const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
// const authRoutes = require('./routes/authRoute.js');
const authRoutes = require("./routes/authRoute");

const attendanceRoutes = require("./routes/attendanceRoutes");
const noteRoutes = require("./routes/noteRoutes");
const path = require("path");
require("dotenv").config();

const app = express();

// Enhanced Security Middleware
app.use(helmet());
// app.use(cors({
//   origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

const corsOptions = {
  origin: 'https://smart-campus-jade.vercel.app',  
  // origin: "https://smart-campus-7kfykrirw-rohitpariharaps-projects.vercel.app/", // for Vercel frontend
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // <== THIS handles preflight

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body Parser
app.use(express.json({ limit: "10kb" }));

// Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("Database connection error:", err.message);
    process.exit(1);
  }
};
connectDB();

// Static Files with Fallback
app.use(
  "/uploads",
  express.static("uploads", {
    fallthrough: false,
    setHeaders: (res, path) => {
      res.set("X-Content-Type-Options", "nosniff");
    },
  })
);

// Handle static file 404s
app.use("/uploads", (req, res) => {
  res.status(404).json({ error: "File not found" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/notes", noteRoutes);

// Health Check Endpoints
app.get("/", (req, res) => res.status(200).json({ status: "OK" }));
app.get("/api/health", (req, res) =>
  res.json({
    status: "OK",
    dbState: mongoose.connection.readyState,
    timestamp: new Date().toISOString(),
  })
);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Handle 404
app.use("*", (req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `Server running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`
  );
});
