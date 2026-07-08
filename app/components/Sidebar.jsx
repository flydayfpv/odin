'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  LuLayoutDashboard,
  LuClipboardCheck,
  LuCalendarRange,
  LuUsersRound,
  LuChartColumnIncreasing,
  LuBuilding2,
  LuBriefcaseBusiness,
  LuUserCog,
  LuSettings,
  LuLogOut
} from 'react-icons/lu';

const menuConfig = [

  {
    name: 'Dashboard',
    icon: LuLayoutDashboard,
    href: '/pages/dashboard',
    roles: [
      'Super Admin',
      'HQ',
      'Branch Admin',
      'Supervisor',
      'Viewer'
    ]
  },

  {
    name: 'Daily Report',
    icon: LuClipboardCheck,
    href: '/pages/dailyreport',
    roles: [
      'Branch Admin',
      'Supervisor'
    ]
  },

  {
    name: 'TOR Planning',
    icon: LuCalendarRange,
    href: '/pages/tor',
    roles: [
      'Super Admin',
      'HQ'
    ]
  },

  {
    name: 'Manpower Plan',
    icon: LuUsersRound,
    href: '/pages/planning',
    roles: [
      'Super Admin',
      'HQ'
    ]
  },

  {
    name: 'Daily Reports',
    icon: LuChartColumnIncreasing,
    href: '/pages/dailyreport',
    roles: [
      'Super Admin',
      'HQ',
      'Branch Admin',
      'Supervisor',
      'Viewer'
    ]
  },

  {
    name: 'Branches',
    icon: LuBuilding2,
    href: '/pages/branches',
    roles: [
      'Super Admin'
    ]
  },

  {
    name: 'Departments',
    icon: LuBriefcaseBusiness,
    href: '/departments',
    roles: [
      'Super Admin',
      'HQ'
    ]
  },

  {
    name: 'Users',
    icon: LuUserCog,
    href: '/pages/users',
    roles: [
      'Super Admin'
    ]
  },

  {
    name: 'Settings',
    icon: LuSettings,
    href: '/pages/settings',
    roles: [
      'Super Admin'
    ]
  }

];

export default function Sidebar() {

  const pathname = usePathname();

  const [user, setUser] = useState(null);
  const [menus, setMenus] = useState([]);

  useEffect(() => {

    const userData =
      localStorage.getItem('user');

    if (!userData) return;

    const parsedUser =
      JSON.parse(userData);

    setUser(parsedUser);

    const userRoles =
      parsedUser.roles?.map(
        role => role.name
      ) || [];

    const filteredMenus =
      menuConfig.filter(menu =>
        menu.roles.some(role =>
          userRoles.includes(role)
        )
      );

    setMenus(filteredMenus);

  }, []);

  const logout = () => {

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    document.cookie =
      'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';

    window.location.href = '/login';

  };

  return (

    <aside className="w-72 bg-slate-950 text-white flex flex-col">

      {/* Logo */}

      <div className="p-6 border-b border-slate-800">

        <h1 className="text-3xl font-bold tracking-wide">
          ODIN
        </h1>

        <p className="text-slate-400 text-sm">
          Manpower Management System
        </p>

      </div>

      {/* User Info */}

      {user && (

        <div className="p-4 border-b border-slate-800">

          <div className="font-semibold">

            {user.fullname}

          </div>

          <div className="text-xs text-slate-400">

            {user.branch?.name_th}

          </div>

          <div className="text-xs text-blue-400 mt-1">

            {
              user.roles
                ?.map(role => role.name)
                .join(', ')
            }

          </div>

        </div>

      )}

      {/* Menu */}

      <nav className="flex-1 p-4">

        {menus.map(menu => {

          const Icon = menu.icon;

          const active =
            pathname.startsWith(menu.href);

          return (

            <Link
              key={menu.href}
              href={menu.href}
              className={`
                flex items-center gap-3
                px-4 py-3 rounded-xl mb-2
                transition-all duration-200
                ${
                  active
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }
              `}
            >

              <Icon size={20} />

              <span>
                {menu.name}
              </span>

            </Link>

          );

        })}

      </nav>

      {/* Footer */}

      <div className="border-t border-slate-800 p-4">

        <button
          onClick={logout}
          className="
            w-full
            flex
            items-center
            gap-3
            px-4
            py-3
            rounded-xl
            text-red-400
            hover:bg-red-500
            hover:text-white
            transition
          "
        >

          <LuLogOut size={20} />

          Logout

        </button>

      </div>

    </aside>

  );

}