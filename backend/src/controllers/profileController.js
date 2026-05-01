const pool = require("../config/db");

exports.getProfile = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE id=$1", [req.user.id]);

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, gst, address } = req.body;

    const result = await pool.query(
      `UPDATE users
       SET name=$1, email=$2, gst=$3, address=$4
       WHERE id=$5
       RETURNING *`,
      [name, email, gst, address, req.user.id]
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};