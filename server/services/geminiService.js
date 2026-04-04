const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const parseReceipt = async (imagePath) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString("base64");
    const mimeType = imagePath.endsWith(".png") ? "image/png" : "image/jpeg";

    const prompt = `Analyze this receipt image and extract the following information in JSON format only, no extra text:
    {
      "amount": <total amount as number>,
      "description": <merchant name or description>,
      "category": <one of: FOOD, TRANSPORT, HOUSING, ENTERTAINMENT, TRAVEL, HEALTH, SHOPPING, MISCELLANEOUS>,
      "date": <date in YYYY-MM-DD format, or null if not found>
    }
    If you cannot find a value, use null. Return only valid JSON.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType,
        },
      },
    ]);

    const response = result.response.text();
    const cleaned = response.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return { success: true, data: parsed };
  } catch (error) {
    console.error("Gemini receipt scan error:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { parseReceipt };