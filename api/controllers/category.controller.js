import Category from "../models/category.model.js";
import { handleMakeError } from "../middleware/handleError.js";
import { logAuditTrail } from "./audit.controller.js";
import { isValidTextNoNumbers } from "../utils/validations.js";

export const addCategory = async (req, res, next) => {
  const { categoryName, categoryDescription } = req.body;
  const userId = req.user.id;

  if (!categoryName || !categoryDescription) {
    return next(handleMakeError(400, "Please input required fields!"));
  }

  if (!categoryName.trim()) {
    return next(handleMakeError(400, "Only spaces not allowed."));
  }

  if (!categoryDescription.trim()) {
    return next(handleMakeError(400, "Only spaces not allowed."));
  }

  if (!isValidTextNoNumbers(categoryName)) {
    return next(
      handleMakeError(
        400,
        "Category name do not allow spaces and number. It should be between 3 to 50 max characters."
      )
    );
  }

  try {
    const newCategory = new Category({
      categoryName,
      categoryDescription,
    });

    await newCategory.save();

    await logAuditTrail({
      action: "create_category",
      userId,
      targetId: newCategory._id,
      targetType: "Category",
      details: {
        categoryName,
      },
      role: "admin",
    });

    res.status(200).json(newCategory);
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const getCategories = await Category.find().sort({ createdAt: -1 });

    if (!getCategories) return res.status(200).json([]);

    res.status(200).json(getCategories);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  const { categoryId } = req.params;
  const userId = req.user.id;

  try {
    const singleCategory = await Category.findById(categoryId);

    if (!singleCategory)
      return next(handleMakeError(400, "Category not found!"));

    const categoryName = singleCategory.categoryName;

    await Category.findByIdAndDelete(categoryId);

    await logAuditTrail({
      action: "delete_category",
      userId,
      targetId: singleCategory._id,
      targetType: "Category",
      details: {
        categoryName,
      },
      role: "admin",
    });

    res.status(200).json({ message: "Category Deleted" });
  } catch (error) {
    next(error);
  }
};

export const editCategory = async (req, res, next) => {
  const userId = req.user.id;
  const { categoryId } = req.params;
  const { categoryName, categoryDescription } = req.body;

  if (!categoryName || !categoryDescription) {
    return next(handleMakeError(400, "Please input required fields!"));
  }

  if (!categoryName.trim()) {
    return next(handleMakeError(400, "Only spaces not allowed."));
  }

  if (!categoryDescription.trim()) {
    return next(handleMakeError(400, "Only spaces not allowed."));
  }

  if (!isValidTextNoNumbers(categoryName)) {
    return next(
      handleMakeError(
        400,
        "Category name do not allow spaces and number. It should be between 3 to 50 max characters."
      )
    );
  }

  try {
    const updateCategory = await Category.findByIdAndUpdate(categoryId, {
      categoryName,
      categoryDescription,
    });

    if (!updateCategory)
      return next(handleMakeError(400, "Category not found!"));

    await logAuditTrail({
      action: "update_category",
      userId,
      targetId: updateCategory._id,
      targetType: "Category",
      details: {
        categoryName,
      },
      role: "admin",
    });

    res.status(200).json({ message: "Category Updated!" });
  } catch (error) {
    console.log(error);
  }
};

export const getSingleCategory = async (req, res, next) => {
  const { categoryId } = req.params;

  try {
    const getSingleCategory = await Category.findById(categoryId);

    if (!getSingleCategory)
      return next(handleMakeError(400, "Category not found!"));

    res.status(200).json(getSingleCategory);
  } catch (error) {
    next(error);
  }
};
