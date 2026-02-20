import { handleMakeError } from "../middleware/handleError.js";
import Order from "../models/order.model.js";
import Rider from "../models/rider.models.js";
import User from "../models/user.models.js";
import { logAuditTrail } from "./audit.controller.js";
import { riderSchema } from "../schema/rider.schema.js";

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
          { riderName: searchRegex },
          { riderStatus: searchRegex },
          { _id: search }
        ];
      } else {
        query.$or = [
          { riderName: searchRegex },
          { riderStatus: searchRegex }
        ];
      }
    }

    const riders = await Rider.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalCount = await Rider.countDocuments(query);

    res.status(200).json({
      riders,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      hasMore: totalCount > pageNum * limitNum,
    });
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

    if (!rider) return next(handleMakeError(400, "Rider ID is not found!"));

    const riderName = rider.riderName;

    // Check if rider is assigned to any active order
    const activeOrder = await Order.findOne({
      riderId: riderId,
      status: { $in: ["Pending", "Processing", "Shipped", "Out for Delivery"] },
    });

    if (activeOrder) {
      return next(
        handleMakeError(
          400,
          "This rider is currently assigned to an active order and cannot be archived."
        )
      );
    }

    // SOFT DELETE
    await Rider.findByIdAndUpdate(riderId, { isArchived: true });

    res.status(200).json({ message: "Archived Succesfully!" });

    await logAuditTrail({
      action: "archive_rider",
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

    // Check if any rider is assigned to an active order
    const activeOrders = await Order.find({
      riderId: { $in: riderIds },
      status: { $in: ["Pending", "Processing", "Shipped", "Out for Delivery"] },
    }).populate("riderId", "riderName");

    if (activeOrders.length > 0) {
      const busyRiderNames = [...new Set(activeOrders.map((o) => o.riderId?.riderName))].filter(Boolean);
      return next(
        handleMakeError(
          400,
          `These riders are assigned to active orders and cannot be archived: ${busyRiderNames.join(", ")}`
        )
      );
    }

    const riderNames = rider.reduce((acc, ride) => {
      acc[ride._id] = ride.riderName;
      return acc;
    }, {});

    // Soft Delete
    await Rider.updateMany({ _id: { $in: riderIds } }, { isArchived: true });

    await Promise.all(
      riderIds.map((id) =>
        logAuditTrail({
          action: "archive_riders_bulk",
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

    res.status(200).json({ message: "Succesfully Archived" });
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

// --- Batch Rider Upload Logic ---
export const restoreRider = async (req, res, next) => {
  const { riderId } = req.params;
  const userId = req.user.id;

  try {
    const rider = await Rider.findById(riderId);

    if (!rider) return next(handleMakeError(400, "Rider not found!"));

    if (!rider.isArchived) {
      return next(handleMakeError(400, "Rider is not archived"));
    }

    await Rider.findByIdAndUpdate(riderId, { isArchived: false });

    await logAuditTrail({
      action: "restore_rider",
      userId,
      targetId: rider._id,
      targetType: "Rider",
      details: {
        riderName: rider.riderName,
      },
      role: "admin",
    });

    res.status(200).json({ message: "Rider restored successfully" });
  } catch (error) {
    next(error);
  }
};

export const getArchivedRiders = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10,
      search = ""
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const searchFilter = search
      ? {
          $or: [
            { riderName: { $regex: search, $options: "i" } },
            { riderPhoneNumber: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const query = { 
      isArchived: true,
      ...searchFilter,
    };

    const riders = await Rider.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalCount = await Rider.countDocuments(query);

    res.status(200).json({
      riders,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      hasMore: totalCount > pageNum * limitNum,
    });
  } catch (error) {
    next(error);
  }
};

// --- Batch Rider Upload Logic ---

export const getRiderCsvTemplate = async (req, res, next) => {
  try {
    const headers = [
      "riderName",
      "riderPhoneNumber",
    ];

    const exampleRow = [
      "Juan Dela Cruz",
      "09123456789",
    ];

    const csvContent = [headers.join(","), exampleRow.join(",")].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="rider_upload_template.csv"'
    );
    res.send(csvContent);
  } catch (error) {
    next(error);
  }
};

export const batchAddRiders = async (req, res, next) => {
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

    // Cache existing rider phone numbers
    const existingRiders = await Rider.find({}, "riderPhoneNumber");
    const existingPhones = new Set(
      existingRiders.map((r) => r.riderPhoneNumber)
    );

    // We also need to check Users and Orders during the loop or pre-fetch if possible.
    // Given the complexity of checking 3 collections, we'll do it per-row for safety,
    // although strictly less efficient than a massive `$in` query, it's safer for data integrity
    // considering the checks are across different schemas.
    // Optimization: Pre-fetch all User phones and Pending Order Guest phones?
    // Users might be many, but Riders are likely fewer. Let's pre-fetch for now to be faster.

    const allUsers = await User.find({}, "phoneNumber");
    const existingUserPhones = new Set(allUsers.map(u => u.phoneNumber));

    const pendingOrders = await Order.find({ paymentStatus: "Pending" }, "guestUser.phone");
    const existingOrderPhones = new Set(pendingOrders.map(o => o.guestUser?.phone).filter(Boolean));

    for (const [index, row] of data.entries()) {
      const rowNum = index + 2;
      const { riderName, riderPhoneNumber } = row;

      if (!riderName || !riderPhoneNumber) {
        results.failed++;
        results.errors.push({
          row: rowNum,
          reason: "Missing riderName or riderPhoneNumber",
        });
        continue;
      }

      // ----------------------------------------------------
      // Use Zod Schema for validation
      // Reuse the same schema as single add (riderSchema)
      // ----------------------------------------------------
      const validation = riderSchema.shape.body.safeParse({
        riderName: riderName.trim(),
        riderPhoneNumber: riderPhoneNumber.trim(),
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

      const normalizedPhone = riderPhoneNumber.trim();

      // Check duplications
      if (existingPhones.has(normalizedPhone)) {
        results.failed++;
        results.errors.push({
          row: rowNum,
          reason: `Phone '${normalizedPhone}' already exists in Riders`,
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

      if (existingOrderPhones.has(normalizedPhone)) {
        results.failed++;
        results.errors.push({
          row: rowNum,
          reason: `Phone '${normalizedPhone}' has a pending guest order`,
        });
        continue;
      }

      try {
        const newRider = new Rider({
          riderName: riderName.trim(),
          riderPhoneNumber: normalizedPhone,
        });
        await newRider.save();

        // Audit Log
        await logAuditTrail({
          action: "create_rider",
          userId,
          targetId: newRider._id,
          targetType: "Rider",
          details: { riderName: newRider.riderName },
          role: "admin",
        });

        // Add to Set to prevent duplicates within same batch
        existingPhones.add(normalizedPhone);
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

