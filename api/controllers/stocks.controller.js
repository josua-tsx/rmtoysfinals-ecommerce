import { handleMakeError } from "../middleware/handleError.js";
import Product from "../models/product.model.js";
import Stocks from "../models/stocks.model.js";

export const OrderStocks = async (req, res, next) => {
  const {
    product,
    supplier,
    supplierPrice,
    shopPrice,
    quantity,
    category,
    shippingPrice,
    totalCost,
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
    });

    await Product.findByIdAndUpdate(
      product,
      { status: "published",
        price: shopPrice,
        stocks: newDelivery._id,
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
    totalCost,
  } = req.body;
  const { deliveryId } = req.params;

  try {
    // 1. First find the existing stock
    const existingStock = await Stocks.findById(deliveryId);
    
    if (!existingStock) return next(handleMakeError(400, "No stock found!"));

    // 2. Calculate the new total quantity
    const updatedQuantity = existingStock.quantity + Number(newQuantity);

    // 3. Update the stock with all fields including the new quantity
    const updateDeliver = await Stocks.findByIdAndUpdate(
      deliveryId,
      {
        product,
        supplier,
        supplierPrice,
        shopPrice,
        quantity: updatedQuantity, // Use the summed quantity
        category,
        shippingPrice,
        totalCost,
        deliveryStatus: "delivered"
      },
      { new: true } // Return the updated document
    );

    res.status(200).json(updateDeliver);

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
        path: "supplier",
        select: "supplierName",
      })
      .sort({ createdAt: -1 });

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

    // Return a response with categorized stock levels
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
