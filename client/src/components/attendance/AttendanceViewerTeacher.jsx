import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTeacherAttendanceApi, updateAttendanceApi, getAttendanceSummaryApi } from '../../services/attendanceApi';
import { toast } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import LoadingSpinner from '../LoadingSpinner';
import { FiEdit2, FiCheckSquare, FiXSquare } from 'react-icons/fi'; // Example icons

// Helper to format date for display
const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
};

export default function AttendanceViewerTeacher() {
    const queryClient = useQueryClient();
    const [filters, setFilters] = useState({
        date: new Date(),
        classSubject: '',
        studentName: '',
        status: '' // 'present', 'absent', or '' for all
    });
    const [editingRecord, setEditingRecord] = useState(null); // { _id: '...', status: '...' }

    const queryParams = {
        date: filters.date ? filters.date.toISOString().split('T')[0] : '',
        classSubject: filters.classSubject,
        studentName: filters.studentName,
        status: filters.status
    };

    // --- Fetch Attendance Data ---
    const { data: records, isLoading, error, refetch } = useQuery({
        queryKey: ['teacherAttendance', queryParams.date, queryParams.classSubject, queryParams.studentName, queryParams.status],
        queryFn: () => getTeacherAttendanceApi(queryParams),
        enabled: !!queryParams.date && !!queryParams.classSubject, // Require date and subject
        staleTime: 60 * 1000, // 1 minute stale time
    });

    // --- Update Attendance Mutation ---
     const updateMutation = useMutation({
        mutationFn: ({ recordId, status }) => updateAttendanceApi(recordId, { status }),
        onSuccess: (updatedRecord) => {
            toast.success(`Attendance updated for ${updatedRecord.student?.name || 'student'}`);
            setEditingRecord(null); // Exit edit mode
            // Update the specific record in the cache or invalidate
            queryClient.setQueryData(
                ['teacherAttendance', queryParams.date, queryParams.classSubject, queryParams.studentName, queryParams.status],
                (oldData) => oldData.map(rec => rec._id === updatedRecord._id ? { ...rec, status: updatedRecord.status, markedAt: updatedRecord.markedAt } : rec)
            );
            // Or just invalidate: queryClient.invalidateQueries(['teacherAttendance', queryParams.date, queryParams.classSubject]);
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

    // --- Render Logic ---
    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">View Attendance</h2>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 border rounded-md bg-gray-50">
                 <div>
                    <label className="block text-sm font-medium mb-1">Date *</label>
                    <DatePicker 
                        selected={filters.date} 
                        onChange={handleDateChange}
                        dateFormat="yyyy-MM-dd"
                        className="w-full p-2 border rounded-md"
                        maxDate={new Date()}
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">Class/Subject *</label>
                     <input 
                        type="text" 
                        name="classSubject"
                        value={filters.classSubject} 
                        onChange={handleFilterChange} 
                        placeholder="Enter Class/Subject" 
                        className="w-full p-2 border rounded-md" 
                     />
                </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">Student Name</label>
                    <input 
                        type="text" 
                        name="studentName"
                        value={filters.studentName}
                        onChange={handleFilterChange}
                        placeholder="Search student..."
                        className="w-full p-2 border rounded-md"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="w-full p-2 border rounded-md"
                    >
                        <option value="">All</option>
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                    </select>
                </div>
            </div>

            {/* Attendance Table */}
            {isLoading && <LoadingSpinner />}
            {error && <p className="text-red-500">Error fetching data: {error.message}</p>}
             {!isLoading && !error && !filters.date && <p className="text-gray-500">Please select a date and subject.</p>}
             {!isLoading && !error && filters.date && filters.classSubject && (!records || records.length === 0) && <p className="text-gray-500">No attendance records found for the selected criteria.</p>}
             
            {!isLoading && !error && records && records.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-2 px-4 border-b text-left">Student Name</th>
                                <th className="py-2 px-4 border-b text-left">Email</th>
                                <th className="py-2 px-4 border-b text-center">Status</th>
                                <th className="py-2 px-4 border-b text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map(record => (
                                <tr key={record._id} className="hover:bg-gray-50">
                                    <td className="py-2 px-4 border-b">{record.studentInfo?.name || 'N/A'}</td>
                                    <td className="py-2 px-4 border-b">{record.studentInfo?.email || 'N/A'}</td>
                                    <td className="py-2 px-4 border-b text-center">
                                         {editingRecord?._id === record._id ? (
                                            // Edit Mode
                                            <div className="flex justify-center space-x-2">
                                                 <button 
                                                    onClick={() => handleEditStatusChange('present')}
                                                    className={`p-1 rounded ${editingRecord.status === 'present' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                                                > <FiCheckSquare size={18}/> </button>
                                                <button 
                                                     onClick={() => handleEditStatusChange('absent')}
                                                    className={`p-1 rounded ${editingRecord.status === 'absent' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
                                                > <FiXSquare size={18} /> </button>
                                            </div>
                                        ) : (
                                            // View Mode
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${record.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {record.status === 'present' ? '✅ Present' : '❌ Absent'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-2 px-4 border-b text-center">
                                         {editingRecord?._id === record._id ? (
                                            <div className="flex justify-center space-x-2">
                                                <button onClick={handleSaveEdit} className="text-green-600 hover:text-green-800 disabled:opacity-50" disabled={updateMutation.isLoading}>Save</button>
                                                <button onClick={handleCancelEdit} className="text-gray-500 hover:text-gray-700">Cancel</button>
                                            </div>
                                        ) : (
                                             <button 
                                                onClick={() => handleEditClick(record)} 
                                                className="text-blue-600 hover:text-blue-800"
                                                title="Edit Attendance"
                                            >
                                                <FiEdit2 />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
              {/* TODO: Add list view of present/absent students for the day */}
             {/* TODO: Add view for individual student summary */}
        </div>
    );
}