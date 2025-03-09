import { useAuth } from "../context/AuthContext";
import MarkAttendance from "../components/MarkAttendance";
import { format } from "date-fns";

export default function MarkAttendancePage() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{format(new Date(), "MMMM yyyy")} Attendance</h1>
        {user?.role === "teacher" ? (
          <MarkAttendance />
        ) : (
          <div className="text-center py-12 text-red-500">Unauthorized access - Teacher privileges required</div>
        )}
      </div>
    </div>
  );
}
