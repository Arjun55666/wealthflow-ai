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
    const cacheKey = `monthly:${req.user.userId}`;

    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.status(200).json({ data: JSON.parse(cached), fromCache: true });
      }
    }

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

    if (redis) {
      await redis.set(cacheKey, JSON.stringify(results), "EX", 600);
    }

    res.status(200).json({ data: results, fromCache: false });
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
    const cacheKey = `categories:${req.user.userId}:${month}:${year}`;

    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.status(200).json({ data: JSON.parse(cached), fromCache: true });
      }
    }

    const data = await getMonthlyCategoryExpenses(req.user.userId, month, year);

    if (redis) {
      await redis.set(cacheKey, JSON.stringify(data), "EX", 600);
    }

    res.status(200).json({ data, fromCache: false });
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
    const cacheKey = `tip:${req.user.userId}`;

    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.status(200).json({ tip: cached, fromCache: true });
      }
    }

    const categoryExpenses = await getMonthlyCategoryExpenses(
      req.user.userId, month, year
    );

    const tip = await generateFinancialTip(categoryExpenses);

    if (redis) {
      await redis.set(cacheKey, tip, "EX", 3600);
    }

    res.status(200).json({ tip, fromCache: false });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
