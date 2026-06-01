const express = require("express");
const router = express.Router();
const operatorController = require("../controllers/operatorController");

// 🌟 IMPORTANT: Import your existing authentication check middleware
// Adjust this path if your verifyToken middleware lives inside middleware/authMiddleware.js
const { verifyToken } = require("../middleware/authMiddleware") || { verifyToken: (req,res,next) => next() }; 

/* ===================== ROUTE ASSIGNMENTS ===================== */

// Maps to: GET /api/operator/tasks
router.get("/tasks", verifyToken, operatorController.getOperatorTasks);

// Maps to: POST /api/operator/mutate-status
router.post("/mutate-status", verifyToken, operatorController.mutateOperatorStatus);

module.exports = router;