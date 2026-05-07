const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createRequest,
  getMyRequests,
  debugAllRequests,
  getRequestById,
  updateStatus,
  getRequestHistory,
  testApproveRequest,
} = require("../controllers/requestController");

/* ===================== CREATE ===================== */

router.post(
  "/",
  authMiddleware,
  createRequest
);

/* ===================== GET ALL ===================== */

router.get(
  "/",
  authMiddleware,
  getMyRequests
);
router.get("/debug/all", authMiddleware, debugAllRequests);
/* ===================== HISTORY ===================== */
/* IMPORTANT: keep ABOVE "/:id" */

router.get(
  "/:id/history",
  authMiddleware,
  getRequestHistory
);

/* ===================== GET BY ID ===================== */

router.get(
  "/:id",
  authMiddleware,
  getRequestById
);

/* ===================== UPDATE STATUS ===================== */

router.post(
  "/status",
  authMiddleware,
  updateStatus
);

/* ===================== TEST APPROVE ===================== */

router.post(
  "/test-approve/:requestId",
  authMiddleware,
  testApproveRequest
);

module.exports = router;