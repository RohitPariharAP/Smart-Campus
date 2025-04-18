import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStudentAttendanceApi, getAttendanceSummaryApi } from '../../services/attendanceApi';
import { useAuth } from '../../context/AuthContext'; // Assuming you have this
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import LoadingSpinner from '../LoadingSpinner';

// Helper to format date for display
const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
};


export default function AttendanceViewerStudent() {
    const { user } = useAuth(); // Get logged-in student's info
    const [filters, setFilters] = useState({
        startDate: null,
        endDate: null,
        classSubject: ''
    });

     const queryParams = {
        startDate: filters.startDate ? filters.startDate.toISOString().split('T')[0] : undefined,
        endDate: filters.endDate ? filters.endDate.toISOString().split('T')[0] : undefined,
        classSubject: filters.classSubject || undefined,
    };


    // --- Fetch Attendance Records ---
    const { data: records, isLoading: isLoadingRecords, error: errorRecords } = useQuery({
        queryKey: ['studentAttendance', user?.id, queryParams],
        queryFn: () => getStudentAttendanceApi(queryParams),
        enabled: !!user?.id, // Only fetch if user is logged in
        staleTime: 2 * 60 * 1000, // 2 minutes stale time
    });

    // --- Fetch Attendance Summary ---
    const { data: summary, isLoading: isLoadingSummary, error: errorSummary } = useQuery({
        queryKey: ['studentAttendanceSummary', user?.id, filters.classSubject], // Refetch if subject filter changes
        queryFn: () => getAttendanceSummaryApi(user.id, { classSubject: filters.classSubject || undefined }),
         enabled: !!user?.id,
         staleTime: 5 * 60 * 1000,
    });

     // --- Handle Filter Changes ---
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };


    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">My Attendance</h2>

             {/* Summary Section */}
             <div className="mb-6 p-4 border rounded-md bg-blue-50">
                <h3 className="text-lg font-semibold mb-2">Overall Summary {filters.classSubject ? `for ${filters.classSubject}` : ''}</h3>
                 {isLoadingSummary && <LoadingSpinner />}
                {errorSummary && <p className="text-red-500">Could not load summary.</p>}
                {summary && !isLoadingSummary && (
                    <div className="flex space-x-4">
                         <p>Total Days Recorded: <span className="font-bold">{summary.totalDays}</span></p>
                         <p>Present: <span className="font-bold text-green-600">{summary.present}</span></p>
                         <p>Absent: <span className="font-bold text-red-600">{summary.absent}</span></p>
                         {summary.totalDays > 0 && (
                             <p>Percentage: <span className="font-bold">{((summary.present / summary.totalDays) * 100).toFixed(1)}%</span></p>
                         )}
                    </div>
                 )}
                {/* TODO: Add Chart component here */}
             </div>


            {/* Filters */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 border rounded-md bg-gray-50">
                 <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <DatePicker 
                        selected={filters.startDate} 
                         onChange={(date) => setFilters(prev => ({ ...prev, startDate: date }))}
                        dateFormat="yyyy-MM-dd"
                        className="w-full p-2 border rounded-md"
                        selectsStart
                        startDate={filters.startDate}
                         endDate={filters.endDate}
                         isClearable
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
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
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">Class/Subject</label>
                     <input 
                        type="text" 
                        name="classSubject"
                        value={filters.classSubject} 
                        onChange={handleFilterChange} 
                        placeholder="Filter by Subject (Optional)" 
                        className="w-full p-2 border rounded-md" 
                     />
                 </div>
             </div>

            {/* Attendance Table */}
            {isLoadingRecords && <LoadingSpinner />}
            {errorRecords && <p className="text-red-500">Error fetching records: {errorRecords.message}</p>}
            {!isLoadingRecords && !errorRecords && (!records || records.length === 0) && <p className="text-gray-500">No attendance records found for the selected criteria.</p>}

             {!isLoadingRecords && !errorRecords && records && records.length > 0 && (
                 <div className="overflow-x-auto">
                    {/* TODO: Implement Calendar View toggle */}
                    <table className="min-w-full bg-white border">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-2 px-4 border-b text-left">Date</th>
                                <th className="py-2 px-4 border-b text-left">Class/Subject</th>
                                <th className="py-2 px-4 border-b text-center">Status</th>
                                 <th className="py-2 px-4 border-b text-left">Marked By</th>
                            </tr>
                        </thead>
                        <tbody>
                             {records.map(record => (
                                <tr key={record._id} className="hover:bg-gray-50">
                                    <td className="py-2 px-4 border-b">{formatDate(record.date)}</td>
                                     <td className="py-2 px-4 border-b">{record.classSubject}</td>
                                    <td className="py-2 px-4 border-b text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${record.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {record.status === 'present' ? '✅ Present' : '❌ Absent'}
                                        </span>
                                    </td>
                                     <td className="py-2 px-4 border-b">{record.markedBy?.name || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            )}
        </div>
    );
}