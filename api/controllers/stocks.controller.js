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
import { orderStockSchema, stockBodyBase } from "../schema/stock.schema.js";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export const OrderStocks = async (req, res, next) => {
  const userId = req.user.id;
  const session = await mongoose.startSession();
  session.startTransaction();

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
    // ✅ Fetch Product FIRST to check Tax Status
    const productExists = await Product.findById(product).session(session);
    if (!productExists) {
      await session.abortTransaction();
      session.endSession();
      return next(handleMakeError(404, "Product not found"));
    }

    // ✅ Handle VAT Logic
    let vatExists = null;

    if (productExists.taxStatus === "vatable") {
      if (!vat || !mongoose.Types.ObjectId.isValid(vat)) {
        await session.abortTransaction();
        session.endSession();
        return next(
          handleMakeError(400, "VAT ID is required for vatable products")
        );
      }
      vatExists = await Vat.findById(vat).session(session);
      if (!vatExists) {
        await session.abortTransaction();
        session.endSession();
        return next(handleMakeError(404, "VAT not found"));
      }
    }

    const supplierExists = await Supplier.findById(supplier).session(session);
    if (!supplierExists) {
      await session.abortTransaction();
      session.endSession();
      return next(handleMakeError(404, "Supplier not found"));
    }

    // ✅ Get subscribed users (OPTIMIZED: returns array of strings)
    const subscribedEmails = await User.find({
      isSubscribed: true,
    }).distinct("email");

    // ✅ Calculate VAT values server-side
    const vatPercent = vatExists ? vatExists.vatPercent : 0;
    const calculatedVatShopPrice = Number(shopPrice) * (1 + vatPercent / 100);
    const calculatedVatToRemit =
      (calculatedVatShopPrice - Number(shopPrice)) * Number(quantity);

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

    await newDelivery.save({ session });

    // ✅ Fixed orderStockLogs with proper data types
    await orderStockLogs(
      {
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
      },
      session
    ); // Pass session to logs if supported

    // ✅ Update related documents
    await Promise.all([
      // NOTE: Using $push for stocks array history as requested
      Product.findByIdAndUpdate(
        product,
        {
          status: "published",
          price: calculatedVatShopPrice,
          preVatPrice: Number(shopPrice),
          $push: { stocks: newDelivery._id }, // Keeping history!
          taxStatus: vatPercent > 0 ? "vatable" : "exempt",
          totalVat: vatPercent,
          supplier: supplier, // ✅ Update supplier when ordering stock
        },
        { new: true, runValidators: true, session }
      ),
      Supplier.findByIdAndUpdate(
        supplier,
        {
          $addToSet: { product: newDelivery.product }, // Use $addToSet to avoid duplicates
        },
        { session }
      ),
      vatExists &&
        Vat.findByIdAndUpdate(
          vat,
          {
            $addToSet: { productId: newDelivery.product },
          },
          { session }
        ),
    ]);

    // ✅ Commit Transaction
    await session.commitTransaction();
    session.endSession();

    // ✅ Send response FIRST to prevent lag
    res.status(201).json({
      message: "Stock ordered successfully",
      delivery: newDelivery,
      emailNotification:
        notifySubscribedUser && subscribedEmails.length > 0
          ? "Sending notifications in background"
          : "No notifications sent",
    });

    // ✅ Process emails in BACKGROUND after response
    if (notifySubscribedUser === true && subscribedEmails.length > 0) {
      // Pass emails array directly
      processEmailsInBackground(
        subscribedEmails,
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
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
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

    /* 
       Manual validation for reorder replaced by Zod schema
       - Required fields
       - Price limits
       - Quantity checks
    */

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
        totalVat: vatPercent,
        supplier: supplier, // ✅ Update supplier on reorder
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
        // CHECK ENABLE NOTIFICATIONS HERE
        if (
          item.supplier &&
          item.supplier.contactNumber &&
          item.supplier.enableNotifications !== false // Default to true if undefined
        ) {
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
        // CHECK ENABLE NOTIFICATIONS HERE
        if (
          item.supplier &&
          item.supplier.contactNumber &&
          item.supplier.enableNotifications !== false
        ) {
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

// --- Batch Stock Upload Logic ---

export const getStockCsvTemplate = async (req, res, next) => {
  try {
    const headers = [
      "productName",
      "supplierName",
      "quantity",
      "supplierPrice", // Cost per unit from supplier
      "shopPrice", // Selling price
      "shippingPrice", // Total shipping for this batch
      "dateDelivery", // YYYY-MM-DD
    ];

    // Helper to escape CSV fields
    const escapeCSV = (value) => {
      if (
        typeof value === "string" &&
        (value.includes('"') || value.includes(",") || value.includes("\n"))
      ) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const exampleRow = [
      "Example Robot Toy",
      "ABC Supplier",
      "50",
      "100",
      "250",
      "500",
      "2023-12-01",
    ].map(escapeCSV);

    const csvContent = [headers.join(","), exampleRow.join(",")].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="stock_upload_template.csv"'
    );
    res.send(csvContent);
  } catch (error) {
    next(error);
  }
};

export const batchOrderStocks = async (req, res, next) => {
  const file = req.file;
  if (!file) {
    return next(handleMakeError(400, "No CSV file uploaded"));
  }

  const userId = req.user.id;
  const Papa = await import("papaparse"); // Dynamic import if not top-level

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const csvData = file.buffer.toString("utf-8");
    const { data, errors: parseErrors } = Papa.default.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
    });

    if (parseErrors.length > 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "CSV parsing error",
        errors: parseErrors,
      });
    }

    if (data.length === 0) {
      await session.abortTransaction();
      return next(handleMakeError(400, "CSV file is empty"));
    }

    const results = {
      created: 0,
      failed: 0,
      errors: [],
    };

    // Cache Suppliers and VATs to minimize DB calls
    // Only fetch ACTIVE (non-archived) ones
    const allSuppliers = await Supplier.find({ isArchived: { $ne: true } }).select("supplierName _id");
    const supplierMap = new Map(
      allSuppliers.map((s) => [s.supplierName.toLowerCase().trim(), s._id])
    );

    const allVats = await Vat.find({}).lean();
    const defaultVat = allVats.length > 0 ? allVats[0] : null;

    // 1. Process each row
    for (const [index, row] of data.entries()) {
      const rowNum = index + 2; // +2 for header + 0-index

      const {
        productName,
        supplierName,
        quantity,
        supplierPrice,
        shopPrice,
        shippingPrice,
        dateDelivery,
      } = row;

      // Basic Validation
      if (!productName || !quantity || !supplierPrice || !shopPrice) {
        results.failed++;
        results.errors.push({
          row: rowNum,
          reason: "Missing required fields (productName, quantity, prices)",
        });
        continue;
      }

      // ----------------------------------------------------
      // Use Zod Schema for numeric field validation
      // Pick only numeric fields from orderStockSchema
      // ----------------------------------------------------
      const numericSchema = stockBodyBase.pick({
        quantity: true,
        supplierPrice: true,
        shopPrice: true,
        shippingPrice: true,
      });

      const validation = numericSchema.safeParse({
        quantity: Number(quantity),
        supplierPrice: Number(supplierPrice),
        shopPrice: Number(shopPrice),
        shippingPrice: Number(shippingPrice) || 0,
      });

      if (!validation.success) {
        const errorMessages = validation.error.issues
          .map((issue) => issue.message)
          .join(", ");
        results.failed++;
        results.errors.push({
          row: rowNum,
          reason: `Validation Error: ${errorMessages}`,
        });
        continue;
      }

      // Find Product
      const product = await Product.findOne({
        productName: { $regex: new RegExp(`^${productName.trim()}$`, "i") }, // Case-insensitive exact match
      }).session(session);

      if (!product) {
        results.failed++;
        results.errors.push({
          row: rowNum,
          reason: `Product '${productName}' not found`,
        });
        continue;
      }

      // Find Supplier
      let supplierId = null;
      if (supplierName && supplierMap.has(supplierName.toLowerCase().trim())) {
        supplierId = supplierMap.get(supplierName.toLowerCase().trim());
      } else if (supplierName) {
        // Provided but not found
        results.failed++;
        results.errors.push({
          row: rowNum,
          reason: `Supplier '${supplierName}' not found`,
        });
        continue;
      }
      if (!supplierId) {
        results.failed++;
        results.errors.push({
          row: rowNum,
          reason: "Valid Supplier Name is required",
        });
        continue;
      }

      // VAT Logic (Reuse from OrderStocks)
      let vatId = null;
      let effectiveVatPercent = 0;

      // If product has VAT set, use it
      if (product.taxStatus === "vatable") {
        if (product.vat) {
           vatId = product.vat;
           // We need to fetch the specific VAT doc if it's not in our list (though likely is)
           const vatDoc = allVats.find(v => v._id.toString() === product.vat.toString());
           if (vatDoc) effectiveVatPercent = vatDoc.vatPercent;
           else {
             // Fallback if product points to non-existent VAT
             const liveVat = await Vat.findById(vatId).session(session);
             if (liveVat) effectiveVatPercent = liveVat.vatPercent;
           }
        } else if (defaultVat) {
          // If vatable but no VAT set, use default
          vatId = defaultVat._id;
          effectiveVatPercent = defaultVat.vatPercent;
        }
      }

      // Calcs
      const qtyNum = Number(quantity);
      const supplierPriceNum = Number(supplierPrice);
      const shopPriceNum = Number(shopPrice);
      const shippingPriceNum = Number(shippingPrice) || 0;

      if (isNaN(qtyNum) || isNaN(supplierPriceNum) || isNaN(shopPriceNum)) {
        results.failed++;
        results.errors.push({ row: rowNum, reason: "Invalid number format" });
        continue;
      }

      const calculatedVatShopPrice =
        shopPriceNum * (1 + effectiveVatPercent / 100);
      const calculateVatToRemit =
        (calculatedVatShopPrice - shopPriceNum) * qtyNum;
      const totalCostVal = supplierPriceNum * qtyNum + shippingPriceNum;

      const newDeliveryId =
        "BATCH-" + Math.random().toString(36).substring(2, 6).toUpperCase();

      // Create Stock
      const newStock = new Stocks({
        product: product._id,
        supplier: supplierId,
        supplierPrice: supplierPriceNum,
        shopPrice: shopPriceNum,
        quantity: qtyNum,
        shippingPrice: shippingPriceNum,
        totalCost: totalCostVal,
        deliveryStatus: "delivered", // Immediate delivery for batch
        deliveryId: newDeliveryId,
        dateDelivery: dateDelivery ? new Date(dateDelivery) : new Date(),
        vat: vatId,
        vatShopPrice: calculatedVatShopPrice,
        vatToRemit: calculateVatToRemit,
      });

      await newStock.save({ session });

      // Create Log
      await orderStockLogs(
        {
          action: "admin_ordered_stock",
          userId,
          deliveryId: newDeliveryId,
          supplier: supplierId,
          category: product.category,
          quantityOrdered: qtyNum,
          supplierPrice: supplierPriceNum,
          shippingPrice: shippingPriceNum,
          vatPercentApplied: effectiveVatPercent,
          shopPrice: shopPriceNum,
          receivedDate: newStock.dateDelivery,
          receivedQuantity: qtyNum,
          totalCost: totalCostVal,
        },
        session
      );

      // Update Product
      const productUpdate = {
        status: "published", // Auto-publish
        price: calculatedVatShopPrice,
        preVatPrice: shopPriceNum,
        $push: { stocks: newStock._id },
        taxStatus: effectiveVatPercent > 0 ? "vatable" : "exempt",
        totalVat: effectiveVatPercent,
        supplier: supplierId, // ✅ Update supplier on batch order
      };

      await Product.findByIdAndUpdate(product._id, productUpdate, { session });

      // Update Supplier
      await Supplier.findByIdAndUpdate(
        supplierId,
        { $addToSet: { product: product._id } },
        { session }
      );

      // Update VAT
      if (vatId) {
        await Vat.findByIdAndUpdate(
          vatId,
          { $addToSet: { productId: product._id } },
          { session }
        );
      }

      results.created++;
    }

    await session.commitTransaction();
    res.status(200).json(results);
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};
