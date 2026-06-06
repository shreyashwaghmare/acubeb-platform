const jwt = require("jsonwebtoken");

module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Malformed authorization token string structure." });
  }

  // 🛡️ STRATEGY CHANGE: Attempt to cryptographically verify genuine production tokens first
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Successfully unpacked database signature user details (id, role, mobile)
    return next();
  } catch (error) {
    
    // 🌟 LOCAL DEVELOPMENT PASS-THROUGH FALLBACK
    // If cryptographic verification fails, check if it's an explicit frontend mock sandbox token
   if (
  process.env.NODE_ENV !== "production" &&
  (token === "DEVELOPMENT_OPERATOR_TOKEN" || token.startsWith("MOCK_JWT_"))
)  {
      console.log("------------------------------------------------------------------");
      console.log("🛠️  Auth Middleware: Mock Token Fallback Triggered. Local Bypass Granted.");
      console.log("------------------------------------------------------------------");
      
      // Inject deterministic operator context mapping to your active Supabase record row
      req.user = {
        id: "3347423b-079a-443e-8476-df0c32e7376b", 
        mobile: "9697985597",
        role: "operator"
      };
      
      return next();
    }

    // If it's neither a valid signed JWT nor an authorized development string bypass, reject access
    console.warn("❌ JWT Verification Engine Rejected Token Signature:", error.message);
    return res.status(401).json({ success: false, message: "Session expired or invalid token signature structure." });
  }
};