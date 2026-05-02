const express = require("express");
const router = express.Router();

const {
  getReportById,
  getReportByRequestId,
} = require("../controllers/reportController");

// IMPORTANT: keep this route before "/:id"
router.get("/request/:requestId", getReportByRequestId);

router.get("/:id", getReportById);

module.exports = router;