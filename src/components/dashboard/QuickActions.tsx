import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  BookOpen,
  Users,
  GraduationCap,
  FileText,
  Settings,
  UserCheck,
} from 'lucide-react';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ElementType;
  action: () => void;
  roles: string[];
}

export default function QuickActions() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const quickActions: QuickAction[] = [
    {
      title: 'Add Student',
      description: 'Register a new student',
      icon: UserPlus,
      action: () => navigate('/dashboard/students/new'),
      roles: ['ADMIN'],
    },
    {
      title: 'Add Teacher',
      description: 'Register a new teacher',
      icon: UserCheck,
      action: () => navigate('/dashboard/teachers/new'),
      roles: ['ADMIN'],
    },
    {
      title: 'Add Subject',
      description: 'Create a new subject',
      icon: BookOpen,
      action: () => navigate('/dashboard/subjects/new'),
      roles: ['ADMIN'],
    },
    {
      title: 'View Students',
      description: 'Manage all students',
      icon: Users,
      action: () => navigate('/dashboard/students'),
      roles: ['ADMIN', 'TEACHER'],
    },
    {
      title: 'View Teachers',
      description: 'Manage all teachers',
      icon: UserCheck,
      action: () => navigate('/dashboard/teachers'),
      roles: ['ADMIN'],
    },
    {
      title: 'Enrollments',
      description: 'Manage enrollments',
      icon: GraduationCap,
      action: () => navigate('/dashboard/enrollments'),
      roles: ['ADMIN', 'TEACHER', 'STUDENT'],
    },
    {
      title: 'My Subjects',
      description: 'View enrolled subjects',
      icon: FileText,
      action: () => navigate('/dashboard/subjects'),
      roles: ['STUDENT'],
    },
    {
      title: 'Settings',
      description: 'Manage preferences',
      icon: Settings,
      action: () => navigate('/dashboard/settings'),
      roles: ['ADMIN', 'TEACHER', 'STUDENT'],
    },
  ];

  const filteredActions = quickActions.filter((action) =>
    action.roles.includes(user?.role || '')
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Frequently used actions for quick access</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredActions.map((action) => (
            <Button
              key={action.title}
              variant="outline"
              className="h-auto flex flex-col items-start p-4 space-y-2"
              onClick={action.action}
            >
              <div className="flex items-center space-x-2 w-full">
                <action.icon className="h-5 w-5 text-primary" />
                <span className="font-semibold">{action.title}</span>
              </div>
              <span className="text-xs text-muted-foreground text-left">
                {action.description}
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}