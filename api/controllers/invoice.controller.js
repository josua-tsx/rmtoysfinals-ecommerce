import Order from '../models/order.model.js';
import StoreInfo from '../models/storeInfo.model.js';
import { generateInvoicePdf } from '../utils/generateInvoicePdf.js';

/**
 * Generate and download an invoice PDF for a specific order.
 * GET /api/invoice/:orderId
 */
export const getInvoicePdf = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    // Fetch order with populated fields
    const order = await Order.findById(orderId)
      .populate('userId', 'fullName username email phoneNumber')
      .populate({
        path: 'orderItems.productId',
        select: 'productName price category',
        populate: { path: 'category', select: 'categoryName' },
      })
      .lean();

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Fetch store info for branding
    const storeInfo = await StoreInfo.findOne().lean();

    // Generate PDF
    const pdfBuffer = await generateInvoicePdf(order, storeInfo);

    // Set headers for PDF download
    const filename = `Invoice-${order._id.toString().slice(-8)}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Invoice generation error:', error);
    next(error);
  }
};
