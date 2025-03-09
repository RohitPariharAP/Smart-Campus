import { useAuth } from '../context/AuthContext';
import AttendanceSummary from '../components/AttendanceSummary';
import AttendanceHistory from '../components/AttendanceHistory';
import SearchByDateStudent from '../components/SearchByDateStudent';
import SearchByDateTeacher from '../components/SearchByDateTeacher';

export default function AttendancePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Attendance Records</h1>
        {user.role === 'teacher' ? (
          <>
            <AttendanceSummary />
            <SearchByDateTeacher />
          </>
        ) : (
          <>
            <AttendanceSummary />
            <SearchByDateStudent />
            <AttendanceHistory />
          </>
        )}
      </div>
    </div>
  );
}
