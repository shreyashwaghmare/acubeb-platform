const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");
const { sendNotification } = require("../utils/sendNotification");

/* ===================== HELPERS ===================== */

const normalizeStatus = (status = "") => {
  return String(status).trim().replace(/\s+/g, "_").toUpperCase();
};

const getStatusMessage = (status) => {
  const s = normalizeStatus(status);

  switch (s) {
    case "NEW_REQUEST":
      return "Your request has been created successfully.";
    case "REQUEST_APPROVED":
    case "APPROVED":
      return "Your request has been approved.";
    case "OPERATOR_ASSIGNED":
      return "An operator has been assigned to your request.";
    case "SITE_VISIT_SCHEDULED":
      return "Site visit has been scheduled for your request.";
    case "SAMPLE_COLLECTED":
      return "Sample collection has been completed.";
    case "TESTING_IN_PROGRESS":
      return "Testing is now in progress.";
    case "REPORT_APPROVED":
      return "Your report has been approved.";
    case "FINAL_REPORT_SHARED":
    case "COMPLETED":
      return "Your final report is ready. Tap to view.";
    default:
      return `Your request status is now ${String(status).replace(/_/g, " ")}.`;
  }
};

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
        remarks,
        status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
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
        "NEW_REQUEST",
      ]
    );

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

    const finalStatus = normalizeStatus(status);

    const updatedRequest = await pool.query(
      `UPDATE service_requests
       SET status=$1
       WHERE id=$2
       RETURNING id, user_id, request_no, service, project, status`,
      [finalStatus, requestId]
    );

    if (!updatedRequest.rows[0]) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    const requestRow = updatedRequest.rows[0];

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
        finalStatus,
        req.user?.role || "operator",
        remarks || getStatusMessage(finalStatus),
      ]
    );

    /* ===================== AUTOMATED PUSH NOTIFICATION ===================== */

    try {
      const userData = await pool.query(
        `SELECT expo_push_token
         FROM users
         WHERE id=$1`,
        [requestRow.user_id]
      );

      const pushToken = userData.rows[0]?.expo_push_token;

      if (pushToken) {
        let screen = "request-detail";
        let reportId = null;

        if (
          finalStatus === "REPORT_APPROVED" ||
          finalStatus === "FINAL_REPORT_SHARED" ||
          finalStatus === "COMPLETED"
        ) {
          const reportData = await pool.query(
            `SELECT id
             FROM reports
             WHERE request_id=$1
             ORDER BY created_at DESC
             LIMIT 1`,
            [requestId]
          );

          reportId = reportData.rows[0]?.id || null;

          if (reportId) {
            screen = "report-detail";
          }
        }

        await sendNotification(
          pushToken,
          getStatusMessage(finalStatus),
          {
            title: "A Cube B Consultants",
            screen,
            requestId,
            reportId,
          }
        );
      } else {
        console.log("No push token found for user:", requestRow.user_id);
      }
    } catch (notificationError) {
      console.log("NOTIFICATION ERROR:", notificationError);
    }

    res.json({
      success: true,
      message: "Status updated successfully",
      data: {
        requestId,
        status: finalStatus,
      },
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