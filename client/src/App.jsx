import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import {
  HomePage,
  LoginPage,
  RegistrationPage,
  NotesPage,
  AttendancePage,
  MarkAttendancePage,
  DashboardPage,
  NotFoundPage,
  UploadNote

} from './pages';
import RegistrationForm from './components/RegistrationForm';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mx-auto px-4 pt-8">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />

          {/* Protected Student Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/upload-note" element={<UploadNote />} />
          </Route>

          {/* Protected Teacher Routes */}
          <Route element={<ProtectedRoute role="teacher" />}>
            <Route path="/mark-attendance" element={<MarkAttendancePage />} />
            <Route path="/register/student" element={<RegistrationForm />} />
            <Route path="/register/teacher" element={<RegistrationForm />} />
            <Route path="/upload-note" element={<UploadNote />} />

          </Route>

          {/* Redirects & 404 */}
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
