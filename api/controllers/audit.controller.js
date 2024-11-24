import Audit from "../models/audit.model.js"

export const logAuditTrail = async({
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
        })

        await auditEntry.save()
    } catch (error) {
        console.log(error)
    }
}

export const getAdminLogs = async (req, res, next) => {
    try {
        const logs = await Audit.find({role: "admin"})
        .populate({
            path: "userId",
            select: "email"
        })
        .sort({timestamp: -1})
        res.status(200).json(logs)
    } catch (error) {
        next(error)
    }
}