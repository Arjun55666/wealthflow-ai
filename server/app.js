const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const path = require("path");
dotenv.config();

const app = express();

app.set("trust proxy", true);
app.use(helmet({ contentSecurityPolicy: false }));

const allowedOrigins = [
  process.env.FRONTEND_DOMAIN,
  /\.vercel\.app$/,
  /\.replit\.app$/,
  /\.replit\.dev$/,
  "http://localhost:5000",
  "http://localhost:5173",
];
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
app.use(express.json());

const userRoutes = require("./routes/user");
const accountRoutes = require("./routes/account");
const transactionRoutes = require("./routes/transaction");
const receiptRoutes = require("./routes/receipt");
const arcjetMiddleware = require("./middlewares/arcjet");
const graphRoutes = require("./routes/graph");

// Arcjet only protects API routes, not static files
app.use("/api", arcjetMiddleware);

app.use("/api/auth", userRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/graph", graphRoutes);

// Serve built React frontend
const clientDist = path.join(__dirname, "../client/dist");
app.use(express.static(clientDist));

// SPA fallback — all non-API routes serve index.html
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(clientDist, "index.html"));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong", error: err.message });
});

const { startCronJobs } = require("./services/cronService");
startCronJobs();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
