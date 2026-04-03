const rateLimit = require("express-rate-limit")

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // max 10 requests per 15 minutes
    message: {
        message: "Too many requests, please try again after 15 minutes"
    }
})

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, // max 100 requests per 15 minutes
    message: {
        message: "Too many requests, please try again later"
    }
})

module.exports = { authLimiter, generalLimiter }