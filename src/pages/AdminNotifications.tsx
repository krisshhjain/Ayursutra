import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Bell, 
  Send, 
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  Users,
  MessageCircle,
  AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  targetAudience: 'all' | 'patients' | 'practitioners';
  isActive: boolean;
  sentCount: number;
  readCount: number;
  createdAt: string;
  scheduledAt?: string;
  createdBy: string;
}

const AdminNotifications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterAudience, setFilterAudience] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info' as const,
    targetAudience: 'all' as const,
    scheduledAt: ''
  });

  useEffect(() => {
    // Check admin auth
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/auth');
      return;
    }
    
    fetchNotifications();
  }, [navigate, searchTerm, filterType, filterAudience]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      // Mock data for now - you can implement actual API calls
      const mockNotifications: Notification[] = [
        {
          _id: '1',
          title: 'System Maintenance Notice',
          message: 'Scheduled maintenance will occur on Sunday from 2:00 AM to 4:00 AM. Some services may be temporarily unavailable.',
          type: 'warning',
          targetAudience: 'all',
          isActive: true,
          sentCount: 245,
          readCount: 189,
          createdAt: '2024-01-15T10:30:00Z',
          createdBy: 'Admin User'
        },
        {
          _id: '2',
          title: 'New Practitioner Verification',
          message: 'Dr. Amit Sharma has been verified and is now available for consultations in Panchakarma therapy.',
          type: 'success',
          targetAudience: 'patients',
          isActive: true,
          sentCount: 156,
          readCount: 98,
          createdAt: '2024-01-14T15:45:00Z',
          createdBy: 'Admin User'
        },
        {
          _id: '3',
          title: 'Holiday Schedule Update',
          message: 'Please note the updated holiday schedule for the month of February. All practitioners are requested to update their availability.',
          type: 'info',
          targetAudience: 'practitioners',
          isActive: true,
          sentCount: 23,
          readCount: 18,
          createdAt: '2024-01-13T09:15:00Z',
          createdBy: 'Admin User'
        },
        {
          _id: '4',
          title: 'Security Alert',
          message: 'We detected unusual login activity. Please review your account security settings and enable two-factor authentication.',
          type: 'error',
          targetAudience: 'all',
          isActive: false,
          sentCount: 298,
          readCount: 267,
          createdAt: '2024-01-12T14:20:00Z',
          createdBy: 'System'
        }
      ];

      // Apply filters
      let filteredNotifications = mockNotifications;
      
      if (searchTerm) {
        filteredNotifications = filteredNotifications.filter(notification =>
          notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notification.message.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (filterType !== 'all') {
        filteredNotifications = filteredNotifications.filter(notification => notification.type === filterType);
      }
      
      if (filterAudience !== 'all') {
        filteredNotifications = filteredNotifications.filter(notification => notification.targetAudience === filterAudience);
      }

      setNotifications(filteredNotifications);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotification = async () => {
    if (!newNotification.title || !newNotification.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/system/notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newNotification)
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Notification created successfully",
        });
        setIsCreateDialogOpen(false);
        setNewNotification({
          title: '',
          message: '',
          type: 'info',
          targetAudience: 'all',
          scheduledAt: ''
        });
        fetchNotifications(); // Refresh the list
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to create notification",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error while creating notification",
        variant: "destructive"
      });
    }
  };

  const handleSendNotification = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/system/notifications/${notificationId}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Notification sent successfully",
        });
        fetchNotifications(); // Refresh to show updated counts
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send notification",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error while sending notification",
        variant: "destructive"
      });
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-700">Success</Badge>;
      case 'warning':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-700">Warning</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Info</Badge>;
    }
  };

  const getAudienceBadge = (audience: string) => {
    switch (audience) {
      case 'patients':
        return <Badge variant="outline">Patients</Badge>;
      case 'practitioners':
        return <Badge variant="outline">Practitioners</Badge>;
      default:
        return <Badge variant="outline">All Users</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/admin/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <Bell className="h-6 w-6 text-purple-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Notification Management</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Notification
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Notification</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={newNotification.title}
                        onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter notification title"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        value={newNotification.message}
                        onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Enter notification message"
                        rows={4}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select 
                          value={newNotification.type} 
                          onValueChange={(value: any) => setNewNotification(prev => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="info">Info</SelectItem>
                            <SelectItem value="success">Success</SelectItem>
                            <SelectItem value="warning">Warning</SelectItem>
                            <SelectItem value="error">Error</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Target Audience</Label>
                        <Select 
                          value={newNotification.targetAudience} 
                          onValueChange={(value: any) => setNewNotification(prev => ({ ...prev, targetAudience: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Users</SelectItem>
                            <SelectItem value="patients">Patients Only</SelectItem>
                            <SelectItem value="practitioners">Practitioners Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="scheduledAt">Schedule for Later (Optional)</Label>
                      <Input
                        id="scheduledAt"
                        type="datetime-local"
                        value={newNotification.scheduledAt}
                        onChange={(e) => setNewNotification(prev => ({ ...prev, scheduledAt: e.target.value }))}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateNotification}>
                        <Send className="h-4 w-4 mr-2" />
                        Create & Send
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bell className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
                  <p className="text-sm text-gray-500">Total Notifications</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Send className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {notifications.reduce((sum, n) => sum + n.sentCount, 0)}
                  </p>
                  <p className="text-sm text-gray-500">Total Sent</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Eye className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {notifications.reduce((sum, n) => sum + n.readCount, 0)}
                  </p>
                  <p className="text-sm text-gray-500">Total Read</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {notifications.filter(n => n.isActive).length}
                  </p>
                  <p className="text-sm text-gray-500">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterAudience} onValueChange={setFilterAudience}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Audiences</SelectItem>
                  <SelectItem value="patients">Patients</SelectItem>
                  <SelectItem value="practitioners">Practitioners</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setFilterAudience('all');
              }} variant="outline">
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications ({notifications.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Sent/Read</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification) => (
                  <TableRow key={notification._id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{notification.title}</p>
                        <p className="text-sm text-gray-500 line-clamp-2">{notification.message}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(notification.type)}</TableCell>
                    <TableCell>{getAudienceBadge(notification.targetAudience)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{notification.sentCount} sent</p>
                        <p className="text-gray-500">{notification.readCount} read</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={notification.isActive ? "default" : "secondary"}>
                        {notification.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{new Date(notification.createdAt).toLocaleDateString()}</p>
                        <p className="text-gray-500">{notification.createdBy}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSendNotification(notification._id)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {notifications.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No notifications found matching your criteria
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminNotifications;