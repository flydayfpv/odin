'use client'

import { useEffect, useState } from "react";

function ListDepartment({ value, onChange }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const res = await fetch(`${API_URL}/departments/`); // endpoint departments
        if (!res.ok) throw new Error("Failed to fetch departments");
        const data = await res.json();
        setDepartments(data);
      } catch (err) {
        console.error("Failed to fetch departments", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDepartments();
  }, [API_URL]);

  if (loading) return <p>Loading departments...</p>;

  return (
    <div>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="border p-2 rounded w-full"
        required
      >
        <option value="" disabled>
          กรุณาเลือกแผนก
        </option>
        {departments.map((dept) => (
          <option key={dept.id} value={dept.id}>
            {dept.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ListDepartment;
