import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Bell,
  Check,
  X,
  Clock,
  AlertCircle,
  Mail,
  MessageSquare,
  Smartphone,
  Settings,
  Calendar,
  User,
  Loader2
} from 'lucide-react';
import { useMediaQuery } from '@mui/material';
import ResponsiveSidebar from '@/components/navigation/ResponsiveSidebar';
import MobileNavigation from '@/components/navigation/MobileNavigation';

interface Notification {
  _id: string;
  recipientId: string;
  appointmentId?: {
    _id: string;
    date: string;
    slotStartUtc: string;
    therapy?: string;
    practitionerId?: {
      firstName: string;
      lastName: string;
    };
  };
  channels: string[];
  templateId: string;
  variables: Record<string, any>;
  scheduledAt: string;
  sentAt?: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  read: boolean;
  createdAt: string;
}

const NotificationCenter = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const getUserName = () => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return 'Patient';
      const user = JSON.parse(raw);
      return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Patient';
    } catch (e) {
      return 'Patient';
    }
  };
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState({
    inApp: true,
    email: true,
    sms: false,
    therapy: true,
    precautions: true,
    progress: true,
    feedback: true,
    system: false
  });

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        if (response.status === 404) {
          throw new Error('Notification service not available. Please ensure the backend server is running.');
        }
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.notifications);
      } else {
        throw new Error(data.message || 'Failed to fetch notifications');
      }
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Cannot connect to server. Please ensure the backend is running on port 5000.');
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      const data = await response.json();
      
      if (data.success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === id ? { ...notif, read: true } : notif
          )
        );
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
      // Show error to user if needed
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    
    for (const notification of unreadNotifications) {
      await markAsRead(notification._id);
    }
  };

  const deleteNotification = (id: string) => {
    // For now, just hide from UI since we don't have a delete endpoint
    setNotifications(prev => prev.filter(notif => notif._id !== id));
  };

  const getNotificationIcon = (templateId: string) => {
    switch (templateId) {
      case '24h-before':
      case '2h-before':
      case 'on-time':
        return Clock;
      case 'immediate-post':
      case '48h-post':
        return AlertCircle;
      default: 
        return Bell;
    }
  };

  const getNotificationTitle = (templateId: string, variables: Record<string, any>) => {
    switch (templateId) {
      case '24h-before':
        return 'Therapy Reminder - Tomorrow';
      case '2h-before':
        return 'Therapy Starting Soon';
      case 'on-time':
        return 'Your Therapy Begins Now';
      case 'immediate-post':
        return 'Post-Therapy Care Instructions';
      case '48h-post':
        return 'Follow-up Care Reminder';
      default:
        return 'Notification';
    }
  };

  const getNotificationMessage = (notification: Notification) => {
    const { templateId, variables, appointmentId } = notification;
    const therapy = variables.therapy || appointmentId?.therapy || 'therapy session';
    const practitionerName = variables.practitionerName || 
      (appointmentId?.practitionerId ? 
        `${appointmentId.practitionerId.firstName} ${appointmentId.practitionerId.lastName}` : 
        'your practitioner');

    switch (templateId) {
      case '24h-before':
        return `Your ${therapy} with ${practitionerName} is scheduled for tomorrow. Please prepare according to the pre-therapy guidelines.`;
      case '2h-before':
        return `Your ${therapy} session begins in 2 hours. Please avoid heavy meals and arrive 15 minutes early.`;
      case 'on-time':
        return `Your ${therapy} session with ${practitionerName} is starting now. Please proceed to the therapy room.`;
      case 'immediate-post':
        return `Your ${therapy} session is complete. Please follow the post-therapy care instructions for optimal benefits.`;
      case '48h-post':
        return `It's been 48 hours since your ${therapy}. Please continue following the prescribed care routine and stay hydrated.`;
      default:
        return variables.message || 'You have a new notification';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span>Loading notifications...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Notifications</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchNotifications}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Responsive Sidebar */}
      {!isMobile && (
        <ResponsiveSidebar 
          userType="patient" 
          userName={getUserName()}
          userRole="Patient"
        />
      )}

      {/* Content wrapper */}
      <div className={`${!isMobile ? 'ml-64' : ''} ${isMobile ? 'pt-16 pb-20' : ''}`}>
        {/* Header */}
        <header className="bg-card border-b border-border/50 px-4 md:px-6 py-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h1 className="text-lg md:text-xl font-semibold text-foreground">Notifications</h1>
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs md:text-sm"
                >
                  Mark all as read
                </Button>
              )}
              <Badge variant={unreadCount > 0 ? "destructive" : "secondary"}>
                {unreadCount} unread
              </Badge>
            </div>
          </div>
        </header>

        <div className="p-3 md:p-4">
          <Tabs defaultValue="notifications" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-4">
              {notifications.length === 0 ? (
                <Card className="border-border/50">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No notifications</h3>
                    <p className="text-muted-foreground text-center">You're all caught up! Check back later for updates.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification, index) => {
                    const IconComponent = getNotificationIcon(notification.templateId);
                    const title = getNotificationTitle(notification.templateId, notification.variables);
                    const message = getNotificationMessage(notification);
                    const time = formatTime(notification.sentAt || notification.scheduledAt);
                    const priority = notification.templateId.includes('2h-before') || notification.templateId.includes('on-time') ? 'high' : 'medium';
                    
                    return (
                      <motion.div
                        key={notification._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className={`border-border/50 transition-all hover:shadow-sm ${
                          !notification.read ? 'bg-primary/5 border-primary/20' : ''
                        }`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start space-x-3 flex-1">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  priority === 'high' 
                                    ? 'bg-destructive/10 text-destructive'
                                    : 'bg-primary/10 text-primary'
                                }`}>
                                  <IconComponent className="h-4 w-4" />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h3 className="font-semibold text-foreground text-sm md:text-base">
                                      {title}
                                    </h3>
                                    {!notification.read && (
                                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                                    )}
                                    <Badge variant={
                                      notification.status === 'sent' ? 'default' :
                                      notification.status === 'pending' ? 'secondary' :
                                      notification.status === 'failed' ? 'destructive' : 'outline'
                                    } className="text-xs">
                                      {notification.status}
                                    </Badge>
                                  </div>
                                  <p className="text-muted-foreground text-sm mb-2 break-words">
                                    {message}
                                  </p>
                                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                    <span>{time}</span>
                                    {notification.appointmentId && (
                                      <>
                                        <span>•</span>
                                        <div className="flex items-center space-x-1">
                                          <Calendar className="h-3 w-3" />
                                          <span>{new Date(notification.appointmentId.date).toLocaleDateString()}</span>
                                        </div>
                                      </>
                                    )}
                                    <span>•</span>
                                    <div className="flex items-center space-x-1">
                                      {notification.channels.includes('email') && <Mail className="h-3 w-3" />}
                                      {notification.channels.includes('in-app') && <Bell className="h-3 w-3" />}
                                      {notification.channels.includes('sms') && <Smartphone className="h-3 w-3" />}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-1 flex-shrink-0">
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markAsRead(notification._id)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteNotification(notification._id)}
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-primary" />
                    <span>Notification Preferences</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Delivery Methods */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Delivery Methods</h3>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Bell className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <Label htmlFor="in-app">In-App Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive notifications within the app</p>
                          </div>
                        </div>
                        <Switch
                          id="in-app"
                          checked={preferences.inApp}
                          onCheckedChange={(checked) => 
                            setPreferences(prev => ({ ...prev, inApp: checked }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <Label htmlFor="email">Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                          </div>
                        </div>
                        <Switch
                          id="email"
                          checked={preferences.email}
                          onCheckedChange={(checked) => 
                            setPreferences(prev => ({ ...prev, email: checked }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Smartphone className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <Label htmlFor="sms">SMS Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive notifications via text message</p>
                          </div>
                        </div>
                        <Switch
                          id="sms"
                          checked={preferences.sms}
                          onCheckedChange={(checked) => 
                            setPreferences(prev => ({ ...prev, sms: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notification Types */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Notification Types</h3>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="therapy-notifs">Therapy Reminders</Label>
                          <p className="text-sm text-muted-foreground">Upcoming sessions and appointments</p>
                        </div>
                        <Switch
                          id="therapy-notifs"
                          checked={preferences.therapy}
                          onCheckedChange={(checked) => 
                            setPreferences(prev => ({ ...prev, therapy: checked }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="precaution-notifs">Precaution Tips</Label>
                          <p className="text-sm text-muted-foreground">AI-generated health precautions</p>
                        </div>
                        <Switch
                          id="precaution-notifs"
                          checked={preferences.precautions}
                          onCheckedChange={(checked) => 
                            setPreferences(prev => ({ ...prev, precautions: checked }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="progress-notifs">Progress Updates</Label>
                          <p className="text-sm text-muted-foreground">Recovery progress and milestones</p>
                        </div>
                        <Switch
                          id="progress-notifs"
                          checked={preferences.progress}
                          onCheckedChange={(checked) => 
                            setPreferences(prev => ({ ...prev, progress: checked }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="feedback-notifs">Feedback Requests</Label>
                          <p className="text-sm text-muted-foreground">Session feedback and ratings</p>
                        </div>
                        <Switch
                          id="feedback-notifs"
                          checked={preferences.feedback}
                          onCheckedChange={(checked) => 
                            setPreferences(prev => ({ ...prev, feedback: checked }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="system-notifs">System Updates</Label>
                          <p className="text-sm text-muted-foreground">App updates and new features</p>
                        </div>
                        <Switch
                          id="system-notifs"
                          checked={preferences.system}
                          onCheckedChange={(checked) => 
                            setPreferences(prev => ({ ...prev, system: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobile && <MobileNavigation userType="patient" />}

      {/* Mobile Sidebar */}
      {isMobile && (
        <ResponsiveSidebar 
          userType="patient" 
          userName={getUserName()}
          userRole="Patient"
        />
      )}
    </div>
  );
};

export default NotificationCenter;