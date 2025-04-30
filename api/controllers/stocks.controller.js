import { handleMakeError } from "../middleware/handleError.js";
import OrderStockHistory from "../models/orderStockHistory.models.js";
import Product from "../models/product.model.js";
import Stocks from "../models/stocks.model.js";
import Supplier from "../models/supplier.model.js";
import Vat from "../models/vat.models.js";
// import { sendEmail } from "../nodemailer/nodemailer.js";
import { sendSMS } from "../utils/smsService.js";

export const OrderStocks = async (req, res, next) => {
  const userId = req.user.id;

  const {
    product,
    supplier,
    supplierPrice,
    shopPrice,
    quantity,
    shippingPrice,
    totalCost,
    deliveryId,
    dateDelivery,
    discount,
    vat,
    vatShopPrice,
  } = req.body;

  try {
    if (!dateDelivery) {
      return next(handleMakeError(400, "Please input date delivery"));
    }

    if (!vat) {
      return next(handleMakeError(400, "Please select VAT"));
    }

    if (!supplier) {
      return next(handleMakeError(400, "Please select Supplier"));
    }

    if (!shopPrice) {
      return next(handleMakeError(400, "Please input shop price"));
    }

    if (!shippingPrice) {
      return next(handleMakeError(400, "Please input shipping Price"));
    }

    // Validate required fields
    if (
      !product ||
      !supplier ||
      !deliveryId ||
      !vat ||
      !shippingPrice ||
      !dateDelivery ||
      !shopPrice
    ) {
      return res.status(400).json({ message: "Please input required fields!" });
    }

    if (Number(discount) > Number(vatShopPrice)) {
      return next(
        handleMakeError(400, "Discount should not be higher than shop price")
      );
    }

    // Quantity specific validation
    if (Number(quantity) <= 0) {
      return next(handleMakeError(400, "Quantity must be at least 1"));
    }

    // Price validation
    if (Number(shopPrice) < Number(supplierPrice)) {
      return next(
        handleMakeError(400, "Shop price cannot be lower than supplier price")
      );
    }

    const newDelivery = new Stocks({
      product,
      supplier,
      supplierPrice,
      shopPrice,
      quantity,
      shippingPrice,
      totalCost,
      deliveryStatus: "delivered",
      deliveryId,
      dateDelivery,
      discount,
      vat,
      vatShopPrice,
      vatToRemit: (Number(vatShopPrice) - Number(shopPrice)) * quantity,
    });

    await newDelivery.save();

    await OrderStockHistory({
      action: "admin_ordered_stock",
      userId,
      deliveryId,
      supplier,
      quantityOrdered: quantity,
      supplierPrice,
      shippingPrice,
      vatPercentApplied: vat,
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
        preVatPrice: shopPrice,
        stocks: newDelivery._id,
        discount,
      },
      { new: true, runValidators: true }
    );

    await Supplier.findByIdAndUpdate(supplier, {
      $push: { product: newDelivery.product },
    });

    // ADD TO SET IS USED TO PREVENT DUPLICATE ID PUSHING ON VAT PRODUCTS
    await Vat.findByIdAndUpdate(vat, {
      $addToSet: { product: newDelivery.vat },
    });

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
    vatPercent: newVatPercent,
    vatShopPrice,
  } = req.body;
  const { stockId } = req.params;

  const userId = req.user.id;

  try {
    if (!dateDelivery) {
      return next(handleMakeError(400, "Please input date delivery"));
    }

    if (!newVatPercent) {
      return next(handleMakeError(400, "Please select VAT"));
    }

    if (!supplier) {
      return next(handleMakeError(400, "Please select Supplier"));
    }

    if (!shopPrice) {
      return next(handleMakeError(400, "Please input shop price"));
    }

    if (!shippingPrice) {
      return next(handleMakeError(400, "Please input shipping Price"));
    }

    if (
      !dateDelivery ||
      !newVatPercent ||
      !supplier ||
      !shopPrice ||
      !shippingPrice
    ) {
      return res.status(400).json({ message: "Please input required fields!" });
    }

    if (Number(discount) > Number(vatShopPrice)) {
      return next(
        handleMakeError(400, "Discount should not be higher than shop price")
      );
    }

    // Price validation
    if (Number(shopPrice) < Number(supplierPrice)) {
      return next(
        handleMakeError(400, "Shop price cannot be lower than supplier price")
      );
    }

    // 1. First find the existing stock
    const existingStock = await Stocks.findById(stockId);
    if (!existingStock) return next(handleMakeError(400, "No stock found!"));

    if (
      existingStock.vat &&
      existingStock.vat.toString() !== newVatPercent.toString()
    ) {
      // Remove from old VAT
      await Vat.findByIdAndUpdate(existingStock.vat, {
        $pull: { product: existingStock.product },
      });
    }

    // 2. Calculate the new total quantity and total cost
    const updatedQuantity = existingStock.quantity + Number(newQuantity);
    // const updatedTotalCost = existingStock.totalCost + Number(newTotalCost);

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
        totalCost: supplierPrice * updatedQuantity + shippingPrice,
        deliveryStatus: "delivered",
        deliveryId,
        dateDelivery,
        discount,
        vatPercent: newVatPercent,
        vatShopPrice,
        vatToRemit:
          (Number(vatShopPrice) - Number(shopPrice)) * updatedQuantity,
      },
      { new: true } // Return the updated document
    );

    await OrderStockHistory({
      action: "admin_reordered_stock",
      userId,
      deliveryId,
      supplier,
      category,
      quantityOrdered: newQuantity,
      supplierPrice,
      shippingPrice,
      vatPercentApplied: newVatPercent,
      shopPrice,
      receivedDate: dateDelivery,
      receivedQuantity: newQuantity,
      totalCost: newTotalCost,
    });

    await Vat.findByIdAndUpdate(newVatPercent, {
      $addToSet: { product: updateDeliver.vat },
    });

    await Product.findByIdAndUpdate(
      existingStock.product,
      {
        price: vatShopPrice,
        preVatPrice: shopPrice,
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
        path: "vat",
        select: "vatPercent vatValue",
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
