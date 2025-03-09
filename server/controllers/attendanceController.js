const Attendance = require("../models/Attendence.model");
const User = require("../models/User.model");

// Mark attendance for a student

const markAttendance = async (req, res) => {
  try {
    const { date, students } = req.body;

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: "Invalid date format (YYYY-MM-DD required)" });
    }

    // Validate students exist
    const studentIds = students.map(s => s.student);
    const existingStudents = await User.countDocuments({ 
      _id: { $in: studentIds }, 
      role: 'student' 
    });

    if (existingStudents !== studentIds.length) {
      return res.status(400).json({ error: "Invalid student IDs detected" });
    }

    const attendanceDate = new Date(date);
    
    attendanceDate.setHours(0, 0, 0, 0); // Normalize time

    let attendance = await Attendance.findOne({ date: attendanceDate });

    if (attendance) {
      attendance.students = students;
    } else {
      attendance = new Attendance({ date: attendanceDate, students });
    }

    await attendance.save();
    
    // Populate student details in response
    const populated = await Attendance.populate(attendance, {
      path: 'students.student',
      select: 'name email'
    });

    res.status(200).json(populated);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//Get attendance by date

const getAttendanceByDate = async (req, res) => {
  try {
    const dateParam = req.params.date;
    
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const date = new Date(dateParam);
    const attendance = await Attendance.findOne({ date })
      .populate("students.student", "name email contact");

    if (!attendance) {
      return res.status(404).json({ error: "No attendance records found for this date" });
    }

    res.json(attendance);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select(
      "name email contact"
    );
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getStudentAttendanceHistory = async (req, res) => {
    try {
        const history = await Attendance.aggregate([
            { $unwind: "$students" },
            { $match: { "students.student": req.user._id } },
            { $project: { date: 1, status: "$students.status" }},
        ]);

        res.json(history);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }               
}


const getAttendanceSummary = async (req, res) => {
  try {
    const summary = await Attendance.aggregate([
      { $unwind: "$students" },
      {
        $group: {
          _id: "$students.student",
          presentCount: {
            $sum: { $cond: [{ $eq: ["$students.status", "present"] }, 1, 0] }
          },
          absentCount: {
            $sum: { $cond: [{ $eq: ["$students.status", "absent"] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "studentDetails"
        }
      },
      { $unwind: "$studentDetails" },
      {
        $project: {
          _id: 1,
          presentCount: 1,
          absentCount: 1,
          name: "$studentDetails.name",
          contact: "$studentDetails.contact",
          email: "$studentDetails.email"
        }
      },
      { $sort: { name: 1 } }
    ]);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// For students: Get summary for the logged in student
const getMyAttendanceSummary = async (req, res) => {
  try {
    const myId = req.user._id;
    const summary = await Attendance.aggregate([
      { $unwind: "$students" },
      { $match: { "students.student": myId } },
      {
        $group: {
          _id: "$students.student",
          presentCount: {
            $sum: { $cond: [{ $eq: ["$students.status", "present"] }, 1, 0] }
          },
          absentCount: {
            $sum: { $cond: [{ $eq: ["$students.status", "absent"] }, 1, 0] }
          }
        }
      }
    ]);
    res.json(summary.length > 0 ? summary[0] : { presentCount: 0, absentCount: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getMyAttendanceByDate = async (req, res) => {
  try {
    const dateParam = req.params.date; // e.g., "2025-03-10"
    const date = new Date(dateParam);
    date.setHours(0, 0, 0, 0);
    const attendanceDoc = await Attendance.findOne({ date });
    if (!attendanceDoc) {
      return res.status(404).json({ error: 'No attendance record found for that date' });
    }
    const myEntry = attendanceDoc.students.find(
      (s) => s.student.toString() === req.user._id.toString()
    );
    res.json({ date: dateParam, status: myEntry ? myEntry.status : 'No record' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



module.exports = { markAttendance, getAttendanceByDate,getStudents,getStudentAttendanceHistory, getAttendanceSummary, getMyAttendanceSummary, getMyAttendanceByDate };
