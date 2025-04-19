const express = require('express');
const router = express.Router();
const { protect, teacherOnly } = require('../middleware/authMiddleware'); // Assuming you have teacherOnly middleware
const {
    markAttendance,
    getAttendanceByTeacher,
    getAttendanceByStudent,
    getAttendanceSummary,
    updateAttendance,
    getStudentsForAttendance,
     // Add this new controller function
} = require('../controllers/attendanceController');

// Routes for Teachers
router.post('/mark', protect, teacherOnly, markAttendance);
router.get('/teacher', protect, teacherOnly, getAttendanceByTeacher);
router.put('/:recordId', protect, teacherOnly, updateAttendance);
router.get('/students', protect, teacherOnly, getStudentsForAttendance); // Route to get student list

// Route for Student's own view
router.get('/student', protect, getAttendanceByStudent); // No teacherOnly needed

// Route for Summary (accessible by teacher or the specific student)
router.get('/summary/:studentId', protect, getAttendanceSummary); 
 
module.exports = router;