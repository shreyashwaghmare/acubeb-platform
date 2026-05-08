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
const admin = require("../config/firebase");

exports.firebaseLogin = async (req, res) => {
  try {
    const {
      firebaseToken,
      mobile,
      email,
      name,
      profileImage,
      provider,
    } = req.body;

    if (!firebaseToken) {
      return res.status(400).json({
        success: false,
        message: "Firebase token required",
      });
    }

    // ✅ Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(firebaseToken);

    const firebaseUid = decoded.uid;

    // ✅ Check existing user
    let result = await pool.query(
      `SELECT * FROM users WHERE firebase_uid = $1`,
      [firebaseUid]
    );

    let user;

    // ✅ Create user if not exists
    if (result.rows.length === 0) {
      const id = uuidv4();

      const created = await pool.query(
        `
        INSERT INTO users (
          id,
          firebase_uid,
          auth_provider,
          is_verified,
          mobile,
          email,
          name,
          profile_image,
          role
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9
        )
        RETURNING *
        `,
        [
          id,
          firebaseUid,
          provider || "firebase",
          true,
          mobile || "",
          email || "",
          name || "Client",
          profileImage || "",
          "client",
        ]
      );

      user = created.rows[0];
    } else {
      user = result.rows[0];

      // ✅ Update latest profile info
      await pool.query(
        `
        UPDATE users
        SET
          mobile = COALESCE($1, mobile),
          email = COALESCE($2, email),
          name = COALESCE($3, name),
          profile_image = COALESCE($4, profile_image),
          is_verified = true
        WHERE id = $5
        `,
        [
          mobile,
          email,
          name,
          profileImage,
          user.id,
        ]
      );
    }

    // ✅ Generate app JWT
    const token = createToken(user);

    res.json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    console.log("FIREBASE LOGIN ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};