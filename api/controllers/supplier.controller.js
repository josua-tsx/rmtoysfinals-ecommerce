import Supplier from "../models/supplier.model.js";
import { handleMakeError } from "../middleware/handleError.js";
import { logAuditTrail } from "./audit.controller.js";
import { createSupplierSchema } from "../schema/supplier.schema.js";
import Stocks from "../models/stocks.model.js";
import User from "../models/user.models.js";
import Rider from "../models/rider.models.js";


export const addSupplier = async (req, res, next) => {
  const userId = req.user.id;

  const {
    contactNumber,
    supplierName,
    contactPerson,
    supplierAddress,
    enableNotifications,
  } = req.body;

  /* 
    VALIDATION REFACTOR NOTE:
    Manual validations for supplierName, contactNumber, contactPerson, 
    and supplierAddress have been removed.
    These are now handled by Zod middleware in routes/supplier.route.js
  */

  try {
    // Check for duplicate supplier name
    const existingSupplier = await Supplier.findOne({
      supplierName: { $regex: new RegExp(`^${supplierName.trim()}$`, "i") },
    });

    if (existingSupplier) {
      return next(handleMakeError(400, "Supplier name already exists"));
    }

    // Check for duplicate phone number across User, Rider, and Supplier collections
    const [phoneExistsInUser, phoneExistsInRider, phoneExistsInSupplier] = await Promise.all([
      User.findOne({ phoneNumber: contactNumber }),
      Rider.findOne({ riderPhoneNumber: contactNumber }),
      Supplier.findOne({ contactNumber })
    ]);

    if (phoneExistsInUser) {
      return next(handleMakeError(400, "Phone number is already in use by another account"));
    }
    if (phoneExistsInRider) {
      return next(handleMakeError(400, "Phone number is already in use by another account"));
    }
    if (phoneExistsInSupplier) {
      return next(handleMakeError(400, "Phone number is already in use by another account"));
    }

    const newSupplier = new Supplier({
      supplierName,
      contactPerson,
      contactNumber,
      supplierAddress,
      enableNotifications,
    });

    await newSupplier.save();

    await logAuditTrail({
      action: "create_supplier",
      userId,
      targetId: newSupplier._id,
      targetType: "Supplier",
      details: {
        supplierName: supplierName,
      },
      role: "admin",
    });

    res.status(200).json(newSupplier);
  } catch (error) {
    next(error);
  }
};

export const getSuppliers = async (req, res, next) => {
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
          { supplierName: searchRegex },
          { _id: search }
        ];
      } else {
        query.supplierName = searchRegex;
      }
    }

    // Fetch suppliers with pagination
    const suppliers = await Supplier.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const totalCount = await Supplier.countDocuments(query);

    res.status(200).json({
      suppliers,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      hasMore: totalCount > pageNum * limitNum,
    });
  } catch (error) {
    next(error);
  }
};

export const getArchivedSuppliers = async (req, res, next) => {
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
      ...(search && { supplierName: { $regex: search, $options: "i" } }),
    };

    const suppliers = await Supplier.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalCount = await Supplier.countDocuments(query);

    res.status(200).json({
      suppliers,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      hasMore: totalCount > pageNum * limitNum,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMultiSupplier = async (req, res, next) => {
  const { supplierIds } = req.body;
  const userId = req.user.id;

  if (!Array.isArray(supplierIds)) {
    return next(handleMakeError(400, "SupplierIds should be an array"));
  }

  try {
    const supplier = await Supplier.find({ _id: { $in: supplierIds } });

    if (supplier.length !== supplierIds.length) {
      const foundIds = supplier.map((s) => s._id.toString());
      const missingIds = supplier.filter((id) => !foundIds.includes(id));
      return next(
        handleMakeError(400, `Suppliers not found ${missingIds.join(", ")}`)
      );
    }

    const supplierInUse = await Supplier.find({
      supplier: supplierIds,
    }).distinct("supplier");

    const supplierWithProducts = supplier
      .filter((s) => s.product?.length > 0)
      .map((s) => s._id.toString());

    const allUsedSuppliers = [
      ...new Set([
        ...supplierInUse.map((id) => id.toString()),
        ...supplierWithProducts,
      ]),
    ];

    if (allUsedSuppliers.length > 0) {
      const usedSupplierNames = supplier
        .filter((s) => allUsedSuppliers.includes(s._id.toString()))
        .map((s) => s.supplierName);
        
      return next(
        handleMakeError(
          400,
          `These suppliers are in use and cannot be deleted: ${usedSupplierNames.join(
            ", "
          )}`
        )
      );
    }

    // Soft Delete: Mark isArchived = true
    await Supplier.updateMany(
      { _id: { $in: supplierIds } },
      { isArchived: true }
    );

    const supplierNames = supplier.reduce((acc, supplier) => {
      acc[supplier._id] = supplier.supplierName;
      return acc;
    }, {});

    await Promise.all(
      supplierIds.map((id) =>
        logAuditTrail({
          action: "delete_supplier_bulk",
          userId,
          targetId: id,
          targetType: "Supplier",
          details: {
            supplierName: supplierNames[id],
          },
          role: "admin",
        })
      )
    );

    res.status(200).json({
      message: `${supplierIds.length} suppliers deleted successfully`,
      deletedCount: supplierIds.length,
    });
  } catch (error) {
    next(error);
    console.log(error);
  }
};

export const deleteSupplier = async (req, res, next) => {
  const userId = req.user.id;
  const { supplierId } = req.params;

  try {
    const singleSupplier = await Supplier.findById(supplierId);

    if (!singleSupplier) {
      return next(handleMakeError(400, "Supplier not found!"));
    }

    const supplierInUse = await Stocks.exists({ supplier: supplierId });
    if (supplierInUse || singleSupplier?.product?.length > 0) {
      return next(
        handleMakeError(400, "Supplier is in use and cannot be deleted")
      );
    }

    const supplierName = singleSupplier.supplierName;

    // SOFT DELETE: Mark as archived
    await Supplier.findByIdAndUpdate(supplierId, { isArchived: true });

    await logAuditTrail({
      action: "delete_supplier",
      userId,
      targetId: singleSupplier._id,
      targetType: "Supplier",
      details: {
        supplierName,
      },
      role: "admin",
    });

    res.status(200).json({ message: "Supplier deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const restoreSupplier = async (req, res, next) => {
  const userId = req.user.id;
  const { supplierId } = req.params;

  try {
    const supplier = await Supplier.findById(supplierId);

    if (!supplier) {
      return next(handleMakeError(400, "Supplier not found!"));
    }

    if (!supplier.isArchived) {
      return next(handleMakeError(400, "Supplier is not archived"));
    }

    await Supplier.findByIdAndUpdate(supplierId, { isArchived: false });

    await logAuditTrail({
      action: "restore_supplier",
      userId,
      targetId: supplier._id,
      targetType: "Supplier",
      details: {
        supplierName: supplier.supplierName,
      },
      role: "admin",
    });

    res.status(200).json({ message: "Supplier restored successfully" });
  } catch (error) {
    next(error);
  }
};

export const editSupplier = async (req, res, next) => {
  const userId = req.user.id;

  const { supplierId } = req.params;
  const {
    supplierName,
    contactPerson,
    contactNumber,
    supplierAddress,
    enableNotifications,
  } = req.body;

  /* 
    VALIDATION REFACTOR NOTE:
    Manual validations for contactNumber, supplierName, contactPerson, 
    and supplierAddress have been removed.
  */

  try {
    // Check for duplicate supplier name
    if (supplierName) {
      const existingSupplierName = await Supplier.findOne({
        supplierName: { $regex: new RegExp(`^${supplierName.trim()}$`, "i") },
        _id: { $ne: supplierId },
      });

      if (existingSupplierName) {
        return next(handleMakeError(400, "Supplier name already exists"));
      }
    }

    // Check for duplicate phone number across User, Rider, and Supplier collections
    if (contactNumber !== undefined) {
      const [phoneExistsInUser, phoneExistsInRider, phoneExistsInSupplier] = await Promise.all([
        User.findOne({ phoneNumber: contactNumber }),
        Rider.findOne({ riderPhoneNumber: contactNumber }),
        Supplier.findOne({ contactNumber, _id: { $ne: supplierId } }) // Exclude current supplier
      ]);

      if (phoneExistsInUser) {
        return next(handleMakeError(400, "Phone number is already in use by another account"));
      }
      if (phoneExistsInRider) {
        return next(handleMakeError(400, "Phone number is already in use by another account"));
      }
      if (phoneExistsInSupplier) {
        return next(handleMakeError(400, "Phone number is already in use by another account"));
      }
    }

    const updateSupplier = await Supplier.findByIdAndUpdate(supplierId, {
      supplierName,
      contactPerson,
      contactNumber,
      supplierAddress,
      enableNotifications,
    });

    if (!updateSupplier)
      return next(handleMakeError(400, "Supplier not found!"));

    await logAuditTrail({
      action: "update_supplier",
      userId,
      targetId: updateSupplier._id,
      targetType: "Supplier",
      details: {
        supplierName: supplierName,
      },
      role: "admin",
    });

    res.status(200).json(updateSupplier);
  } catch (error) {
    next(error);
  }
};

export const getSingleSupplier = async (req, res, next) => {
  const { supplierId } = req.params;

  try {
    const getSingleSupplier = await Supplier.findById(supplierId);
    if (!getSingleSupplier)
      return next(handleMakeError(400, "Supplier not found"));
    res.status(200).json(getSingleSupplier);
  } catch (error) {
    next(error);
  }
};

export const toggleNotification = async (req, res, next) => {
  const { supplierId } = req.params;
  const { enableNotifications } = req.body;
  const userId = req.user.id;

  try {
    const supplier = await Supplier.findByIdAndUpdate(
      supplierId,
      { enableNotifications },
      { new: true }
    );

    if (!supplier) {
      return next(handleMakeError(404, "Supplier not found"));
    }

    await logAuditTrail({
      action: "toggle_notification",
      userId,
      targetId: supplier._id,
      targetType: "Supplier",
      details: {
        supplierName: supplier.supplierName,
        status: enableNotifications ? "Enabled" : "Disabled",
      },
      role: "admin",
    });

    res.status(200).json(supplier);
  } catch (error) {
    next(error);
  }
};

// --- Batch Supplier Upload Logic ---

export const getSupplierCsvTemplate = async (req, res, next) => {
  try {
    const headers = [
      "supplierName",
      "contactPerson",
      "contactNumber",
      "supplierAddress",
      "enableNotifications", // TRUE or FALSE
    ];

    const exampleRow = [
      "Example Supplier Inc.",
      "Juan Dela Cruz",
      "09123456789",
      "123 Toy Street, Manila",
      "TRUE",
    ];

    const csvContent = [headers.join(","), exampleRow.join(",")].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="supplier_upload_template.csv"'
    );
    res.send(csvContent);
  } catch (error) {
    next(error);
  }
};

export const batchAddSuppliers = async (req, res, next) => {
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

    // Cache existing suppliers
    const existingSuppliers = await Supplier.find({}, "supplierName contactNumber");
    const existingNames = new Set(
      existingSuppliers.map((s) => s.supplierName.toLowerCase().trim())
    );
    const existingSupplierPhones = new Set(
      existingSuppliers.map((s) => s.contactNumber)
    );

    // Pre-fetch User and Rider phones for cross-collection duplicate check
    const allUsers = await User.find({}, "phoneNumber");
    const existingUserPhones = new Set(allUsers.map((u) => u.phoneNumber));

    const allRiders = await Rider.find({}, "riderPhoneNumber");
    const existingRiderPhones = new Set(allRiders.map((r) => r.riderPhoneNumber));

    for (const [index, row] of data.entries()) {
      const rowNum = index + 2;
      const {
        supplierName,
        contactPerson,
        contactNumber,
        supplierAddress,
        enableNotifications,
      } = row;

      if (
        !supplierName ||
        !contactPerson ||
        !contactNumber ||
        !supplierAddress
      ) {
        results.failed++;
        results.errors.push({
          row: rowNum,
          reason: "Missing required fields",
        });
        continue;
      }

      // ----------------------------------------------------
      // Use Zod Schema for validation
      // Reuse the same schema as single add (createSupplierSchema)
      // ----------------------------------------------------
      const validation = createSupplierSchema.shape.body.safeParse({
        supplierName: supplierName.trim(),
        contactPerson: contactPerson.trim(),
        contactNumber: contactNumber.trim(),
        supplierAddress: supplierAddress.trim(),
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

      const normalizedName = supplierName.trim();
      const normalizedPhone = contactNumber.trim();

      if (existingNames.has(normalizedName.toLowerCase())) {
        results.failed++;
        results.errors.push({
          row: rowNum,
          reason: `Supplier '${normalizedName}' already exists`,
        });
        continue;
      }

      // Check duplications for phone
      if (existingSupplierPhones.has(normalizedPhone)) {
        results.failed++;
        results.errors.push({
          row: rowNum,
          reason: `Phone '${normalizedPhone}' already exists in Suppliers`,
        });
        continue;
      }

      if (existingUserPhones.has(normalizedPhone)) {
        results.failed++;
        results.errors.push({
          row: rowNum,
          reason: `Phone '${normalizedPhone}' belongs to a registered User`,
        });
        continue;
      }

      if (existingRiderPhones.has(normalizedPhone)) {
        results.failed++;
        results.errors.push({
          row: rowNum,
          reason: `Phone '${normalizedPhone}' belongs to a registered Rider`,
        });
        continue;
      }

      // Create Supplier
      try {
        const newSupplier = new Supplier({
          supplierName: normalizedName,
          contactPerson: contactPerson.trim(),
          contactNumber: normalizedPhone,
          supplierAddress: supplierAddress.trim(),
          enableNotifications:
            String(enableNotifications).toUpperCase() === "TRUE",
        });
        await newSupplier.save();

        // Audit Log
        await logAuditTrail({
          action: "create_supplier",
          userId,
          targetId: newSupplier._id,
          targetType: "Supplier",
          details: { supplierName: normalizedName },
          role: "admin",
        });

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
