import { handleMakeError } from "../middleware/handleError.js";
import Product from "../models/product.model.js";
import Stocks from "../models/stocks.model.js";

export const addProduct = async (req, res, next) => {
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
    res.status(200).json(newProduct);
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find()
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

export const deleteProduct = async (req, res, next) => {
  const { productId } = req.params;

  try {
    const singleProduct = await Product.findById(productId);

    if (!singleProduct) return next(handleMakeError(400, "Product not found"));

    await Stocks.deleteMany({ product: productId });

    await Product.findByIdAndDelete(productId);

    res.status(200).json({ message: "Successfully deleted" });
  } catch (error) {
    next(error);
  }
};

export const editProduct = async (req, res, next) => {
  const { id } = req.params;

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
        supplier,
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

    res.status(200).json(updateProduct);
  } catch (error) {
    next(error);
  }
};

export const getSingleProduct = async (req, res, next) => {
  const { id } = req.params;

  try {
    const getSingleProduct = await Product.findById(id);

    if (!getSingleProduct)
      return next(handleMakeError(400, "Product not found"));

    res.status(200).json(getSingleProduct);
  } catch (error) {
    next(error);
  }
};

export const draftProduct = async (req, res, next ) => {
  try {
    
  } catch (error) {
    next(error)
  }
}