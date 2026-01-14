import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Handlebars from 'handlebars';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generates a PDF invoice from order data.
 * @param {Object} order - The order document with populated fields.
 * @param {Object} storeInfo - Store information for branding.
 * @returns {Promise<Buffer>} - PDF file as a buffer.
 */
export const generateInvoicePdf = async (order, storeInfo) => {
  // Read and compile the HTML template
  const templatePath = path.join(__dirname, '../template/invoice.html');
  const templateHtml = fs.readFileSync(templatePath, 'utf-8');
  const template = Handlebars.compile(templateHtml);

  // Format order items for the template
  const orderItems = order.orderItems.map((item) => ({
    productName: item.productId?.productName || 'Unknown Product',
    category: item.productId?.category?.categoryName || 'Uncategorized',
    quantity: item.quantity,
    unitPrice: (item.productId?.price || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 }),
    totalPrice: ((item.productId?.price || 0) * item.quantity).toLocaleString('en-PH', { minimumFractionDigits: 2 }),
  }));

  // Get customer info (handle both user and guest orders)
  const customerName = order.isGuest
    ? order.guestUser?.name || 'Guest'
    : order.userId?.fullName || order.userId?.username || 'Customer';
  const customerEmail = order.isGuest
    ? order.guestUser?.email || 'N/A'
    : order.userId?.email || 'N/A';
  const customerPhone = order.isGuest
    ? order.guestUser?.phone || 'N/A'
    : order.userId?.phoneNumber || 'N/A';

  // Prepare template data
  const templateData = {
    // Store Info
    storeName: storeInfo?.storeName || 'RM Toys',
    storeAddress: storeInfo?.address || 'Philippines',
    storePhone: storeInfo?.contactPhone || '',
    storeEmail: storeInfo?.contactEmail || '',

    // Order Info
    orderId: order._id.toString(),
    orderDate: new Date(order.createdAt).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,

    // Customer Info
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress: order.shippingAddress,

    // Order Items
    orderItems,

    // Totals
    subtotal: (order.subtotal || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 }),
    shippingPrice: (order.shippingPrice || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 }),
    vatAmount: order.totalVatAmount
      ? order.totalVatAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })
      : null,
    usedCredits: order.usedCredits
      ? order.usedCredits.toLocaleString('en-PH', { minimumFractionDigits: 2 })
      : null,
    totalPrice: (order.totalPrice || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 }),
  };

  // Render HTML with data
  const html = template(templateData);

  // Launch Puppeteer and generate PDF
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
  });

  await browser.close();

  return pdfBuffer;
};
