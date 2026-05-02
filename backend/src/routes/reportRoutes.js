const express = require("express");
const router = express.Router();
const { getReportById } = require("../controllers/reportController");

router.get("/request/:requestId", getReportByRequestId);
router.get("/:id", getReportById);

module.exports = router;