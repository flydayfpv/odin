'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Home,
  BarChart2,
  Users,
  LogOut,
  Menu,
  Settings,
  FileSpreadsheet,
  User2,
  LayoutDashboard,
  ClipboardList,
  FileText,
  UserCog,
  CalendarDays,
  PieChart,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [role, setRole] = useState(null);

  // =========================
  // Load role from localStorage
  // =========================
  useEffect(() => {
    const storedRole = localStorage.getItem('role'); // systemadmin / admin / user / reporter
    setRole(storedRole);
  }, []);

  // =========================
  // Logout
  // =========================
  const handleLogout = () => {
    localStorage.removeItem('odin_token');
    localStorage.removeItem('role');
    localStorage.removeItem('divisionId');

    // redirect ไปหน้า entry / login
    window.location.replace('/odin');
  };

  // =========================
  // Nav items by role
  // =========================
  const getNavItems = (role) => {
    switch (role) {
      case 'systemadmin':
        return [
          {
            name: 'User Management',
            href: '/odin/page/usermanagement',
            icon: <UserCog size={18} />,
          },
        ];

      case 'admin':
        return [
          {
            name: 'Manpower Plan',
            href: '/odin/page/ManpowerPlan',
            icon: <CalendarDays size={18} />,
          },
          {
            name: 'Manpower Report',
            href: '/odin/page/manpower',
            icon: <ClipboardList size={18} />,
          },
          {
            name: 'Reports',
            href: '/odin/page/reports',
            icon: <PieChart size={18} />,
          },
          {
            name: 'Admin Settings',
            href: '/odin/page/admin',
            icon: <Settings size={18} />,
          },
        ];

      case 'user':
        return [
          {
            name: 'Dashboard',
            href: '/odin/page/dashboard',
            icon: <LayoutDashboard size={18} />,
          },
          {
            name: 'My Tasks',
            href: '/odin/page/tasks',
            icon: <FileText size={18} />,
          },
        ];

      case 'reporter':
        return [
          {
            name: 'Dashboard',
            href: '/odin/page/ReporterDashboard',
            icon: <LayoutDashboard size={18} />,
          },
          {
            name: 'Daily Reports',
            href: '/odin/page/reports',
            icon: <BarChart2 size={18} />,
          },
          {
            name: 'Monthly Reports',
            href: '/odin/page/monthly',
            icon: <PieChart size={18} />,
          },
        ];

      default:
        return [];
    }
  };

  const navItems = getNavItems(role);

  // =========================
  // Render
  // =========================
  return (
    <aside
      className={`${
        isOpen ? 'w-64' : 'w-16'
      } bg-slate-900 text-white flex flex-col transition-all duration-300`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">{isOpen ? '⚡ ODIN' : '⚡'}</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-slate-400 hover:text-white transition"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all ${
                active
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {item.icon}
              {isOpen && <span>{item.name}</span>}
            </Link>
          );
        })} 
          <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-300 hover:text-white w-full"
        >
          <LogOut size={18} />
          {isOpen && <span>Logout</span>}
        </button>
      </nav>

      {/* Footer / Logout */}
     
    </aside>
  );
}
