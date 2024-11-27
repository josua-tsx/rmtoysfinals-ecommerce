import Cart from "../models/cart.model.js";
import { handleMakeError } from "../middleware/handleError.js";
import Product from "../models/product.model.js";
import Stocks from "../models/stocks.model.js";
import { logAuditTrail } from "./audit.controller.js";
import Review from "../models/review.model.js";

export const addProduct = async (req, res, next) => {

  const userId = req.user.id

  const {
    productName,
    price,
    productDescription,
    productDetails,
    stocks,
    discount,
    productImages,
    filters,
    category,
    supplier,
  } = req.body;

  if (!category || !supplier) {
    return next(
      handleMakeError(400, "You need category or supplier to add product!")
    );
  }

  try {
    const existingDraftProduct = await Product.findOne({
      productName,
      status: "draft",
    });

    if (existingDraftProduct) {
      return next(
        handleMakeError(400, "This product name is already in draft")
      );
    }

    const newProduct = new Product({
      productName,
      price,
      productDescription,
      productDetails,
      stocks,
      discount,
      productImages,
      filters,
      category,
      supplier,
    });

    await newProduct.save();

    // CREATING A AUDIT LOGS FOR CREATING A PRODUCT AS AN ADMIN
    await logAuditTrail({
      action: "create_product",
      userId,
      targetId: newProduct._id,
      targetType: "Product",
      details: {
        productName,
        price
      },
      role: "admin"
    })

    res.status(200).json(newProduct);
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ status: "published"})
      .populate({
        path: "supplier",
        select: "supplierName",
      })
      .populate({
        path: "category",
        select: "categoryName",
      }).populate({
        path: "stocks",
        select: "stockQuantity"
      }).populate({
        path: "reviews",
        select: "commentReview rating"
      })
      .sort({createdAt: -1})

    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

export const getNoStocksProducts = async (req, res, next) => {
  try {
    const products = await Product.find({status: {$ne: "draft"}})
      .populate({
        path: "supplier",
        select: "supplierName",
      })
      .populate({
        path: "category",
        select: "categoryName",
      }).populate({
        path: "stocks",
        select: "stockQuantity"
      })

    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  const userId = req.user.id
  const { productId } = req.params;

  try {
    const singleProduct = await Product.findById(productId);

    if (!singleProduct) return next(handleMakeError(400, "Product not found"));

    await Stocks.deleteMany({ product: productId });

    await Cart.deleteMany({"items.productId": productId})
   
    await Review.deleteMany({ productId: productId })

    await Order.deleteMany({"orderItems.productId": productId})

    await Product.findByIdAndDelete(productId);



    await logAuditTrail({
      action: "delete_product",
      userId,
      targetId: singleProduct._id,
      targetType: "Product",
      details: {
        productName: singleProduct.productName,
        price: singleProduct.price
      },
      role: "admin"
    })

    res.status(200).json({ message: "Successfully deleted" });
  } catch (error) {
    next(error);
  }
};

export const editProduct = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id

  const {
    productName,
    price,
    productDescription,
    productDetails,
    discount,
    productImages,
    filters,
    category,
    supplier,
  } = req.body;

  try {
    const updateProduct = await Product.findByIdAndUpdate(
      id,
      {
        productName,
        price,
        productDescription,
        productDetails,
        discount,
        productImages,
        filters,
        category,
        status: "published",
        category,
        supplier,
      },
      {
        new: true,
      }
    );

    if (!updateProduct) {
      return next(handleMakeError(400, "Product Not Found!"));
    }

    await logAuditTrail({
      action: "update_product",
      userId,
      targetId: updateProduct._id,
      targetType: "Product",
      details: {
        productName: updateProduct.productName,
        price: updateProduct.price
      },
      role: "admin"
    })

    res.status(200).json(updateProduct);
  } catch (error) {
    next(error);
  }
};

export const getSingleProduct = async (req, res, next) => {
  const { id } = req.params;

  try {
    const getSingleProduct = await Product.findById(id).populate({
      path: "category",
      select: "categoryName",
    }).populate({
      path: "stocks",
      select: "stockQuantity"
    }).populate({
      path: "reviews",
      select: "commentReview rating", 
      populate: { 
        path: "userId",
        select: "avatar username email"
      }
    })

    if (!getSingleProduct)
      return next(handleMakeError(400, "Product not found"));

    res.status(200).json(getSingleProduct);
  } catch (error) {
    next(error);
  }
};

// DRAFTS

export const addDraft = async (req, res, next) => {

  const userId = req.user.id

  const {
    productName,
    price,
    productDescription,
    productDetails,
    stocks,
    discount,
    productImages,
    filters,
    category,
    supplier,
  } = req.body;

  if (!category || !supplier)
    return next(
      handleMakeError(400, "You need category or supplier to add product!")
    );

  try {
    const newDraft = new Product({
      productName,
      price,
      productDescription,
      productDetails,
      stocks,
      discount,
      productImages,
      filters,
      status: "draft",
      category,
      supplier,
    });

    await newDraft.save();


    await logAuditTrail({
      action: "draft_product",
      userId,
      targetId: newDraft._id,
      targetType: "Product",
      details: {
        productName: newDraft.productName,
        price: newDraft.price
      },
      role: "admin"
    })

    res.status(200).json(newDraft);
  } catch (error) {
    next(error);
  }
};

export const getDrafts = async (req, res, next) => {
  try {
    const products = await Product.find({ status: "draft" })
      .populate({
        path: "supplier",
        select: "supplierName",
      })
      .populate({
        path: "category",
        select: "categoryName",
      });

    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

export const deleteDraft = async (req, res, next) => {
  const { draftId } = req.params;

  try {
    const singleDraft = await Product.findById(draftId);

    if (!singleDraft) return next(handleMakeError(400, "Draft is not found!"));

    await Product.findByIdAndDelete(draftId);

    res.status(200).json({ message: "draft is deleted!" });
  } catch (error) {
    next(error);
  }
};

export const publishDraft = async (req, res, next) => {
  const { draftId } = req.params;

  try {
    const publishDraft = await Product.findByIdAndUpdate(
      draftId,
      {
        status: "",
      },
      { new: true }
    );

    if (!publishDraft) return next(handleMakeError(400, "draft not found"));

    res.status(200).json(publishDraft)

  } catch (error) {
    next(error);
  }
};
