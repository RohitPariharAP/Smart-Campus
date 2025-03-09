import { useQuery } from '@tanstack/react-query';
import { parseISO, format } from 'date-fns';
import LoadingSpinner from './LoadingSpinner';
import api from '../config/axios';

export default function AttendanceHistory() {
  const fetchAttendanceHistory = async () => {
    const { data } = await api.get('/attendance/student/history');
    console.log('Attendance History API response:', data);

    if (!Array.isArray(data)) {
      console.error('Expected an array for attendance history, but got:', data);
      return [];
    }

    return data.map((entry) => {
      let dateValue = null;
      if (entry.date) {
        // If entry.date is a string, attempt to parse it
        if (typeof entry.date === 'string') {
          try {
            dateValue = parseISO(entry.date);
          } catch (err) {
            console.error("Failed to parse date string:", entry.date, err);
            dateValue = new Date(entry.date); // fallback to basic Date conversion
          }
        } else if (entry.date instanceof Date) {
          // If it's already a Date object, use it directly
          dateValue = entry.date;
        } else {
          // Otherwise, try converting it to a Date
          dateValue = new Date(entry.date);
        }
      }
      return {
        ...entry,
        date: dateValue
      };
    });
  };

  const {
    data: history = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['attendance-history'],
    queryFn: fetchAttendanceHistory
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
      <div className="p-6 max-w-2xl mx-auto text-red-500">
        Error loading attendance history: {error.message || 'Unknown error'}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Your Attendance History</h2>
      {history.length > 0 ? (
        <div className="space-y-2">
          {history.map((entry) => (
            <div
              key={entry._id}
              className="flex items-center justify-between p-3 border rounded bg-white hover:bg-gray-50"
            >
              <span className="font-medium">
                {entry.date ? format(new Date(entry.date), 'MMM dd, yyyy') : 'No date'}
              </span>
              <span
                className={`px-2 py-1 rounded capitalize ${
                  entry.status === 'present'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {entry.status}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No attendance records found.
        </div>
      )}
    </div>
  );
}
