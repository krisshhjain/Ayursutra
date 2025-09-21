import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Star, 
  Activity,
  Brain,
  BarChart3,
  PieChart,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ResponsiveSidebar from '@/components/navigation/ResponsiveSidebar';
import MobileNavigation from '@/components/navigation/MobileNavigation';
import { useMediaQuery } from '@mui/material';

const PractitionerAnalytics = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [practitioner, setPractitioner] = useState({ firstName: '', lastName: '', specialization: '' });

  useEffect(() => {
    fetchPractitionerInfo();
  }, []);

  const fetchPractitionerInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/practitioner/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setPractitioner(data.data.practitioner);
      }
    } catch (error) {
      console.error('Error fetching practitioner info:', error);
    }
  };

  const therapyStats = [
    { name: 'Abhyanga', sessions: 45, success: 92, satisfaction: 4.8 },
    { name: 'Shirodhara', sessions: 32, success: 88, satisfaction: 4.9 },
    { name: 'Swedana', sessions: 28, success: 85, satisfaction: 4.7 },
    { name: 'Udvartana', sessions: 21, success: 90, satisfaction: 4.6 },
  ];

  const aiInsights = [
    {
      title: 'Peak Performance Hours',
      insight: 'Patients show 23% better recovery rates in morning sessions (9-11 AM)',
      priority: 'high'
    },
    {
      title: 'Therapy Combinations',
      insight: 'Abhyanga followed by Swedana shows 18% higher satisfaction scores',
      priority: 'medium'
    },
    {
      title: 'Patient Retention',
      insight: 'Patients who complete consultation phase have 95% treatment completion rate',
      priority: 'high'
    },
    {
      title: 'Seasonal Trends',
      insight: 'Detox therapies are 40% more effective during winter months',
      priority: 'low'
    }
  ];

  const monthlyData = [
    { month: 'Oct', patients: 32, revenue: 48000, satisfaction: 4.6 },
    { month: 'Nov', patients: 38, revenue: 57000, satisfaction: 4.7 },
    { month: 'Dec', patients: 42, revenue: 63000, satisfaction: 4.8 },
    { month: 'Jan', patients: 47, revenue: 70500, satisfaction: 4.9 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && (
        <ResponsiveSidebar 
          userType="practitioner" 
          userName={`Dr. ${practitioner.firstName} ${practitioner.lastName}`} 
          userRole="Practitioner" 
        />
      )}
      
      <div className={`${!isMobile ? 'ml-64' : ''}`}>
        <main className="p-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
          >
            <div>
              <h1 className="text-2xl font-bold text-foreground">Analytics & Insights</h1>
              <p className="text-muted-foreground">Track performance and gain AI-powered insights</p>
            </div>
            
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </motion.div>

          {/* Key Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">47</p>
                    <p className="text-sm text-muted-foreground">Active Patients</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% from last month
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-healing/10 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-healing" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">126</p>
                    <p className="text-sm text-muted-foreground">Sessions This Month</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8% from last month
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-wellness/10 rounded-lg flex items-center justify-center">
                    <Star className="h-5 w-5 text-wellness" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">4.9</p>
                    <p className="text-sm text-muted-foreground">Avg. Rating</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +0.2 from last month
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Activity className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">89%</p>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +3% from last month
                  </div>
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
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="therapies">Therapies</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
                <TabsTrigger value="insights">AI Insights</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Monthly Performance */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Monthly Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {monthlyData.map((data, index) => (
                          <div key={data.month} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div>
                              <p className="font-medium text-foreground">{data.month} 2024</p>
                              <p className="text-sm text-muted-foreground">{data.patients} patients</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-foreground">₹{data.revenue.toLocaleString()}</p>
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500" />
                                <span className="text-sm text-muted-foreground">{data.satisfaction}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Patient Demographics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-primary" />
                        Patient Demographics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Age 25-35</span>
                            <span className="font-medium text-foreground">38%</span>
                          </div>
                          <Progress value={38} className="h-2" />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Age 36-45</span>
                            <span className="font-medium text-foreground">32%</span>
                          </div>
                          <Progress value={32} className="h-2" />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Age 46-55</span>
                            <span className="font-medium text-foreground">20%</span>
                          </div>
                          <Progress value={20} className="h-2" />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Age 55+</span>
                            <span className="font-medium text-foreground">10%</span>
                          </div>
                          <Progress value={10} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="therapies" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Therapy Performance Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {therapyStats.map((therapy, index) => (
                        <div key={therapy.name} className="p-4 border border-border/50 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-foreground">{therapy.name}</h4>
                            <Badge variant="outline">{therapy.sessions} sessions</Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Success Rate</span>
                                <span className="font-medium text-foreground">{therapy.success}%</span>
                              </div>
                              <Progress value={therapy.success} className="h-2" />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Satisfaction</span>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span className="font-medium text-foreground">{therapy.satisfaction}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="trends" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Booking Patterns</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Morning (9-12 PM)</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div className="w-16 bg-primary h-2 rounded-full"></div>
                            </div>
                            <span className="text-sm font-medium text-foreground">65%</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Afternoon (12-5 PM)</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div className="w-10 bg-primary h-2 rounded-full"></div>
                            </div>
                            <span className="text-sm font-medium text-foreground">25%</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Evening (5-8 PM)</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div className="w-4 bg-primary h-2 rounded-full"></div>
                            </div>
                            <span className="text-sm font-medium text-foreground">10%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Seasonal Demand</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Winter (Dec-Feb)</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div className="w-18 bg-primary h-2 rounded-full"></div>
                            </div>
                            <span className="text-sm font-medium text-foreground">40%</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Spring (Mar-May)</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div className="w-12 bg-primary h-2 rounded-full"></div>
                            </div>
                            <span className="text-sm font-medium text-foreground">25%</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Monsoon (Jun-Sep)</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div className="w-8 bg-primary h-2 rounded-full"></div>
                            </div>
                            <span className="text-sm font-medium text-foreground">20%</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Post-Monsoon (Oct-Nov)</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div className="w-6 bg-primary h-2 rounded-full"></div>
                            </div>
                            <span className="text-sm font-medium text-foreground">15%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="insights" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      AI-Powered Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {aiInsights.map((insight, index) => (
                        <div key={index} className="p-4 border border-border/50 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-foreground">{insight.title}</h4>
                            <Badge 
                              variant={insight.priority === 'high' ? 'destructive' : 
                                      insight.priority === 'medium' ? 'secondary' : 'outline'}
                            >
                              {insight.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{insight.insight}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>
      </div>

      {isMobile && <MobileNavigation userType="practitioner" />}
    </div>
  );
};

export default PractitionerAnalytics;