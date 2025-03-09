  import { useEffect } from 'react';
  import { useAuth } from '../context/AuthContext';
  import RegistrationForm from '../components/RegistrationForm';
  import { useNavigate } from 'react-router-dom';

  export default function RegistrationPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
      if (user) navigate('/dashboard');
    }, [user]);

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <RegistrationForm />
          <p className="mt-4 text-center text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:underline">
              Login here
            </a>
          </p>
        </div>
      </div>
    );
  }