const { parseReceipt } = require("../services/geminiService");
const fs = require("fs");

const scanReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const result = await parseReceipt(req.file.path);

    // Delete temp file after processing
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    if (!result.success) {
      console.error("Receipt parsing failed:", result.error);
      return res.status(500).json({ message: "Failed to parse receipt", error: result.error });
    }

    res.status(200).json({
      message: "Receipt parsed successfully",
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { scanReceipt };