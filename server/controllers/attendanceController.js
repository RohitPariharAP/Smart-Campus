const Attendance = require('../models/Attendance.model');
const User = require('../models/User.model');
const mongoose = require('mongoose');

// Helper function to normalize date to midnight UTC
const normalizeDate = (date) => {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d;
};

// @desc    Mark attendance for multiple students for a specific class/date
// @route   POST /api/attendance/mark
// @access  Private (Teacher)
exports.markAttendance = async (req, res) => {
    const { date, classSubject, attendanceData } = req.body; // attendanceData = [{ studentId: '...', status: 'present/absent' }]
    const teacherId = req.user._id; // From authMiddleware

    if (!date || !classSubject || !Array.isArray(attendanceData) || attendanceData.length === 0) {
        return res.status(400).json({ error: 'Missing required fields: date, classSubject, or attendanceData array.' });
    }

    const normalizedDate = normalizeDate(date);

    try {
        const operations = attendanceData.map(({ studentId, status }) => ({
            updateOne: {
                filter: { student: studentId, date: normalizedDate, classSubject },
                update: { 
                    $set: { 
                        status, 
                        markedBy: teacherId,
                        classSubject // Ensure classSubject is set on update too
                    },
                    $setOnInsert: { // Only set these on initial insert
                        student: studentId,
                        date: normalizedDate,
                    }
                },
                upsert: true // Create if doesn't exist, update if it does
            }
        }));

        const result = await Attendance.bulkWrite(operations);

        res.status(200).json({ 
            message: 'Attendance marked successfully.',
            insertedCount: result.upsertedCount,
            modifiedCount: result.modifiedCount
        });

    } catch (error) {
        console.error("Mark Attendance Error:", error);
         if (error.code === 11000) { // Duplicate key error
            return res.status(409).json({ error: 'Attendance record already exists for one or more students on this date/class. Use update if needed.' });
        }
        res.status(500).json({ error: 'Failed to mark attendance.', details: error.message });
    }
};

// @desc    Get attendance records (Teacher view)
// @route   GET /api/attendance/teacher
// @access  Private (Teacher)
exports.getAttendanceByTeacher = async (req, res) => {
    const teacherId = req.user._id;
    const { date, classSubject, studentName, status } = req.query;

    try {
        const query = { markedBy: teacherId }; // Base query for the teacher

        if (date) {
            query.date = normalizeDate(date);
        }
        if (classSubject) {
            query.classSubject = classSubject;
        }
         if (status) {
            query.status = status; // 'present' or 'absent'
        }
        
        // Base pipeline stages
        const pipeline = [
            { $match: query },
             {
                $lookup: {
                    from: 'users', // Collection name for Users
                    localField: 'student',
                    foreignField: '_id',
                    as: 'studentInfo'
                }
            },
             { $unwind: '$studentInfo' } // Deconstruct the studentInfo array
        ];
        
         // Add filtering by student name if provided
        if (studentName) {
            pipeline.push({
                $match: { 
                    'studentInfo.name': { $regex: studentName, $options: 'i' } 
                }
            });
        }

        // Add sorting and projection
         pipeline.push(
            { $sort: { 'studentInfo.name': 1, date: -1 } }, // Sort by student name, then date
            { 
                $project: { // Select fields to return
                    _id: 1,
                    date: 1,
                    status: 1,
                    classSubject: 1,
                    markedAt: 1,
                    'studentInfo.name': 1,
                    'studentInfo.email': 1,
                    'studentInfo._id': 1
                } 
            }
        );


        const attendanceRecords = await Attendance.aggregate(pipeline);


        res.status(200).json(attendanceRecords);

    } catch (error) {
        console.error("Get Teacher Attendance Error:", error);
        res.status(500).json({ error: 'Failed to fetch attendance records.' });
    }
};


// @desc    Get attendance records (Student view)
// @route   GET /api/attendance/student
// @access  Private (Student)
exports.getAttendanceByStudent = async (req, res) => {
    const studentId = req.user._id;
    const { startDate, endDate, classSubject } = req.query;

    try {
        const query = { student: studentId };
        
        if (classSubject) {
            query.classSubject = classSubject;
        }

        if (startDate || endDate) {
            query.date = {};
            if (startDate) {
                query.date.$gte = normalizeDate(startDate);
            }
            if (endDate) {
                 // Add 1 day to include the end date fully
                const end = normalizeDate(endDate);
                end.setUTCDate(end.getUTCDate() + 1);
                query.date.$lt = end;
            }
        }

        const attendanceRecords = await Attendance.find(query)
            .sort({ date: -1 }) // Sort by date descending
            .populate('markedBy', 'name'); // Optionally show teacher name

        res.status(200).json(attendanceRecords);
    } catch (error) {
        console.error("Get Student Attendance Error:", error);
        res.status(500).json({ error: 'Failed to fetch attendance records.' });
    }
};

// @desc    Get attendance summary for a specific student (can be used by both)
// @route   GET /api/attendance/summary/:studentId
// @access  Private (Teacher or Specific Student)
exports.getAttendanceSummary = async (req, res) => {
    const studentId = req.params.studentId;
    const requestingUserId = req.user._id;
    const requestingUserRole = req.user.role;
     const { classSubject } = req.query; // Optional filter

    // Security check: Ensure the requestor is the student themselves or a teacher
    if (requestingUserRole !== 'teacher' && requestingUserId.toString() !== studentId) {
        return res.status(403).json({ error: 'Access denied. You can only view your own summary or if you are a teacher.' });
    }

    try {
        const matchQuery = { student: new mongoose.Types.ObjectId(studentId) };
        if (classSubject) {
            matchQuery.classSubject = classSubject;
        }

        const summary = await Attendance.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$status', // Group by status (present/absent)
                    count: { $sum: 1 } // Count occurrences
                }
            },
             {
                $group: {
                    _id: null, // Group all results into one document
                    totalDays: { $sum: '$count' }, // Sum counts for total
                    statuses: { $push: { status: '$_id', count: '$count' } } // Push status counts into an array
                }
            },
            {
                 $project: { // Reshape the output
                    _id: 0, // Exclude default _id
                    totalDays: 1,
                    present: {
                         $ifNull: [{$let: { vars: { p: {$arrayElemAt: [{$filter: {input: '$statuses', as: 's', cond: {$eq: ['$$s.status', 'present']}}}, 0]} }, in: '$$p.count'}}, 0]
                    },
                    absent: {
                         $ifNull: [{$let: { vars: { a: {$arrayElemAt: [{$filter: {input: '$statuses', as: 's', cond: {$eq: ['$$s.status', 'absent']}}}, 0]} }, in: '$$a.count'}}, 0]
                    }
                }
            }
        ]);

        // If no records found, aggregate returns empty array, send default zero counts
        const result = summary.length > 0 ? summary[0] : { totalDays: 0, present: 0, absent: 0 };

        res.status(200).json(result);

    } catch (error) {
        console.error("Get Attendance Summary Error:", error);
        res.status(500).json({ error: 'Failed to fetch attendance summary.' });
    }
};

// @desc    Update a specific attendance record
// @route   PUT /api/attendance/:recordId
// @access  Private (Teacher)
exports.updateAttendance = async (req, res) => {
    const { recordId } = req.params;
    const { status } = req.body;
    const teacherId = req.user._id;

    if (!status || !['present', 'absent'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status provided.' });
    }

    if (!mongoose.Types.ObjectId.isValid(recordId)) {
        return res.status(400).json({ error: 'Invalid attendance record ID.' });
    }

    try {
        // Find the record first to ensure it exists and the teacher is authorized (optional but good practice)
        const record = await Attendance.findById(recordId);

        if (!record) {
            return res.status(404).json({ error: 'Attendance record not found.' });
        }
        
        // Optional: Add a check if the teacher marking is the one updating, or allow any teacher
        // if (record.markedBy.toString() !== teacherId.toString()) {
        //    return res.status(403).json({ error: 'You are not authorized to update this record.' });
        // }


        const updatedRecord = await Attendance.findByIdAndUpdate(
            recordId,
            { $set: { status, markedBy: teacherId } },
            { new: true, runValidators: true } // Return updated doc, run schema validation
        ).populate('student', 'name email').populate('markedBy', 'name'); // Populate details

        if (!updatedRecord) { // Should not happen if findById worked, but check just in case
             return res.status(404).json({ error: 'Attendance record not found after update attempt.' });
        }

        res.status(200).json(updatedRecord);

    } catch (error) {
        console.error("Update Attendance Error:", error);
        res.status(500).json({ error: 'Failed to update attendance record.' });
    }
};


// @desc    Get a list of students (for populating teacher's marking form)
// @route   GET /api/attendance/students
// @access  Private (Teacher)
exports.getStudentsForAttendance = async (req, res) => {
     const { classSubject } = req.query; // Optional: Filter by class/subject if you store enrollment info

     try {
        let query = { role: 'student' }; // Base query for students

        // If you add enrolledClasses/enrolledSubjects to your User model:
        // if (classSubject) {
        //     query.$or = [
        //         { enrolledClasses: classSubject },
        //         { enrolledSubjects: classSubject }
        //     ];
        // }

        const students = await User.find(query).select('name email _id').sort('name'); // Select only needed fields

        res.status(200).json(students);

    } catch (error) {
        console.error("Get Students Error:", error);
        res.status(500).json({ error: 'Failed to fetch students.' });
    }
};