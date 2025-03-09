const express = require('express');
const router = express.Router();
const { 
  markAttendance, 
  getAttendanceByDate,
  getStudentAttendanceHistory,
  getStudents,
  getAttendanceSummary,
  getMyAttendanceSummary,
  getMyAttendanceByDate
} = require('../controllers/attendanceController');
const { protect, teacherOnly } = require("../middleware/authMiddleware");

// Teacher-only routes
router.post("/", protect, teacherOnly, markAttendance);
router.get("/students", protect, teacherOnly, getStudents);
router.get("/summary", protect, teacherOnly, getAttendanceSummary); // Teacher view

// Student-accessible routes
router.get("/:date", protect, getAttendanceByDate);
router.get("/student/history", protect, getStudentAttendanceHistory);
router.get("/summary/me", protect, getMyAttendanceSummary); // Student summary
router.get("/student/date/:date", protect, getMyAttendanceByDate); // studnet date search

// router.get("/:id", protect,teacherOnly, deleteUser); 

module.exports = router;