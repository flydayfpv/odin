'use client'

import { useEffect, useState } from "react";

function ListShift({ value, onChange }) {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    async function fetchShifts() {
      try {
        const res = await fetch(`${API_URL}/shifts/`); // endpoint shifts
        const data = await res.json();
        setShifts(data);
      } catch (err) {
        console.error("Failed to fetch shifts", err);
      } finally {
        setLoading(false);
      }
    }

    fetchShifts();
  }, [API_URL]);

  if (loading) return <p>Loading shifts...</p>;

  return (
    <div>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="border p-2 rounded w-full"
        required
      >
        <option value="" disabled>
          กรุณาเลือกกะ
        </option>
        {shifts.map((shift) => (
          <option key={shift.id} value={shift.id}>
            {shift.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ListShift;
