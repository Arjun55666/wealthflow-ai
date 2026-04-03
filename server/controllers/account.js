const prisma = require("../utils/prismaClient");

const createAccount = async (req, res) => {
  try {
    const { name, balance, budget } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Account name is required" });
    }

    const account = await prisma.account.create({
      data: {
        name,
        balance: balance || 0,
        budget: budget || null,
        userId: req.user.userId,
      },
    });

    res.status(201).json({
      message: "Account created successfully",
      account,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAccounts = async (req, res) => {
  try {
    const accounts = await prisma.account.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ accounts });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAccountById = async (req, res) => {
  try {
    const { id } = req.params;

    const account = await prisma.account.findFirst({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.status(200).json({ account });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const account = await prisma.account.findFirst({
      where: { id, userId: req.user.userId },
    });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    await prisma.account.delete({ where: { id } });

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { createAccount, getAccounts, getAccountById, deleteAccount };