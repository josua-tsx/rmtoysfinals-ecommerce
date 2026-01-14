import { handleMakeError } from "../middleware/handleError.js";
import Order from "../models/order.model.js";
import Rider from "../models/rider.models.js";
import User from "../models/user.models.js";
import { logAuditTrail } from "./audit.controller.js";

export const addRider = async (req, res, next) => {
  const userId = req.user.id;
  const { riderName, riderPhoneNumber } = req.body;

    /*
       Manual validation handled by Zod
    */

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


    const existingUser = await User.findOne({ phoneNumber: riderPhoneNumber });
    if (existingUser) {
      return next(handleMakeError(400, "This phone number is registered to an existing account."));
    }

    const existingGuestOrder = await Order.findOne({
      "guestUser.phone": riderPhoneNumber,
      paymentStatus: "Pending",
    });

    if (existingGuestOrder) {
      return next(handleMakeError(400, "A pending guest order already exists for this phone."));
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

    if (rider.length !== riderIds.length) {
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

    res.status(200).json({ message: "Succesfully Deleted" });
  } catch (error) {
    next(error);
  }
};

export const editRider = async (req, res, next) => {
  const { riderId } = req.params;
  const { riderName: newName, riderPhoneNumber: newNumber } = req.body;

  /*
     Manual validation handled by Zod
  */

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

    const existingUser = await User.findOne({ phoneNumber: newNumber });
    if (existingUser) {
      return next(handleMakeError(400, "This phone number is registered to an existing account."));
    }

    const existingGuestOrder = await Order.findOne({
      "guestUser.phone": newNumber,
      paymentStatus: "Pending",
    });

    if (existingGuestOrder) {
      return next(handleMakeError(400, "A pending guest order already exists for this phone."));
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

