const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { login, register,firebaseLogin } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.put(
  "/profile",
  authMiddleware,
  authController.updateProfile
);
router.post("/login", login);
router.post("/register", register);
router.post("/firebase-login", firebaseLogin);
module.exports = router;