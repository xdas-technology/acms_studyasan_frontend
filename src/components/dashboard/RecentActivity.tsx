import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Activity } from 'lucide-react';

interface ActivityItem {
  id: number;
  user: string;
  action: string;
  time: Date;
  type: 'enrollment' | 'subject' | 'student' | 'teacher';
}

// Mock data - replace with real data from API
const mockActivities: ActivityItem[] = [
  {
    id: 1,
    user: 'John Doe',
    action: 'enrolled in Mathematics',
    time: new Date(Date.now() - 1000 * 60 * 5),
    type: 'enrollment',
  },
  {
    id: 2,
    user: 'Jane Smith',
    action: 'created new subject Physics',
    time: new Date(Date.now() - 1000 * 60 * 15),
    type: 'subject',
  },
  {
    id: 3,
    user: 'Admin',
    action: 'added new student Mike Johnson',
    time: new Date(Date.now() - 1000 * 60 * 30),
    type: 'student',
  },
];

export default function RecentActivity() {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'enrollment':
        return 'bg-blue-500';
      case 'subject':
        return 'bg-green-500';
      case 'student':
        return 'bg-purple-500';
      case 'teacher':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Recent Activity</span>
        </CardTitle>
        <CardDescription>Latest activities in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className={`${getActivityColor(activity.type)} text-white text-xs`}>
                  {getInitials(activity.user)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm">
                  <span className="font-medium">{activity.user}</span>{' '}
                  <span className="text-muted-foreground">{activity.action}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(activity.time, { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}