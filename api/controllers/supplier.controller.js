import Supplier from "../models/supplier.model.js";
import { handleMakeError } from "../middleware/handleError.js";
import { logAuditTrail } from "./audit.controller.js";
import Stocks from "../models/stocks.model.js";


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
    const getSuppliers = await Supplier.find().sort({ createdAt: -1 });
    if (!getSuppliers)
      return next(handleMakeError(400, "no suppliers availabe"));
    res.status(200).json(getSuppliers);
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
      return next(
        handleMakeError(
          400,
          `These suppliers are in use and cannot be deleted ${allUsedSuppliers.join(
            ", "
          )}`
        )
      );
    }

    const supplierNames = supplier.reduce((acc, supplier) => {
      acc[supplier._id] = supplier.supplierName;
      return acc;
    }, {});

    await Supplier.deleteMany({ _id: { $in: supplierIds } });

    await Promise.all(
      supplierIds.map((id) =>
        logAuditTrail({
          action: "delete_supplier",
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

    await Supplier.findByIdAndDelete(supplierId);

    await logAuditTrail({
      action: "delete_supplier",
      userId,
      targetId: singleSupplier._id,
      targetType: "Supplier",
      details: {
        supplierName, // Use the correct variable name
      },
      role: "admin",
    });

    res.status(200).json({ message: "Successfully deleted the supplier" });
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
