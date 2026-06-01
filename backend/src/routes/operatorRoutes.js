const express = require("express");
const router = express.Router();
const operatorController = require("../controllers/operatorController");

// 1. 🌟 SAFE MIDDLEWARE IMPORT: Try destructured first, fallback to direct import
let authMiddleware = require("../middleware/authMiddleware");
const verifyToken = authMiddleware.verifyToken || authMiddleware;

// 2. 🔍 DIAGNOSTIC LOGS: This will print inside your Render terminal so you can see what is undefined!
console.log("--- OPERATOR APP ROUTE DIAGNOSTICS ---");
console.log("verifyToken is a:", typeof verifyToken);
console.log("getOperatorTasks is a:", typeof operatorController?.getOperatorTasks);
console.log("mutateOperatorStatus is a:", typeof operatorController?.mutateOperatorStatus);
console.log("--------------------------------------");

/* ===================== ROUTE ASSIGNMENTS ===================== */

// Maps to: GET /api/operator/tasks
router.get("/tasks", verifyToken, operatorController.getOperatorTasks);

// Maps to: POST /api/operator/mutate-status
router.post("/mutate-status", verifyToken, operatorController.mutateOperatorStatus);

module.exports = router;