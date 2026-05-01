const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  createRequest,
  getMyRequests,
  getRequestById,
  updateStatus,
  getRequestHistory
} = require("../controllers/requestController");

router.post("/", authMiddleware, createRequest);
router.get("/", authMiddleware, getMyRequests);
router.get("/:id", authMiddleware, getRequestById);
router.post("/status", authMiddleware, updateStatus);
router.get("/:id/history", authMiddleware, getRequestHistory);

module.exports = router;