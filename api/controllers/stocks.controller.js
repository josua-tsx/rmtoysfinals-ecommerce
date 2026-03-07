import mongoose from "mongoose";
import { handleMakeError } from "../middleware/handleError.js";
import Product from "../models/product.model.js";
import Stocks from "../models/stocks.model.js";
import Supplier from "../models/supplier.model.js";
import User from "../models/user.models.js";
import Vat from "../models/vat.models.js";
import { stockNotificationEmail } from "../template/stockEmailTemplates.js";



import { sendSMS } from "../utils/smsService.js";
import { orderStockLogs } from "./orderStockHistory.contoller.js";
import { sendGrid } from "../sendGrid/sendGrid.js";
import { orderStockSchema, stockBodyBase } from "../schema/stock.schema.js";
import { checkAndSendStockAlerts } from "../services/stockAlert.service.js";

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
    deliveryId,
    dateDelivery,
    vat,
    notifySubscribedUser,
  } = req.body;

  // ✅ Fetch subscribed emails OUTSIDE the transaction (not transactional data)
  const subscribedEmails = await User.find({
    isSubscribed: true,
  }).distinct("email");

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // ✅ Fetch Product FIRST to check Tax Status
    const productExists = await Product.findById(product).session(session);
    if (!productExists) {
      throw handleMakeError(404, "Product not found");
    }

    // ✅ Handle VAT Logic
    let vatExists = null;

    if (productExists.taxStatus === "vatable") {
      if (!vat || !mongoose.Types.ObjectId.isValid(vat)) {
        throw handleMakeError(400, "VAT ID is required for vatable products");
      }
      vatExists = await Vat.findById(vat).session(session);
      if (!vatExists) {
        throw handleMakeError(404, "VAT not found");
      }
    }

    const supplierExists = await Supplier.findById(supplier).session(session);
    if (!supplierExists) {
      throw handleMakeError(404, "Supplier not found");
    }

    // ✅ Calculate ALL values server-side (never trust client for financial data)
    const vatPercent = vatExists ? vatExists.vatPercent : 0;
    const calculatedVatShopPrice = Number(shopPrice) * (1 + vatPercent / 100);
    const calculatedVatToRemit =
      (calculatedVatShopPrice - Number(shopPrice)) * Number(quantity);
    const calculatedTotalCost =
      Number(supplierPrice) * Number(quantity) + Number(shippingPrice);

    // ✅ Create and save new delivery
    const newDelivery = new Stocks({
      product,
      supplier,
      supplierPrice: Number(supplierPrice) || 0,
      shopPrice: Number(shopPrice),
      quantity: Number(quantity),
      shippingPrice: Number(shippingPrice),
      totalCost: calculatedTotalCost,
      deliveryStatus: "delivered",
      deliveryId,
      dateDelivery: new Date(dateDelivery),
      vat: vatExists ? vatExists._id : null,
      vatShopPrice: calculatedVatShopPrice,
      vatToRemit: calculatedVatToRemit,
    });

    await newDelivery.save({ session });

    // ✅ Log the stock order
    await orderStockLogs(
      {
        action: "admin_ordered_stock",
        userId,
        deliveryId,
        supplier,
        category: productExists.category || null,
        quantityOrdered: Number(quantity),
        supplierPrice: Number(supplierPrice) || 0,
        shippingPrice: Number(shippingPrice),
        vatPercentApplied: vatPercent,
        shopPrice: Number(shopPrice),
        receivedDate: new Date(dateDelivery),
        receivedQuantity: Number(quantity),
        totalCost: calculatedTotalCost,
      },
      session
    );

    // ✅ Update related documents (conditionally built array)
    const updateOps = [
      Product.findByIdAndUpdate(
        product,
        {
          status: "published",
          price: calculatedVatShopPrice,
          preVatPrice: Number(shopPrice),
          $push: { stocks: newDelivery._id },
          taxStatus: vatPercent > 0 ? "vatable" : "exempt",
          totalVat: vatPercent,
          supplier: supplier,
        },
        { new: true, runValidators: true, session }
      ),
      Supplier.findByIdAndUpdate(
        supplier,
        { $addToSet: { product: newDelivery.product } },
        { session }
      ),
    ];

    if (vatExists) {
      updateOps.push(
        Vat.findByIdAndUpdate(
          vat,
          { $addToSet: { productId: newDelivery.product } },
          { session }
        )
      );
    }

    await Promise.all(updateOps);

    // ✅ Commit Transaction
    await session.commitTransaction();

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
    console.error("OrderStocks error:", error);
    next(error);
  } finally {
    // ✅ Session cleanup ALWAYS runs — no more repetitive endSession() calls
    session.endSession();
  }
};



// ✅ Background email processing function
const processEmailsInBackground = async (
  emails,
  product,
  newDelivery,
  quantity
) => {
  const results = { successful: 0, failed: 0, errors: [] };

  console.log(
    `🔄 Starting background email sending to ${emails.length} users`
  );

  const emailSubject = `New Stock Arrival Notification - ${product.productName}`;
  const emailBody = stockNotificationEmail(product, newDelivery, quantity);

  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];

    try {
      await sendGrid(email, emailSubject, emailBody);
      results.successful++;
      console.log(
        `✅ Email sent to ${email} (${i + 1}/${emails.length})`
      );

      // ✅ Add small delay to avoid rate limiting
      if (i < emails.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    } catch (error) {
      results.failed++;
      results.errors.push({ email, error: error.message });
      console.error(`❌ Failed to send email to ${email}:`, error.message);
    }
  }

  console.log(
    `📧 Email summary: ${results.successful} sent, ${results.failed} failed`
  );
  return results;
};


export const updateStockQuantity = async (req, res, next) => {
  const { productId } = req.params;
  const { quantity, reason } = req.body;
  const userId = req.user.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Fetch all stock batches for this product, ordered by oldest first (FIFO)
    const stockBatches = await Stocks.find({ product: productId, deliveryStatus: "delivered" }).sort({ createdAt: 1 }).session(session);

    if (!stockBatches || stockBatches.length === 0) {
      throw handleMakeError(404, "No stock entries found for this product.");
    }

    // Calculate total current stock
    const currentTotalStock = stockBatches.reduce((sum, batch) => sum + batch.quantity, 0);

    // Identity Guard: Prevent redundant updates
    if (quantity === currentTotalStock) {
      throw handleMakeError(400, "The new quantity is identical to the current quantity. No changes made.");
    }

    // Reduction Guard
    const reductionAmount = currentTotalStock - quantity;
    if (reductionAmount === currentTotalStock) {
      throw handleMakeError(400, "Manual adjustments cannot reduce stock to zero. Please archive the stock or set a non-zero value.");
    }

    if (quantity < 0) {
      throw handleMakeError(400, "Inventory levels cannot be negative.");
    }

    // Increase Threshold Guard: Prevent misuse for reordering
    const delta = quantity - currentTotalStock;
    if (delta > 0) {
      const threshold = Math.max(20, Math.ceil(currentTotalStock * 0.1));
      if (delta > threshold) {
        throw handleMakeError(400, `Manual increase of ${delta} units exceeds the safety threshold (${threshold}). Please use the 'Order Stock' function for large inventory updates to maintain proper tracking.`);
      }
    }

    // 2. Distribute the delta across batches
    let remainingDelta = Math.abs(delta);
    
    // We need some reference values for logging based on the product
    const referenceBatch = stockBatches[stockBatches.length - 1]; // Use latest for prices
    
    if (delta < 0) {
      // REDUCTION (FIFO: Reduce oldest stocks first)
      for (const batch of stockBatches) {
        if (remainingDelta === 0) break;
        
        const amountToDeduct = Math.min(batch.quantity, remainingDelta);
        batch.quantity -= amountToDeduct;
        
        // Recalculate totals for this batch
        batch.totalCost = (batch.supplierPrice * batch.quantity) + batch.shippingPrice;
        batch.vatToRemit = (batch.vatShopPrice - batch.shopPrice) * batch.quantity;
        
        await batch.save({ session });
        remainingDelta -= amountToDeduct;
      }
    } else {
      // INCREASE (Add to the most recent stock batch)
      const latestBatch = stockBatches[stockBatches.length - 1];
      latestBatch.quantity += remainingDelta;
      
      latestBatch.totalCost = (latestBatch.supplierPrice * latestBatch.quantity) + latestBatch.shippingPrice;
      latestBatch.vatToRemit = (latestBatch.vatShopPrice - latestBatch.shopPrice) * latestBatch.quantity;
      
      await latestBatch.save({ session });
    }

    // 3. Audit Logging
    await orderStockLogs(
      {
        action: "manual_adjustment",
        userId,
        deliveryId: "MANUAL_ADJ_BATCH",
        supplier: referenceBatch.supplier || null,
        category: referenceBatch.category || null,
        quantityOrdered: currentTotalStock, // Old quantity
        supplierPrice: referenceBatch.supplierPrice || 0,
        shippingPrice: referenceBatch.shippingPrice || 0,
        vatPercentApplied: referenceBatch.vatPercentApplied || 0,
        shopPrice: referenceBatch.shopPrice || 0,
        receivedDate: new Date().toISOString(),
        receivedQuantity: quantity, // New quantity
        totalCost: referenceBatch.totalCost, // Approximate for log
        reason: `[ADJ: ${delta > 0 ? "+" : ""}${delta}] ${reason}`,
      },
      session
    );

    await session.commitTransaction();

    // Fire and forget alerts (async)
    checkAndSendStockAlerts();

    res.status(200).json({
      message: "Stock quantity adjusted successfully across batches.",
      previousQuantity: currentTotalStock,
      newQuantity: quantity,
      delta,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
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
    const { 
      page = 1, 
      limit = 10, 
      search 
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build the aggregation pipeline
    const pipeline = [
      { $match: { deliveryStatus: "delivered" } },
      
      // Lookup relations
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },

      // Exclude stocks for archived products
      { $match: { "product.isArchived": { $ne: true } } },

      {
        $lookup: {
          from: "suppliers",
          localField: "supplier",
          foreignField: "_id",
          as: "supplier",
        },
      },
      { $unwind: { path: "$supplier", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
           from: "categories",
           localField: "product.category",
           foreignField: "_id",
           as: "product.category"
        }
      },
      { $unwind: { path: "$product.category", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "vats",
          localField: "vat",
          foreignField: "_id",
          as: "vat",
        },
      },
      { $unwind: { path: "$vat", preserveNullAndEmptyArrays: true } },
    ];

    // Search Match Stage
    if (search) {
      const searchRegex = new RegExp(search, "i");
      pipeline.push({
        $match: {
          $or: [
            { deliveryId: searchRegex },
            { "product.productName": searchRegex },
            { "supplier.supplierName": searchRegex },
            { "product.category.categoryName": searchRegex },
          ],
        },
      });
    }

    // Sort by latest delivery
    pipeline.push({ $sort: { createdAt: -1 } });

    // --- NEW: Group by Product so the table doesn't show duplicates ---
    pipeline.push({
      $group: {
        _id: "$product._id",
        // Keep the product details
        product: { $first: "$product" },
        // Keep the latest supplier details
        supplier: { $first: "$supplier" },
        // Keep the latest delivery date/ID for reference
        deliveryId: { $first: "$deliveryId" },
        dateDelivery: { $first: "$dateDelivery" },
        createdAt: { $first: "$createdAt" },
        // Aggregate stock numbers
        quantity: { $sum: "$quantity" },
        totalCost: { $sum: "$totalCost" },
        vatToRemit: { $sum: "$vatToRemit" },
        // Use the latest prices
        shopPrice: { $first: "$shopPrice" },
        vatShopPrice: { $first: "$vatShopPrice" },
        supplierPrice: { $first: "$supplierPrice" },
        shippingPrice: { $first: "$shippingPrice" },
        vat: { $first: "$vat" },
      }
    });

    // Sort the final grouped results alphabetically or by date
    pipeline.push({ $sort: { "product.productName": 1 } });

    // Pagination Facet
    const facetPipeline = [
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: skip }, { $limit: limitNum }],
        },
      },
    ];

    const result = await Stocks.aggregate([...pipeline, ...facetPipeline]);

    const data = result[0].data;
    const totalCount = result[0].metadata[0]?.total || 0;
    
    res.status(200).json({
      stocks: data,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      hasMore: totalCount > pageNum * limitNum,
    });
  } catch (error) {
    next(error);
  }
};

export const getStockLevels = async (req, res, next) => {
  try {
    // Helper to filter out stocks for archived products
    const filterArchived = (stocks) =>
      stocks.filter((s) => s.product && !s.product.isArchived);

    // Query for stocks based on the stock levels
    const highStock = await Stocks.find({
      quantity: { $gte: 50 },
    })
      .populate({
        path: "product",
        select: "productImages productName isArchived",
      })
      .sort({ createdAt: -1 });

    const mediumStock = await Stocks.find({
      quantity: { $gte: 30, $lt: 50 },
    })
      .populate({
        path: "product",
        select: "productImages productName isArchived",
      })
      .sort({ createdAt: -1 });

    // FIX IS HERE: Use $gte: 1 to include items with quantity of 1
    const lowStock = await Stocks.find({ quantity: { $gte: 1, $lt: 30 } }) 
      .populate({
        path: "product",
        select: "productImages productName isArchived",
      })
      .sort({ createdAt: -1 });

    const outOfStock = await Stocks.find({ quantity: 0 })
      .populate({
        path: "product",
        select: "productImages productName isArchived",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      highStock: filterArchived(highStock),
      mediumStock: filterArchived(mediumStock),
      lowStock: filterArchived(lowStock),
      outOfStock: filterArchived(outOfStock),
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
