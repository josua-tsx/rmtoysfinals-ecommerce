import { handleMakeError } from "../middleware/handleError.js";
import Faqs from "../models/faqs.model.js";
import { validateAnswer, validateFaqsTitle } from "../utils/validations.js";
import { logAuditTrail } from "./audit.controller.js";

export const addNewFaqs = async (req, res, next) => {
  const { title, answer } = req.body;

  if (!title.trim()) {
    return next(handleMakeError(400, "Title is required"));
  }

  const faqsTitle = validateFaqsTitle(title);
  if (!faqsTitle.valid) {
    return next(handleMakeError(400, faqsTitle.message));
  }

  if (!answer.trim()) {
    return next(handleMakeError(400, "Answer is required"));
  }

  const faqsAnswer = validateAnswer(answer);
  if (!faqsAnswer.valid) {
    return next(handleMakeError(400, faqsAnswer.message));
  }


  try {
    const existingFaqs = await Faqs.find();

    if (existingFaqs.length >= 5) {
      return next(handleMakeError(400, "You can only put 5 max faqs."));
    }

    const existingTitle = await Faqs.findOne({
      title,
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

export const deleteMultiFaq = async (req, res, next) => {
  const { faqIds } = req.body;
  const userId = req.user.id;

  if (!Array.isArray(faqIds))
    return next(handleMakeError(400, "FaqIds should be an array!"));

  try {
    const faqs = await Faqs.find({
      _id: {
        $in: faqIds,
      },
    });

    if (faqs.length !== faqIds.length) {
      const foundIds = faqs.map((c) => c._id.toString());
      const missingIds = faqIds.filter((id) => !foundIds.include(id));
      return next(
        handleMakeError(400, `Faqs not found: ${missingIds.join(", ")}`)
      );
    }

    const faqsTitle = faqs.reduce((acc, faq) => {
      acc[faq._id] = faq.title;
      return acc;
    }, {});

    await Faqs.deleteMany({ _id: { $in: faqIds } });

    // Create audit trail entries for each deleted category
    await Promise.all(
      faqIds.map((id) =>
        logAuditTrail({
          action: "delete_faqs",
          userId,
          targetId: id,
          targetType: "Faqs",
          details: {
            FaqTitle: faqsTitle[id],
          },
          role: "admin",
        })
      )
    );

    res.status(200).json({
      message: `${faqIds.length} categories deleted successfully`,
      deletedCount: faqIds.length,
    });
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

  const faqsTitle = validateFaqsTitle(newTitle);
  if (!faqsTitle.valid) {
    return next(handleMakeError(400, faqsTitle.message));
  }

  if (!newAnswer || !newAnswer.trim()) {
    return next(handleMakeError(400, "Answer is required"));
  }


  
  const faqsAnswer = validateAnswer(newAnswer);
  if (!faqsAnswer.valid) {
    return next(handleMakeError(400, faqsAnswer.message));
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
        title: newTitle,
        answer: newAnswer,
      },
      { new: true }
    );

    if (!updateFaq) return next(handleMakeError(400, "Faq not found!"));

    res.status(200).json({ message: "Faq updated!", data: updateFaq });
  } catch (error) {
    next(error);
  }
};
