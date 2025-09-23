import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar,
  Bell,
  TrendingUp,
  User,
  Settings,
  BookOpen,
  MessageSquare,
  LogOut,
  Leaf,
  Clock,
  Activity,
  Heart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@mui/material';
import ResponsiveSidebar from '@/components/navigation/ResponsiveSidebar';
import MobileNavigation from '@/components/navigation/MobileNavigation';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    patient: { firstName: '', lastName: '', age: 0, email: '' },
    stats: { totalSessions: 0, progressPercentage: 0, averageRating: '0.0', daysRemaining: 0 },
    progressSummary: {
      overallRecovery: { percentage: 0, status: '' },
      detoxPhase: { percentage: 0, status: '' },
      rejuvenation: { percentage: 0, status: '' }
    },
    nextTherapy: { type: '', date: '', time: '', practitioner: '' },
    precautions: [],
    notifications: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/patient/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setDashboardData(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      // Could add toast notification here
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { icon: Activity, label: 'Dashboard', active: true },
    { icon: Calendar, label: 'Schedule' },
    { icon: Bell, label: 'Notifications' },
    { icon: TrendingUp, label: 'Progress' },
    { icon: MessageSquare, label: 'Feedback' },
    { icon: User, label: 'Profile' },
  ];

  const { patient, stats, progressSummary, nextTherapy, precautions, notifications } = dashboardData;

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar - hidden on mobile */}
      {!isMobile && (
        <ResponsiveSidebar 
          userType="patient" 
          userName={patient.firstName && patient.lastName ? `${patient.firstName} ${patient.lastName}` : "Patient"}
          userRole="Patient"
        />
      )}

      {/* Content wrapper: apply left margin on desktop to avoid overlap */}
      <div className={`${!isMobile ? 'ml-64 pt-0' : 'pt-16'}`}>
        {/* Main Content - Start immediately */}
        <main className="p-3 space-y-3">
          {/* Welcome Message */}
          <div className="mb-2">
            <h1 className="text-lg font-semibold text-foreground">
              Welcome back, {patient.firstName || "Patient"}
            </h1>
          </div>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-border/50">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Calendar className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xl md:text-2xl font-bold text-foreground">{stats.totalSessions}</p>
                        <p className="text-xs md:text-sm text-muted-foreground">Sessions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-healing/10 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-healing" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{stats.progressPercentage}%</p>
                        <p className="text-sm text-muted-foreground">Recovery Progress</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-wellness/10 rounded-lg flex items-center justify-center">
                        <Heart className="h-5 w-5 text-wellness" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{stats.averageRating}</p>
                        <p className="text-sm text-muted-foreground">Avg. Rating</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                        <Clock className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{stats.daysRemaining}</p>
                        <p className="text-sm text-muted-foreground">Days Remaining</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Main Dashboard Widgets */}
            <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
              {/* Next Therapy Session */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span>Next Therapy Session</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gradient-primary/10 rounded-lg p-3 md:p-4">
                      <h3 className="font-semibold text-base md:text-lg text-foreground">{nextTherapy.type}</h3>
                      <p className="text-sm text-muted-foreground">{nextTherapy.date} at {nextTherapy.time}</p>
                      <p className="text-xs md:text-sm text-muted-foreground">with {nextTherapy.practitioner}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <Button size="sm" className="bg-gradient-primary">
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        Reschedule
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* AI Precaution Tips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5 text-healing" />
                      <span>Precaution Tips</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {precautions.map((tip, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-foreground">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Progress Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-wellness" />
                      <span>Progress Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Overall Recovery</span>
                        <span className="text-sm font-medium text-foreground">{progressSummary.overallRecovery.percentage}%</span>
                      </div>
                      <Progress value={progressSummary.overallRecovery.percentage} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Detox Phase</span>
                        <span className="text-sm font-medium text-foreground">{progressSummary.detoxPhase.status}</span>
                      </div>
                      <Progress value={progressSummary.detoxPhase.percentage} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Rejuvenation</span>
                        <span className="text-sm font-medium text-foreground">{progressSummary.rejuvenation.percentage}%</span>
                      </div>
                      <Progress value={progressSummary.rejuvenation.percentage} className="h-2" />
                    </div>

                    <div className="bg-success/10 rounded-lg p-3 mt-4">
                      <p className="text-sm text-success">
                        <strong>{progressSummary.overallRecovery.status} progress!</strong> You're showing significant improvement in energy levels and overall wellness.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-accent" />
                    <span>Recent Notifications</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {notifications.map((notification, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{notification.title}</p>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{notification.time} ago</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </main>

          {/* Mobile Navigation */}
          {isMobile && <MobileNavigation userType="patient" />}
        </div>
      </div>
    );
  };

  export default PatientDashboard;