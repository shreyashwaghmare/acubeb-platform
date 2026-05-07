const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createReport,
  getMyReports,
  getReportById,
  getReportByRequestId,
} = require("../controllers/reportController");

/* ===================== CREATE REPORT ===================== */

router.post("/", authMiddleware, createReport);

/* ===================== GET MY REPORTS ===================== */

router.get("/", authMiddleware, getMyReports);

/* ===================== GET REPORT BY REQUEST ===================== */
/* IMPORTANT: Keep before "/:id" */

router.get(
  "/request/:requestId",
  authMiddleware,
  getReportByRequestId
);

/* ===================== GET REPORT BY ID ===================== */

router.get("/:id", authMiddleware, getReportById);

module.exports = router;