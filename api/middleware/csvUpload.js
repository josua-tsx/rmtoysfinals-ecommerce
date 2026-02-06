import multer from "multer";

/**
 * Shared Multer configuration for CSV batch uploads.
 * - Uses memory storage (buffer)
 * - 5MB file size limit
 * - Only accepts .csv files
 */
const storage = multer.memoryStorage();

export const csvUpload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"), false);
    }
  },
});
