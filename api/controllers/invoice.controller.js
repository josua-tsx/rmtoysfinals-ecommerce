import Order from '../models/order.model.js';
import StoreInfo from '../models/storeInfo.model.js';


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

    // Format order items for the response
    const orderItems = order.orderItems.map((item) => ({
      productName: item.productId?.productName || 'Unknown Product',
      category: item.productId?.category?.categoryName || 'Uncategorized',
      quantity: item.quantity,
      unitPrice: item.productId?.price || 0,
      totalPrice: (item.productId?.price || 0) * item.quantity,
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

    // Prepare response data
    const responseData = {
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
      subtotal: order.subtotal || 0,
      shippingPrice: order.shippingPrice || 0,
      vatAmount: order.totalVatAmount || 0,
      usedCredits: order.usedCredits || 0,
      totalPrice: order.totalPrice || 0,
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error('Invoice data error:', error);
    next(error);
  }
};
