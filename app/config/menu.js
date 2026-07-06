import {
  LuLayoutDashboard,
  LuClipboardCheck,
  LuCalendarRange,
  LuUsersRound,
  LuChartColumnIncreasing,
  LuBuilding2,
  LuBriefcaseBusiness,
  LuUserCog
} from 'react-icons/lu';

export const menuConfig = [

  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LuLayoutDashboard,
    roles: [
      'Super Admin',
      'HQ Admin',
      'Branch Admin',
      'Supervisor',
      'User'
    ]
  },

  {
    name: 'Daily Report',
    href: '/manpower',
    icon: LuClipboardCheck,
    roles: [
      'Branch Admin',
      'Supervisor',
      'User'
    ]
  },

  {
    name: 'TOR Planning',
    href: '/tor',
    icon: LuCalendarRange,
    roles: [
      'Super Admin',
      'HQ Admin'
    ]
  },

  {
    name: 'Reports',
    href: '/reports',
    icon: LuChartColumnIncreasing,
    roles: [
      'Super Admin',
      'HQ Admin',
      'Branch Admin'
    ]
  },

  {
    name: 'Branches',
    href: '/branches',
    icon: LuBuilding2,
    roles: [
      'Super Admin'
    ]
  },

  {
    name: 'Departments',
    href: '/departments',
    icon: LuBriefcaseBusiness,
    roles: [
      'Super Admin'
    ]
  },

  {
    name: 'Users',
    href: '/users',
    icon: LuUserCog,
    roles: [
      'Super Admin'
    ]
  }

];