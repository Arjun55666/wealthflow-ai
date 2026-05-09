const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");

dotenv.config();

const app = express();

// Trust proxy (important for deployment platforms)
app.set("trust proxy", true);

// Security
app.use(helmet({ contentSecurityPolicy: false }));

// CORS
const allowedOrigins = [
  process.env.FRONTEND_DOMAIN,
  /\.vercel\.app$/,
  "http://localhost:5000",
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const allowed = allowedOrigins.some((o) =>
        typeof o === "string" ? o === origin : o.test(origin)
      );

      callback(allowed ? null : new Error("CORS not allowed"), allowed);
    },
    credentials: true,
  })
);

// Body parser
app.use(express.json());

// Routes
const userRoutes = require("./routes/user");
const accountRoutes = require("./routes/account");
const transactionRoutes = require("./routes/transaction");
const receiptRoutes = require("./routes/receipt");
const graphRoutes = require("./routes/graph");
const arcjetMiddleware = require("./middlewares/arcjet");

// Protect API routes
app.use("/api", arcjetMiddleware);

// API routes
app.use("/api/auth", userRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/graph", graphRoutes);

// Health route
app.get("/", (req, res) => {
  res.send("WealthFlow API running 🚀");
});

// Global error handler — never expose internal errors to clients in production
app.use((err, req, res, next) => {
  console.error(err.message);

  res.status(500).json({
    message: "Something went wrong",
    ...(process.env.NODE_ENV !== "production" && { error: err.message }),
  });
});

// Cron jobs
const { startCronJobs } = require("./services/cronService");
startCronJobs();

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});