const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const redis = require("./utils/redisClient");
dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_DOMAIN, credentials: true }));
app.use(express.json());

const userRoutes = require("./routes/user");
const accountRoutes = require("./routes/account");
const transactionRoutes = require("./routes/transaction");
const receiptRoutes = require("./routes/receipt");
const arcjetMiddleware = require("./middlewares/arcjet");
const graphRoutes = require("./routes/graph");



app.use("/api/auth", userRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/receipts", receiptRoutes);
app.use(arcjetMiddleware);
app.use("/api/graph", graphRoutes);

app.get("/", (req, res) => {
  res.json({ message: "WealthFlow AI API is running!" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong", error: err.message });
});

const { startCronJobs } = require("./services/cronService");
startCronJobs();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));