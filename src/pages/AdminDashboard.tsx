import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Users, 
  UserCheck, 
  Activity, 
  TrendingUp,
  Shield,
  Bell,
  Settings,
  BarChart3,
  UserX,
  AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  overview: {
    totalUsers: number;
    totalPatients: number;
    totalPractitioners: number;
    totalAdmins: number;
    activeUsers: number;
    verifiedPractitioners: number;
    verificationRate: string;
  };
  growth: {
    newUsersInRange: number;
    newPatientsInRange: number;
    newPractitionersInRange: number;
    growthRate: number;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    description: string;
    admin: string;
    timestamp: string;
    targetType: string;
  }>;
  timeRange: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    
    if (!token || !user) {
      navigate('/admin/auth');
      return;
    }

    setAdminUser(JSON.parse(user));
    fetchDashboardStats();
  }, [navigate]);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/admin/dashboard/stats?timeRange=30d', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load dashboard statistics",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error while loading dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/auth');
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
              <Shield className="h-8 w-8 text-purple-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {adminUser?.firstName} {adminUser?.lastName}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.overview.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats?.growth.newUsersInRange || 0} this month
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.overview.activeUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {((stats?.overview.activeUsers || 0) / (stats?.overview.totalUsers || 1) * 100).toFixed(1)}% active
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verified Practitioners</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.overview.verifiedPractitioners || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.overview.verificationRate || 0}% verification rate
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.growth.growthRate || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  Monthly growth rate
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-1"
          >
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <button
                  onClick={() => navigate('/admin/users')}
                  className="w-full flex items-center p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Users className="h-5 w-5 mr-3 text-blue-600" />
                  <div>
                    <div className="font-medium">Manage Users</div>
                    <div className="text-sm text-gray-500">View and manage all users</div>
                  </div>
                </button>
                
                <button
                  onClick={() => navigate('/admin/create-practitioner')}
                  className="w-full flex items-center p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <UserCheck className="h-5 w-5 mr-3 text-emerald-600" />
                  <div>
                    <div className="font-medium">Add Practitioner</div>
                    <div className="text-sm text-gray-500">Create new practitioner account</div>
                  </div>
                </button>
                
                <button
                  onClick={() => navigate('/admin/practitioners')}
                  className="w-full flex items-center p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <UserCheck className="h-5 w-5 mr-3 text-green-600" />
                  <div>
                    <div className="font-medium">Practitioner Verification</div>
                    <div className="text-sm text-gray-500">Verify practitioner credentials</div>
                  </div>
                </button>
                
                <button
                  onClick={() => navigate('/admin/analytics')}
                  className="w-full flex items-center p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <BarChart3 className="h-5 w-5 mr-3 text-purple-600" />
                  <div>
                    <div className="font-medium">Analytics</div>
                    <div className="text-sm text-gray-500">View detailed analytics</div>
                  </div>
                </button>
                
                <button
                  onClick={() => navigate('/admin/notifications')}
                  className="w-full flex items-center p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Bell className="h-5 w-5 mr-3 text-orange-600" />
                  <div>
                    <div className="font-medium">Send Notifications</div>
                    <div className="text-sm text-gray-500">Manage system notifications</div>
                  </div>
                </button>
                
                <button
                  onClick={() => navigate('/admin/settings')}
                  className="w-full flex items-center p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Settings className="h-5 w-5 mr-3 text-gray-600" />
                  <div>
                    <div className="font-medium">System Settings</div>
                    <div className="text-sm text-gray-500">Configure system settings</div>
                  </div>
                </button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.recentActivity.slice(0, 8).map((activity, index) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                      <div className="flex-shrink-0">
                        {activity.action.includes('CREATE') && <Users className="h-4 w-4 text-green-600" />}
                        {activity.action.includes('UPDATE') && <Activity className="h-4 w-4 text-blue-600" />}
                        {activity.action.includes('DELETE') && <UserX className="h-4 w-4 text-red-600" />}
                        {activity.action.includes('VERIFY') && <UserCheck className="h-4 w-4 text-purple-600" />}
                        {activity.action.includes('SUSPEND') && <AlertTriangle className="h-4 w-4 text-orange-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          by {activity.admin} • {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      No recent activity to display
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;