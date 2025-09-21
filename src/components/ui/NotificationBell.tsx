import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';

interface Notification {
  _id: string;
  templateId: string;
  variables: Record<string, any>;
  scheduledAt: string;
  sentAt?: string;
  read: boolean;
  appointmentId?: {
    date: string;
    therapy?: string;
  };
}

interface NotificationBellProps {
  className?: string;
  onNotificationClick?: () => void;
}

export default function NotificationBell({ className = '', onNotificationClick }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUnreadNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) return;

      const response = await fetch('/api/notifications?status=unread&limit=10', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotifications(data.notifications);
          setUnreadCount(data.count);
        }
      } else {
        // Silently fail for notification bell - don't disrupt user experience
        console.warn('Failed to fetch notifications for bell:', response.status);
      }
    } catch (error) {
      // Silently fail for notification bell - don't disrupt user experience
      console.warn('Error fetching notifications for bell:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) return;

      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === id ? { ...notif, read: true } : notif
          ).filter(notif => !notif.read) // Remove read notifications from dropdown
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationTitle = (templateId: string) => {
    switch (templateId) {
      case '24h-before':
        return 'Therapy Tomorrow';
      case '2h-before':
        return 'Starting Soon';
      case 'on-time':
        return 'Beginning Now';
      case 'immediate-post':
        return 'Care Instructions';
      case '48h-post':
        return 'Follow-up Care';
      default:
        return 'Notification';
    }
  };

  const getNotificationMessage = (notification: Notification) => {
    const { templateId, variables } = notification;
    const therapy = variables.therapy || 'therapy session';

    switch (templateId) {
      case '24h-before':
        return `${therapy} scheduled for tomorrow`;
      case '2h-before':
        return `${therapy} begins in 2 hours`;
      case 'on-time':
        return `Your ${therapy} is starting`;
      case 'immediate-post':
        return 'Please follow post-therapy care';
      case '48h-post':
        return 'Continue your care routine';
      default:
        return variables.message || 'New notification';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`relative p-2 ${className}`}
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] font-bold"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} unread
            </Badge>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {loading ? (
          <div className="p-4 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            No new notifications
          </div>
        ) : (
          <ScrollArea className="max-h-80">
            {notifications.slice(0, 5).map((notification) => (
              <DropdownMenuItem
                key={notification._id}
                className="p-0 cursor-pointer"
                onClick={() => markAsRead(notification._id)}
              >
                <Card className="w-full border-0 shadow-none">
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-foreground mb-1">
                          {getNotificationTitle(notification.templateId)}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-1 line-clamp-2">
                          {getNotificationMessage(notification)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTime(notification.sentAt || notification.scheduledAt)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </DropdownMenuItem>
            ))}
            
            {notifications.length > 5 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-center text-primary hover:text-primary cursor-pointer"
                  onClick={onNotificationClick}
                >
                  View all notifications ({unreadCount} total)
                </DropdownMenuItem>
              </>
            )}
          </ScrollArea>
        )}
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-center cursor-pointer"
              onClick={onNotificationClick}
            >
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}