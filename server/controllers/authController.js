const User = require("../models/User.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, contact } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Password validation (length, uppercase, number, etc.)
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ error: "Password must contain at least one uppercase letter" });
    }
    if (!/[0-9]/.test(password)) {
      return res.status(400).json({ error: "Password must contain at least one number" });
    }

    // Role-based authorization (only teachers can create teacher accounts)
    if (role === "teacher") {
      const existingTeacher = await User.findOne({ role: "teacher" });
      if (existingTeacher && (!req.user || req.user.role !== "teacher")) {
        return res.status(403).json({ 
          error: "Only existing teachers can create new teacher accounts" 
        });
      }
    }

    // Create user by passing the plain text password.
    // The pre-save hook in the User model will hash it.
    const user = await User.create({ 
      name, 
      email, 
      password, // pass plain text
      role, 
      contact,
      changedPasswordAt: Date.now()
    });

    // Generate token including additional user fields
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role, 
        name: user.name, 
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ 
      id: user._id,
      token,
      role: user.role,
      message: "User registered successfully"
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user and explicitly include password field
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate token including additional user fields
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        name: user.name,
        email: user.email,
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Update password change timestamp if necessary
    user.changedPasswordAt = Date.now();
    await user.save();

    res.json({ 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      message: "Login successful"
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const validateToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({ error: "Invalid token" });
    }

    res.json({ valid: true, user });

  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};



module.exports = { registerUser, loginUser, validateToken };
