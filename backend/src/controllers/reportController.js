const pool = require("../config/db");

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
        request_id AS "requestId"
      FROM reports
      WHERE request_id = $1`,
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

