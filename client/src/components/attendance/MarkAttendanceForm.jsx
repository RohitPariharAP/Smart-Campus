import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStudentsForAttendanceApi, markAttendanceApi } from '../../services/attendanceApi';
import { toast } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import LoadingSpinner from '../LoadingSpinner';

export default function MarkAttendanceForm() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendance, setAttendance] = useState({});

  // Fetch all students (no subject filtering)
  const { data: students, isLoading, error } = useQuery({
    queryKey: ['allStudentsForAttendance'],
    queryFn: async () => {
      const data = await getStudentsForAttendanceApi();
      console.log("Students data from query:", data); // Log here
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Mark attendance mutation
  const markMutation = useMutation({
    mutationFn: markAttendanceApi,
    onSuccess: (data) => {
      toast.success(data.message || 'Attendance marked successfully!');
      queryClient.invalidateQueries(['teacherAttendance']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to mark attendance');
    },
  });

  // Init attendance
  useEffect(() => {
    if (students && Array.isArray(students)) {
      const initial = {};
      students.forEach(student => {
        initial[student._id] = 'present';
      });
      setAttendance(initial);
    }
  }, [students]);

  const handleStatusChange = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedDate || Object.keys(attendance).length === 0) {
      toast.error('Please select date and mark attendance.');
      return;
    }

    const attendanceData = Object.entries(attendance).map(([studentId, status]) => ({
      studentId,
      status,
    }));

    markMutation.mutate({
      date: selectedDate.toISOString().split('T')[0],
      attendanceData,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Mark Attendance</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Date *</label>
          <DatePicker 
            selected={selectedDate} 
            onChange={(date) => setSelectedDate(date)}
            dateFormat="yyyy-MM-dd"
            className="w-full p-2 border rounded-md"
            maxDate={new Date()}
          />
        </div>

        {/* Students list */}
        {isLoading && <div className="text-center p-4"><LoadingSpinner /> Loading students...</div>}
        {error && <div className="text-red-500">Error loading students: {error.message}</div>}

        {!isLoading && students && students.length > 0 ? (
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
          <p className="text-gray-500">No students found.</p>
        )}

        <button
          type="submit"
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          disabled={markMutation.isLoading || isLoading || !students || students.length === 0}
        >
          {markMutation.isLoading ? 'Submitting...' : 'Submit Attendance'}
        </button>
      </form>
    </div>
  );
}
