import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import api from "../config/axios";
import LoadingSpinner from './LoadingSpinner';

export default function MarkAttendance() {
  const queryClient = useQueryClient();
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [attendance, setAttendance] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Fetch students
  const { data: students = [], isLoading: isStudentsLoading, isError, error } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      try {
        const res = await api.get('/attendance/students');
        return Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.error("Error fetching students:", err);
        toast.error('Failed to load students');
        return [];
      }
    },
  });
  
  // Fetch attendance for selected date
  useEffect(() => {
    const fetchExistingAttendance = async () => {
      try {
        setIsLoading(true);
        // Use the centralized api instance here:
        const res = await api.get(`/attendance/${date.toISOString().split('T')[0]}`);
        const existingAttendance = res.data?.students?.reduce((acc, curr) => ({
          ...acc,
          [curr.student._id]: curr.status,
        }), {}) || {};
        setAttendance(existingAttendance);
      } catch (error) {
        toast.error('Failed to load attendance data');
        setAttendance({});
      } finally {
        setIsLoading(false);
      }
    };
    fetchExistingAttendance();
  }, [date]);

  // Handle status change
  const handleStatusChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === status ? 'absent' : status,
    }));
  };

  // Submit attendance
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const payload = {
        date: date.toISOString().split('T')[0],
        students: Object.entries(attendance).map(([student, status]) => ({ student, status })),
      };
      await api.post('/attendance', payload);
      await queryClient.invalidateQueries(['students']);
      toast.success('Attendance saved successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save attendance');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <DatePicker
          selected={date}
          onChange={date => setDate(new Date(date.setHours(0, 0, 0, 0)))}
          dateFormat="yyyy-MM-dd"
          className="border p-2 rounded w-full md:w-auto"
          maxDate={new Date()}
        />
        <button
          onClick={handleSubmit}
          className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          disabled={isLoading || isStudentsLoading || students.length === 0}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <LoadingSpinner size="small" /> Saving...
            </span>
          ) : 'Save Attendance'}
        </button>
      </div>
      {isError && <div className="text-center py-4 text-red-500">Failed to load students. {error?.message}</div>}
      {isStudentsLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 animate-pulse rounded" />
          ))}
        </div>
      ) : students.length > 0 ? (
        <div className="space-y-2">
          {students.map(student => (
            <div key={student._id} className="flex items-center justify-between p-3 border rounded bg-white">
              <div className="flex-1">
                <h3 className="font-medium">{student.name}</h3>
                <p className="text-sm text-gray-600">{student.email}</p>
                <p className="text-sm text-gray-600">{student.contact}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleStatusChange(student._id, 'present')}
                  className={`px-3 py-1 rounded transition-colors ${attendance[student._id] === 'present' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                >
                  Present
                </button>
                <button
                  onClick={() => handleStatusChange(student._id, 'absent')}
                  className={`px-3 py-1 rounded transition-colors ${attendance[student._id] === 'absent' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                >
                  Absent
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">No students registered yet</div>
      )}
    </div>
  );
}
