import Audit from "../models/audit.model.js";
import User from "../models/user.models.js";

export const logAuditTrail = async ({
  action,
  userId,
  targetId,
  targetType,
  details,
  role,
}) => {
  try {
    const auditEntry = new Audit({
      action,
      userId,
      targetId,
      targetType,
      details,
      role,
    });

    await auditEntry.save();
  } catch (error) {
    console.log(error);
  }
};

export const deleteAllAuditLogs = async (req, res, next) => {
  try {
    const logs = await Audit.deleteMany({});
    return res.status(200).json(logs);
  } catch (error) {
    next(error);
  }
};

const getLogsByRole = async (req, res, role, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    let query = { role };

    if (search) {
      // Find users matching search first
      const users = await User.find({
          email: { $regex: search, $options: "i" }
      }).select('_id');
      const userIds = users.map(u => u._id);

      query = {
        $and: [
          { role },
          {
            $or: [
              { action: { $regex: search, $options: "i" } },
              { targetId: { $regex: search, $options: "i" } },
              { userId: { $in: userIds } }
            ]
          }
        ]
      };
    }

    const total = await Audit.countDocuments(query);
    const logs = await Audit.find(query)
      .populate({
        path: "userId",
        select: "email",
      })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      logs,
      pagination: {
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminLogs = async (req, res, next) => {
  await getLogsByRole(req, res, "admin", next);
};

export const getCustomerLogs = async (req, res, next) => {
  await getLogsByRole(req, res, "customer", next);
};

export const getValidatorStaffLogs = async (req, res, next) => {
  await getLogsByRole(req, res, "validatorStaff", next);
};
