import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import StoreInfo from '../models/storeInfo.model.js';


/**
 * Generate and download Sales Report PDF.
 * GET /api/report/sales?startDate&endDate&period=daily|monthly
 */
export const getSalesReportPdf = async (req, res, next) => {
  try {
    const { startDate, endDate, period = 'daily' } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const matchStage = {
      paymentStatus: 'Paid',
      ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
    };

    // Aggregate sales data
    const dateFormat = period === 'monthly' ? '%Y-%m' : '%Y-%m-%d';
    const salesData = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          totalSales: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 30 },
    ]);

    // Calculate totals
    const totals = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = totals[0]?.totalRevenue || 0;
    const totalOrders = totals[0]?.totalOrders || 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Fetch store info
    const storeInfo = await StoreInfo.findOne().lean();

    // Prepare template data
    const templateData = {
      storeName: storeInfo?.storeName || 'RM Toys',
      storeAddress: storeInfo?.address || 'Philippines',
      storePhone: storeInfo?.contactPhone || '',
      storeEmail: storeInfo?.contactEmail || '',
      generatedAt: new Date().toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      dateRange: startDate && endDate ? `${startDate} to ${endDate}` : 'All Time',
      totalRevenue,
      totalOrders,
      avgOrderValue,
      salesData: salesData.map((item) => ({
        period: item._id,
        totalSales: item.totalSales,
        orderCount: item.orderCount,
      })),
    };

    // Send JSON response
    res.status(200).json(templateData);
  } catch (error) {
    console.error('Sales Report Error:', error);
    next(error);
  }
};

/**
 * Generate and download Orders Summary Report Data.
 * GET /api/report/orders
 */
export const getOrdersReportPdf = async (req, res, next) => {
  try {
    // Count orders by status
    const [pendingCount, processingCount, deliveredCount, cancelledCount] = await Promise.all([
      Order.countDocuments({ status: 'Pending' }),
      Order.countDocuments({ status: { $in: ['Processing', 'To Ship', 'Shipped'] } }),
      Order.countDocuments({ status: 'Delivered' }),
      Order.countDocuments({ status: 'Cancelled' }),
    ]);

    // Get recent orders
    const recentOrders = await Order.find()
      .populate('userId', 'fullName username')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    // Fetch store info
    const storeInfo = await StoreInfo.findOne().lean();

    // Prepare template data
    const templateData = {
      storeName: storeInfo?.storeName || 'RM Toys',
      storeAddress: storeInfo?.address || 'Philippines',
      storePhone: storeInfo?.contactPhone || '',
      storeEmail: storeInfo?.contactEmail || '',
      generatedAt: new Date().toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      pendingCount,
      processingCount,
      deliveredCount,
      cancelledCount,
      recentOrders: recentOrders.map((order) => ({
        orderId: order._id.toString().slice(-8),
        customerName: order.isGuest
          ? order.guestUser?.name || 'Guest'
          : order.userId?.fullName || order.userId?.username || 'Customer',
        createdAt: order.createdAt,
        status: order.status,
        statusClass: order.status.toLowerCase().replace(' ', '-'),
        totalPrice: order.totalPrice,
      })),
    };

    // Send JSON response
    res.status(200).json(templateData);
  } catch (error) {
    console.error('Orders Report Error:', error);
    next(error);
  }
};

/**
 * Generate and download Inventory Report Data.
 * GET /api/report/inventory
 */
export const getInventoryReportPdf = async (req, res, next) => {
  try {
    // Fetch all products with stock info
    const products = await Product.find({ status: 'published' })
      .populate('category', 'categoryName')
      .populate('stocks', 'quantity')
      .sort({ 'stocks.quantity': 1 })
      .lean();

    // Calculate counts
    const totalProducts = products.length;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    const productData = products.map((product) => {
      const stock = product.stocks?.quantity || 0;
      let stockStatus = 'In Stock';
      let stockClass = 'in-stock';

      if (stock === 0) {
        stockStatus = 'Out of Stock';
        stockClass = 'out-of-stock';
        outOfStockCount++;
      } else if (stock <= 10) {
        stockStatus = 'Low Stock';
        stockClass = 'low-stock';
        lowStockCount++;
      }

      return {
        productName: product.productName,
        category: product.category?.categoryName || 'Uncategorized',
        price: product.price,
        stock,
        stockStatus,
        stockClass,
      };
    });

    // Fetch store info
    const storeInfo = await StoreInfo.findOne().lean();

    // Prepare template data
    const templateData = {
      storeName: storeInfo?.storeName || 'RM Toys',
      storeAddress: storeInfo?.address || 'Philippines',
      storePhone: storeInfo?.contactPhone || '',
      storeEmail: storeInfo?.contactEmail || '',
      generatedAt: new Date().toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      totalProducts,
      lowStockCount,
      outOfStockCount,
      products: productData,
    };

    // Send JSON response
    res.status(200).json(templateData);
  } catch (error) {
    console.error('Inventory Report Error:', error);
    next(error);
  }
};
