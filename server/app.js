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
  process.env.FRONTEND_DOMAIN, // your Vercel URL
  /\.vercel\.app$/,
  "http://localhost:5173"
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const allowed = allowedOrigins.some((o) =>
      typeof o === "string" ? o === origin : o.test(origin)
    );

    callback(allowed ? null : new Error("CORS not allowed"), allowed);
  },
  credentials: true,
}));

// Body parser
app.use(express.json());

// Routes
const userRoutes = require("./routes/user");
const accountRoutes = require("./routes/account");
const transactionRoutes = require("./routes/transaction");
const receiptRoutes = require("./routes/receipt");
const arcjetMiddleware = require("./middlewares/arcjet");
const graphRoutes = require("./routes/graph");

// Protect API routes
app.use("/api", arcjetMiddleware);

app.use("/api/auth", userRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/graph", graphRoutes);

// Health route (important)
app.get("/", (req, res) => {
  res.send("WealthFlow API running 🚀");
});

//  Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong",
    error: err.message
  });
});

//  Cron jobs (okay for now)
const { startCronJobs } = require("./services/cronService");
startCronJobs();

//  Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});