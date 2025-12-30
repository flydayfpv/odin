'use client';

import { useEffect, useState } from 'react';

export default function DashboardContent() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem('role'); // systemadmin / admin / user / reporter
    setRole(storedRole);
  }, []);

  if (!role) {
    return (
      <div className="bg-white p-4 rounded shadow text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  // =========================
  // Dashboard by role
  // =========================
  switch (role) {
    case 'systemadmin':
      return <SystemAdminDashboard />;

    case 'admin':
      return <AdminDashboard />;

    case 'reporter':
      return <ReporterDashboard />;

    case 'user':
    default:
      return <UserDashboard />;
  }
}

/* =========================
   Role Components
   ========================= */

function SystemAdminDashboard() {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-2">System Admin Dashboard</h2>
      <p className="text-gray-600">
        Manage users, roles, and system configurations.
      </p>
    </div>
  );
}

function AdminDashboard() {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-2">Admin Dashboard</h2>
      <ul className="list-disc ml-5 text-gray-600 space-y-1">
        <li>Manpower planning overview</li>
        <li>Daily & monthly manpower summary</li>
        <li>Pending approvals</li>
      </ul>
    </div>
  );
}

function ReporterDashboard() {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-2">Reporter Dashboard</h2>
      <p className="text-gray-600">
        Quick access to daily and monthly reports.
      </p>
    </div>
  );
}

function UserDashboard() {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-2">User Dashboard</h2>
      <p className="text-gray-600">
        Your tasks, schedules, and recent activities.
      </p>
    </div>
  );
}
