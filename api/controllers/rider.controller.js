import { handleMakeError } from "../middleware/handleError.js";
import Rider from "../models/rider.models.js";
import { validateFullName, validatePHMobile } from "../utils/validations.js";
import { logAuditTrail } from "./audit.controller.js";

export const addRider = async (req, res, next) => {
  const userId = req.user.id;
  const { riderName, riderPhoneNumber } = req.body;

  if (!riderName) {
    return next(handleMakeError(400, "Rider name is required."));
  }

  if (!riderPhoneNumber) {
    return next(handleMakeError(400, "Rider phone number is required."));
  }

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
    const existingPhoneNumber = await Rider.findOne({
      riderPhoneNumber,
    });

    if (existingPhoneNumber) {
      return next(
        handleMakeError(
          400,
          "This phone number is already in the rider table. Try new one."
        )
      );
    }

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

export const deleteRider = async (req, res, next) => {
  const { riderId } = req.params;
  const userId = req.user.id;

  try {
    const rider = await Rider.findById(riderId);

    const riderName = rider.riderName;

    if (!rider) return next(handleMakeError(400, "Rider ID is not found!"));

    await Rider.findByIdAndDelete(riderId);

    res.status(200).json({ message: "Deleted Succesfully!" });

    await logAuditTrail({
      action: "delete_rider",
      userId,
      targetId: rider._id,
      targetType: "Rider",
      details: {
        riderName,
      },
      role: "admin",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMultiRider = async (req, res, next) => {
  const userId = req.user.id;
  const { riderIds } = req.body;

  if (!Array.isArray(riderIds)) {
    return next(handleMakeError(400, "Rider IDS should be an array"));
  }

  try {
    const rider = await Rider.find({
      _id: {
        $in: riderIds,
      },
    });

    if (rider.length !== riderIds) {
      const foundIds = rider.map((r) => r._id.toString());
      const missingIds = riderIds.filter((id) => !foundIds.includes(id));
      return next(
        handleMakeError(400, `Riders not found: ${missingIds.join(", ")}`)
      );
    }

    const riderNames = rider.reduce((acc, ride) => {
      acc[ride._id] = ride.riderName;
      return acc;
    }, {});

    await Rider.deleteMany({ _id: { $in: riderIds } });

    await Promise.all(
      riderIds.map((id) =>
        logAuditTrail({
          action: "delete_riders",
          userId,
          targetId: id,
          targetType: "riders",
          details: {
            riderName: riderNames[id],
          },
          role: "admin",
        })
      )
    );
  } catch (error) {
    next(error);
  }
};

export const editRider = async (req, res, next) => {
  const { riderId } = req.params;
  const { riderName: newName, riderPhoneNumber: newNumber } = req.body;

  try {
    const existingPhoneNumber = await Rider.findOne({
      riderPhoneNumber: newNumber,
      _id: { $ne: riderId },
    });

    if (existingPhoneNumber) {
      return next(
        handleMakeError(
          400,
          "This Phone number is already exist in the table. Try new one"
        )
      );
    }

    const updateRider = await Rider.findByIdAndUpdate(
      riderId,
      {
        riderName: newName,
        riderPhoneNumber: newNumber,
      },
      { new: true }
    );

    if (!updateRider) return next(handleMakeError(400, "Update error"));

    res.status(200).json({ message: "Rider updated", data: updateRider });
  } catch (error) {
    next(error);
  }
};
