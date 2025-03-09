import { createContext, useContext, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../config/axios';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';

const AttendanceContext = createContext();

export function AttendanceProvider({ children }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { 
    data: students,
    isLoading: isLoadingStudents,
    error: studentsError
  } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const res = await api.get('/attendance/students');
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: user?.role === 'teacher',
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to load students');
    }
  });

  // Update markAttendance to use 'api'
  const markAttendance = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/attendance', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Attendance saved successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to save attendance');
    }
  });

  const refreshStudents = async () => {
    await queryClient.invalidateQueries({ queryKey: ['students'] });
  };

  useEffect(() => {
    if (studentsError) {
      toast.error('Failed to load student list');
    }
  }, [studentsError]);

  return (
    <AttendanceContext.Provider value={{ 
      students,
      isLoadingStudents,
      markAttendance,
      refreshStudents
    }}>
      {children}
    </AttendanceContext.Provider>
  );
}

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};
