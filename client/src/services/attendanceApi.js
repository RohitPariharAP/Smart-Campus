import api from '../config/axios'; // Assuming axios.js is set up as before

// --- Add these functions ---

export const markAttendanceApi = (data) => api.post('/attendance/mark', data);

export const getTeacherAttendanceApi = (params) => api.get('/attendance/teacher', { params }); 
// params example: { date: 'YYYY-MM-DD', classSubject: 'Math', studentName: 'John', status: 'present' }

export const getStudentAttendanceApi = (params) => api.get('/attendance/student', { params });
// params example: { startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD', classSubject: 'Physics' }

export const getAttendanceSummaryApi = (studentId, params) => api.get(`/attendance/summary/${studentId}`, { params });
// params example: { classSubject: 'Chemistry' }

export const updateAttendanceApi = (recordId, data) => api.put(`/attendance/${recordId}`, data); 
// data example: { status: 'present' }

export const getStudentsForAttendanceApi = (params) => api.get('/attendance/students', { params });
// params example: { classSubject: 'Biology' } // If filtering needed

// --- End of new functions ---

export default api; // Or export the functions individually