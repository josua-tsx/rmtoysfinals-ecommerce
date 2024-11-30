import { handleMakeError } from "../middleware/handleError.js";
import Gcash from "../models/gcash.model.js";
import { isValidTextAllowNumbers } from "../utils/validations.js";
import { logAuditTrail } from "./audit.controller.js";

export const addGcash = async (req, res, next) => {
  const { gcashUrl, gcashName } = req.body;
  const userId = req.user.id;

  if (!gcashUrl || !gcashName) {
    return next(handleMakeError(400, "Please input required fields!"));
  }

  if (!gcashName.trim()) {
    return next(handleMakeError(400, "Gcash name do not allow only spaces!"));
  }

  if (!isValidTextAllowNumbers(gcashName)) {
    return next(
      handleMakeError(
        400,
        "Gcash name do not allow double spaces. It should be 3 between 50 characters long."
      )
    );
  }

  try {
    const gcash = new Gcash({
      gcashUrl,
      gcashName,
    });

    await gcash.save();

    await logAuditTrail({
      action: "create_gcashQR",
      userId,
      targetId: gcash._id,
      targetType: "Gcash",
      details: {
        gcashName,
      },
      role: "admin",
    });

    res.status(200).json({ message: "Added new gcash", gcash });
  } catch (error) {
    next(error);
  }
};

export const getAllGcash = async (req, res, next) => {
  try {
    const gcash = await Gcash.find();

    if (!gcash) return next(handleMakeError(400, "No Gcash found!"));

    res.status(200).json(gcash);
  } catch (error) {
    next(error);
  }
};

export const deleteGcash = async (req, res, next) => {
  const { gcashId } = req.params;
  const userId = req.user.id;

  try {
    const gcash = await Gcash.findById(gcashId);
    if (!gcash) return next(handleMakeError(400, "No gcash found!"));
    const gcashName = gcash.gcashName;
    await Gcash.findByIdAndDelete(gcashId);

    await logAuditTrail({
      action: "delete_gcashQR",
      userId,
      targetId: gcash._id,
      targetType: "Gcash",
      details: {
        gcashName,
      },
      role: "admin",
    });

    res.status(200).json({ message: "Successfully Deleted!" });
  } catch (error) {
    next(error);
  }
};

export const updateGcashStatus = async (req, res, next) => {
  const { gcashId } = req.params; // Order ID from URL params
  const { gcashStatus } = req.body;
  const userId = req.user.id;

  try {
    const validStatuses = ["Active", "Inactive"];
    if (!validStatuses.includes(gcashStatus)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const updatedGcash = await Gcash.findByIdAndUpdate(
      gcashId,
      { gcashStatus },
      { new: true, runValidators: true }
    );

    if (!updatedGcash) return next(handleMakeError(400, "gcash not found!"));

    const gcashName = updatedGcash.gcashName;

    await logAuditTrail({
      action: "update_gcashStatus",
      userId,
      targetId: updatedGcash._id,
      targetType: "Gcash",
      details: {
        gcashName,
        gcashStatus,
      },
      role: "admin",
    });

    res.status(200).json({ message: "Delivery Status updated sucessfully" });
  } catch (error) {}
};

export const getGcashActive = async (req, res, next) => {
  try {
    const gcash = await Gcash.find({ gcashStatus: "Active" });
    if (!gcash) return next(handleMakeError(400, "gcash not found!"));
    res.status(200).json(gcash);
  } catch (error) {
    next(error);
  }
};
