import { createContext, useContext, useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';
import axios from 'axios';

const AuthContext = createContext();

export  function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (token, role) => {
    // console.log("Decoded JWT:", decoded); // Check if 'name' is present
    const decoded = jwtDecode(token);
    const userData = {
      id: decoded.id,
      role: decoded.role,
      name: decoded.name,
      email: decoded.email
    };
    
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    window.location.href = '/login';
  };

  const validateToken = async (token) => {
    try {
      await axios.get('/api/auth/validate', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        const isValid = await validateToken(token);
        if (isValid) {
          const decoded = jwtDecode(token);
          console.log("Decoded JWT:", decoded);
          login(token, decoded.role);
        } else {
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const changedPasswordAfter = (jwtTimestamp) => {
    if (user?.changedPasswordAt) {
      const changedTimestamp = parseInt(user.changedPasswordAt / 1000, 10);
      return jwtTimestamp < changedTimestamp;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading,
      login, 
      logout,
      changedPasswordAfter
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};