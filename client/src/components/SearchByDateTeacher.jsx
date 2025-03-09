// SearchByDateTeacher.jsx
import { useState } from 'react';
import api from '../config/axios';

export default function SearchByDateTeacher() {
  const [dateInput, setDateInput] = useState('');
  const [records, setRecords] = useState(null);

  const handleSearch = async () => {
    try {
      const res = await api.get(`/attendance/${dateInput}`);
      setRecords(res.data); // Expected to be a record with a date and a list of students
    } catch (err) {
      console.error(err);
      setRecords({ error: 'No record found or error occurred' });
    }
  };

  return (
    <div className="my-4">
      <h2 className="text-xl font-bold">Search Attendance By Date (All Students)</h2>
      <input
        type="date"
        value={dateInput}
        onChange={(e) => setDateInput(e.target.value)}
        className="border p-2 rounded"
      />
      <button onClick={handleSearch} className="ml-4 px-4 py-2 bg-blue-600 text-white rounded">
        Search
      </button>
      {records && !records.error && (
        <div className="mt-2">
          <h3 className="font-semibold">Attendance for {records.date}:</h3>
          {records.students.map((entry) => (
            <div key={entry.student._id}>
              {entry.student.name} - {entry.status}
            </div>
          ))}
        </div>
      )}
      {records && records.error && <p className="text-red-500">{records.error}</p>}
    </div>
  );
}
