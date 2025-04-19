import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTeacherAttendanceApi, updateAttendanceApi, getAttendanceSummaryApi } from '../../services/attendanceApi';
import { toast } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import LoadingSpinner from '../LoadingSpinner';
import { FiEdit2, FiCheckSquare, FiXSquare, FiSearch, FiCalendar, FiFilter, FiUser } from 'react-icons/fi';
import { FaRegCheckCircle, FaRegTimesCircle } from 'react-icons/fa';

// Helper to format date for display
const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString();
};

export default function AttendanceViewerTeacher() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    date: new Date(),
    studentName: '',
    status: '' // 'present', 'absent', or '' for all
  });
  const [editingRecord, setEditingRecord] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [showFilters, setShowFilters] = useState(true);

  const queryParams = {
    date: filters.date ? filters.date.toISOString().split('T')[0] : '',
    studentName: filters.studentName,
    status: filters.status
  };

  // --- Fetch Attendance Data ---
  const { 
    data: records = [], // Default to empty array to prevent filter errors
    isLoading, 
    error, 
    refetch,
    isFetching 
  } = useQuery({
    queryKey: ['teacherAttendance', queryParams.date, queryParams.studentName, queryParams.status],
    queryFn: () => getTeacherAttendanceApi(queryParams).then(res => res.data),
   
    enabled: !!queryParams.date, // Only run query when date is set
    staleTime: 60 * 1000, // 1 minute stale time
  });
  console.log("Fetched attendance records:", records);

  // --- Fetch Attendance Summary ---
  const { 
    data: summary, 
    isLoading: isSummaryLoading 
  } = useQuery({
    queryKey: ['attendanceSummary', queryParams.date],
    queryFn: () => getTeacherAttendanceApi(queryParams).then(res => res.data),

    enabled: !!queryParams.date,
    onSuccess: (data) => setAttendanceSummary(data),
    staleTime: 60 * 1000,
  });

  // --- Update Attendance Mutation ---
  const updateMutation = useMutation({
    mutationFn: ({ recordId, status }) => updateAttendanceApi(recordId, { status }),
    onSuccess: (updatedRecord) => {
      toast.success(`Attendance updated for ${updatedRecord.student?.name || 'student'}`);
      setEditingRecord(null); // Exit edit mode
      // Invalidate queries to refetch the data
      queryClient.invalidateQueries(['teacherAttendance']);
      queryClient.invalidateQueries(['attendanceSummary']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update attendance');
      setEditingRecord(null);
    }
  });

  // --- Handle Filter Changes ---
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFilters(prev => ({ ...prev, date }));
  };

  const clearFilters = () => {
    setFilters({
      date: new Date(),
      studentName: '',
      status: ''
    });
  };

  // --- Handle Edit ---
  const handleEditClick = (record) => {
    setEditingRecord({ _id: record._id, status: record.status });
  };

  const handleEditStatusChange = (newStatus) => {
    setEditingRecord(prev => ({ ...prev, status: newStatus }));
  };

  const handleSaveEdit = () => {
    if (editingRecord) {
      updateMutation.mutate({ recordId: editingRecord._id, status: editingRecord.status });
    }
  };

  const handleCancelEdit = () => {
    setEditingRecord(null);
  };

  // Calculate attendance statistics - with defensive programming
  const getAttendanceStats = () => {
    // Check if records is an array and has length
    if (!Array.isArray(records) || records.length === 0) {
      return { present: 0, absent: 0, total: 0, presentPercentage: 0 };
    }
    
    try {
      const present = records.filter(r => r.status === 'present').length;
      const total = records.length;
      
      return {
        present,
        absent: total - present,
        total,
        presentPercentage: total > 0 ? Math.round((present / total) * 100) : 0
      };
    } catch (err) {
      console.error('Error calculating stats:', err);
      return { present: 0, absent: 0, total: 0, presentPercentage: 0 };
    }
  };

  const stats = getAttendanceStats();

  // Ensure records is always an array
  const safeRecords = Array.isArray(records) ? records : [];
  const hasRecords = safeRecords.length > 0;

  // --- Render Logic ---
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Attendance Records</h2>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="mt-2 sm:mt-0 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <FiFilter className="mr-1" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Summary Cards */}
      {!isLoading && hasRecords && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-3">
              <FiUser className="text-blue-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Students</p>
              <p className="text-xl font-bold text-gray-800">{stats.total}</p>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 border border-green-100 flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-3">
              <FaRegCheckCircle className="text-green-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Present</p>
              <p className="text-xl font-bold text-gray-800">{stats.present} <span className="text-sm font-normal text-gray-500">({stats.presentPercentage}%)</span></p>
            </div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4 border border-red-100 flex items-center">
            <div className="bg-red-100 p-3 rounded-full mr-3">
              <FaRegTimesCircle className="text-red-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Absent</p>
              <p className="text-xl font-bold text-gray-800">{stats.absent} <span className="text-sm font-normal text-gray-500">({100 - stats.presentPercentage}%)</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-6 transition-all duration-300">
          <div className="mb-3 flex justify-between items-center">
            <h3 className="font-medium text-gray-700 flex items-center">
              <FiFilter className="mr-2" /> Filter Records
            </h3>
            <button 
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Reset
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium mb-1 text-gray-700">Date *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCalendar className="text-gray-400" />
                </div>
                <DatePicker 
                  selected={filters.date} 
                  onChange={handleDateChange}
                  dateFormat="yyyy-MM-dd"
                  className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  maxDate={new Date()}
                />
              </div>
            </div>
            
            <div className="relative">
              <label className="block text-sm font-medium mb-1 text-gray-700">Student Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input 
                  type="text" 
                  name="studentName"
                  value={filters.studentName}
                  onChange={handleFilterChange}
                  placeholder="Search student..."
                  className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <LoadingSpinner />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div>
              <p className="text-sm text-red-700">
                Error fetching data: {error.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty States */}
      {!isLoading && !error && !filters.date && (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <FiCalendar className="mx-auto text-gray-400 text-3xl mb-2" />
          <p className="text-gray-500">Please select a date to view attendance records.</p>
        </div>
      )}
      
      {!isLoading && !error && filters.date && !hasRecords && (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <FiSearch className="mx-auto text-gray-400 text-3xl mb-2" />
          <p className="text-gray-500">No attendance records found for the selected criteria.</p>
          <button 
            className="mt-3 text-blue-600 hover:text-blue-800"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        </div>
      )}
      
      {/* Attendance Table */}
      {!isLoading && !error && hasRecords && (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {safeRecords.map(record => (
                <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-3">
                        {(record.studentInfo?.name || 'N/A').charAt(0).toUpperCase()}
                      </div>
                      <div className="font-medium text-gray-900">
                        {record.studentInfo?.name || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">
                    {record.studentInfo?.email || 'N/A'}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-center">
                    {editingRecord?._id === record._id ? (
                      // Edit Mode
                      <div className="flex justify-center space-x-3">
                        <button 
                          onClick={() => handleEditStatusChange('present')}
                          className={`flex items-center px-3 py-1 rounded-full transition-colors ${
                            editingRecord.status === 'present' 
                              ? 'bg-green-100 text-green-800 border border-green-300' 
                              : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-700'
                          }`}
                        > 
                          <FiCheckSquare className="mr-1" /> Present
                        </button>
                        <button 
                          onClick={() => handleEditStatusChange('absent')}
                          className={`flex items-center px-3 py-1 rounded-full transition-colors ${
                            editingRecord.status === 'absent' 
                              ? 'bg-red-100 text-red-800 border border-red-300' 
                              : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-700'
                          }`}
                        > 
                          <FiXSquare className="mr-1" /> Absent
                        </button>
                      </div>
                    ) : (
                      // View Mode
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        record.status === 'present' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {record.status === 'present' 
                          ? <><FaRegCheckCircle className="mr-1" /> Present</> 
                          : <><FaRegTimesCircle className="mr-1" /> Absent</>}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-center">
                    {editingRecord?._id === record._id ? (
                      <div className="flex justify-center space-x-2">
                        <button 
                          onClick={handleSaveEdit} 
                          className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                          disabled={updateMutation.isLoading}
                        >
                          {updateMutation.isLoading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Saving...
                            </>
                          ) : (
                            'Save'
                          )}
                        </button>
                        <button 
                          onClick={handleCancelEdit} 
                          className="border border-gray-300 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleEditClick(record)} 
                        className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded-full transition-colors"
                        title="Edit Attendance"
                      >
                        <FiEdit2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Refetch Status */}
      {isFetching && !isLoading && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Refreshing data...
        </div>
      )}
    </div>
  );
}