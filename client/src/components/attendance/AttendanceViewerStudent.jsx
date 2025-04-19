import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStudentAttendanceApi, getAttendanceSummaryApi } from '../../services/attendanceApi';
import { useAuth } from '../../context/AuthContext';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import LoadingSpinner from '../LoadingSpinner';

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString();
};

export default function AttendanceViewerStudent() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
  });

  const queryParams = {
    startDate: filters.startDate ? filters.startDate.toISOString().split('T')[0] : undefined,
    endDate: filters.endDate ? filters.endDate.toISOString().split('T')[0] : undefined,
  };

  // Fetch Attendance Records (Return only data array)
  const {
    data: records = [],
    isLoading: isLoadingRecords,
    error: errorRecords
  } = useQuery({
    queryKey: ['studentAttendance', user?.id, queryParams],
    queryFn: () => getStudentAttendanceApi(queryParams).then(res => res.data),
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
  });

  // Fetch Summary (Return only data object)
  const {
    data: summary,
    isLoading: isLoadingSummary,
    error: errorSummary
  } = useQuery({
    queryKey: ['studentAttendanceSummary', user?.id],
    queryFn: () =>
        getAttendanceSummaryApi(user.id).then(res => {
          console.log("Summary response:", res.data);
          return res.data;
        }),
      
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const attendanceStats = summary && summary.totalDays > 0 && {
    presentPercentage: ((summary.present / summary.totalDays) * 100).toFixed(1),
    absentPercentage: ((summary.absent / summary.totalDays) * 100).toFixed(1)
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">My Attendance</h2>

      {/* Summary */}
      <div className="mb-8 p-6 border rounded-lg shadow-sm bg-blue-50">
        <h3 className="text-lg font-semibold mb-4">Overall Summary</h3>
        {isLoadingSummary && <LoadingSpinner />}
        {errorSummary && <p className="text-red-500">Could not load summary.</p>}
        {summary && !isLoadingSummary && (
          <>
            <div className="flex flex-wrap gap-6 mb-4">
              <div className="px-4 py-3 bg-white rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Total Days</p>
                <p className="text-2xl font-bold">{summary.totalDays}</p>
              </div>
              <div className="px-4 py-3 bg-green-50 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Present</p>
                <p className="text-2xl font-bold text-green-600">{summary.present}</p>
              </div>
              <div className="px-4 py-3 bg-red-50 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Absent</p>
                <p className="text-2xl font-bold text-red-600">{summary.absent}</p>
              </div>
              {attendanceStats && (
                <div className="px-4 py-3 bg-blue-100 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Attendance Rate</p>
                  <p className="text-2xl font-bold">{attendanceStats.presentPercentage}%</p>
                </div>
              )}
            </div>
            {attendanceStats && (
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div 
                  className="bg-green-500 h-4 rounded-full" 
                  style={{ width: `${attendanceStats.presentPercentage}%` }}
                ></div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 border rounded-lg shadow-sm bg-gray-50">
        <div>
          <label className="block text-sm font-medium mb-2">Start Date</label>
          <DatePicker 
            selected={filters.startDate} 
            onChange={(date) => setFilters(prev => ({ ...prev, startDate: date }))}
            dateFormat="yyyy-MM-dd"
            className="w-full p-2 border rounded-md"
            selectsStart
            startDate={filters.startDate}
            endDate={filters.endDate}
            isClearable
            placeholderText="Select start date"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">End Date</label>
          <DatePicker 
            selected={filters.endDate} 
            onChange={(date) => setFilters(prev => ({ ...prev, endDate: date }))}
            dateFormat="yyyy-MM-dd"
            className="w-full p-2 border rounded-md"
            selectsEnd
            startDate={filters.startDate}
            endDate={filters.endDate}
            minDate={filters.startDate}
            isClearable
            placeholderText="Select end date"
          />
        </div>
      </div>

      {/* Records Table */}
      <div className="border rounded-lg shadow-sm overflow-hidden">
        <h3 className="text-lg font-semibold p-4 bg-gray-50 border-b">Attendance Records</h3>

        {isLoadingRecords && (
          <div className="p-8 flex justify-center"><LoadingSpinner /></div>
        )}

        {errorRecords && (
          <div className="p-8">
            <p className="text-red-500">Error fetching records: {errorRecords.message}</p>
          </div>
        )}

        {!isLoadingRecords && !errorRecords && records.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No attendance records found for the selected criteria.
          </div>
        )}

        {!isLoadingRecords && !errorRecords && records.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-6 border-b text-left">Date</th>
                  <th className="py-3 px-6 border-b text-center">Status</th>
                  <th className="py-3 px-6 border-b text-left">Marked By</th>
                </tr>
              </thead>
              <tbody>
                {records.map(record => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="py-3 px-6 border-b">{formatDate(record.date)}</td>
                    <td className="py-3 px-6 border-b text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        record.status === 'present'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {record.status === 'present' ? '✅ Present' : '❌ Absent'}
                      </span>
                    </td>
                    <td className="py-3 px-6 border-b">{record.markedBy?.name || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
