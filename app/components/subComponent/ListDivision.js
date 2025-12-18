'use client'

import { useEffect, useState } from "react";

function ListDivision({ value, onChange }) {
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    async function fetchDivisions() {
      try {
        const res = await fetch(`${API_URL}/divisions/`);
        const data = await res.json();
        setDivisions(data);
      } catch (err) {
        console.error("Failed to fetch divisions", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDivisions();
  }, [API_URL]);

  if (loading) return <p>Loading divisions...</p>;

  return (
    <div>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="border p-2 rounded w-full"
        required
      >
        <option value="" disabled>
          กรุณาเลือกฝ่าย
        </option>
        {divisions.map((div) => (
          <option key={div.id} value={div.id}>
            {div.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ListDivision;
