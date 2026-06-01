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
    case "OPERATOR_ASSIGNED":
      return "An on-field engineering specialist has been assigned to your site.";
    case "SAMPLE_COLLECTED":
      return "Core substrate structural samples have been collected from your location.";
    case "TESTING_IN_PROGRESS":
      return "Laboratory analysis and NABL testing parameters are currently in progress.";
    default:
      return `Your inspection request status has evolved to ${String(status).replace(/_/g, " ")}.`;
  }
};

/* ===================== GET OPERATOR TASK ROSTER ===================== */
exports.getOperatorTasks = async (req, res) => {
  try {
    // Restrict query context access to users registered with operational engineering clearance
    if (req.user.role !== "operator" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access Denied: Terminal restricted to authorized operators.",
      });
    }

    // Pivot filtering query against your live schema structure using user_id mapping
    const result = await pool.query(
      `SELECT
        id,
        request_no AS "requestNo",
        service,
        project,
        site,
        contact_person AS "contact_person",
        sample_qty AS "sample_qty",
        remarks,
        status,
        created_at
      FROM service_requests
      WHERE user_id = $1 OR status = 'OPERATOR_ASSIGNED'
      ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("GET OPERATOR TASKS CONTROLLER ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===================== MUTATE REQUEST TIMELINE STATE ===================== */
exports.mutateOperatorStatus = async (req, res) => {
  try {
    const { requestId, status, remarks } = req.body;

    if (!requestId || !status) {
      return res.status(400).json({
        success: false,
        message: "Missing Parameters: requestId and status fields are required.",
      });
    }

    const targetStatus = normalizeStatus(status);

    // Update the master service request tracking column
    const updatedRequest = await pool.query(
      `UPDATE service_requests
       SET status = $1
       WHERE id = $2
       RETURNING id, user_id, request_no, service, project, status`,
      [targetStatus, requestId]
    );

    if (!updatedRequest.rows[0]) {
      return res.status(404).json({
        success: false,
        message: "Target inspection order record could not be found.",
      });
    }

    const requestRow = updatedRequest.rows[0];

    // Append history entry into request_status_history to update the client's timeline UI
    await pool.query(
      `INSERT INTO request_status_history (id, request_id, status, updated_by, remarks)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        uuidv4(),
        requestId,
        targetStatus,
        req.user.role || "operator",
        remarks || getStatusMessage(targetStatus),
      ]
    );

    /* ===================== AUTOMATED NOTIFICATION TRANSMISSION ===================== */
    try {
      const clientProfile = await pool.query(
        `SELECT expo_push_token FROM users WHERE id = $1`,
        [requestRow.user_id]
      );

      const pushToken = clientProfile.rows[0]?.expo_push_token;

      if (pushToken) {
        await sendNotification(
          pushToken,
          getStatusMessage(targetStatus),
          {
            title: "A Cube B Updates",
            screen: "request-detail",
            requestId,
          }
        );
      }
    } catch (notificationError) {
      console.error("NOTIFICATION DISPATCH FAILURE:", notificationError);
    }

    res.json({
      success: true,
      message: "Inspection tracking parameters updated successfully.",
      data: {
        requestId,
        status: targetStatus,
      },
    });
  } catch (error) {
    console.error("MUTATE OPERATOR STATUS CONTROLLER ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};