'use client'

import { useEffect, useState } from "react";

function ListRole({ value, onChange }) {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    async function fetchRoles() {
      try {
        const res = await fetch(`${API_URL}/roles/`);
        const data = await res.json();
        setRoles(data);
      } catch (err) {
        console.error("Failed to fetch roles", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRoles();
  }, [API_URL]);

  if (loading) return <p>Loading roles...</p>;

  return (
    <div>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="border p-2 rounded w-full"
      >
        <option value="" disabled>
          กรุณาเลือกบทบาท
        </option>
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.name}
          </option>
        ))}
        required
      </select>
    </div>
  );
}

export default ListRole;
