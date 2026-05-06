const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getMyReports,
  getReportById,
  getReportByRequestId,
} = require("../controllers/reportController");

router.get("/", authMiddleware, getMyReports);
// IMPORTANT: keep this route before "/:id"
router.get("/request/:requestId", getReportByRequestId);

router.get("/:id", getReportById);

module.exports = router;