import { handleMakeError } from "../middleware/handleError.js";
import Rider from "../models/rider.models";
import { validateFullName, validatePHMobile } from "../utils/validations.js";
import { logAuditTrail } from "./audit.controller.js";

export const addRider = async (req, res, next) => {
  const userId = req.user.id;
  const { riderName, riderPhoneNumber } = req.body;

  if (riderName !== undefined && riderName) {
    const riderNameCheck = validateFullName(riderName);
    if (!riderNameCheck.valid) {
      return next(handleMakeError(400, riderNameCheck.message));
    }
  }

  if (riderPhoneNumber !== undefined && riderPhoneNumber) {
    const riderPhoneNumberCheck = validatePHMobile(riderPhoneNumber);
    if (!riderPhoneNumberCheck.valid) {
      return next(handleMakeError(400, riderPhoneNumberCheck.message));
    }
  }

  try {
    const addRider = new Rider({
      riderName,
      riderPhoneNumber,
    });

    await addRider.save();

    await logAuditTrail({
      action: "create_rider",
      userId,
      targetId: addRider._id,
      targetType: "Rider",
      details: {
        riderName,
      },
      role: "admin",
    });

    res.status(200).json({
      message: "Added succesfully!",
      data: addRider,
    });
  } catch (error) {
    next(error);
  }
};

export const getRiders = async (req, res, next) => {
  try {
    const riders = await Rider.find();
    if (!riders) return next(handleMakeError(400, "No rider found!"));
    res.status(200).json(riders);
  } catch (error) {
    next(error);
  }
};

export const getSingleRider = async (req, res, next) => {
  const { riderId } = req.params;

  try {
    const singleRider = await Rider.findById(riderId);
    if (!singleRider) return next(handleMakeError(400, "No rider found!"));
    res.status(200).json(singleRider);
  } catch (error) {
    next(error);
  }
};
