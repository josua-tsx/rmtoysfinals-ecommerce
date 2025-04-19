import { handleMakeError } from "../middleware/handleError.js";
import Product from "../models/product.model.js";
import Stocks from "../models/stocks.model.js";
// import { sendEmail } from "../nodemailer/nodemailer.js";
import { sendSMS } from "../utils/smsService.js";
import { orderStockHistory } from "./orderStockHistory.contoller.js";

export const OrderStocks = async (req, res, next) => {
  const userId = req.user.id;

  const {
    product,
    supplier,
    supplierPrice,
    shopPrice,
    quantity,
    category,
    shippingPrice,
    totalCost,
    deliveryId,
    dateDelivery,
    discount,
    vatPercent,
    vatShopPrice,
  } = req.body;

  try {
    const newDelivery = new Stocks({
      product,
      supplier,
      supplierPrice,
      shopPrice,
      quantity,
      category,
      shippingPrice,
      totalCost,
      deliveryStatus: "delivered",
      deliveryId,
      dateDelivery,
      discount,
      vatPercent,
      vatShopPrice,
      vatToRemit: (Number(vatShopPrice) - Number(shopPrice)) * quantity,
    });

    await orderStockHistory({
      action: "admin_ordered_stock",
      userId,
      deliveryId,
      supplier,
      category,
      quantityOrdered: quantity,
      supplierPrice,
      shippingPrice,
      vatPercentApplied: vatPercent,
      shopPrice,
      receivedDate: dateDelivery,
      receivedQuantity: quantity,
      totalCost,
    });

    await Product.findByIdAndUpdate(
      product,
      {
        status: "published",
        price: vatShopPrice,
        stocks: newDelivery._id,
        discount,
      },
      { new: true, runValidators: true }
    );

    await newDelivery.save();
    res.status(201).json(newDelivery);
  } catch (error) {
    next(error);
  }
};

export const reorderStock = async (req, res, next) => {
  const {
    product,
    supplier,
    supplierPrice,
    shopPrice,
    quantity: newQuantity, // Rename to newQuantity for clarity
    category,
    shippingPrice,
    totalCost: newTotalCost,
    deliveryId,
    dateDelivery,
    discount,
    vatPercent,
    vatShopPrice,
  } = req.body;
  const { stockId } = req.params;

  const userId = req.user.id;

  try {
    // 1. First find the existing stock
    const existingStock = await Stocks.findById(stockId);

    if (!existingStock) return next(handleMakeError(400, "No stock found!"));

    // 2. Calculate the new total quantity and total cost
    const updatedQuantity = existingStock.quantity + Number(newQuantity);
    const updatedTotalCost = existingStock.totalCost + Number(newTotalCost);

    // 3. Update the stock with all fields including the new quantity
    const updateDeliver = await Stocks.findByIdAndUpdate(
      stockId,
      {
        product,
        supplier,
        supplierPrice,
        shopPrice,
        quantity: updatedQuantity, // Use the summed quantity
        category,
        shippingPrice,
        totalCost: updatedTotalCost,
        deliveryStatus: "delivered",
        deliveryId,
        dateDelivery,
        discount,
        vatPercent,
        vatShopPrice,
        vatToRemit:
          (Number(vatShopPrice) - Number(shopPrice)) * updatedQuantity,
      },
      { new: true } // Return the updated document
    );

    await orderStockHistory({
      action: "admin_reordered_stock",
      userId,
      deliveryId,
      supplier,
      category,
      quantityOrdered: newQuantity,
      supplierPrice,
      shippingPrice,
      vatPercentApplied: vatPercent,
      shopPrice,
      receivedDate: dateDelivery,
      receivedQuantity: newQuantity,
      totalCost: newTotalCost,
    });

    await Product.findByIdAndUpdate(
      existingStock.product,
      {
        price: shopPrice,
      },
      { new: true, runValidators: true }
    );
    res.status(200).json(updateDeliver);
  } catch (error) {
    next(error);
  }
};

export const updateStockQuantity = async (req, res, next) => {
  const { stockId } = req.params;
  const { quantity } = req.body;
  try {
    // const existingTotalCosty

    const existingStock = await Stocks.findById(stockId);

    if (!existingStock) return next(handleMakeError(400, "No stock found!"));

    const existingSupplierPrice = existingStock.supplierPrice;
    const existingShippingPrice = existingStock.shippingPrice;
    const existingShopPrice = existingStock.shopPrice;
    const existingVatPrice = existingStock.vatShopPrice;

    const updateQuantity = await Stocks.findByIdAndUpdate(
      stockId,
      {
        quantity,
        totalCost: existingSupplierPrice * quantity + existingShippingPrice,
        vatToRemit: (existingVatPrice - existingShopPrice) * quantity,
      },
      { new: true }
    );
    res.status(200).json(updateQuantity);
  } catch (error) {
    next(error);
  }
};

export const getPendingDeliveries = async (req, res, next) => {
  try {
    const processingDeliveries = await Stocks.find({
      deliveryStatus: "processing",
    })
      .populate({
        path: "product",
        select: "productName productImages category",
        populate: {
          path: "category",
          select: "categoryName",
        },
      })
      .populate({
        path: "supplier",
        select: "supplierName",
      });

    res.status(200).json(processingDeliveries);
  } catch (error) {
    next(error);
  }
};

// export const confirmDelivery = async (req, res, next) => {
//   const { deliveryId } = req.params;

//   try {
//     // Validate deliveryId
//     if (!mongoose.Types.ObjectId.isValid(deliveryId)) {
//       return res.status(400).json({ message: "Invalid delivery ID format!" });
//     }

//     // Find the stock by deliveryId
//     const stock = await Stocks.findById(deliveryId);
//     if (!stock) {
//       return res.status(400).json({ message: "Delivery not found!" });
//     }

//     // Update the delivery status in Stocks
//     stock.deliveryStatus = "delivered";
//     await stock.save();

//     // Ensure stock contains a productId
//     if (!stock.product) {
//       return res.status(400).json({ message: "No product associated with this delivery!" });
//     }

//     console.log(stock)

//     // Update the corresponding product's status to "published"
//     const updatedProduct = await Product.findByIdAndUpdate(
//       stock.product,
//       { status: "published",
//         price: stock.shopPrice,
//         stocks: stock._id,
//       },
//       { new: true, runValidators: true }
//     );

//     if (!updatedProduct) {
//       return res.status(400).json({ message: "Associated product not found!" });
//     }

//     res.status(200).json({
//       message: "Delivery confirmed, product status updated!",
//       delivery: stock,
//       product: updatedProduct,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

//   const { deliveryId } = req.params;

//   try {
//     // 1. Find the delivery record
//     const delivery = await DeliverStocks.findById(deliveryId);
//     if (!delivery) {
//       return res.status(404).json({ message: "Delivery not found" });
//     }

//     // 2. Update delivery status to "delivered"
//     delivery.deliveryStatus = "delivered";
//     await delivery.save();

//     // 3. Update product status to "active"
//     await Product.findByIdAndUpdate(
//       delivery.productId,
//       { status: "published" },
//       { new: true }
//     );

//     // 4. Update or create stock record
//     let stock = await Stocks.findOne({ product: delivery.productId });

//     if (!stock) {
//       stock = new Stocks({
//         product: delivery.productId,
//         quantity: delivery.quantity,
//         supplierPrice: delivery.supplierPrice,
//         shopPrice: delivery.shopPrice,
//         shippingPrice: delivery.shippingPrice,
//         supplier: delivery.supplier,
//         deliveryId: delivery._id
//       });
//     } else {
//       stock.quantity += delivery.quantity;
//       stock.supplierPrice = delivery.supplierPrice; // Update to latest price
//       stock.shopPrice = delivery.shopPrice;
//       stock.shippingPrice = delivery.shippingPrice
//       stock.supplier = delivery.supplier
//     }

//     await stock.save();

//     res.status(200).json({
//       message: "Delivery confirmed and stock updated",
//       delivery,
//       stock,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

export const getStocks = async (req, res, next) => {
  try {
    // Find all stocks and populate product, supplier, and category
    const getStocks = await Stocks.find({ deliveryStatus: "delivered" })
      .populate({
        path: "product", // Populate the product field
        select: "productImages productName discount price", // Include fields to select from product
        populate: [
          // Use an array for nested populations
          {
            path: "category",
            select: "categoryName",
          },
        ],
      })
      .populate({
        path: "supplier",
        select: "supplierName contactNumber",
      })
      .sort({ createdAt: -1 });

    // Threshold configuration
    const STOCK_LEVELS = {
      LOW: 30,
      OUT: 0,
    };

    // Notification cooldowns (in milliseconds)
    const NOTIFICATION_COOLDOWNS = {
      LOW: 1 * 60 * 1000, // 10 minutes for low stock
      OUT: 5 * 60 * 1000, // 5 minutes for out-of-stock
    };

    // const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PHONENUMBER = process.env.ADMIN_PHONENUMBER;

    // Classify stocks and check notification needs
    const stockAlerts = {
      low: getStocks.filter((stock) => {
        return (
          stock.quantity <= STOCK_LEVELS.LOW &&
          stock.quantity > STOCK_LEVELS.OUT &&
          (!stock.lastLowStockNotification ||
            Date.now() - stock.lastLowStockNotification >
              NOTIFICATION_COOLDOWNS.LOW)
        );
      }),

      out: getStocks.filter((stock) => {
        return (
          stock.quantity === STOCK_LEVELS.OUT &&
          (!stock.lastOutOfStockNotification ||
            Date.now() - stock.lastOutOfStockNotification >
              NOTIFICATION_COOLDOWNS.OUT)
        );
      }),
    };

    if (stockAlerts.low.length > 0) {
      await sendSMS(
        ADMIN_PHONENUMBER,
        `ALERT: LOW STOCK ITEMS (${stockAlerts.low.length}) \n
        URGENT! The following items are critically low:\n\n${stockAlerts.low
          .map(
            (item) =>
              `- ${item.product?.productName}: ${item.quantity} remaining`
          )
          .join("\n")}\n\nRestock immediately!`
      );

      // Group alerts by supplier to avoid sending multiple SMS
      const supplierAlerts = {};

      stockAlerts.low.forEach((item) => {
        if (item.supplier && item.supplier.contactNumber) {
          if (!supplierAlerts[item.supplier._id]) {
            supplierAlerts[item.supplier._id] = {
              supplier: item.supplier,
              products: [],
            };
          }
          supplierAlerts[item.supplier._id].products.push({
            name: item.product?.productName,
            quantity: item.quantity,
          });
        }
      });

      // Send one SMS per supplier with all their low stock products
      await Promise.all(
        Object.values(supplierAlerts).map(async ({ supplier, products }) => {
          const message =
            `Low Stock Alert for ${supplier.supplierName}:\n\n` +
            `The following products are running low:\n` +
            products
              .map((p) => `- ${p.name} (${p.quantity} units left)`)
              .join("\n") +
            `\n\nPlease arrange restocking soon. FROM: RM TOYS`;

          await sendSMS(supplier.contactNumber, message);
        })
      );

      await Promise.all(
        stockAlerts.low.map((item) =>
          Stocks.findByIdAndUpdate(item._id, {
            lastLowStockNotification: Date.now(),
          })
        )
      );
    }

    if (stockAlerts.out.length > 0) {
      await sendSMS(
        ADMIN_PHONENUMBER,
        `EMERGENCY: OUT-OF-STOCK ITEMS (${stockAlerts.out.length}) \n
        CRITICAL! The following items are completely out of stock:\n\n${stockAlerts.out
          .map((item) => `- ${item.product?.productName}`)
          .join("\n")}\n\nTake immediate action! FROM: RM TOYS`
      );

      // SMS to each supplier about their out-of-stock products
      const supplierAlerts = {};
      stockAlerts.out.forEach((item) => {
        if (item.supplier && item.supplier.contactNumber) {
          if (!supplierAlerts[item.supplier._id]) {
            supplierAlerts[item.supplier._id] = {
              supplier: item.supplier,
              products: [],
            };
          }
          supplierAlerts[item.supplier._id].products.push(
            item.product?.productName
          );
        }
      });

      await Promise.all(
        Object.values(supplierAlerts).map(async ({ supplier, products }) => {
          const message = `URGENT: ${
            supplier.supplierName
          },\n\nThe following products you supply are OUT OF STOCK:\n\n${products.join(
            "\n"
          )}\n\nImmediate restocking is required to avoid business disruption.`;

          await sendSMS(supplier.contactNumber, message);
        })
      );

      await Promise.all(
        stockAlerts.out.map((item) =>
          Stocks.findByIdAndUpdate(item._id, {
            lastOutOfStockNotification: Date.now(),
          })
        )
      );
    }

    res.status(200).json(getStocks);
  } catch (error) {
    next(error);
  }
};

export const getStockLevels = async (req, res, next) => {
  try {
    // Query for stocks based on the stock levels
    const highStock = await Stocks.find({
      quantity: { $gte: 50 },
    })
      .populate({
        path: "product",
        select: "productImages productName",
      })
      .sort({ createdAt: -1 });

    const mediumStock = await Stocks.find({
      quantity: { $gte: 30, $lt: 50 },
    })
      .populate({
        path: "product",
        select: "productImages productName",
      })
      .sort({ createdAt: -1 });

    const lowStock = await Stocks.find({ quantity: { $gt: 1, $lt: 30 } })
      .populate({
        path: "product",
        select: "productImages productName",
      })
      .sort({ createdAt: -1 });

    const outOfStock = await Stocks.find({ quantity: 0 })
      .populate({
        path: "product",
        select: "productImages productName",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      highStock,
      mediumStock,
      lowStock,
      outOfStock,
    });
  } catch (error) {
    next(error);
  }
};

export const getSingleStock = async (req, res, next) => {
  const { stockId } = req.params;

  try {
    const singleStock = await Stocks.findById(stockId).populate({
      path: "product",
      select: "productName discount category supplier",
      populate: [
        {
          path: "category",
          select: "categoryName", // Assuming the category name is stored in a field called `name`
        },
        {
          path: "supplier",
          select: "supplierName", // Assuming the supplier name is stored in a field called `supplierName`
        },
      ],
    });
    if (!singleStock) return next(handleMakeError(400, "stock not found"));
    res.status(200).json(singleStock);
  } catch (error) {
    next(error);
  }
};
