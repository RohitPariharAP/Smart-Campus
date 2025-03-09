import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import LoadingSpinner from './LoadingSpinner';
import api from '../config/axios';
import { toast } from 'react-hot-toast';

export default function TeacherAttendanceOverview() {
  // Set the initial date to today (normalized to 00:00)
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  // Format the date as YYYY-MM-DD for the API call
  const formattedDate = selectedDate.toISOString().split('T')[0];

  // Fetch attendance data for the selected date
  const {
    data: attendanceData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['attendance', formattedDate],
    queryFn: async () => {
      const res = await api.get(`/attendance/${formattedDate}`);
      return res.data;
    },
  });

  // Compute summary counts for present and absent
  let presentCount = 0;
  let absentCount = 0;
  if (attendanceData && attendanceData.students) {
    attendanceData.students.forEach(item => {
      if (item.status === 'present') {
        presentCount++;
      } else if (item.status === 'absent') {
        absentCount++;
      }
    });
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(new Date(date.setHours(0, 0, 0, 0)))}
          dateFormat="yyyy-MM-dd"
          className="border p-2 rounded w-full md:w-auto"
          maxDate={new Date()}
        />
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="text-red-500 p-6">
          Error loading attendance data: {error.message || 'Unknown error'}
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <h2 className="text-2xl font-bold">
              Attendance for {format(selectedDate, 'MMM dd, yyyy')}
            </h2>
            <p className="text-gray-600">
              Present: {presentCount} | Absent: {absentCount}
            </p>
          </div>

          {attendanceData && attendanceData.students && attendanceData.students.length > 0 ? (
            <div className="space-y-2">
              {attendanceData.students.map((entry) => (
                <div
                  key={entry.student._id}
                  className="flex items-center justify-between p-3 border rounded bg-white hover:bg-gray-50"
                >
                  <span className="font-medium">
                    {entry.student.name} ({entry.student.email})
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
              No attendance records found for this date.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
