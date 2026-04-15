const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const generateFinancialTip = async (spendingData) => {
  try {
    const prompt = `Based on this monthly spending data, give ONE short, specific, actionable financial tip in 2-3 sentences. Be friendly and encouraging. Data: ${JSON.stringify(spendingData)}`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Groq financial tip failed:", error.message?.slice(0, 100));
    return "Track your expenses regularly to identify areas where you can save more each month.";
  }
};

module.exports = generateFinancialTip;
