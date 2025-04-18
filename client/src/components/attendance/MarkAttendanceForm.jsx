import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStudentsForAttendanceApi, markAttendanceApi } from '../../services/attendanceApi'; // Adjust path if needed
import { toast } from 'react-hot-toast';
import DatePicker from 'react-datepicker'; // Install: npm install react-datepicker
import "react-datepicker/dist/react-datepicker.css";
import LoadingSpinner from '../LoadingSpinner'; // Assuming this exists

export default function MarkAttendanceForm() {
    const queryClient = useQueryClient();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSubject, setSelectedSubject] = useState(''); // You might fetch subjects/classes
    const [attendance, setAttendance] = useState({}); // { studentId: 'present' / 'absent' }

    // --- Fetch Students ---
    // TODO: Potentially filter students by selectedSubject if implemented in backend/User model
    const { data: students, isLoading: isLoadingStudents, error: errorStudents } = useQuery({
        queryKey: ['studentsForAttendance', selectedSubject], // Re-fetch if subject changes
        queryFn: () => getStudentsForAttendanceApi({ classSubject: selectedSubject }),
        enabled: !!selectedSubject, // Only fetch when a subject is selected
        staleTime: 5 * 60 * 1000, // Cache for 5 mins
    });

    // --- Mark Attendance Mutation ---
    const markMutation = useMutation({
        mutationFn: markAttendanceApi,
        onSuccess: (data) => {
            toast.success(data.message || 'Attendance marked successfully!');
            // Optionally refetch teacher attendance data for the selected date/subject
            queryClient.invalidateQueries(['teacherAttendance', selectedDate.toISOString().split('T')[0], selectedSubject]);
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Failed to mark attendance');
            console.error("Mark attendance error details:", error.response?.data);
        },
    });

    // --- Handle Attendance Change ---
    const handleStatusChange = (studentId, status) => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    // --- Initialize attendance state when students load ---
     useEffect(() => {
        if (students) {
            const initialAttendance = {};
            students.forEach(student => {
                // Default to 'present' or load existing data if needed later
                initialAttendance[student._id] = 'present'; 
            });
            setAttendance(initialAttendance);
        }
    }, [students]);

    // --- Handle Submit ---
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedSubject || !selectedDate || Object.keys(attendance).length === 0) {
            toast.error('Please select date, subject, and mark attendance for students.');
            return;
        }

        const attendanceData = Object.entries(attendance).map(([studentId, status]) => ({
            studentId,
            status
        }));

        markMutation.mutate({
            date: selectedDate.toISOString().split('T')[0], // Send as YYYY-MM-DD
            classSubject: selectedSubject,
            attendanceData
        });
    };
    
    // --- Render Logic ---
    return (
        <div className="max-w-4xl mx-auto p-4 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Mark Attendance</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Date and Subject Selection */}
                <div className="flex flex-wrap gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Date *</label>
                        <DatePicker 
                            selected={selectedDate} 
                            onChange={(date) => setSelectedDate(date)}
                            dateFormat="yyyy-MM-dd"
                            className="w-full p-2 border rounded-md"
                            maxDate={new Date()} // Prevent marking for future dates
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Class/Subject *</label>
                        {/* TODO: Replace with actual subject/class fetching and selection */}
                        <input 
                            type="text" 
                            value={selectedSubject} 
                            onChange={(e) => setSelectedSubject(e.target.value)} 
                            placeholder="Enter Class/Subject" 
                            className="w-full p-2 border rounded-md" 
                            required 
                        />
                    </div>
                </div>

                {/* Student List */}
                {isLoadingStudents && <div className="text-center p-4"><LoadingSpinner /> Loading students...</div>}
                {errorStudents && <div className="text-red-500">Error loading students: {errorStudents.message}</div>}
                
                {!isLoadingStudents && !errorStudents && selectedSubject && (
                     students && students.length > 0 ? (
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {students.map(student => (
                                <div key={student._id} className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                                    <div>
                                        <p className="font-medium">{student.name}</p>
                                        <p className="text-sm text-gray-500">{student.email}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button 
                                            type="button"
                                            onClick={() => handleStatusChange(student._id, 'present')}
                                            className={`px-3 py-1 rounded ${attendance[student._id] === 'present' ? 'bg-green-500 text-white ring-2 ring-green-300' : 'bg-gray-200 hover:bg-green-100'}`}
                                        >
                                            ✅ Present
                                        </button>
                                         <button 
                                            type="button"
                                            onClick={() => handleStatusChange(student._id, 'absent')}
                                            className={`px-3 py-1 rounded ${attendance[student._id] === 'absent' ? 'bg-red-500 text-white ring-2 ring-red-300' : 'bg-gray-200 hover:bg-red-100'}`}
                                        >
                                            ❌ Absent
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                       selectedSubject && <p className="text-gray-500">No students found for this subject or role.</p> 
                    )
                )}
                 {!selectedSubject && <p className="text-gray-500">Please select a subject to load students.</p>}


                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                    disabled={markMutation.isLoading || isLoadingStudents || !students || students.length === 0}
                >
                    {markMutation.isLoading ? 'Submitting...' : 'Submit Attendance'}
                </button>
            </form>
        </div>
    );
}