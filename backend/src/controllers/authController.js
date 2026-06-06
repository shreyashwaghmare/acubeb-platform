const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");
const admin = require("../config/firebase");

const createToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("Critical Configuration Error: JWT_SECRET environment variable is missing.");
  }
  return jwt.sign(
    { id: user.id, role: user.role, mobile: user.mobile },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const isValidUpdateValue = (val) => {
  return val !== undefined && val !== null && String(val).trim() !== "";
};

// 🎯 YOUR EXISTING REGISTER FUNCTION (Untouched, defaults to client)
exports.register = async (req, res) => {
  try {
    const { name, mobile } = req.body;
    if (!name || !mobile) {
      return res.status(400).json({ success: false, message: "Name and mobile are required" });
    }

    const existing = await pool.query("SELECT * FROM users WHERE mobile=$1", [mobile]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: "Mobile number already registered." });
    }

    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO users (id, name, mobile, role) VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, name, mobile, "client"]
    );

    const user = result.rows[0];
    const token = createToken(user);
    return res.json({ success: true, token, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 🎯 YOUR LOGIN FUNCTION (Safely enhanced for Operators)
exports.login = async (req, res) => {
  try {
    // We pull 'targetRole' from the body request. 
    // If it's not sent (like in your current client-app), it safely defaults to normal behavior.
    const { mobile, targetRole } = req.body; 

    if (!mobile) {
      return res.status(400).json({ success: false, message: "Mobile number is required" });
    }

    const result = await pool.query("SELECT * FROM users WHERE mobile=$1", [mobile]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Mobile number not registered." });
    }

    const user = result.rows[0];

    // 🌟 THE SAFE GUARDRAIL: If the operator console is trying to log in, 
    // make sure the user account actually has the 'operator' role in Supabase.
    if (targetRole && user.role !== targetRole) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Account is not configured as an authorized ${targetRole}.`,
      });
    }

    const token = createToken(user);

    return res.json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 🎯 YOUR EXISTING FIREBASE LOGIN FUNCTION (Untouched)
exports.firebaseLogin = async (req, res) => {
  try {
    const {
      firebaseToken,
      mobile,
      email,
      name,
      profileImage,
      provider,
      targetRole,
    } = req.body;

    if (!firebaseToken) {
      return res.status(400).json({
        success: false,
        message: "Firebase token required",
      });
    }

    const decoded = await admin.auth().verifyIdToken(firebaseToken);
    const firebaseUid = decoded.uid;

    let result = await pool.query(
      `SELECT * FROM users WHERE firebase_uid = $1`,
      [firebaseUid]
    );

    let user;

    if (result.rows.length === 0) {
      /*
        IMPORTANT:
        Operator app must NOT auto-create operator accounts.
        Only client app should create new client accounts.
      */

      if (targetRole === "operator" || targetRole === "admin") {
        return res.status(403).json({
          success: false,
          message:
            "Access denied. Operator/Admin account must be created by administrator first.",
        });
      }

      const id = uuidv4();
      const fallbackMobile =
        mobile && mobile.trim() !== "" ? mobile : null;
      const fallbackEmail =
        email && email.trim() !== "" ? email : null;

      const created = await pool.query(
        `
        INSERT INTO users
        (
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
        VALUES
        (
          $1, $2, $3, $4, $5, $6, $7, $8, $9
        )
        RETURNING *
        `,
        [
          id,
          firebaseUid,
          provider || "firebase",
          true,
          fallbackMobile,
          fallbackEmail,
          name || "Client",
          profileImage || "",
          "client",
        ]
      );

      user = created.rows[0];
    } else {
      user = result.rows[0];

      const updatedMobile = isValidUpdateValue(mobile)
        ? mobile
        : user.mobile;

      const updatedEmail = isValidUpdateValue(email)
        ? email
        : user.email;

      const updatedName = isValidUpdateValue(name)
        ? name
        : user.name;

      const updatedProfileImage = isValidUpdateValue(profileImage)
        ? profileImage
        : user.profile_image;

      const updatedResult = await pool.query(
        `
        UPDATE users
        SET
          mobile = $1,
          email = $2,
          name = $3,
          profile_image = $4,
          is_verified = true
        WHERE id = $5
        RETURNING *
        `,
        [
          updatedMobile,
          updatedEmail,
          updatedName,
          updatedProfileImage,
          user.id,
        ]
      );

      user = updatedResult.rows[0];
    }

    /*
      ROLE GUARD:
      Operator app sends targetRole: "operator".
      Client app can omit targetRole or send "client".
    */
    if (targetRole && user.role !== targetRole) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Account is not configured as authorized ${targetRole}.`,
      });
    }

    const token = createToken(user);

    return res.json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    console.error("FIREBASE LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const result = await pool.query(
      `
      UPDATE users
      SET
        name = $1,
        email = $2
      WHERE id = $3
      RETURNING *
      `,
      [name, email, req.user.id]
    );

    return res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};