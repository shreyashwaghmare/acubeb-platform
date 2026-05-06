const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const requestRoutes = require("./routes/requestRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

/* ===================== MIDDLEWARE ===================== */

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* IMPORTANT FOR MOBILE PAYLOADS */

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ===================== HEALTH CHECK ===================== */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "A Cube B API running",
  });
});

/* ===================== API ROUTES ===================== */

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/reports", reportRoutes);

/* ===================== 404 HANDLER ===================== */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

/* ===================== GLOBAL ERROR HANDLER ===================== */

app.use((err, req, res, next) => {
  console.error("GLOBAL SERVER ERROR:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

module.exports = app;