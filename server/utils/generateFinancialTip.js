const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateFinancialTip = async (spendingData) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Based on this monthly spending data, give ONE short, specific, actionable financial tip in 2-3 sentences. Be friendly and encouraging. Data: ${JSON.stringify(spendingData)}`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    return "Track your expenses regularly to identify areas where you can save more each month.";
  }
};

module.exports = generateFinancialTip;