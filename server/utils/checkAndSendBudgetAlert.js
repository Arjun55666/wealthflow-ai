const prisma = require("./prismaClient");
const sendEmail = require("./sendEmail");

const checkAndSendBudgetAlert = async (userId, accountId) => {
  try {
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId },
      include: { user: { select: { email: true, name: true } } },
    });

    if (!account || !account.budget) return;

    const usedPercent =
      (parseFloat(account.usedAmount) / parseFloat(account.budget)) * 100;

    if (usedPercent < 80) return;

    // Check how many alerts already sent this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    const sentThisMonth = await prisma.scheduledEmail.count({
      where: {
        userId,
        accountId,
        type: "BUDGET_ALERT",
        status: "SENT",
        createdAt: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    if (sentThisMonth >= 2) return;
    if (sentThisMonth === 1 && usedPercent < 100) return;

    const isExceeded = usedPercent >= 100;

    const subject = isExceeded
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
          <p>Remaining: ₹${
            parseFloat(account.budget) - parseFloat(account.usedAmount)
          }</p>
        </div>
        <p>${
          isExceeded
            ? "You have exceeded your budget. Please review your expenses."
            : "Consider reviewing your expenses to stay within budget."
        }</p>
        <p>— WealthFlow AI Team</p>
      </div>
    `;

    // Send email using sendEmail.js
    const emailSent = await sendEmail({
      to: account.user.email,
      subject,
      html,
    });

    console.log("Email sent status:", emailSent);

    // Save record
    await prisma.scheduledEmail.create({
      data: {
        userId,
        accountId,
        type: "BUDGET_ALERT",
        status: emailSent ? "SENT" : "FAILED",
      },
    });
  } catch (error) {
    console.error("Budget alert error:", error);
  }
};

module.exports = checkAndSendBudgetAlert;