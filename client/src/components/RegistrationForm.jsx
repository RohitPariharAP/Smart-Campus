import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../config/axios';

export default function RegistrationForm() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  
  const isStudentRegistration = pathname.includes('/register/student');
  const isTeacherRegistration = pathname.includes('/register/teacher');
  const defaultRole = isStudentRegistration ? 'student' : 
                     isTeacherRegistration ? 'teacher' : null;

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting },
    setValue,
    watch
  } = useForm({
    defaultValues: {
      role: defaultRole
    }
  });

  // Set default role and prevent modification
  useEffect(() => {
    if (defaultRole) {
      setValue('role', defaultRole);
    }
  }, [defaultRole, setValue]);

  const onSubmit = async (data) => {
    try {
      const config = user?.role === 'teacher' ? {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        } 
      } : {};

      const response = await api.post('/auth/register', data, config);
      
      toast.success('Account created successfully!');
      
      // Redirect after successful registration
      if (user?.role === 'teacher') {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                         error.message || 
                         'Registration failed';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isStudentRegistration && 'Register New Student'}
        {isTeacherRegistration && 'Register New Teacher'}
        {!defaultRole && 'Create Account'}
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input
            {...register('name', { 
              required: 'Name is required',
              minLength: {
                value: 3,
                message: 'Name must be at least 3 characters'
              }
            })}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.name && (
            <span className="text-red-500 text-sm">{errors.name.message}</span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <input
            type="email"
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.email && (
            <span className="text-red-500 text-sm">{errors.email.message}</span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password *</label>
          <input
            type="password"
            {...register('password', { 
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters'
              },
              validate: (value) => 
                /[A-Z]/.test(value) && 
                /[0-9]/.test(value) ||
                'Password must contain at least one uppercase letter and one number'
            })}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.password && (
            <span className="text-red-500 text-sm">{errors.password.message}</span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Contact</label>
          <input
            {...register('contact', { 
              pattern: {
                value: /^\d{10}$/,
                message: 'Invalid phone number (10 digits required)'
              }
            })}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.contact ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.contact && (
            <span className="text-red-500 text-sm">{errors.contact.message}</span>
          )}
        </div>

        {!defaultRole && (
          <div>
            <label className="block text-sm font-medium mb-1">Role *</label>
            <select
              {...register('role', { required: 'Role is required' })}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.role ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </span>
          ) : (
            user?.role === 'teacher' ? 'Create Account' : 'Register'
          )}
        </button>
      </form>
    </div>
  );
}