const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const protect = require("../middlewares/auth");
const { scanReceipt } = require("../controllers/receiptController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG and PNG images allowed"));
    }
  },
});

router.post("/scan", protect, upload.single("receipt"), scanReceipt);

module.exports = router;