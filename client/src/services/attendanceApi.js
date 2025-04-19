import api from '../config/axios';  

// --- Add these functions ---

export const markAttendanceApi = (data) => api.post('/attendance/mark', data);

export const getTeacherAttendanceApi = (params) => api.get('/attendance/teacher', { params }); 
 

export const getStudentAttendanceApi = (params) => api.get('/attendance/student', { params });
 
export const getAttendanceSummaryApi = (studentId, params) => api.get(`/attendance/summary/${studentId}`, { params });
 

export const updateAttendanceApi = (recordId, data) => api.put(`/attendance/${recordId}`, data); 

 
export const getStudentsForAttendanceApi = (params) =>
    api.get('/attendance/students', { params }).then(res => res.data);
  

export default api; // Or export the functions individually