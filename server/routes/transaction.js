const express = require("express");
const router = express.Router();
const protect = require("../middlewares/auth");
const {
  createTransaction,
  getTransactions,
  getTransactionById,
  deleteTransaction,
  getSummary,
} = require("../controllers/transaction");

router.use(protect); // all routes below require JWT

router.post("/", createTransaction);
router.get("/", getTransactions);
router.get("/summary", getSummary);
router.get("/:id", getTransactionById);
router.delete("/:id", deleteTransaction);

module.exports = router;