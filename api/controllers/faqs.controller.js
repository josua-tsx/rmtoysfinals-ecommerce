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
    const existingFaqs = await Faqs.find();

    if (existingFaqs.length >= 5) {
      return next(handleMakeError(400, "You can only put 5 max faqs."));
    }

    const existingTitle = existingFaqs.find((t) => t.title === title);

    if (existingTitle) {
      return next(
        handleMakeError(
          400,
          "This title is already exist in the database. Try new one."
        )
      );
    }

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

export const deleteFaq = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const singleFaq = await Faqs.findById(id);

    if (!singleFaq) return next(handleMakeError(400, "Faq not found!"));

    await Faqs.findByIdAndDelete(id);

    res.status(200).json({ message: "Faq Deleted" });
  } catch (error) {
    next(error);
  }
};
