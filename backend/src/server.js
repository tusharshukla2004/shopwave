const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const sellerRoutes = require("./routes/sellerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { expirePendingOrders } = require("./services/orderInventory");


dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error("Missing required JWT_SECRET configuration");
}

const app = express();
const frontendOrigins = (
  process.env.FRONTEND_ORIGINS || "https://shopwave-nine.vercel.app"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: [
      /^http:\/\/(localhost|127\.0\.0\.1):\d+$/,
      ...frontendOrigins,
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// auth routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/seller",sellerRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("ShopWave API Running...");
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Request body must contain valid JSON",
    });
  }
  if (error.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Request body is too large",
    });
  }

  console.error("Unhandled API error:", error);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const connection = await db.getConnection();
    connection.release();

    await expirePendingOrders();
    const expirationTimer = setInterval(() => {
      expirePendingOrders()
        .then((expiredCount) => {
          if (expiredCount > 0) {
            console.info(`Expired ${expiredCount} unpaid order reservation(s)`);
          }
        })
        .catch((error) => {
          console.error("Failed to expire unpaid order reservations:", error);
        });
    }, 60_000);
    expirationTimer.unref();

    app.listen(PORT, () => {
      console.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(
      "Unable to connect to the required MySQL database:",
      error.message || error.code || "Unknown connection error",
    );
    await db.end();
    process.exitCode = 1;
  }
};

startServer();