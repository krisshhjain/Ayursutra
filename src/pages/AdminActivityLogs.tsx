import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Activity, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  User,
  Shield,
  Database,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  Eye,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ActivityLog {
  id: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'practitioner' | 'patient';
  };
  action: string;
  category: 'authentication' | 'user_management' | 'system' | 'security' | 'data';
  details: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'warning' | 'error';
  metadata?: Record<string, any>;
}

const AdminActivityLogs: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7d');
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  useEffect(() => {
    // Check admin authentication
    const adminToken = localStorage.getItem('adminToken');
    const adminUser = localStorage.getItem('adminUser');
    
    if (!adminToken || !adminUser) {
      navigate('/admin/auth');
      return;
    }

    // Fetch activity logs
    fetchActivityLogs();
  }, [navigate, categoryFilter, statusFilter, dateRange]);

  const fetchActivityLogs = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      // const response = await fetch(`/api/admin/activity-logs?category=${categoryFilter}&status=${statusFilter}&range=${dateRange}&search=${searchTerm}`, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      // });
      // const data = await response.json();
      
      // Mock data for now
      const mockLogs: ActivityLog[] = [
        {
          id: '1',
          timestamp: '2024-01-15T10:30:00Z',
          user: { id: 'admin1', name: 'Super Admin', email: 'superadmin@ayursutra.com', role: 'admin' },
          action: 'User Login',
          category: 'authentication',
          details: 'Administrator logged in successfully',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          status: 'success'
        },
        {
          id: '2',
          timestamp: '2024-01-15T10:25:00Z',
          user: { id: 'prac1', name: 'Dr. Arjun Sharma', email: 'arjun@ayursutra.com', role: 'practitioner' },
          action: 'Profile Update',
          category: 'user_management',
          details: 'Updated practitioner profile information',
          ipAddress: '203.0.113.45',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          status: 'success',
          metadata: { fields_updated: ['phone', 'specialization'] }
        },
        {
          id: '3',
          timestamp: '2024-01-15T10:20:00Z',
          user: { id: 'patient1', name: 'Rahul Kumar', email: 'rahul@example.com', role: 'patient' },
          action: 'Failed Login Attempt',
          category: 'security',
          details: 'Multiple failed login attempts detected',
          ipAddress: '198.51.100.25',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
          status: 'warning',
          metadata: { attempt_count: 3, locked: false }
        },
        {
          id: '4',
          timestamp: '2024-01-15T10:15:00Z',
          user: { id: 'admin1', name: 'Super Admin', email: 'superadmin@ayursutra.com', role: 'admin' },
          action: 'Create Practitioner',
          category: 'user_management',
          details: 'Created new practitioner account for Dr. Priya Nair',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          status: 'success',
          metadata: { practitioner_id: 'prac_new_123', email: 'priya@ayursutra.com' }
        },
        {
          id: '5',
          timestamp: '2024-01-15T10:10:00Z',
          user: { id: 'system', name: 'System', email: 'system@ayursutra.com', role: 'admin' },
          action: 'Database Backup',
          category: 'system',
          details: 'Automated database backup completed successfully',
          ipAddress: 'localhost',
          userAgent: 'System Process',
          status: 'success',
          metadata: { backup_size: '2.4GB', duration: '45 minutes' }
        },
        {
          id: '6',
          timestamp: '2024-01-15T10:05:00Z',
          user: { id: 'admin1', name: 'Super Admin', email: 'superadmin@ayursutra.com', role: 'admin' },
          action: 'System Settings Update',
          category: 'system',
          details: 'Updated notification settings configuration',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          status: 'success',
          metadata: { settings_changed: ['email_notifications', 'sms_enabled'] }
        },
        {
          id: '7',
          timestamp: '2024-01-15T09:55:00Z',
          user: { id: 'prac2', name: 'Dr. Rajesh Kumar', email: 'rajesh@ayursutra.com', role: 'practitioner' },
          action: 'Data Export',
          category: 'data',
          details: 'Exported patient consultation reports',
          ipAddress: '203.0.113.67',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          status: 'success',
          metadata: { export_type: 'consultation_reports', record_count: 25 }
        },
        {
          id: '8',
          timestamp: '2024-01-15T09:50:00Z',
          user: { id: 'unknown', name: 'Unknown User', email: 'unknown@suspicious.com', role: 'patient' },
          action: 'Suspicious Activity',
          category: 'security',
          details: 'Attempted access to restricted admin endpoints',
          ipAddress: '198.51.100.99',
          userAgent: 'curl/7.68.0',
          status: 'error',
          metadata: { blocked: true, threat_level: 'high' }
        }
      ];
      
      setLogs(mockLogs);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      toast({
        title: "Error",
        description: "Failed to load activity logs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const exportLogs = () => {
    // Generate and download activity logs report
    console.log('Exporting activity logs...');
    toast({
      title: "Export started",
      description: "Activity logs report is being generated",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'authentication':
        return <User className="h-4 w-4" />;
      case 'user_management':
        return <User className="h-4 w-4" />;
      case 'system':
        return <Activity className="h-4 w-4" />;
      case 'security':
        return <Shield className="h-4 w-4" />;
      case 'data':
        return <Database className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'practitioner':
        return 'bg-blue-100 text-blue-800';
      case 'patient':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Loading activity logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
              <p className="text-gray-600 mt-1">System activity and audit trail</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button onClick={exportLogs} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Logs
            </Button>
            <Button onClick={fetchActivityLogs}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="authentication">Authentication</SelectItem>
                <SelectItem value="user_management">User Management</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="data">Data</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {filteredLogs.length} results
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Activity Logs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {filteredLogs.map((log) => (
            <Card key={log.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(log.status)}
                      {getCategoryIcon(log.category)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-gray-900">{log.action}</h3>
                        <Badge variant="outline" className={`text-xs ${getRoleColor(log.user.role)}`}>
                          {log.user.role}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {log.category.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{log.details}</p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{log.user.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>IP: {log.ipAddress}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedLog(log)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
                
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(log.metadata).map(([key, value]) => (
                        <Badge key={key} variant="secondary" className="text-xs">
                          {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          
          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No activity logs found</h3>
              <p className="text-gray-600">Try adjusting your filters or search criteria</p>
            </div>
          )}
        </motion.div>

        {/* Log Detail Modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedLog(null)}>
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Activity Log Details</h2>
                <Button variant="ghost" size="sm" onClick={() => setSelectedLog(null)}>
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Action</Label>
                    <p className="text-sm">{selectedLog.action}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Status</Label>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(selectedLog.status)}
                      <span className="text-sm capitalize">{selectedLog.status}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">User</Label>
                  <div className="text-sm">
                    <p>{selectedLog.user.name} ({selectedLog.user.email})</p>
                    <Badge className={`text-xs mt-1 ${getRoleColor(selectedLog.user.role)}`}>
                      {selectedLog.user.role}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Details</Label>
                  <p className="text-sm">{selectedLog.details}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Timestamp</Label>
                    <p className="text-sm">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">IP Address</Label>
                    <p className="text-sm">{selectedLog.ipAddress}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">User Agent</Label>
                  <p className="text-sm break-all">{selectedLog.userAgent}</p>
                </div>
                
                {selectedLog.metadata && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Metadata</Label>
                    <pre className="text-xs bg-gray-100 p-3 rounded mt-1 overflow-x-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminActivityLogs;