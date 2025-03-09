// SearchByDateStudent.jsx
import { useState } from 'react';
import api from '../config/axios';

export default function SearchByDateStudent() {
  const [dateInput, setDateInput] = useState('');
  const [result, setResult] = useState(null);

  const handleSearch = async () => {
    try {
      const res = await api.get(`/attendance/student/date/${dateInput}`);
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setResult({ error: 'No record found or error occurred' });
    }
  };

  return (
    <div className="my-4">
      <h2 className="text-xl font-bold">Search Your Attendance By Date</h2>
      <input
        type="date"
        value={dateInput}
        onChange={(e) => setDateInput(e.target.value)}
        className="border p-2 rounded"
      />
      <button onClick={handleSearch} className="ml-4 px-4 py-2 bg-blue-600 text-white rounded">
        Search
      </button>
      {result && (
        <div className="mt-2">
          {result.error ? (
            <p className="text-red-500">{result.error}</p>
          ) : (
            <p>
              On {result.date}, you were <strong>{result.status}</strong>.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
