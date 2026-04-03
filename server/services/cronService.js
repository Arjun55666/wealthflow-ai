const cron = require("node-cron");
const prisma = require("../utils/prismaClient");

const processRecurringTransactions = async () => {
  try {
    const now = new Date();

    // Find all recurring transactions due today
    const recurringTransactions = await prisma.transaction.findMany({
      where: {
        isRecurring: true,
        nextRecurringDate: { lte: now },
      },
    });

    console.log(`Processing ${recurringTransactions.length} recurring transactions...`);

    for (const txn of recurringTransactions) {
      await prisma.$transaction(async (tx) => {
        // Create new transaction
        await tx.transaction.create({
          data: {
            type: txn.type,
            amount: txn.amount,
            description: txn.description,
            date: now,
            category: txn.category,
            accountId: txn.accountId,
            userId: txn.userId,
            isRecurring: false, // new copy is not recurring
          },
        });

        // Update account balance
        const balanceChange = txn.type === "INCOME" ? txn.amount : -txn.amount;
        await tx.account.update({
          where: { id: txn.accountId },
          data: {
            balance: { increment: balanceChange },
            usedAmount: txn.type === "EXPENSE"
              ? { increment: txn.amount }
              : undefined,
          },
        });

        // Update next recurring date
        await tx.transaction.update({
          where: { id: txn.id },
          data: { nextRecurringDate: calculateNextDate(txn.recurringInterval) },
        });
      });
    }

    console.log("Recurring transactions processed successfully");
  } catch (error) {
    console.error("Cron job error:", error.message);
  }
};

const generateMonthlyReports = async () => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const users = await prisma.user.findMany({
      select: { id: true },
    });

    for (const user of users) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const transactions = await prisma.transaction.findMany({
        where: {
          userId: user.id,
          date: { gte: startDate, lte: endDate },
        },
      });

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

      // Save report to DB (upsert = create or update)
      await prisma.report.upsert({
        where: { userId_month_year: { userId: user.id, month, year } },
        update: { data: { totalIncome, totalExpense, byCategory, transactionCount: transactions.length } },
        create: {
          userId: user.id,
          month,
          year,
          data: { totalIncome, totalExpense, byCategory, transactionCount: transactions.length },
        },
      });
    }

    console.log("Monthly reports generated successfully");
  } catch (error) {
    console.error("Monthly report cron error:", error.message);
  }
};

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

const startCronJobs = () => {
  // Run every day at midnight
  cron.schedule("0 0 * * *", () => {
    console.log("Running recurring transactions cron...");
    processRecurringTransactions();
  });

  // Run on 1st of every month at 1am
  cron.schedule("0 1 1 * *", () => {
    console.log("Running monthly report cron...");
    generateMonthlyReports();
  });

  console.log("Cron jobs started!");
};

module.exports = { startCronJobs };