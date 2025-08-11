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

    const existingTitle = await Faqs.findOne({
      title: newTitle,
      _id: { $ne: faqSingleId },
    });

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

export const getSingleFaq = async (req, res, next) => {
  const { faqSingleId } = req.params;

  try {
    const getSingleFaq = await Faqs.findById(faqSingleId);

    if (!getSingleFaq) return next(handleMakeError(400, "No Faq found"));

    res.status(200).json({
      message: "Success!",
      singleFaq: getSingleFaq,
    });
  } catch (error) {
    next(error);
  }
};

export const updateFaq = async (req, res, next) => {
  const { faqSingleId } = req.params;
  const { title: newTitle, answer: newAnswer } = req.body;
  // Validate inputs
  if (!newTitle || !newTitle.trim()) {
    return next(handleMakeError(400, "Title is required"));
  }

  if (!newAnswer || !newAnswer.trim()) {
    return next(handleMakeError(400, "Answer is required"));
  }

  try {
    const existingTitle = await Faqs.findOne({
      title: newTitle,
      _id: { $ne: faqSingleId },
    });

    if (existingTitle)
      return next(
        handleMakeError(
          400,
          "This title is already exist in the database. Try new one."
        )
      );

    const updateFaq = await Faqs.findByIdAndUpdate(
      faqSingleId,
      {
        newTitle,
        newAnswer,
      },
      { new: true }
    );

    if (!updateFaq) return next(handleMakeError(400, "Faq not found!"));

    res.status(200).json({ message: "Faq updated!", data: updateFaq });
  } catch (error) {
    next(error);
  }
};
