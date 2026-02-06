import { handleMakeError } from "../middleware/handleError.js";
import Faqs from "../models/faqs.model.js";
import { logAuditTrail } from "./audit.controller.js";

export const addNewFaqs = async (req, res, next) => {
  const { title, answer } = req.body;

    /*
       Manual validation handled by Zod
    */


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
  /*
     Manual validation handled by Zod
  */

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

// --- Batch FAQ Upload Logic ---
import { faqsSchema } from "../schema/faqs.schema.js";

export const getFaqCsvTemplate = async (req, res, next) => {
  try {
    const headers = ["title", "answer"];
    const exampleRow = ["How do I track my order?", "You can track your order in the Orders section."];

    const csvContent = [headers.join(","), exampleRow.join(",")].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="faq_upload_template.csv"'
    );
    res.send(csvContent);
  } catch (error) {
    next(error);
  }
};

export const batchAddFaqs = async (req, res, next) => {
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

    // Check max FAQ limit
    const existingFaqs = await Faqs.find();
    const remainingSlots = 5 - existingFaqs.length;

    if (remainingSlots <= 0) {
      return next(handleMakeError(400, "Maximum 5 FAQs allowed. Delete some to add more."));
    }

    if (data.length > remainingSlots) {
      return next(handleMakeError(400, `Only ${remainingSlots} FAQ slots remaining. You're trying to add ${data.length}.`));
    }

    const results = {
      created: 0,
      failed: 0,
      errors: [],
    };

    // Cache existing titles
    const existingTitles = new Set(
      existingFaqs.map((f) => f.title.toLowerCase().trim())
    );

    for (const [index, row] of data.entries()) {
      const rowNum = index + 2;
      const { title, answer } = row;

      if (!title || !answer) {
        results.failed++;
        results.errors.push({
          row: rowNum,
          reason: "Missing title or answer",
        });
        continue;
      }

      // ----------------------------------------------------
      // Use Zod Schema for validation
      // ----------------------------------------------------
      const validation = faqsSchema.shape.body.safeParse({
        title: title.trim(),
        answer: answer.trim(),
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

      const normalizedTitle = title.trim();

      // Check duplicate
      if (existingTitles.has(normalizedTitle.toLowerCase())) {
        results.failed++;
        results.errors.push({
          row: rowNum,
          reason: `FAQ '${normalizedTitle}' already exists`,
        });
        continue;
      }

      try {
        const newFaq = new Faqs({
          title: normalizedTitle,
          answer: answer.trim(),
        });
        await newFaq.save();

        // Audit Log
        await logAuditTrail({
          action: "create_faq",
          userId,
          targetId: newFaq._id,
          targetType: "Faq",
          details: { title: normalizedTitle },
          role: "admin",
        });

        existingTitles.add(normalizedTitle.toLowerCase());
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
