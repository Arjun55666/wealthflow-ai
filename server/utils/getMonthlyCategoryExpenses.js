const prisma = require("./prismaClient");

const getMonthlyCategoryExpenses = async (userId, month, year) => {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: "EXPENSE",
        date: { gte: startDate, lte: endDate },
      },
    });

    const byCategory = {};
    transactions.forEach((t) => {
      byCategory[t.category] = (byCategory[t.category] || 0) + parseFloat(t.amount);
    });

    return Object.entries(byCategory).map(([category, amount]) => ({
      category,
      amount,
    }));
  } catch (error) {
    console.error("Category expenses error:", error.message);
    return [];
  }
};

module.exports = getMonthlyCategoryExpenses;