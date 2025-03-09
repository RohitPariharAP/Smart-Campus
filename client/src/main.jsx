import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
 
import {AuthProvider} from './context/AuthContext';
import { AttendanceProvider } from './context/AttendanceContext';
import { Toaster } from 'react-hot-toast';
import './index.css';

// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       staleTime: 5 * 60 * 1000, // 5 minutes
//       retry: 2,
//     }
//   }
// });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Recommended for better UX
      retry: 2,
    },
  },
});

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AttendanceProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#374151',
              },
            }}
          />
          <App />
        </AttendanceProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);