const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const {
  createAccount,
  getAccounts,
  getAccountById,
  deleteAccount,
} = require("../controllers/account");

router.post("/", authMiddleware, createAccount);
router.get("/", authMiddleware, getAccounts);
router.get("/:id", authMiddleware, getAccountById);
router.delete("/:id", authMiddleware, deleteAccount);

module.exports = router;