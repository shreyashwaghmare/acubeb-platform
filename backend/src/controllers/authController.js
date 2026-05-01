const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

exports.login = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({ success: false, message: "Mobile is required" });
    }

    let userResult = await pool.query("SELECT * FROM users WHERE mobile=$1", [mobile]);

    let user;

    if (userResult.rows.length === 0) {
      const id = uuidv4();

      const insertResult = await pool.query(
        `INSERT INTO users (id, name, mobile, role)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [id, "New Client", mobile, "client"]
      );

      user = insertResult.rows[0];
    } else {
      user = userResult.rows[0];
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, mobile: user.mobile },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};