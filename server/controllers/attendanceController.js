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
    const { date, attendanceData } = req.body; // attendanceData = [{ studentId: '...', status: 'present/absent' }]
    const teacherId = req.user._id; // From authMiddleware

    if (!date || !Array.isArray(attendanceData) || attendanceData.length === 0) {
        return res.status(400).json({ error: 'Missing required fields: date, or attendanceData array.' });
    }

    const normalizedDate = normalizeDate(date);

    try {
        const operations = attendanceData.map(({ studentId, status }) => ({
            updateOne: {
                filter: { student: studentId, date: normalizedDate },
                update: { 
                    $set: { 
                        status, 
                        markedBy: teacherId,
                        lastUpdated: new Date() // Track when the record was last updated
                    },
                    $setOnInsert: { // Only set these on initial insert
                        student: studentId,
                        date: normalizedDate,
                        markedAt: new Date() // Track when the record was first created
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
            return res.status(409).json({ error: 'Attendance record already exists for one or more students on this date. Use update if needed.' });
        }
        res.status(500).json({ error: 'Failed to mark attendance.', details: error.message });
    }
};

// @desc    Get attendance records (Teacher view)
// @route   GET /api/attendance/teacher
// @access  Private (Teacher)
exports.getAttendanceByTeacher = async (req, res) => {
    const teacherId = req.user._id;
    const { date, studentName, status } = req.query;

    try {
        const query = { markedBy: teacherId }; // Base query for the teacher

        if (date) {
            query.date = normalizeDate(date);
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
                    markedAt: 1,
                    lastUpdated: 1,
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
        res.status(500).json({ error: 'Failed to fetch attendance records.', details: error.message });
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
        res.status(500).json({ error: 'Failed to fetch attendance records.', details: error.message });
    }
};

// @desc    Get attendance summary for a specific date or period
// @route   GET /api/attendance/summary
// @access  Private (Teacher)
exports.getAttendanceSummary = async (req, res) => {
    const teacherId = req.user._id;
    const { date, startDate, endDate, studentId, classSubject } = req.query;
    
    try {
        // Build the match query
        const matchQuery = { markedBy: new mongoose.Types.ObjectId(teacherId) };
        
        // Handle date filtering
        if (date) {
            matchQuery.date = normalizeDate(date);
        } else if (startDate || endDate) {
            matchQuery.date = {};
            if (startDate) {
                matchQuery.date.$gte = normalizeDate(startDate);
            }
            if (endDate) {
                const end = normalizeDate(endDate);
                end.setUTCDate(end.getUTCDate() + 1);
                matchQuery.date.$lt = end;
            }
        }
        
        // Optional student filter
        if (studentId) {
            matchQuery.student = new mongoose.Types.ObjectId(studentId);
        }
        
        // Optional class/subject filter
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
        
        // Calculate percentages for convenience (matches the UI needs)
        if (result.totalDays > 0) {
            result.presentPercentage = Math.round((result.present / result.totalDays) * 100);
            result.absentPercentage = Math.round((result.absent / result.totalDays) * 100);
        } else {
            result.presentPercentage = 0;
            result.absentPercentage = 0;
        }

        res.status(200).json(result);
        
    } catch (error) {
        console.error("Get Attendance Summary Error:", error);
        res.status(500).json({ error: 'Failed to fetch attendance summary.', details: error.message });
    }
};

// @desc    Get attendance summary for a specific student
// @route   GET /api/attendance/summary/:studentId
// @access  Private (Teacher or Specific Student)
exports.getStudentAttendanceSummary = async (req, res) => {
    const studentId = req.params.studentId;
    const requestingUserId = req.user._id;
    const requestingUserRole = req.user.role;
    const { classSubject, startDate, endDate } = req.query; // Optional filters

    // Security check: Ensure the requestor is the student themselves or a teacher
    if (requestingUserRole !== 'teacher' && requestingUserId.toString() !== studentId) {
        return res.status(403).json({ error: 'Access denied. You can only view your own summary or if you are a teacher.' });
    }

    try {
        const matchQuery = { student: new mongoose.Types.ObjectId(studentId) };
        
        // Add date range filter if provided
        if (startDate || endDate) {
            matchQuery.date = {};
            if (startDate) {
                matchQuery.date.$gte = normalizeDate(startDate);
            }
            if (endDate) {
                const end = normalizeDate(endDate);
                end.setUTCDate(end.getUTCDate() + 1);
                matchQuery.date.$lt = end;
            }
        }
        
        // Add class filter if provided
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
        
        // Add percentages
        if (result.totalDays > 0) {
            result.presentPercentage = Math.round((result.present / result.totalDays) * 100);
            result.absentPercentage = 100 - result.presentPercentage;
        } else {
            result.presentPercentage = 0;
            result.absentPercentage = 0;
        }

        // Get student info
        const studentInfo = await User.findById(studentId).select('name email');
        if (studentInfo) {
            result.studentInfo = {
                _id: studentInfo._id,
                name: studentInfo.name,
                email: studentInfo.email
            };
        }

        res.status(200).json(result);

    } catch (error) {
        console.error("Get Attendance Summary Error:", error);
        res.status(500).json({ error: 'Failed to fetch attendance summary.', details: error.message });
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
        // Find the record first to ensure it exists
        const record = await Attendance.findById(recordId);

        if (!record) {
            return res.status(404).json({ error: 'Attendance record not found.' });
        }

        // Update the record
        const updatedRecord = await Attendance.findByIdAndUpdate(
            recordId,
            { 
                $set: { 
                    status, 
                    markedBy: teacherId,
                    lastUpdated: new Date() // Track when updated
                } 
            },
            { new: true } // Return updated doc
        ).populate({
            path: 'student',
            select: 'name email _id'
        });

        if (!updatedRecord) {
            return res.status(404).json({ error: 'Attendance record not found after update attempt.' });
        }

        res.status(200).json(updatedRecord);

    } catch (error) {
        console.error("Update Attendance Error:", error);
        res.status(500).json({ error: 'Failed to update attendance record.', details: error.message });
    }
};

// @desc    Get attendance stats for a date range (e.g., for dashboard)
// @route   GET /api/attendance/stats
// @access  Private (Teacher)
exports.getAttendanceStats = async (req, res) => {
    const teacherId = req.user._id;
    const { startDate, endDate } = req.query;
    
    try {
        const matchQuery = { markedBy: new mongoose.Types.ObjectId(teacherId) };
        
        // Add date range filter
        if (startDate || endDate) {
            matchQuery.date = {};
            if (startDate) {
                matchQuery.date.$gte = normalizeDate(startDate);
            }
            if (endDate) {
                const end = normalizeDate(endDate);
                end.setUTCDate(end.getUTCDate() + 1);
                matchQuery.date.$lt = end;
            }
        }
        
        // Get daily stats (attendance count by date)
        const dailyStats = await Attendance.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: {
                        date: '$date',
                        status: '$status'
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: '$_id.date',
                    date: { $first: '$_id.date' },
                    statuses: { $push: { status: '$_id.status', count: '$count' } },
                    totalCount: { $sum: '$count' }
                }
            },
            { $sort: { date: 1 } },
            {
                $project: {
                    _id: 0,
                    date: 1,
                    totalCount: 1,
                    present: {
                        $ifNull: [{$let: { vars: { p: {$arrayElemAt: [{$filter: {input: '$statuses', as: 's', cond: {$eq: ['$$s.status', 'present']}}}, 0]} }, in: '$$p.count'}}, 0]
                    },
                    absent: {
                        $ifNull: [{$let: { vars: { a: {$arrayElemAt: [{$filter: {input: '$statuses', as: 's', cond: {$eq: ['$$s.status', 'absent']}}}, 0]} }, in: '$$a.count'}}, 0]
                    }
                }
            }
        ]);
        
        // Calculate additional stats for each day
        const enrichedDailyStats = dailyStats.map(day => {
            const presentPercentage = day.totalCount > 0 ? Math.round((day.present / day.totalCount) * 100) : 0;
            return {
                ...day,
                presentPercentage,
                absentPercentage: 100 - presentPercentage,
                formattedDate: day.date.toISOString().split('T')[0]
            };
        });
        
        // Get overall summary for the period
        const totalPresent = enrichedDailyStats.reduce((sum, day) => sum + day.present, 0);
        const totalAbsent = enrichedDailyStats.reduce((sum, day) => sum + day.absent, 0);
        const totalCount = totalPresent + totalAbsent;
        
        const overallSummary = {
            totalDays: dailyStats.length,
            totalRecords: totalCount,
            totalPresent,
            totalAbsent,
            presentPercentage: totalCount > 0 ? Math.round((totalPresent / totalCount) * 100) : 0,
            absentPercentage: totalCount > 0 ? Math.round((totalAbsent / totalCount) * 100) : 0
        };
        
        res.status(200).json({
            dailyStats: enrichedDailyStats,
            overallSummary
        });
        
    } catch (error) {
        console.error("Get Attendance Stats Error:", error);
        res.status(500).json({ error: 'Failed to fetch attendance statistics.', details: error.message });
    }
};

// @desc    Get a list of students (for populating teacher's marking form)
// @route   GET /api/attendance/students
// @access  Private (Teacher)
exports.getStudentsForAttendance = async (req, res) => {
    const { classSubject, searchTerm } = req.query; 

    try {
        let query = { role: 'student' }; // Base query for students
        
        // Add search by name or email if provided
        if (searchTerm) {
            query.$or = [
                { name: { $regex: searchTerm, $options: 'i' } },
                { email: { $regex: searchTerm, $options: 'i' } }
            ];
        }

        // If you add enrolledClasses/enrolledSubjects to your User model:
        if (classSubject) {
            query.$or = query.$or || [];
            query.$or.push(
                { enrolledClasses: classSubject },
                { enrolledSubjects: classSubject }
            );
        }

        const students = await User.find(query)
            .select('name email _id')
            .sort('name')
            .limit(50); // Limit results for performance

        // If we found less than the limit, no need for pagination info
        if (students.length < 50) {
            return res.status(200).json(students);
        }
        
        // Otherwise include pagination info
        const totalCount = await User.countDocuments(query);
        
        res.status(200).json({
            students,
            pagination: {
                total: totalCount,
                hasMore: totalCount > 50
            }
        });

    } catch (error) {
        console.error("Get Students Error:", error);
        res.status(500).json({ error: 'Failed to fetch students.', details: error.message });
    }
};

// @desc    Bulk update attendance records
// @route   PUT /api/attendance/bulk-update
// @access  Private (Teacher)
exports.bulkUpdateAttendance = async (req, res) => {
    const { records } = req.body; // Array of { recordId, status }
    const teacherId = req.user._id;
    
    if (!Array.isArray(records) || records.length === 0) {
        return res.status(400).json({ error: 'Missing or invalid records array.' });
    }
    
    try {
        const updateOperations = records.map(({ recordId, status }) => {
            if (!mongoose.Types.ObjectId.isValid(recordId) || !['present', 'absent'].includes(status)) {
                throw new Error(`Invalid record ID or status for record: ${recordId}`);
            }
            
            return {
                updateOne: {
                    filter: { _id: recordId },
                    update: { 
                        $set: { 
                            status, 
                            markedBy: teacherId,
                            lastUpdated: new Date()
                        }
                    }
                }
            };
        });
        
        const result = await Attendance.bulkWrite(updateOperations);
        
        res.status(200).json({
            message: 'Attendance records updated successfully',
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount
        });
        
    } catch (error) {
        console.error("Bulk Update Error:", error);
        res.status(500).json({ error: 'Failed to update attendance records.', details: error.message });
    }
};