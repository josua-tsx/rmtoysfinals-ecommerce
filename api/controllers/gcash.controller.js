import { handleMakeError } from "../middleware/handleError.js";
import Gcash from "../models/gcash.model.js";

export const addGcash = async (req, res, next) => {
  const { gcashUrl, gcashName } = req.body;

  if (!gcashUrl || !gcashName) {
    return next(handleMakeError(400, "Please input required fields!"));
  }

  try {
    const gcash = new Gcash({
      gcashUrl,
      gcashName,
    });

    await gcash.save();

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

  try {
    const gcash = await Gcash.findById(gcashId);
    if (!gcash) return next(handleMakeError(400, "No gcash found!"));
    await Gcash.findByIdAndDelete(gcashId);

    res.status(200).json({message: "Successfully Deleted!"})
  } catch (error) {
    next(error);
  }
};

export const updateGcashStatus = async (req, res, next) => {
  const { gcashId } = req.params; // Order ID from URL params
  const { gcashStatus } = req.body;

  try {
    const validStatuses = [
      "Active",
      "Inactive",
    ];
    if (!validStatuses.includes(gcashStatus)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const updatedGcash = await Gcash.findByIdAndUpdate(
      gcashId,
      { gcashStatus },
      { new: true, runValidators: true }
    );

    if (!updatedGcash) return next(handleMakeError(400, "gcash not found!"));

    res.status(200).json({ message: "Delivery Status updated sucessfully" });
  } catch (error) {}
}

export const getGcashActive = async (req, res, next) => {
  try {
    const gcash = await Gcash.find({gcashStatus: "Active"})
    if (!gcash) return next(handleMakeError(400, "gcash not found!"))
    res.status(200).json(gcash)
  } catch (error) {
    next(error)
  }
}