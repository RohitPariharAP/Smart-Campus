import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../config/axios';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function RegistrationForm() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const isStudentRegistration = pathname.includes('/register/student');
  const isTeacherRegistration = pathname.includes('/register/teacher');
  const defaultRole = isStudentRegistration ? 'student' : 
                     isTeacherRegistration ? 'teacher' : null;

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting, isValid },
    setValue,
    watch,
    trigger
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      role: defaultRole
    }
  });

  const passwordValue = watch('password');

  // Set default role and prevent modification
  useEffect(() => {
    if (defaultRole) {
      setValue('role', defaultRole);
    }
  }, [defaultRole, setValue]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const config = user?.role === 'teacher' ? {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        } 
      } : {};

      const response = await api.post('/auth/register', data, config);
      
      toast.success('Account created successfully!', {
        position: 'top-center',
        duration: 2000
      });
      
      // Redirect after successful registration
      if (user?.role === 'teacher') {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    } catch (error) {
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response) {
        if (error.response.status === 409) {
          errorMessage = 'Email already exists. Please use a different email.';
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        }
      }
      
      toast.error(errorMessage, {
        position: 'top-center'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 p-8 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {isStudentRegistration && 'Student Registration'}
          {isTeacherRegistration && 'Teacher Registration'}
          {!defaultRole && 'Create Your Account'}
        </h1>
        <p className="text-gray-600">
          {isStudentRegistration && 'Join our learning community as a student'}
          {isTeacherRegistration && 'Share your knowledge as an educator'}
          {!defaultRole && 'Get started with your educational journey'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            {...register('name', { 
              required: 'Full name is required',
              minLength: {
                value: 3,
                message: 'Name must be at least 3 characters'
              },
              maxLength: {
                value: 50,
                message: 'Name must be less than 50 characters'
              }
            })}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.name ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
            } transition-colors`}
            placeholder="John Doe"
            onBlur={() => trigger('name')}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Please enter a valid email address'
              }
            })}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
            } transition-colors`}
            placeholder="your@email.com"
            onBlur={() => trigger('email')}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password *
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              {...register('password', { 
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters'
                },
                validate: (value) => {
                  if (!/[A-Z]/.test(value)) {
                    return 'Password must contain at least one uppercase letter';
                  }
                  if (!/[0-9]/.test(value)) {
                    return 'Password must contain at least one number';
                  }
                  return true;
                }
              })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
              } transition-colors`}
              placeholder="••••••••"
              onBlur={() => trigger('password')}
            />
            <button 
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
          {passwordValue && !errors.password && (
            <div className="mt-2">
              <div className="grid grid-cols-4 gap-1">
                <div className={`h-1 rounded-sm ${passwordValue.length >= 8 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                <div className={`h-1 rounded-sm ${/[A-Z]/.test(passwordValue) ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                <div className={`h-1 rounded-sm ${/[0-9]/.test(passwordValue) ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                <div className={`h-1 rounded-sm ${passwordValue.length >= 12 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Password strength: {passwordValue.length >= 12 ? 'Strong' : passwordValue.length >= 8 ? 'Good' : 'Weak'}
              </p>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            id="contact"
            type="tel"
            autoComplete="tel"
            {...register('contact', { 
              pattern: {
                value: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im,
                message: 'Please enter a valid phone number'
              }
            })}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.contact ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
            } transition-colors`}
            placeholder="+1 (123) 456-7890"
          />
          {errors.contact && (
            <p className="mt-1 text-sm text-red-600">{errors.contact.message}</p>
          )}
        </div>

        {!defaultRole && (
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Account Type *
            </label>
            <select
              id="role"
              {...register('role', { required: 'Account type is required' })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.role ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
              } transition-colors`}
            >
              <option value="">Select account type</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
            )}
          </div>
        )}

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              required
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="terms" className="font-medium text-gray-700">
              I agree to the{' '}
              <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </Link>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !isValid}
          className={`w-full py-3 px-4 rounded-lg font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
            isSubmitting || !isValid 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
          }`}
        >
          {isSubmitting || isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Creating account...
            </span>
          ) : (
            user?.role === 'teacher' ? 'Create Account' : 'Register'
          )}
        </button>
      </form>

      {!user && (
        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link 
            to="/login" 
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            Sign in
          </Link>
        </div>
      )}
    </div>
  );
}