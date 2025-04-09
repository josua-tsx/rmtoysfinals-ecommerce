import { handleMakeError } from "../middleware/handleError.js";
import Vat from "../models/vat.models.js";

export const addVat = async (req, res, next) => {
  const { vatPercent, vatValue } = req.body;

  try {
    const newVat = new Vat({
      vatPercent, 
      vatValue
    });

    const existingVat = await Vat.findOne({ vatPercent });

    if (existingVat)
      return next(handleMakeError(400, "You can not add a same vat number!"));

    if (!newVat) return next(handleMakeError(400, "VAT is required!"));

    await newVat.save();

    res.status(200).json(newVat);
  } catch (error) {
    next(error);
  }
};

export const getVat = async (req, res, next) => {
  try {
    const getVat = await Vat.find().sort({ createdAt: -1 });
    if (!getVat) return next(handleMakeError(400, "No VAT found"));
    return res.status(200).json(getVat);
  } catch (error) {
    next(error);
  }
};

export const getSingleVat = async (req, res, next) => {
  const { vatId } = req.params;

  try {
    const getSingleVat = await Vat.findById(vatId);
    if (!getSingleVat) return next(handleMakeError(400, "No Vat Found!"));
    res.status(200).json(getSingleVat);
  } catch (error) {
    next(error);
  }
};

export const deleteSingleVat = async (req, res, next) => {
  const { vatId } = req.params;

  try {
    const deleteVat = await Vat.findByIdAndDelete(vatId);
    if (!deleteVat) return next(handleMakeError(400, "No Vat Found!"));
    res.status(200).json(deleteVat);
  } catch (error) {
    next(error);
  }
};

export const editVat = async (req, res, next) => {
  const { vatId } = req.params;
  const { vatPercent, vatValue } = req.body;

  try {
    const updateVat = await Vat.findByIdAndUpdate(vatId, {
      vatPercent, vatValue
    });
    if (!updateVat) return next(handleMakeError(400, "Vat not found!"))
    res.status(200).json(updateVat)
  } catch (error) {
    next(error);
  }
};
