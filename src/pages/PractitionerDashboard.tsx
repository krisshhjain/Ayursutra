import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Users,
  BarChart3,
  MessageSquare,
  User,
  Settings,
  Brain,
  LogOut,
  TrendingUp,
  Award,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ResponsiveSidebar from '@/components/navigation/ResponsiveSidebar';
import MobileNavigation from '@/components/navigation/MobileNavigation';
import { useMediaQuery } from '@mui/material';
import { useToast } from '@/hooks/use-toast';
import { StarRating } from '@/components/ui/StarRating';
import { reviewAPI, type ReviewStats } from '@/lib/api/reviews';
import { buildApiUrl, apiCall } from '@/lib/api/config';

type PractitionerData = {
  firstName: string;
  lastName: string;
  specialization?: string;
  email?: string;
};

type DashboardStats = {
  activePatients: number;
  todaySessions: number;
  avgRating: number;
  successRate: number;
};

const PractitionerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [practitioner, setPractitioner] = useState<PractitionerData | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    activePatients: 0,
    todaySessions: 0,
    avgRating: 0,
    successRate: 0
  });
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (!token || !user) {
      navigate('/auth?type=practitioner');
      return;
    }
    const userData = JSON.parse(user);
    if (userData.userType !== 'practitioner') {
      navigate('/auth?type=practitioner');
      return;
    }
    setPractitioner(userData);
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch basic dashboard stats
      const data = await apiCall('/practitioner/dashboard');
      if (data.success) {
        setStats(data.data.stats);
        setPractitioner(data.data.practitioner);
        
        // Also fetch detailed review stats
        try {
          // Get practitioner ID from user data or token
          const userData = await apiCall('/auth/profile');
          console.log('User data for reviews:', userData);
          
          if (userData.success && userData.data._id) {
            console.log('Fetching review stats for practitioner ID:', userData.data._id);
            const reviewStatsData = await reviewAPI.getPractitionerStats(userData.data._id);
            console.log('Review stats received:', reviewStatsData);
            setReviewStats(reviewStatsData);
          }
        } catch (reviewError) {
          console.error('Error loading review stats:', reviewError);
          // Use fallback from dashboard stats
          setReviewStats({
            totalReviews: 0,
            averageRating: data.data.stats.avgRating || 0,
            recommendationRate: 0,
            ratingDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
            aspectAverages: null
          });
        }
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to load dashboard data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const isMobile = useMediaQuery('(max-width: 768px)');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  const todaySchedule = [
    { patient: 'Arjun Patel', therapy: 'Abhyanga', time: '2:00 PM', status: 'confirmed' },
    { patient: 'Priya Singh', therapy: 'Shirodhara', time: '3:30 PM', status: 'confirmed' },
    { patient: 'Raj Kumar', therapy: 'Udvartana', time: '5:00 PM', status: 'pending' }
  ];

  const pendingFeedback = [
    { patient: 'Arjun Patel', therapy: 'Abhyanga', date: 'Yesterday' },
    { patient: 'Meera Shah', therapy: 'Panchakarma', date: '2 days ago' },
    { patient: 'Vikram Joshi', therapy: 'Karna Purana', date: '3 days ago' }
  ];

  const aiInsights = [
    '85% of patients show improved energy levels after 2 weeks',
    'Abhyanga therapy has the highest satisfaction rate (4.9/5)',
    'Weekend appointments have 20% lower no-show rates',
    'Patients aged 35-50 respond best to combined therapies'
  ];

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && (
        <ResponsiveSidebar userType="practitioner" userName={practitioner ? `Dr. ${practitioner.firstName} ${practitioner.lastName}` : 'Dr. Practitioner'} userRole={practitioner?.specialization || 'Practitioner'} />
      )}

      <div className={`${!isMobile ? 'ml-64' : ''} ${isMobile ? 'pt-16' : ''}`}>
        <div className={isMobile ? 'pb-20' : ''}>
          <div className="bg-card border-b border-border/50 px-6 py-2">
            <h1 className="text-xl font-semibold text-foreground">Good afternoon, {practitioner ? `Dr. ${practitioner.lastName}` : 'Doctor'}</h1>
          </div>

          <main className="p-3 md:p-4 space-y-3 md:space-y-4">
            <div className="grid md:grid-cols-4 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{stats.activePatients}</p>
                        <p className="text-sm text-muted-foreground">Active Patients</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-healing/10 rounded-lg flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-healing" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{stats.todaySessions}</p>
                        <p className="text-sm text-muted-foreground">Today's Sessions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-wellness/10 rounded-lg flex items-center justify-center">
                          <Award className="h-5 w-5 text-wellness" />
                        </div>
                        <div>
                          {reviewStats && reviewStats.totalReviews > 0 ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <StarRating 
                                  rating={reviewStats.averageRating} 
                                  size="sm" 
                                  showNumber={true}
                                />
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? 's' : ''}
                                {reviewStats.totalReviews > 0 && (
                                  <span className="ml-1">• {reviewStats.recommendationRate}% recommend</span>
                                )}
                              </p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-2xl font-bold text-foreground">
                                {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : 'No reviews yet'}
                              </p>
                              <p className="text-sm text-muted-foreground">Avg. Rating</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{stats.successRate}%</p>
                        <p className="text-sm text-muted-foreground">Success Rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span>Today's Schedule</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {todaySchedule.map((session, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">{session.patient}</p>
                          <p className="text-sm text-muted-foreground">{session.therapy}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">{session.time}</p>
                          <Badge variant={session.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs">
                            {session.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">
                      View Full Schedule
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MessageSquare className="h-5 w-5 text-healing" />
                      <span>Pending Feedback</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {pendingFeedback.map((feedback, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-border/50 rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">{feedback.patient}</p>
                          <p className="text-sm text-muted-foreground">{feedback.therapy}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">{feedback.date}</p>
                          <Button size="sm" variant="outline" className="mt-1">
                            Remind
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">
                      View All Feedback
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="h-5 w-5 text-wellness" />
                      <span>AI Insights</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {aiInsights.map((insight, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gradient-primary/5 rounded-lg">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <p className="text-sm text-foreground">{insight}</p>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">
                      View Detailed Analytics
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-accent" />
                    <span>Recent Patient Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-success/10 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-success" />
                        </div>
                        <span className="font-medium text-foreground">Arjun Patel</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">85% Recovery Progress</p>
                      <p className="text-xs text-success">Excellent improvement in energy levels</p>
                    </div>

                    <div className="bg-warning/10 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-8 h-8 bg-warning/20 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-warning" />
                        </div>
                        <span className="font-medium text-foreground">Priya Singh</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">62% Recovery Progress</p>
                      <p className="text-xs text-warning">Moderate progress, needs attention</p>
                    </div>

                    <div className="bg-primary/10 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">Raj Kumar</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">Just Started</p>
                      <p className="text-xs text-primary">Initial assessment completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </main>
        </div>
      </div>
      {isMobile && <MobileNavigation userType="practitioner" />}
    </div>
  );
};

export default PractitionerDashboard;