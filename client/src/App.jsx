import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

// Shared Pages
import {
  HomePage,
  LoginPage,
  RegistrationPage,
  NotesPage,
  DashboardPage,
  NotFoundPage,
  UploadNote,
} from "./pages";

// Registration Form
import RegistrationForm from "./components/RegistrationForm";

// New/Updated Attendance Pages
import MarkAttendancePage from "./pages/MarkAttendancePage";
import TeacherAttendanceHistoryPage from "./pages/TeacherAttendanceHistoryPage";
import StudentAttendanceHistoryPage from "./pages/StudentAttendanceHistoryPage";
// Optional: Remove or comment out if AttendanceDashboard/AdminRecords are deprecated
// import AttendanceDashboard from "./pages/AttendanceDashboard";
// import AdminRecords from "./pages/AdminRecords";

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
          <Route path="/home" element={<Navigate to="/" replace />} />

          {/* Protected Routes - All Authenticated Users */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/upload-note" element={<UploadNote />} />
            {/* Optional: Remove if not needed */}
            {/* <Route path="/attendance" element={<AttendanceDashboard />} /> */}
          </Route>

          {/* Student Only Routes */}
          <Route element={<ProtectedRoute role="student" />}>
            <Route path="/my-attendance" element={<StudentAttendanceHistoryPage />} />
          </Route>

          {/* Teacher Only Routes */}
          <Route element={<ProtectedRoute role="teacher" />}>
            <Route path="/mark-attendance" element={<MarkAttendancePage />} />
            <Route path="/teacher-history" element={<TeacherAttendanceHistoryPage />} />
            <Route path="/register/student" element={<RegistrationForm />} />
            <Route path="/register/teacher" element={<RegistrationForm />} />
          </Route>

          {/* Admin Only Routes - Keep or remove as needed */}
          {/* <Route element={<ProtectedRoute role="admin" />}>
            <Route path="/admin-attendance" element={<AdminRecords />} />
          </Route> */}

          {/* 404 Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
