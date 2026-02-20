import Category from "../models/category.model.js";
import { handleMakeError } from "../middleware/handleError.js";
import { logAuditTrail } from "./audit.controller.js";
import { createCategorySchema } from "../schema/category.schema.js";
import Stocks from "../models/stocks.model.js";

export const addCategory = async (req, res, next) => {
  const { categoryName, categoryDescription } = req.body;
  const userId = req.user.id;

  /* 
    VALIDATION REFACTOR NOTE:
    Manual validations for categoryName and categoryDescription have been removed.
    These are now handled by Zod middleware in routes/category.route.js
  */

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
    const { 
      page = 1, 
      limit = 10, 
      search 
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Base query: exclude archived
    const query = { isArchived: { $ne: true } };

    // Search logic
    if (search) {
      const searchRegex = new RegExp(search, "i");
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(search);

      if (isObjectId) {
        query.$or = [
          { categoryName: searchRegex },
          { _id: search }
        ];
      } else {
        query.categoryName = searchRegex;
      }
    }

    // Fetch categories with pagination
    const categories = await Category.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const totalCount = await Category.countDocuments(query);

    res.status(200).json({
      categories,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      hasMore: totalCount > pageNum * limitNum,
    });
  } catch (error) {
    next(error);
  }
};

export const getArchivedCategories = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10,
      search = ""
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const query = { 
      isArchived: true,
      ...(search && { categoryName: { $regex: search, $options: "i" } }),
    };

    const categories = await Category.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalCount = await Category.countDocuments(query);

    res.status(200).json({
      categories,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      hasMore: totalCount > pageNum * limitNum,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMultiCategory = async (req, res, next) => {
  const { categoryIds } = req.body;
  const userId = req.user.id;

  if (!Array.isArray(categoryIds)) {
    return next(handleMakeError(400, "CategoryIds should be an array"));
  }

  try {
    const categories = await Category.find({
      _id: {
        $in: categoryIds,
      },
    });

    if (categories.length !== categoryIds.length) {
      const foundIds = categories.map((c) => c._id.toString());
      const missingIds = categoryIds.filter((id) => !foundIds.includes(id));
      return next(
        handleMakeError(400, `Categories not found: ${missingIds.join(", ")}`)
      );
    }

    // Check if any category is in use
    const categoriesInUse = await Stocks.find({
      category: { $in: categoryIds },
    }).distinct("category");

    const categoriesWithProducts = categories
      .filter((c) => c.products?.length > 0)
      .map((c) => c._id.toString());

    const allUsedCategories = [
      ...new Set([
        ...categoriesInUse.map((id) => id.toString()),
        ...categoriesWithProducts,
      ]),
    ];

    if (allUsedCategories.length > 0) {
      const usedCategoryNames = categories
        .filter((c) => allUsedCategories.includes(c._id.toString()))
        .map((c) => c.categoryName);
        
      return next(
        handleMakeError(
          400,
          `These categories are in use and cannot be archived: ${usedCategoryNames.join(
            ", "
          )}`
        )
      );
    }

    // Soft Delete: Mark isArchived = true for all selected categories
    await Category.updateMany(
      { _id: { $in: categoryIds } },
      { isArchived: true }
    );

    // Get category names for audit trail
    const categoryNames = categories.reduce((acc, category) => {
      acc[category._id] = category.categoryName;
      return acc;
    }, {});

    // Create audit trail entries for each archived category
    await Promise.all(
      categoryIds.map((id) =>
        logAuditTrail({
          action: "archive_category_bulk",
          userId,
          targetId: id,
          targetType: "Category",
          details: {
            categoryName: categoryNames[id],
          },
          role: "admin",
        })
      )
    );

    res.status(200).json({
      message: `${categoryIds.length} categories archived successfully`,
      deletedCount: categoryIds.length,
    });
  } catch (error) {
    console.log(error);
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

    // Check if category is in use
    const categoryInUse = await Stocks.exists({ category: categoryId });
    if (categoryInUse || singleCategory?.products?.length > 0) {
      return next(
        handleMakeError(400, "Category is in use (has products/stocks) and cannot be archived")
      );
    }

    const categoryName = singleCategory.categoryName;

    // SOFT DELETE: Mark as archived
    await Category.findByIdAndUpdate(categoryId, { isArchived: true });

    await logAuditTrail({
      action: "archive_category",
      userId,
      targetId: singleCategory._id,
      targetType: "Category",
      details: {
        categoryName,
      },
      role: "admin",
    });

    res.status(200).json({ message: "Category archived successfully" });
  } catch (error) {
    next(error);
  }
};

export const restoreCategory = async (req, res, next) => {
  const { categoryId } = req.params;
  const userId = req.user.id;

  try {
    const category = await Category.findById(categoryId);

    if (!category) return next(handleMakeError(400, "Category not found!"));

    if (!category.isArchived) {
      return next(handleMakeError(400, "Category is not archived"));
    }

    await Category.findByIdAndUpdate(categoryId, { isArchived: false });

    await logAuditTrail({
      action: "restore_category",
      userId,
      targetId: category._id,
      targetType: "Category",
      details: {
        categoryName: category.categoryName,
      },
      role: "admin",
    });

    res.status(200).json({ message: "Category restored successfully" });
  } catch (error) {
    next(error);
  }
};

export const editCategory = async (req, res, next) => {
  const userId = req.user.id;
  const { categoryId } = req.params;
  const { categoryName, categoryDescription } = req.body;

  /* 
    VALIDATION REFACTOR NOTE:
    Manual validations for categoryName and categoryDescription have been removed.
  */

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

// --- Batch Category Upload Logic ---

export const getCategoryCsvTemplate = async (req, res, next) => {
  try {
    const headers = ["categoryName", "categoryDescription"];

    const exampleRow = ["Example Category", "Description of the category"];

    const csvContent = [headers.join(","), exampleRow.join(",")].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="category_upload_template.csv"'
    );
    res.send(csvContent);
  } catch (error) {
    next(error);
  }
};

export const batchAddCategories = async (req, res, next) => {
  const file = req.file;
  if (!file) {
    return next(handleMakeError(400, "No CSV file uploaded"));
  }

  const userId = req.user.id;
  const Papa = await import("papaparse");

  try {
    const csvData = file.buffer.toString("utf-8");
    const { data, errors: parseErrors } = Papa.default.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
    });

    if (parseErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "CSV parsing error",
        errors: parseErrors,
      });
    }

    if (data.length === 0) {
      return next(handleMakeError(400, "CSV file is empty"));
    }

    const results = {
      created: 0,
      failed: 0,
      errors: [],
    };

    // Cache existing categories to check duplicates efficiently
    const existingCategories = await Category.find({}, "categoryName");
    const existingNames = new Set(
      existingCategories.map((c) => c.categoryName.toLowerCase().trim())
    );

    for (const [index, row] of data.entries()) {
      const rowNum = index + 2;
      const { categoryName, categoryDescription } = row;

      if (!categoryName) {
        results.failed++;
        results.errors.push({
          row: rowNum,
          reason: "Missing categoryName",
        });
        continue;
      }

      // ----------------------------------------------------
      // Use Zod Schema for validation
      // Reuse the same schema as single add (createCategorySchema)
      // ----------------------------------------------------
      const validation = createCategorySchema.shape.body.safeParse({
        categoryName: categoryName.trim(),
        categoryDescription: (categoryDescription || "").trim(),
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

      const normalizedName = categoryName.trim();

      if (existingNames.has(normalizedName.toLowerCase())) {
        results.failed++;
        results.errors.push({
          row: rowNum,
          reason: `Category '${normalizedName}' already exists`,
        });
        continue;
      }

      // Create Category
      try {
        const newCategory = new Category({
          categoryName: normalizedName,
          categoryDescription: categoryDescription || "",
        });
        await newCategory.save();

        // Audit Log
        await logAuditTrail({
          action: "create_category",
          userId,
          targetId: newCategory._id,
          targetType: "Category",
          details: { categoryName: normalizedName },
          role: "admin",
        });

        // Add to Set to prevent duplicates within same batch
        existingNames.add(normalizedName.toLowerCase());
        results.created++;
      } catch (err) {
        results.failed++;
        results.errors.push({
          row: rowNum,
          reason: err.message || "Database error",
        });
      }
    }

    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};
