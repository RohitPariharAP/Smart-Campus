const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");
const { protect, teacherOnly } = require("../middleware/authMiddleware");

const User = require("../models/User.model");

// Registration (First teacher can register without auth, subsequent need teacher auth)
router.post(
  "/register",
  async (req, res, next) => {
    const teacherExists = await User.exists({ role: "teacher" });
    if (teacherExists) {
      protect(req, res, () => teacherOnly(req, res, next));
    } else {
      next();
    }
  },
  registerUser
);

// Login for all users
router.post("/login", loginUser);

module.exports = router;
