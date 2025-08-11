import { handleMakeError } from "../middleware/handleError.js";
import Faqs from "../models/faqs.model.js";

export const addNewFaqs = async (req, res, next) => {
  const { title, answer } = req.body;

  if (!title.trim()) {
    return next(handleMakeError(400, "Title is required"));
  }

  if (!answer.trim()) {
    return next(handleMakeError(400, "Answer is required"));
  }

  try {
    const newFaqs = new Faqs({
      title,
      answer,
    });

    await newFaqs.save();

    res.status(200).json({
      message: "Succesfully added new faqs",
      data: newFaqs,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllFaqs = async (req, res, next) => {
  try {
    const getFaqs = await Faqs.find();
    if (!getFaqs) return next(handleMakeError(400, "no faqs found!"));
    res.status(200).json(getFaqs);
  } catch (error) {
    next(error);
  }
};
