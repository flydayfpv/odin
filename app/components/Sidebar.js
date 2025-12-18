'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Home, BarChart2, Users, LogOut, Menu, Settings,FileSpreadsheet,User2  } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem('role'); // admin / user / reporter
    setRole(storedRole);
  }, []);

  // กำหนด navItems ตาม role
  const getNavItems = (role) => {
    switch (role) {
      case 'systemadmin' :
        return [
                    { name: 'User ', href: '/odin/page/usermanagement', icon: <User2  size={18} /> },

        ]
      case 'admin':
        return [
          { name: 'Manpower Plan', href: '/odin/page/ManpowerPlan', icon: <FileSpreadsheet  size={18} /> },
          { name: 'Manpower Report', href: '/odin/page/manpower', icon: <Users size={18} /> },
          { name: 'Reports', href: '/odin/page/reports', icon: <BarChart2 size={18} /> },
          { name: 'Admin Settings', href: '/odin/page/admin', icon: <Settings size={18} /> },
        ];
      case 'user':
        return [
          { name: 'Dashboard', href: '/odin/page/dashboard', icon: <Home size={18} /> },
          { name: 'My Tasks', href: '/odin/page/tasks', icon: <Users size={18} /> },
        ];
      case 'reporter':
        return [
          { name: 'Dashboard', href: '/odin/page/dashboard', icon: <Home size={18} /> },
          { name: 'Reports', href: '/odin/page/reports', icon: <BarChart2 size={18} /> },
        ];
      default:
        return []; // หรือ navItems default
    }
  };

  const navItems = getNavItems(role);

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-16'} bg-slate-900 text-white flex flex-col transition-all duration-300`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">{isOpen ? '⚡ ODIN' : '⚡'}</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="text-slate-400 hover:text-white transition">
          <Menu size={20} />
        </button>
      </div>

      {/* Nav Links */}
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
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-700 p-3">
        <button
          onClick={() => window.location.replace('/')}
          className="flex items-center gap-2 text-slate-300 hover:text-white w-full"
        >
          <LogOut size={18} />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
