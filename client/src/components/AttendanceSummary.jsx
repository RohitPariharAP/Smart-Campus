// AttendanceSummary.jsx
import { useQuery } from '@tanstack/react-query';
import api from '../config/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function AttendanceSummary() {
  const { user } = useAuth();
  const endpoint = user.role === 'teacher' ? '/attendance/summary' : '/attendance/summary/me';

  const { data, isLoading, error } = useQuery({
    queryKey: ['attendance-summary', user._id],
    queryFn: async () => {
      const res = await api.get(endpoint);
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center">
        Error loading summary: {error.message}
      </div>
    );
  }

  if (user.role === 'teacher') {
    // Teacher view: table of all students
    return (
      <div className="max-w-7xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Attendance Summary (All Students)</h2>
        {data && data.length > 0 ? (
          <table className="min-w-full border">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Contact</th>
                <th className="px-4 py-2 border">Days Present</th>
                <th className="px-4 py-2 border">Days Absent</th>
              </tr>
            </thead>
            <tbody>
              {data.map((student) => (
                <tr key={student._id}>
                  <td className="px-4 py-2 border">{student.name}</td>
                  <td className="px-4 py-2 border">{student.contact || 'N/A'}</td>
                  <td className="px-4 py-2 border">{student.presentCount}</td>
                  <td className="px-4 py-2 border">{student.absentCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No attendance data available.</p>
        )}
      </div>
    );
  } else {
    // Student view: show personal counts
    return (
      <div className="max-w-2xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Your Attendance Summary</h2>
        <p className="text-lg">
          Days Present: <span className="font-semibold">{data.presentCount}</span>
        </p>
        <p className="text-lg">
          Days Absent: <span className="font-semibold">{data.absentCount}</span>
        </p>
      </div>
    );
  }
}
