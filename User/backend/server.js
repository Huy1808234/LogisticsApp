const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use("/uploads", express.static("uploads"));

// ROUTES
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const momoRoutes = require("./routes/momoRoutes");

app.use("/api/auth", authRoutes);
app.use("/api", orderRoutes);
app.use("/api", userRoutes);
app.use("/api", momoRoutes);

// Fallback route
app.use((req, res) => {
  res.status(404).json({ error: "Đường dẫn không tồn tại." });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Lỗi hệ thống:", err.stack);
  res.status(500).json({ error: "Lỗi hệ thống nội bộ." });
});

// Chạy server
const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () =>
  console.log(` Expo backend running on http://0.0.0.0:${PORT}`)
);
