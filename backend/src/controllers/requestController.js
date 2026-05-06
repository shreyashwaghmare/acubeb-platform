const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");
const { sendNotification } = require("../utils/sendNotification");

/* ===================== CREATE REQUEST ===================== */

exports.createRequest = async (req, res) => {
  try {
    const {
      service,
      project,
      site,
      contact_person,
      sample_qty,
      remarks,
    } = req.body;

    const id = uuidv4();
    const requestNo = `ACB-REQ-${Date.now().toString().slice(-6)}`;

    // Create request
    const result = await pool.query(
      `INSERT INTO service_requests
      (
        id,
        request_no,
        user_id,
        service,
        project,
        site,
        contact_person,
        sample_qty,
        remarks
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING
        id,
        request_no AS "requestNo",
        service,
        project,
        site,
        contact_person AS "contactPerson",
        sample_qty AS "sampleQty",
        remarks,
        status,
        created_at AS "date"`,
      [
        id,
        requestNo,
        req.user.id,
        service,
        project,
        site,
        contact_person,
        sample_qty,
        remarks,
      ]
    );

    // Insert initial history
    await pool.query(
      `INSERT INTO request_status_history
      (
        id,
        request_id,
        status,
        updated_by,
        remarks
      )
      VALUES ($1,$2,$3,$4,$5)`,
      [
        uuidv4(),
        id,
        "NEW_REQUEST",
        "client",
        "Request created by client",
      ]
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.log("CREATE REQUEST ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===================== GET MY REQUESTS ===================== */

exports.getMyRequests = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        id,
        request_no AS "requestNo",
        service,
        project,
        site,
        contact_person AS "contactPerson",
        sample_qty AS "sampleQty",
        remarks,
        status,
        created_at AS "date"
      FROM service_requests
      WHERE user_id=$1
      ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.log("GET REQUESTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===================== GET REQUEST BY ID ===================== */

exports.getRequestById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        id,
        request_no AS "requestNo",
        service,
        project,
        site,
        contact_person AS "contactPerson",
        sample_qty AS "sampleQty",
        remarks,
        status,
        created_at AS "date"
      FROM service_requests
      WHERE id=$1 AND user_id=$2`,
      [req.params.id, req.user.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.log("GET REQUEST BY ID ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===================== UPDATE STATUS ===================== */

exports.updateStatus = async (req, res) => {
  try {
    const { requestId, status, remarks } = req.body;

    if (!requestId || !status) {
      return res.status(400).json({
        success: false,
        message: "requestId and status are required",
      });
    }

    // Update request status
    await pool.query(
      `UPDATE service_requests
       SET status=$1
       WHERE id=$2`,
      [status, requestId]
    );

    // Insert status history
    await pool.query(
      `INSERT INTO request_status_history
      (
        id,
        request_id,
        status,
        updated_by,
        remarks
      )
      VALUES ($1,$2,$3,$4,$5)`,
      [
        uuidv4(),
        requestId,
        status,
        req.user?.role || "admin",
        remarks || "",
      ]
    );

    /* ===================== SEND PUSH NOTIFICATION ===================== */

    if (
      status === "REPORT_APPROVED" ||
      status === "FINAL_REPORT_SHARED" ||
      status === "COMPLETED"
    ) {
      try {
        // Get request owner
        const requestData = await pool.query(
          `SELECT user_id
           FROM service_requests
           WHERE id=$1`,
          [requestId]
        );

        const userId = requestData.rows[0]?.user_id;

        if (userId) {
          // Get user push token
          const userData = await pool.query(
            `SELECT expo_push_token
             FROM users
             WHERE id=$1`,
            [userId]
          );

          const pushToken = userData.rows[0]?.expo_push_token;

          if (pushToken) {
            // Get report ID for deep linking
            const reportData = await pool.query(
              `SELECT id
               FROM reports
               WHERE request_id=$1`,
              [requestId]
            );

            const reportId = reportData.rows[0]?.id;

            console.log("Push Token:", pushToken);
            console.log("Report ID:", reportId);

            await sendNotification(
              pushToken,
              "Your report is ready. Tap to view.",
              reportId
            );
          }
        }
      } catch (notificationError) {
        console.log(
          "NOTIFICATION ERROR:",
          notificationError
        );
      }
    }

    res.json({
      success: true,
      message: "Status updated successfully",
    });
  } catch (error) {
    console.log("UPDATE STATUS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===================== GET REQUEST HISTORY ===================== */

exports.getRequestHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        id,
        request_id AS "requestId",
        status,
        updated_by,
        remarks,
        created_at
      FROM request_status_history
      WHERE request_id=$1
      ORDER BY created_at ASC`,
      [id]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.log("GET HISTORY ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===================== TEST APPROVE REQUEST ===================== */

exports.testApproveRequest = async (req, res) => {
  try {
    req.body = {
      requestId: req.params.requestId,
      status: "REPORT_APPROVED",
      remarks: "Report approved for testing",
    };

    return exports.updateStatus(req, res);
  } catch (error) {
    console.log("TEST APPROVE ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};