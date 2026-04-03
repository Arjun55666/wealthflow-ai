const prisma = require("../utils/prismaClient");
const checkAndSendBudgetAlert = require("../utils/checkAndSendBudgetAlert");
const redis = require("../utils/redisClient");

// Create Transaction (ACID - balance updates atomically)
const createTransaction = async (req, res) => {
  try {
    const {
      type,
      amount,
      description,
      date,
      category,
      accountId,
      isRecurring,
      recurringInterval,
    } = req.body;

    if (!type || !amount || !date || !category || !accountId) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (!["INCOME", "EXPENSE"].includes(type)) {
      return res.status(400).json({ message: "Type must be INCOME or EXPENSE" });
    }
    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    const account = await prisma.account.findFirst({
      where: { id: accountId, userId: req.user.userId },
    });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // ACID Transaction
    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          type,
          amount,
          description,
          date: new Date(date),
          category,
          accountId,
          userId: req.user.userId,
          isRecurring: isRecurring || false,
          recurringInterval: isRecurring ? recurringInterval : null,
          nextRecurringDate: isRecurring
            ? calculateNextDate(recurringInterval)
            : null,
        },
      });

      const balanceChange = type === "INCOME" ? amount : -amount;
      const updatedAccount = await tx.account.update({
        where: { id: accountId },
        data: {
          balance: { increment: balanceChange },
          usedAmount:
            type === "EXPENSE"
              ? { increment: amount }
              : undefined,
        },
      });

      return { transaction, updatedAccount };
    });

    // Budget alert (runs in background, doesn't block response)
    if (type === "EXPENSE") {
      checkAndSendBudgetAlert(req.user.userId, accountId);
    }

    // Invalidate Redis cache
    if (redis) {
      await redis.del(`monthly:${req.user.userId}`);
      await redis.del(`categories:${req.user.userId}:${new Date().getMonth() + 1}:${new Date().getFullYear()}`);
      await redis.del(`tip:${req.user.userId}`);
    }

    res.status(201).json({
      message: "Transaction created successfully",
      transaction: result.transaction,
      newBalance: result.updatedAccount.balance,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Transactions with pagination + filters
const getTransactions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      category,
      accountId,
      startDate,
      endDate,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { userId: req.user.userId };
    if (type) where.type = type;
    if (category) where.category = category;
    if (accountId) where.accountId = accountId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { date: "desc" },
        skip,
        take: parseInt(limit),
        include: { account: { select: { name: true } } },
      }),
      prisma.transaction.count({ where }),
    ]);

    res.status(200).json({
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get single transaction
const getTransactionById = async (req, res) => {
  try {
    const transaction = await prisma.transaction.findFirst({
      where: { id: req.params.id, userId: req.user.userId },
      include: { account: { select: { name: true } } },
    });
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.status(200).json({ transaction });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete Transaction (reverses balance — also ACID)
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await prisma.transaction.findFirst({
      where: { id: req.params.id, userId: req.user.userId },
    });
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    await prisma.$transaction(async (tx) => {
      await tx.transaction.delete({ where: { id: req.params.id } });

      const balanceChange =
        transaction.type === "INCOME"
          ? -transaction.amount
          : transaction.amount;

      await tx.account.update({
        where: { id: transaction.accountId },
        data: {
          balance: { increment: balanceChange },
          usedAmount:
            transaction.type === "EXPENSE"
              ? { decrement: transaction.amount }
              : undefined,
        },
      });
    });

    // Invalidate Redis cache
    if (redis) {
      await redis.del(`monthly:${req.user.userId}`);
      await redis.del(`categories:${req.user.userId}:${new Date().getMonth() + 1}:${new Date().getFullYear()}`);
      await redis.del(`tip:${req.user.userId}`);
    }

    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get spending summary (for dashboard)
const getSummary = async (req, res) => {
  try {
    const { accountId, month, year } = req.query;
    const now = new Date();
    const targetMonth = parseInt(month) || now.getMonth() + 1;
    const targetYear = parseInt(year) || now.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const where = {
      userId: req.user.userId,
      date: { gte: startDate, lte: endDate },
    };
    if (accountId) where.accountId = accountId;

    const transactions = await prisma.transaction.findMany({ where });

    const totalIncome = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalExpense = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const byCategory = {};
    transactions
      .filter((t) => t.type === "EXPENSE")
      .forEach((t) => {
        byCategory[t.category] = (byCategory[t.category] || 0) + parseFloat(t.amount);
      });

    res.status(200).json({
      summary: {
        totalIncome,
        totalExpense,
        netSavings: totalIncome - totalExpense,
        byCategory,
        month: targetMonth,
        year: targetYear,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Helper — calculate next recurring date
const calculateNextDate = (interval) => {
  const date = new Date();
  switch (interval) {
    case "DAILY":   date.setDate(date.getDate() + 1); break;
    case "WEEKLY":  date.setDate(date.getDate() + 7); break;
    case "MONTHLY": date.setMonth(date.getMonth() + 1); break;
    case "YEARLY":  date.setFullYear(date.getFullYear() + 1); break;
  }
  return date;
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  deleteTransaction,
  getSummary,
};