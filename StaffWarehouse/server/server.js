const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const routes = require("./routes/api");
const cookieParser = require("cookie-parser");

dotenv.config();

// Middleware
app.use(express.json({ limit: "10mb" })); // Tăng giới hạn
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3003"],
    credentials: true,
  })
);

// Cho phép nhiều origin trong dev
app.use(
  cors({
    origin: ["http://localhost:3003"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/api", routes);

// 404 fallback
app.use((req, res) => {
  console.error(`[ 404] ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: "Route not found", path: req.originalUrl });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(` Server is running at http://localhost:${PORT}`);
});
