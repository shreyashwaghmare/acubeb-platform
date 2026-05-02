const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

const createToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role, mobile: user.mobile },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

exports.register = async (req, res) => {
  try {
    const { name, mobile } = req.body;

    if (!name || !mobile) {
      return res.status(400).json({
        success: false,
        message: "Name and mobile are required",
      });
    }

    const existing = await pool.query("SELECT * FROM users WHERE mobile=$1", [mobile]);

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Mobile number already registered. Please login.",
      });
    }

    const id = uuidv4();

    const result = await pool.query(
      `INSERT INTO users (id, name, mobile, role)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, name, mobile, "client"]
    );

    const user = result.rows[0];
    const token = createToken(user);

    res.json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is required",
      });
    }

    const result = await pool.query("SELECT * FROM users WHERE mobile=$1", [mobile]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Mobile number not registered. Please register first.",
      });
    }

    const user = result.rows[0];
    const token = createToken(user);

    res.json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};