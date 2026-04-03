const arcjet = require("@arcjet/node");

const aj = arcjet.default({
  key: process.env.ARCJET_KEY,
  characteristics: ["ip.src"],
  rules: [
    arcjet.fixedWindow({
      mode: "LIVE",
      window: "1m",
      max: 60,
    }),
    arcjet.shield({
      mode: "LIVE",
    }),
  ],
});

const arcjetMiddleware = async (req, res, next) => {
  try {
    const decision = await aj.protect(req);
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({ message: "Too many requests, slow down!" });
      }
      if (decision.reason.isShield()) {
        return res.status(403).json({ message: "Suspicious activity detected" });
      }
      return res.status(403).json({ message: "Request blocked" });
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = arcjetMiddleware;