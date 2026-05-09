const Groq = require("groq-sdk");
const fs = require("fs");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const parseReceipt = async (imagePath) => {
  try {
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString("base64");
    const ext = imagePath.split(".").pop().toLowerCase();
    const mimeType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

    const prompt = `Analyze this receipt image and extract the following information in JSON format only, no extra text:
{
  "amount": <total amount as number>,
  "description": <merchant name or description>,
  "category": <one of: FOOD, TRANSPORT, HOUSING, ENTERTAINMENT, TRAVEL, HEALTH, SHOPPING, MISCELLANEOUS>,
  "date": <date in YYYY-MM-DD format, or null if not found>
}
If you cannot find a value, use null. Return only valid JSON.`;

    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${base64Image}` },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    const text = response.choices[0].message.content;
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    console.log("Receipt parsed successfully using Groq llama-4-scout");
    return { success: true, data: parsed };
  } catch (error) {
    console.error("Groq receipt parsing failed:", error.message?.slice(0, 200));
    return { success: false, error: error.message };
  }
};

module.exports = { parseReceipt };
