const pool = require("../config/db");

exports.getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        id,
        name,
        mobile,
        email,
        gst,
        address,
        role,
        expo_push_token,
        created_at
       FROM users
       WHERE id=$1`,
      [req.user.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.log("GET PROFILE ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, gst, address } = req.body;

    const result = await pool.query(
      `UPDATE users
       SET
        name=$1,
        email=$2,
        gst=$3,
        address=$4
       WHERE id=$5
       RETURNING
        id,
        name,
        mobile,
        email,
        gst,
        address,
        role,
        expo_push_token,
        created_at`,
      [name, email, gst, address, req.user.id]
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.log("UPDATE PROFILE ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.savePushToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Push token is required",
      });
    }

    const result = await pool.query(
      `UPDATE users
       SET expo_push_token=$1
       WHERE id=$2
       RETURNING id, name, mobile, expo_push_token`,
      [token, userId]
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (e) {
    console.error("SAVE PUSH TOKEN ERROR:", e);
    res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};