import mongoose from "mongoose";
import { handleMakeError } from "../middleware/handleError.js";
import Product from "../models/product.model.js";
import Stocks from "../models/stocks.model.js";
import Supplier from "../models/supplier.model.js";
import User from "../models/user.models.js";
import Vat from "../models/vat.models.js";
import { sendEmail } from "../nodemailer/nodemailer.js";



import { sendSMS } from "../utils/smsService.js";
import { orderStockLogs } from "./orderStockHistory.contoller.js";
import { sendGrid } from "../sendGrid/sendGrid.js";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

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
    vat,
    vatShopPrice,
    notifySubscribedUser,
  } = req.body;

  try {
    // ✅ Validate required fields first (Removed VAT from strict check)
    if (
      !product ||
      !supplier ||
      !deliveryId ||
      !shippingPrice ||
      !dateDelivery ||
      !shopPrice
    ) {
      return res.status(400).json({ message: "Please input required fields!" });
    }

    // ✅ Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(product)) {
      return next(handleMakeError(400, "Invalid product ID"));
    }
    if (!mongoose.Types.ObjectId.isValid(supplier)) {
      return next(handleMakeError(400, "Invalid supplier ID"));
    }

    // ✅ Fetch Product FIRST to check Tax Status
    const productExists = await Product.findById(product);
    if (!productExists) {
      return next(handleMakeError(404, "Product not found"));
    }

    // ✅ Handle VAT Logic
    let vatExists = null;
    
    if (productExists.taxStatus === "vatable") {
      if (!vat || !mongoose.Types.ObjectId.isValid(vat)) {
        return next(handleMakeError(400, "VAT ID is required for vatable products"));
      }
      vatExists = await Vat.findById(vat);
      if (!vatExists) {
        return next(handleMakeError(404, "VAT not found"));
      }
    } 
    // If Status is 'exempt' (or others), we proceed with vatExists = null

    const supplierExists = await Supplier.findById(supplier);
    if (!supplierExists) {
      return next(handleMakeError(404, "Supplier not found"));
    }

    // ✅ Additional validations
    const MAX_SHOP_PRICE = 1000000; // $1 Million
    const MAX_SHIPPING_PRICE = 10000; // $10k
    const MAX_QUANTITY = 1000;
    const MAX_SUPPLIER_PRICE = 1000000;

    if (!supplierPrice) {
      return next(handleMakeError(400, "Please input supplier price"));
    }
    
    if (Number(supplierPrice) <= 0) {
      return next(handleMakeError(400, "Supplier price must be a positive number"));
    }

    if (Number(supplierPrice) > MAX_SUPPLIER_PRICE) {
      return next(handleMakeError(400, `Supplier price cannot exceed $${MAX_SUPPLIER_PRICE}`));
    }

    // Quantity specific validation
    if (Number(quantity) <= 10) {
      return next(handleMakeError(400, "Quantity must be at least 11"));
    }
    if (Number(quantity) > MAX_QUANTITY) {
      return next(handleMakeError(400, `Quantity cannot exceed ${MAX_QUANTITY}`));
    }

    // Price validation
    if (Number(shopPrice) < Number(supplierPrice)) {
      return next(
        handleMakeError(400, "Shop price cannot be lower than supplier price")
      );
    }
    if (Number(shopPrice) > MAX_SHOP_PRICE) {
      return next(handleMakeError(400, `Shop price cannot exceed ${MAX_SHOP_PRICE}`));
    }
    
    // Shipping validation
    if (Number(shippingPrice) > MAX_SHIPPING_PRICE) {
       return next(handleMakeError(400, `Shipping price cannot exceed ${MAX_SHIPPING_PRICE}`));
    }


    // ✅ Get subscribed users (only email field for efficiency)
    const subscribedUser = await User.find({
      isSubscribed: true,
    }).select("email");

    // ✅ Calculate VAT values server-side
    const vatPercent = vatExists ? vatExists.vatPercent : 0;
    const calculatedVatShopPrice = Number(shopPrice) * (1 + vatPercent / 100);
    const calculatedVatToRemit = (calculatedVatShopPrice - Number(shopPrice)) * Number(quantity);

    // ✅ Create and save new delivery
    const newDelivery = new Stocks({
      product,
      supplier,
      supplierPrice: Number(supplierPrice) || 0,
      shopPrice: Number(shopPrice),
      quantity: Number(quantity),
      shippingPrice: Number(shippingPrice),
      totalCost: Number(totalCost),
      deliveryStatus: "delivered",
      deliveryId,
      dateDelivery: new Date(dateDelivery),
      vat: vatExists ? vatExists._id : null,
      vatShopPrice: calculatedVatShopPrice,
      vatToRemit: calculatedVatToRemit,
    });

    await newDelivery.save();


    // ✅ Send response FIRST to prevent lag
    res.status(201).json({
      message: "Stock ordered successfully",
      delivery: newDelivery,
      emailNotification:
        notifySubscribedUser && subscribedUser.length > 0
          ? "Sending notifications in background"
          : "No notifications sent",
    });

    

    // ✅ Process emails in BACKGROUND after response
    if (notifySubscribedUser === true && subscribedUser.length > 0) {
      processEmailsInBackground(
        subscribedUser,
        productExists,
        newDelivery,
        quantity
      )
        .then((result) => {
          console.log(
            `✅ Background emails completed: ${result.successful} sent, ${result.failed} failed`
          );
        })
        .catch((error) => {
          console.error("❌ Background email processing failed:", error);
        });
    }

    // ✅ Fixed orderStockLogs with proper data types
    await orderStockLogs({
      action: "admin_ordered_stock",
      userId,
      deliveryId,
      supplier,
      category: productExists.category || null, // Use actual category from product
      quantityOrdered: Number(quantity),
      supplierPrice: Number(supplierPrice) || 0,
      shippingPrice: Number(shippingPrice),
      vatPercentApplied: vatPercent, 
      shopPrice: Number(shopPrice),
      receivedDate: new Date(dateDelivery),
      receivedQuantity: Number(quantity),
      totalCost: Number(totalCost),
    });

    // ✅ Update related documents
    await Promise.all([
      Product.findByIdAndUpdate(
        product,
        {
          status: "published",
          price: calculatedVatShopPrice,
          preVatPrice: Number(shopPrice),
          stocks: newDelivery._id,
          taxStatus: vatPercent > 0 ? "vatable" : "exempt",
          totalVat: vatPercent
        },
        { new: true, runValidators: true }
      ),
      Supplier.findByIdAndUpdate(supplier, {
        $push: { product: newDelivery.product },
      }),
      (vatExists && Vat.findByIdAndUpdate(vat, {
        $addToSet: { productId: newDelivery.product },
      }))
    ]);
  } catch (error) {
    console.error("OrderStocks error:", error);
    next(error);
  }
};

// ✅ Background email processing function
const processEmailsInBackground = async (
  subscribedUser,
  product,
  newDelivery,
  quantity
) => {
  const results = {
    successful: 0,
    failed: 0,
    errors: [],
  };

  console.log(
    `🔄 Starting background email sending to ${subscribedUser.length} users`
  );

  for (let i = 0; i < subscribedUser.length; i++) {
    const user = subscribedUser[i];

    try {
      const emailSubject = `New Stock Arrival Notification - ${product.productName}`;
      const emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">🚀 New Stock Just Arrived!</h2>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
            <p><strong>Product:</strong> ${product.productName}</p>
            <p><strong>Price:</strong> ₱${newDelivery.shopPrice}</p>
            <p><strong>Available Quantity:</strong> ${quantity} units</p>
            <p><strong>Arrival Date:</strong> ${new Date(
              newDelivery.dateDelivery
            ).toLocaleDateString()}</p>
          </div>
          <p style="margin-top: 20px;">Happy shopping!</p>
          <p><em>RM Toys Team</em></p>
        </div>
      `;

      
      await sendGrid(user.email, emailSubject, emailBody);
      results.successful++;
      console.log(
        `✅ Email sent to ${user.email} (${i + 1}/${subscribedUser.length})`
      );

      // ✅ Add small delay to avoid rate limiting
      if (i < subscribedUser.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    } catch (error) {
      results.failed++;
      results.errors.push({ email: user.email, error: error.message });
      console.error(`❌ Failed to send email to ${user.email}:`, error.message);
    }
  }

  console.log(
    `📧 Email summary: ${results.successful} sent, ${ sults.failed} failed`
  );
  return results;
};

export const reorderStock = async (req, res, next) => {
  const {
    product: productIdFromBody, // Rename to avoid confusion
    supplier,
    supplierPrice,
    shopPrice,
    quantity: newQuantity,
    category,
    shippingPrice,
    totalCost: newTotalCost,
    deliveryId,
    dateDelivery,
    vatPercent: newVatPercent,
    vatShopPrice,
  } = req.body;
  const { stockId } = req.params;

  const userId = req.user.id;

  try {
    // 1. Fetch Existing Stock Early
    const existingStock = await Stocks.findById(stockId);
    if (!existingStock) return next(handleMakeError(400, "No stock found!"));

    const productId = productIdFromBody || existingStock.product;

    if (!dateDelivery) {
      return next(handleMakeError(400, "Please input date delivery"));
    }

    // Commented out strict VAT check to allow fallback
    // if (!newVatPercent) {
    //   return next(handleMakeError(400, "Please select VAT"));
    // }

    if (!supplier) {
      return next(handleMakeError(400, "Please select Supplier"));
    }

    if (!shopPrice) {
      return next(handleMakeError(400, "Please input shop price"));
    }

    if (!shippingPrice) {
      return next(handleMakeError(400, "Please input shipping Price"));
    }

    const MAX_SHOP_PRICE = 1000000; // $1 Million
    const MAX_SHIPPING_PRICE = 10000; // $10k
    const MAX_QUANTITY = 1000;
    const MAX_SUPPLIER_PRICE = 1000000

    if (!supplierPrice) {
      return next(handleMakeError(400, "Please input supplier price"));
    }
    
    if (Number(supplierPrice) <= 0) {
      return next(handleMakeError(400, "Supplier price must be a positive number"));
    }

    if (Number(supplierPrice) > MAX_SUPPLIER_PRICE) {
      return next(handleMakeError(400, `Supplier price cannot exceed $${MAX_SUPPLIER_PRICE}`));
    }

    // Quantity specific validation
    if (Number(newQuantity) <= 0) { // Changed this to allow smaller re-orders if needed, or keep at 10? User generally wants > 0
      return next(handleMakeError(400, "Quantity must be greater than 0"));
    }
    if (Number(newQuantity) > MAX_QUANTITY) {
      return next(handleMakeError(400, `Quantity cannot exceed ${MAX_QUANTITY}`));
    }

    // Price validation
    if (Number(shopPrice) < Number(supplierPrice)) {
      return next(
        handleMakeError(400, "Shop price cannot be lower than supplier price")
      );
    }
    if (Number(shopPrice) > MAX_SHOP_PRICE) {
      return next(handleMakeError(400, `Shop price cannot exceed ${MAX_SHOP_PRICE}`));
    }
    
    // Shipping validation
    if (Number(shippingPrice) > MAX_SHIPPING_PRICE) {
       return next(handleMakeError(400, `Shipping price cannot exceed ${MAX_SHIPPING_PRICE}`));
    }

    // 2. Determine VAT to use
    let vatIdToUse = newVatPercent;
    
    // If not provided in body, fall back to existing stock's VAT
    if (!vatIdToUse) {
        vatIdToUse = existingStock.vat; 
    }

    // If still null, maybe check product (optional, but good for safety)
    if (!vatIdToUse) {
       const prod = await Product.findById(productId);
       if (prod && prod.vat) {
         vatIdToUse = prod.vat;
       }
    }

    // 3. Fetch VAT details for calculation
    let vatPercent = 0;
    let vatDoc = null;

    if (vatIdToUse) {
        vatDoc = await Vat.findById(vatIdToUse);
        if (vatDoc) {
            vatPercent = vatDoc.vatPercent;
        }
    }

    // 4. Calculate stats
    const updatedQuantity = existingStock.quantity + Number(newQuantity);
    
    const calculatedVatShopPrice = Number(shopPrice) * (1 + vatPercent / 100);
    const calculatedVatToRemit = (calculatedVatShopPrice - Number(shopPrice)) * updatedQuantity;

    // 5. Update the stock
    const updateDeliver = await Stocks.findByIdAndUpdate(
      stockId,
      {
        product: productId,
        supplier,
        supplierPrice,
        shopPrice,
        quantity: updatedQuantity, 
        category,
        shippingPrice,
        totalCost: Number(supplierPrice) * Number(updatedQuantity) + Number(shippingPrice), // Recalculate total cost carefully
        deliveryStatus: "delivered",
        deliveryId,
        dateDelivery,
        vat: vatDoc ? vatDoc._id : null, // Ensure we save the resolved ID
        vatShopPrice: calculatedVatShopPrice,
        vatToRemit: calculatedVatToRemit,
      },
      { new: true } 
    );

    // Update VAT relationship if valid
    if (vatDoc) {
        await Vat.findByIdAndUpdate(vatDoc._id, {
        $addToSet: { productId: updateDeliver.product },
        });
    }

    await orderStockLogs({
      action: "admin_reordered_stock",
      userId,
      deliveryId,
      supplier,
      category,
      quantityOrdered: Number(newQuantity),
      supplierPrice,
      shippingPrice,
      vatPercentApplied: vatPercent, // Log the actual percent used
      shopPrice: Number(shopPrice),
      receivedDate: new Date(dateDelivery),
      receivedQuantity: Number(newQuantity),
      totalCost: Number(newTotalCost) || (Number(supplierPrice) * Number(newQuantity) + Number(shippingPrice)), // Use provided or calculated
    });

    await Product.findByIdAndUpdate(
      existingStock.product,
      {
        price: calculatedVatShopPrice,
        preVatPrice: Number(shopPrice),
        taxStatus: vatPercent > 0 ? "vatable" : "exempt", // Update tax status based on effective VAT
        totalVat: vatPercent
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
        select: "productImages productName price", // Include fields to select from product
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
        select: "vatPercent vatValue vatName",
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

    // FIX IS HERE: Use $gte: 1 to include items with quantity of 1
    const lowStock = await Stocks.find({ quantity: { $gte: 1, $lt: 30 } }) 
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
      select: "productName category supplier",
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
