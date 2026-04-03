const express = require("express");
const router = express.Router();
const protect = require("../middlewares/auth");
const prisma = require("../utils/prismaClient");
const getMonthlyCategoryExpenses = require("../utils/getMonthlyCategoryExpenses");
const generateFinancialTip = require("../utils/generateFinancialTip");
const redis = require("../utils/redisClient");

// Monthly income vs expense for last 6 months
router.get("/monthly", protect, async (req, res) => {
  try {
    const results = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const transactions = await prisma.transaction.findMany({
        where: {
          userId: req.user.userId,
          date: { gte: startDate, lte: endDate },
        },
      });

      const income = transactions
        .filter((t) => t.type === "INCOME")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const expense = transactions
        .filter((t) => t.type === "EXPENSE")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      results.push({
        month: date.toLocaleString("default", { month: "short" }),
        year,
        income,
        expense,
        savings: income - expense,
      });
    }

    res.status(200).json({ data: results });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Category expenses for current month
router.get("/categories", protect, async (req, res) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year = parseInt(req.query.year) || now.getFullYear();

    const data = await getMonthlyCategoryExpenses(req.user.userId, month, year);
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Financial tip based on spending
router.get("/tip", protect, async (req, res) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const categoryExpenses = await getMonthlyCategoryExpenses(
      req.user.userId, month, year
    );

    const tip = await generateFinancialTip(categoryExpenses);
    res.status(200).json({ tip });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;