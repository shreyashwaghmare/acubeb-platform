const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const pool = require("../config/db");
const { sendNotification } = require("../utils/sendNotification");

/**
 * GET /api/operator/tasks
 */
router.get("/tasks", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "operator") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Operator only route.",
      });
    }

    const result = await pool.query(
      `
      SELECT 
        sr.*,
        u.name AS client_name,
        u.mobile AS client_mobile
      FROM service_requests sr
      LEFT JOIN users u ON u.id = sr.user_id
      WHERE sr.assigned_operator_id = $1::uuid
      ORDER BY sr.created_at DESC
      `,
      [req.user.id]
    );

    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Operator tasks error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Database read failure",
    });
  }
});

/**
 * POST /api/operator/mutate-status
 */
router.post("/mutate-status", authMiddleware, async (req, res) => {
  const client = await pool.connect();

  try {
    const { requestId, status, remarks } = req.body;

    if (!requestId || !status) {
      return res.status(400).json({
        success: false,
        message: "requestId and status are required",
      });
    }

    if (req.user.role !== "operator") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Operator only route.",
      });
    }

    await client.query("BEGIN");

    const updateResult = await client.query(
      `
      UPDATE service_requests
      SET status = $1
      WHERE id = $2::uuid
      AND assigned_operator_id = $3::uuid
      RETURNING id, request_no, project, user_id, status
      `,
      [status, requestId, req.user.id]
    );

    if (updateResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Request not found or not assigned to this operator.",
      });
    }

    const updatedRequest = updateResult.rows[0];

    await client.query(
  `
  INSERT INTO request_status_history
  (
    id,
    request_id,
    status,
    updated_by,
    remarks,
    created_at
  )
  VALUES
  (
    gen_random_uuid(),
    $1,
    $2,
    $3,
    $4,
    NOW()
  )
  `,
  [
    updatedRequest.id,
    status,
    "Operator",
    remarks || `Status updated to ${status}`,
  ]
);

    const clientResult = await client.query(
      `SELECT expo_push_token FROM users WHERE id = $1::uuid`,
      [updatedRequest.user_id]
    );

    await client.query("COMMIT");

    const clientPushToken = clientResult.rows[0]?.expo_push_token;

    if (clientPushToken) {
      sendNotification(
        clientPushToken,
        `Your request ${updatedRequest.request_no} is now ${status.replaceAll("_", " ")}.`,
        {
          title: "A Cube B Request Update",
          screen: "request-detail",
          requestId: updatedRequest.id,
        }
      ).catch((err) => console.error("Notification error:", err));
    }

    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: updatedRequest,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Operator status update error:", error.message);
    return res.status(500).json({
      success: false,
      message: `Database error: ${error.message}`,
    });
  } finally {
    client.release();
  }
});

/**
 * GET /api/operator/task/:id
 */
router.get("/task/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "operator") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Operator only route.",
      });
    }

    const result = await pool.query(
      `
      SELECT 
        sr.*,
        u.name AS client_name,
        u.mobile AS client_mobile
      FROM service_requests sr
      LEFT JOIN users u ON u.id = sr.user_id
      WHERE sr.id = $1::uuid
      AND sr.assigned_operator_id = $2::uuid
      `,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found or not assigned to this operator",
      });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Operator task detail error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/operator/task/:id/history
 */
router.get("/task/:id/history", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "operator") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Operator only route.",
      });
    }

    const assignmentCheck = await pool.query(
      `
      SELECT id
      FROM service_requests
      WHERE id = $1::uuid
      AND assigned_operator_id = $2::uuid
      `,
      [req.params.id, req.user.id]
    );

    if (assignmentCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found or not assigned to this operator",
      });
    }

    const result = await pool.query(
      `
      SELECT 
        id,
        request_id,
        status,
        updated_by,
        remarks,
        created_at
      FROM request_status_history
      WHERE request_id = $1::uuid
      ORDER BY created_at DESC
      `,
      [req.params.id]
    );

    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Operator task history error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
/**
 * POST /api/operator/upload-photo
 * Saves uploaded photo URL/evidence against request
 */
router.post("/upload-photo", authMiddleware, async (req, res) => {
  try {
    const { requestId, photoUrl, photoType, remarks } = req.body;

    if (!requestId || !photoUrl) {
      return res.status(400).json({
        success: false,
        message: "requestId and photoUrl are required",
      });
    }

    if (req.user.role !== "operator") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Operator only route.",
      });
    }

    const assignmentCheck = await pool.query(
      `
      SELECT id
      FROM service_requests
      WHERE id = $1::uuid
      AND assigned_operator_id = $2::uuid
      `,
      [requestId, req.user.id]
    );

    if (assignmentCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Request not found or not assigned to this operator",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO request_photos
      (
        id,
        request_id,
        photo_url,
        photo_type,
        remarks,
        uploaded_by,
        created_at
      )
      VALUES
      (
        gen_random_uuid(),
        $1,
        $2,
        $3,
        $4,
        $5,
        NOW()
      )
      RETURNING *
      `,
      [
        requestId,
        photoUrl,
        photoType || "SITE",
        remarks || "",
        "Operator",
      ]
    );

    await pool.query(
  `
  INSERT INTO request_status_history
  (id, request_id, status, updated_by, remarks, created_at)
  VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())
  `,
  [
    requestId,
    "PHOTO_UPLOADED",
    "Operator",
    `${photoType || "SITE"} photo uploaded`,
  ]
);

    return res.status(201).json({
      success: true,
      message: "Photo evidence saved successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Operator photo upload error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
router.get("/task/:id/photos", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM request_photos
      WHERE request_id = $1::uuid
      ORDER BY created_at DESC
      `,
      [req.params.id]
    );

    return res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Photo fetch error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
/**
 * POST /api/operator/check-in
 */
router.post("/check-in", authMiddleware, async (req, res) => {
  try {
    const { requestId, latitude, longitude } = req.body;

    if (!requestId || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "requestId, latitude and longitude are required",
      });
    }

    await pool.query(
      `
      INSERT INTO operator_tracking
      (
        request_id,
        operator_id,
        latitude,
        longitude,
        captured_at
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        NOW()
      )
      `,
      [
        requestId,
        req.user.id,
        latitude,
        longitude,
      ]
    );

    await pool.query(
      `
      INSERT INTO request_status_history
      (
        id,
        request_id,
        status,
        updated_by,
        remarks,
        created_at
      )
      VALUES
      (
        gen_random_uuid(),
        $1,
        $2,
        $3,
        $4,
        NOW()
      )
      `,
      [
        requestId,
        "SITE_VISIT_STARTED",
        "Operator",
        `Operator checked in at (${latitude}, ${longitude})`,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Site visit started successfully",
    });
  } catch (error) {
    console.error("Check-in error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
/**
 * POST /api/operator/create-report
 * Creates report entry after testing is completed
 */
router.post("/create-report", authMiddleware, async (req, res) => {
  const client = await pool.connect();

  try {
    const { requestId, reportNo, pdfUrl } = req.body;

    if (!requestId || !reportNo || !pdfUrl) {
      return res.status(400).json({
        success: false,
        message: "requestId, reportNo and pdfUrl are required",
      });
    }

    if (req.user.role !== "operator") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Operator only route.",
      });
    }

    await client.query("BEGIN");

    const requestResult = await client.query(
      `
      SELECT 
        sr.*,
        u.name AS client_name,
        u.mobile AS client_mobile,
        u.expo_push_token
      FROM service_requests sr
      LEFT JOIN users u ON u.id = sr.user_id
      WHERE sr.id = $1::uuid
      AND sr.assigned_operator_id = $2::uuid
      `,
      [requestId, req.user.id]
    );

    if (requestResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Request not found or not assigned to this operator",
      });
    }

    const request = requestResult.rows[0];
    const verificationCode = `ACB-${Date.now()}`;

    const reportResult = await client.query(
      `
      INSERT INTO reports
      (
        report_no,
        service,
        client,
        project,
        issue_date,
        status,
        verification_code,
        pdf_url,
        created_at,
        request_id,
        uploaded_by
      )
      VALUES
      (
        $1, $2, $3, $4, CURRENT_DATE, $5, $6, $7, NOW(), $8, $9
      )
      RETURNING *
      `,
      [
        reportNo,
        request.service,
        request.client_name || request.client_mobile || "Client",
        request.project,
        "PENDING_APPROVAL",
        verificationCode,
        pdfUrl,
        requestId,
        "Operator",
      ]
    );

    await client.query(
      `
      UPDATE service_requests
      SET status = $1
      WHERE id = $2::uuid
      `,
      ["REPORT_READY", requestId]
    );

    await client.query(
      `
      INSERT INTO request_status_history
      (
        id,
        request_id,
        status,
        updated_by,
        remarks,
        created_at
      )
      VALUES
      (
        gen_random_uuid(),
        $1,
        $2,
        $3,
        $4,
        NOW()
      )
      `,
      [
        requestId,
        "REPORT_READY",
        "Operator",
        `Report ${reportNo} uploaded and sent for admin approval`,
      ]
    );

    await client.query("COMMIT");

    if (request.expo_push_token) {
      sendNotification(
        request.expo_push_token,
        `Report ${reportNo} is uploaded and pending approval.`,
        {
          title: "A Cube B Report Update",
          screen: "request-detail",
          requestId,
        }
      ).catch((err) => console.error("Notification error:", err));
    }

    return res.status(201).json({
      success: true,
      message: "Report created successfully",
      data: reportResult.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Create report error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    client.release();
  }
});
module.exports = router;