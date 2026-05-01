const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

/* ===================== CREATE REQUEST ===================== */

exports.createRequest = async (req, res) => {
  try {
    const { service, project, site, contact_person, sample_qty, remarks } = req.body;

    const id = uuidv4();
    const requestNo = `ACB-REQ-${Date.now().toString().slice(-6)}`;

    // Insert request
    const result = await pool.query(
      `INSERT INTO service_requests
       (id, request_no, user_id, service, project, site, contact_person, sample_qty, remarks)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [id, requestNo, req.user.id, service, project, site, contact_person, sample_qty, remarks]
    );

    // 🔥 Insert initial status (IMPORTANT)
    await pool.query(
      `INSERT INTO request_status_history (id, request_id, status, updated_by)
       VALUES ($1, $2, $3, $4)`,
      [uuidv4(), id, "NEW_REQUEST", "client"]
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ===================== GET MY REQUESTS ===================== */

exports.getMyRequests = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM service_requests
       WHERE user_id=$1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ===================== GET REQUEST BY ID ===================== */

exports.getRequestById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM service_requests
       WHERE id=$1 AND user_id=$2`,
      [req.params.id, req.user.id]
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ===================== UPDATE STATUS ===================== */

exports.updateStatus = async (req, res) => {
  try {
    const { requestId, status, remarks } = req.body;

    // Update main request status
    await pool.query(
      `UPDATE service_requests SET status=$1 WHERE id=$2`,
      [status, requestId]
    );

    // Insert into history
    await pool.query(
      `INSERT INTO request_status_history (id, request_id, status, updated_by, remarks)
       VALUES ($1,$2,$3,$4,$5)`,
      [uuidv4(), requestId, status, req.user.role, remarks]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ===================== GET REQUEST HISTORY ===================== */

exports.getRequestHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM request_status_history
       WHERE request_id=$1
       ORDER BY created_at ASC`,
      [id]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};