const express = require("express")
const router = express.Router()
const { register, login, getMe } = require("../controllers/user")
const authMiddleware = require("../middlewares/auth")
const { authLimiter } = require("../middlewares/rateLimiter")

router.post("/register", authLimiter, register)
router.post("/login", authLimiter, login)
router.get("/me", authMiddleware, getMe)

module.exports = router
