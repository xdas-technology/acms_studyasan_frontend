import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import {
  Home,
  Users,
  BookOpen,
  GraduationCap,
  UserCheck,
  Settings,
  LayoutDashboard,
  ClipboardList,
  FileText,
  Award,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    roles: ['ADMIN', 'TEACHER', 'STUDENT'],
  },
  {
    title: 'Students',
    href: '/dashboard/students',
    icon: Users,
    roles: ['ADMIN', 'TEACHER'],
  },
  {
    title: 'Teachers',
    href: '/dashboard/teachers',
    icon: UserCheck,
    roles: ['ADMIN'],
  },
  {
    title: 'Subjects',
    href: '/dashboard/subjects',
    icon: BookOpen,
    roles: ['ADMIN', 'TEACHER', 'STUDENT'],
  },
  {
    title: 'Tests',
    href: '/tests',
    icon: FileText,
    roles: ['ADMIN', 'TEACHER', 'STUDENT'],
  },
  {
    title: 'My Results',
    href: '/tests/my-results',
    icon: Award,
    roles: ['STUDENT'],
  },
  {
    title: 'Classes',
    href: '/dashboard/classes',
    icon: LayoutDashboard,
    roles: ['ADMIN'],
  },
  {
    title: 'Boards',
    href: '/dashboard/boards',
    icon: ClipboardList,
    roles: ['ADMIN'],
  },
  {
    title: 'Enrollments',
    href: '/dashboard/enrollments',
    icon: GraduationCap,
    roles: ['ADMIN', 'TEACHER', 'STUDENT'],
  },
];

export default function Sidebar() {
  const user = useAuthStore((state) => state.user);

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role || '')
  );

  return (
    <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 lg:pt-16 bg-white border-r border-gray-200">
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === '/dashboard'}
            className={({ isActive }) =>
              cn(
                'flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-gray-700 hover:bg-gray-100'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}