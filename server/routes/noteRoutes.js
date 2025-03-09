const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  upload,
  handleUploadErrors,
} = require("../middleware/uploadMiddleware");
const {
  uploadNote,
  getNotes,
  deleteNote,
  updateDownloadCount,
} = require("../controllers/noteController");

// File upload with error handling
router.post(
  "/",
  protect,
  upload.single("file"),
  handleUploadErrors,
  uploadNote
);

// Note access
router.get("/", protect, getNotes);
router.patch("/:id/download", updateDownloadCount); // Open to all

// Note management
router.delete("/:id", protect, deleteNote); // Controller handles ownership

module.exports = router;
