const express = require("express");
const router = express.Router();
const { getReportById } = require("../controllers/reportController");

router.get("/:id", getReportById);

module.exports = router;