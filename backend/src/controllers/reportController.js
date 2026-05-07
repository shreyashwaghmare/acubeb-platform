const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");
const { sendNotification } = require("../utils/sendNotification");

/* ===================== CREATE / UPLOAD REPORT ===================== */

exports.createReport = async (req, res) => {
  try {
    const {
      requestId,
      reportNo,
      service,
      client,
      project,
      issueDate,
      status,
      verificationCode,
      pdfUrl,
    } = req.body;

    if (!requestId || !reportNo || !pdfUrl) {
      return res.status(400).json({
        success: false,
        message: "requestId, reportNo and pdfUrl are required",
      });
    }

    const reportStatus = status || "FINAL";
    const requestStatus = "FINAL_REPORT_SHARED";

    const reportResult = await pool.query(
      `INSERT INTO reports
      (
        id,
        report_no,
        service,
        client,
        project,
        issue_date,
        status,
        verification_code,
        pdf_url,
        request_id
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING
        id,
        report_no AS "reportNo",
        service,
        client,
        project,
        issue_date AS "issueDate",
        status,
        verification_code AS "verificationCode",
        pdf_url AS "pdfUrl",
        request_id AS "requestId",
        created_at AS "createdAt"`,
      [
        uuidv4(),
        reportNo,
        service,
        client,
        project,
        issueDate || new Date(),
        reportStatus,
        verificationCode || `ACB-${Date.now()}`,
        pdfUrl,
        requestId,
      ]
    );

    await pool.query(
      `UPDATE service_requests
       SET status=$1
       WHERE id=$2`,
      [requestStatus, requestId]
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
        requestId,
        requestStatus,
        req.user?.role || "operator",
        "Final report uploaded and shared with client",
      ]
    );

    const userResult = await pool.query(
      `SELECT u.expo_push_token
       FROM users u
       INNER JOIN service_requests sr ON sr.user_id = u.id
       WHERE sr.id=$1`,
      [requestId]
    );

    const pushToken = userResult.rows[0]?.expo_push_token;

    if (pushToken) {
      await sendNotification(
        pushToken,
        "Your final report is ready. Tap to view.",
        {
          screen: "report-detail",
          requestId,
          reportId: reportResult.rows[0].id,
        }
      );
    }

    res.json({
      success: true,
      message: "Report created successfully",
      data: reportResult.rows[0],
    });
  } catch (error) {
    console.error("CREATE REPORT ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===================== GET REPORT BY REQUEST ID ===================== */

exports.getReportByRequestId = async (req, res) => {
  try {
    const { requestId } = req.params;

    const result = await pool.query(
      `SELECT 
        id,
        report_no AS "reportNo",
        service,
        client,
        project,
        issue_date AS "issueDate",
        status,
        verification_code AS "verificationCode",
        pdf_url AS "pdfUrl",
        request_id AS "requestId",
        created_at AS "createdAt"
      FROM reports
      WHERE request_id = $1
      ORDER BY created_at DESC
      LIMIT 1`,
      [requestId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No report found for this request",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("GET REPORT BY REQUEST ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===================== GET REPORT BY ID ===================== */

exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        id,
        report_no AS "reportNo",
        service,
        client,
        project,
        issue_date AS "issueDate",
        status,
        verification_code AS "verificationCode",
        pdf_url AS "pdfUrl",
        request_id AS "requestId",
        created_at AS "createdAt"
      FROM reports
      WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("GET REPORT ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===================== GET MY REPORTS ===================== */

exports.getMyReports = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        r.id,
        r.report_no AS "reportNo",
        r.service,
        r.client,
        r.project,
        r.issue_date AS "issueDate",
        r.status,
        r.verification_code AS "verificationCode",
        r.pdf_url AS "pdfUrl",
        r.request_id AS "requestId",
        r.created_at AS "createdAt"
      FROM reports r
      INNER JOIN service_requests sr ON sr.id = r.request_id
      WHERE sr.user_id = $1
      ORDER BY r.created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("GET MY REPORTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};