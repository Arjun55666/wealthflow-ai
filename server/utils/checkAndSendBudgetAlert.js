const prisma = require("./prismaClient");
const sendEmail = require("./sendEmail");

const checkAndSendBudgetAlert = async (userId, accountId) => {
  try {
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId },
      include: { user: { select: { email: true, name: true } } },
    });

    if (!account || !account.budget) return;

    const usedPercent = (parseFloat(account.usedAmount) / parseFloat(account.budget)) * 100;

    if (usedPercent >= 80) {
      const subject = usedPercent >= 100
        ? `⚠️ Budget Exceeded in ${account.name}!`
        : `⚠️ 80% Budget Used in ${account.name}`;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">Budget Alert - WealthFlow AI</h2>
          <p>Hi ${account.user.name},</p>
          <p>Your account <strong>${account.name}</strong> has used 
          <strong style="color: #ef4444;">${usedPercent.toFixed(1)}%</strong> of its budget.</p>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p>Budget: ₹${account.budget}</p>
            <p>Used: ₹${account.usedAmount}</p>
            <p>Remaining: ₹${parseFloat(account.budget) - parseFloat(account.usedAmount)}</p>
          </div>
          <p>Consider reviewing your expenses to stay within budget.</p>
          <p>— WealthFlow AI Team</p>
        </div>
      `;

      await sendEmail({ to: account.user.email, subject, html });
    }
  } catch (error) {
    console.error("Budget alert error:", error.message);
  }
};

module.exports = checkAndSendBudgetAlert;