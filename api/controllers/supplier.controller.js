import Supplier from "../models/supplier.model.js";
import { handleMakeError } from "../middleware/handleError.js";
import { logAuditTrail } from "./audit.controller.js";
import {
  isValidFullName,
  isValidPhoneNumber,
  isValidText1,
  isValidText2,
} from "../utils/validations.js";

export const addSupplier = async (req, res, next) => {
  const userId = req.user.id;

  const {
    supplierName,
    contactPerson,
    contactNumber,
    supplierPay,
    supplierAddress,
  } = req.body;

  if (
    !supplierName ||
    !contactPerson ||
    !contactNumber ||
    !supplierPay ||
    !supplierAddress
  ) {
    return next(handleMakeError(400, "Please input required fields!"));
  }

  if (!isValidText1(supplierName)) {
    return next(
      handleMakeError(
        400,
        "Supplier name do not allow double spaces, and number. it should be between 3 and 50 characters."
      )
    );
  }

  if (
    !contactPerson.trim() ||
    !supplierPay.trim() ||
    !supplierAddress.trim() ||
    !supplierName.trim()
  ) {
    return next(handleMakeError(400, "Input fields do not allow only spaces!"));
  }

  if (!isValidFullName(contactPerson)) {
    return next(
      handleMakeError(
        400,
        "Contact person full name does not allow double spaces."
      )
    );
  }

  if (!isValidText1(supplierPay)) {
    return next(
      handleMakeError(
        400,
        "Supplier pay do not allow double sapces. It should be between 3 and 50 characters."
      )
    );
  }

  if (!isValidPhoneNumber(contactNumber)) {
    return next(
      handleMakeError(
        400,
        "Phone number should be valid number. It should start with 09 and exact 11 numbers"
      )
    );
  }

  if (!isValidText2(supplierAddress)) {
    return next(
      handleMakeError(
        400,
        "Supplier address do not allow double spaces and is between 5 and 200 max characters long."
      )
    );
  }

  try {
    const newSupplier = new Supplier({
      supplierName,
      contactPerson,
      contactNumber,
      supplierPay,
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
    supplierPay,
    supplierAddress,
  } = req.body;

  if (!isValidText1(supplierName)) {
    return next(
      handleMakeError(
        400,
        "Supplier name do not allow double spaces, and number. it should be between 3 and 50 characters."
      )
    );
  }

  if (
    !contactPerson.trim() ||
    !supplierPay.trim() ||
    !supplierAddress.trim() ||
    !supplierName.trim()
  ) {
    return next(handleMakeError(400, "Input fields do not allow only spaces!"));
  }

  if (!isValidFullName(contactPerson)) {
    return next(
      handleMakeError(
        400,
        "Contact person full name does not allow double spaces."
      )
    );
  }

  if (!isValidText1(supplierPay)) {
    return next(
      handleMakeError(
        400,
        "Supplier pay do not allow double sapces. It should be between 3 and 50 characters."
      )
    );
  }

  if (!isValidPhoneNumber(contactNumber)) {
    return next(
      handleMakeError(
        400,
        "Phone number should be valid number. It should start with 09 and exact 11 numbers"
      )
    );
  }

  if (!isValidText2(supplierAddress)) {
    return next(
      handleMakeError(
        400,
        "Supplier address do not allow double spaces and is between 5 and 200 max characters long."
      )
    );
  }

  try {
    const updateSupplier = await Supplier.findByIdAndUpdate(supplierId, {
      supplierName,
      contactPerson,
      contactNumber,
      supplierPay,
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
