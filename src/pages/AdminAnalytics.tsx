import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Users, 
  Activity, 
  TrendingUp, 
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  RefreshCw,
  Filter
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activePractitioners: number;
    activePatients: number;
    totalConsultations: number;
    revenue: number;
    growthRate: number;
  };
  userGrowth: Array<{
    month: string;
    practitioners: number;
    patients: number;
    total: number;
  }>;
  consultationStats: Array<{
    date: string;
    consultations: number;
    revenue: number;
  }>;
  practitionerPerformance: Array<{
    id: string;
    name: string;
    specialization: string;
    consultations: number;
    rating: number;
    revenue: number;
  }>;
  popularTreatments: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
}

const AdminAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    // Check admin authentication
    const adminToken = localStorage.getItem('adminToken');
    const adminUser = localStorage.getItem('adminUser');
    
    if (!adminToken || !adminUser) {
      navigate('/admin/auth');
      return;
    }

    // Fetch analytics data
    fetchAnalyticsData();
  }, [navigate, timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      // const response = await fetch(`/api/admin/analytics?range=${timeRange}`, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      // });
      // const data = await response.json();
      
      // Mock data for now
      const mockData: AnalyticsData = {
        overview: {
          totalUsers: 1247,
          activePractitioners: 89,
          activePatients: 1158,
          totalConsultations: 3428,
          revenue: 512750,
          growthRate: 12.5
        },
        userGrowth: [
          { month: 'Jan', practitioners: 15, patients: 125, total: 140 },
          { month: 'Feb', practitioners: 22, patients: 189, total: 211 },
          { month: 'Mar', practitioners: 28, patients: 234, total: 262 },
          { month: 'Apr', practitioners: 35, patients: 298, total: 333 },
          { month: 'May', practitioners: 42, patients: 367, total: 409 },
          { month: 'Jun', practitioners: 48, patients: 423, total: 471 }
        ],
        consultationStats: [
          { date: '2024-01-01', consultations: 45, revenue: 6750 },
          { date: '2024-01-02', consultations: 52, revenue: 7800 },
          { date: '2024-01-03', consultations: 38, revenue: 5700 },
          { date: '2024-01-04', consultations: 61, revenue: 9150 },
          { date: '2024-01-05', consultations: 55, revenue: 8250 }
        ],
        practitionerPerformance: [
          { id: '1', name: 'Dr. Arjun Sharma', specialization: 'Panchakarma', consultations: 127, rating: 4.9, revenue: 19050 },
          { id: '2', name: 'Dr. Priya Nair', specialization: 'Ayurvedic Medicine', consultations: 98, rating: 4.8, revenue: 14700 },
          { id: '3', name: 'Dr. Rajesh Kumar', specialization: 'Pulse Diagnosis', consultations: 89, rating: 4.7, revenue: 13350 },
          { id: '4', name: 'Dr. Meera Desai', specialization: 'Herbal Medicine', consultations: 76, rating: 4.6, revenue: 11400 }
        ],
        popularTreatments: [
          { name: 'Panchakarma Detox', count: 234, percentage: 34.2 },
          { name: 'Ayurvedic Consultation', count: 189, percentage: 27.6 },
          { name: 'Herbal Medicine', count: 145, percentage: 21.2 },
          { name: 'Pulse Diagnosis', count: 87, percentage: 12.7 },
          { name: 'Yoga Therapy', count: 29, percentage: 4.3 }
        ]
      };
      
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    // Generate and download analytics report
    console.log('Exporting analytics report...');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load analytics data</p>
          <Button onClick={fetchAnalyticsData} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
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
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">System performance and insights</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportReport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button onClick={fetchAnalyticsData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Overview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalUsers.toLocaleString()}</div>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{analyticsData.overview.growthRate}% from last month
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Practitioners</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{analyticsData.overview.activePractitioners}</div>
              <div className="text-xs text-gray-500 mt-1">
                Verified and active
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Consultations</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalConsultations.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">
                This month
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">₹{analyticsData.overview.revenue.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">
                Total revenue
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Analytics Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">User Analytics</TabsTrigger>
              <TabsTrigger value="practitioners">Practitioners</TabsTrigger>
              <TabsTrigger value="treatments">Treatments</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <LineChart className="h-5 w-5 mr-2 text-green-600" />
                      User Growth Trend
                    </CardTitle>
                    <CardDescription>Monthly user registration statistics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.userGrowth.map((month) => (
                        <div key={month.month} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{month.month}</span>
                          <div className="flex items-center space-x-4">
                            <div className="text-xs text-green-600">P: {month.practitioners}</div>
                            <div className="text-xs text-blue-600">Pt: {month.patients}</div>
                            <Badge variant="outline">{month.total}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                      Daily Consultations
                    </CardTitle>
                    <CardDescription>Recent consultation activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.consultationStats.map((day, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{new Date(day.date).toLocaleDateString()}</span>
                          <div className="flex items-center space-x-4">
                            <Badge variant="secondary">{day.consultations} consultations</Badge>
                            <span className="text-sm text-green-600">₹{day.revenue}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="practitioners" className="space-y-6">
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle>Top Performing Practitioners</CardTitle>
                  <CardDescription>Based on consultations and ratings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.practitionerPerformance.map((practitioner) => (
                      <div key={practitioner.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{practitioner.name}</h4>
                          <p className="text-sm text-gray-600">{practitioner.specialization}</p>
                          <div className="flex items-center mt-1">
                            <span className="text-xs">Rating: {practitioner.rating}/5</span>
                            <span className="mx-2">•</span>
                            <span className="text-xs">{practitioner.consultations} consultations</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">₹{practitioner.revenue.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">Revenue</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="treatments" className="space-y-6">
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-purple-600" />
                    Popular Treatments
                  </CardTitle>
                  <CardDescription>Most requested treatment types</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.popularTreatments.map((treatment, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{treatment.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">{treatment.count}</span>
                            <Badge variant="outline">{treatment.percentage}%</Badge>
                          </div>
                        </div>
                        <Progress value={treatment.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle>User Distribution</CardTitle>
                    <CardDescription>Breakdown by user type</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Patients</span>
                        <span className="text-sm font-medium">{analyticsData.overview.activePatients}</span>
                      </div>
                      <Progress value={(analyticsData.overview.activePatients / analyticsData.overview.totalUsers) * 100} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Practitioners</span>
                        <span className="text-sm font-medium">{analyticsData.overview.activePractitioners}</span>
                      </div>
                      <Progress value={(analyticsData.overview.activePractitioners / analyticsData.overview.totalUsers) * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle>Growth Metrics</CardTitle>
                    <CardDescription>Key performance indicators</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Monthly Growth Rate</span>
                      <Badge variant={analyticsData.overview.growthRate > 10 ? "default" : "secondary"}>
                        {analyticsData.overview.growthRate > 0 ? '+' : ''}{analyticsData.overview.growthRate}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Avg. Consultations/Day</span>
                      <span className="font-medium">{Math.round(analyticsData.overview.totalConsultations / 30)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Revenue per User</span>
                      <span className="font-medium">₹{Math.round(analyticsData.overview.revenue / analyticsData.overview.totalUsers)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminAnalytics;