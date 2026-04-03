const express = require("express")
const router = express.Router()
const { register, login, getMe } = require("../controllers/user")
const authMiddleware = require("../middlewares/auth")

router.post("/register", register)
router.post("/login", login)
router.get("/me", authMiddleware, getMe)

module.exports = router