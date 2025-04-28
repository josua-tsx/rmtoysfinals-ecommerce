import Supplier from "../models/supplier.model.js";
import { handleMakeError } from "../middleware/handleError.js";
import { logAuditTrail } from "./audit.controller.js";
import {
  validateFullName,
  validatePHMobile,
  validateSupplierAddress,
  validateSupplierName,
} from "../utils/validations.js";
// import {
//   isValidFullName,
//   isValidPhoneNumber,
//   isValidText1,
//   isValidText2,
// } from "../utils/validations.js";

export const addSupplier = async (req, res, next) => {
  const userId = req.user.id;

  const { contactNumber, supplierName, contactPerson, supplierAddress } =
    req.body;

  if (!contactNumber || !supplierName || !contactPerson || !supplierAddress) {
    return next(handleMakeError(400, "Input all required fields"));
  }

  const supplierNameCheck = validateSupplierName(supplierName);
  if (!supplierNameCheck.valid) {
    return next(handleMakeError(400, supplierNameCheck.message));
  }

  const contactNumberCheck = validatePHMobile(contactNumber);
  if (!contactNumberCheck.valid) {
    return next(handleMakeError(400, contactNumberCheck.message));
  }

  const contactPersonCheck = validateFullName(contactPerson);
  if (!contactPersonCheck.valid) {
    return next(handleMakeError(400, contactPersonCheck.message));
  }

  const supplierAddressCheck = validateSupplierAddress(supplierAddress);
  if (!supplierAddressCheck.valid) {
    return next(handleMakeError(400, supplierAddressCheck.message));
  }

  try {
    const newSupplier = new Supplier({
      supplierName,
      contactPerson,
      contactNumber,
      supplierAddress,
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

export const deleteSupplier = async (req, res, next) => {
  const userId = req.user.id;
  const { supplierId } = req.params;

  try {
    const singleSupplier = await Supplier.findById(supplierId);

    if (!singleSupplier) {
      return next(handleMakeError(400, "Supplier not found!"));
    }

    const supplierInUse = await Stocks.exists({ supplier: supplierId })
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
  const { supplierName, contactPerson, contactNumber, supplierAddress } =
    req.body;

  if (!contactNumber || !supplierName || !contactPerson || !supplierAddress) {
    return next(handleMakeError(400, "Input all required fields"));
  }

  const supplierNameCheck = validateSupplierName(supplierName);
  if (!supplierNameCheck.valid) {
    return next(handleMakeError(400, supplierNameCheck.message));
  }

  const contactNumberCheck = validatePHMobile(contactNumber);
  if (!contactNumberCheck.valid) {
    return next(handleMakeError(400, contactNumberCheck.message));
  }

  const contactPersonCheck = validateFullName(contactPerson);
  if (!contactPersonCheck.valid) {
    return next(handleMakeError(400, contactPersonCheck.message));
  }

  const supplierAddressCheck = validateSupplierAddress(supplierAddress);
  if (!supplierAddressCheck.valid) {
    return next(handleMakeError(400, supplierAddressCheck.message));
  }

  try {
    const updateSupplier = await Supplier.findByIdAndUpdate(supplierId, {
      supplierName,
      contactPerson,
      contactNumber,
      supplierAddress,
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
