import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp,
  Activity,
  Heart,
  Brain,
  Calendar,
  Award,
  Target,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { useMediaQuery } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import ResponsiveSidebar from '@/components/navigation/ResponsiveSidebar';
import MobileNavigation from '@/components/navigation/MobileNavigation';

const ProgressTracking = () => {
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

  const progressData = [
    { date: 'Week 1', overall: 20, detox: 30, rejuvenation: 10, symptoms: 80 },
    { date: 'Week 2', overall: 35, detox: 60, rejuvenation: 15, symptoms: 65 },
    { date: 'Week 3', overall: 50, detox: 85, rejuvenation: 25, symptoms: 45 },
    { date: 'Week 4', overall: 65, detox: 95, rejuvenation: 45, symptoms: 30 },
    { date: 'Week 5', overall: 80, detox: 100, rejuvenation: 70, symptoms: 20 },
    { date: 'Week 6', overall: 85, detox: 100, rejuvenation: 85, symptoms: 15 },
  ];

  const therapyData = [
    { therapy: 'Abhyanga', completed: 12, total: 15 },
    { therapy: 'Swedana', completed: 8, total: 10 },
    { therapy: 'Virechana', completed: 3, total: 5 },
    { therapy: 'Basti', completed: 6, total: 8 },
    { therapy: 'Nasya', completed: 4, total: 6 },
  ];

  const symptomData = [
    { name: 'Improved', value: 85, color: '#22c55e' },
    { name: 'Same', value: 10, color: '#f59e0b' },
    { name: 'Worsened', value: 5, color: '#ef4444' },
  ];

  const milestones = [
    {
      id: 1,
      title: 'Detox Phase Complete',
      description: 'Successfully completed the initial detoxification phase',
      date: '2024-02-15',
      completed: true,
      type: 'major'
    },
    {
      id: 2,
      title: '10 Sessions Milestone',
      description: 'Completed 10 therapy sessions with excellent compliance',
      date: '2024-02-28',
      completed: true,
      type: 'therapy'
    },
    {
      id: 3,
      title: 'Energy Level Improvement',
      description: 'Reported significant improvement in daily energy levels',
      date: '2024-03-05',
      completed: true,
      type: 'health'
    },
    {
      id: 4,
      title: 'Rejuvenation Phase Start',
      description: 'Beginning the rejuvenation phase of treatment',
      date: '2024-03-10',
      completed: false,
      type: 'major'
    },
    {
      id: 5,
      title: 'Treatment Completion',
      description: 'Complete full Panchakarma treatment cycle',
      date: '2024-03-25',
      completed: false,
      type: 'major'
    }
  ];

  const getCurrentPhase = () => {
    const completedMajorMilestones = milestones.filter(m => m.completed && m.type === 'major').length;
    const phases = ['Preparation', 'Detox', 'Rejuvenation', 'Maintenance'];
    return phases[completedMajorMilestones] || 'Preparation';
  };

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
              <h1 className="text-lg md:text-xl font-semibold text-foreground">Progress Tracking</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Current Phase: {getCurrentPhase()}
              </Badge>
            </div>
          </div>
        </header>

        <div className="p-3 md:p-4">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              {!isMobile && <TabsTrigger value="therapies">Therapies</TabsTrigger>}
              {!isMobile && <TabsTrigger value="milestones">Milestones</TabsTrigger>}
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Progress Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="border-border/50">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground">85%</p>
                          <p className="text-sm text-muted-foreground">Overall Progress</p>
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
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground">33</p>
                          <p className="text-sm text-muted-foreground">Sessions Done</p>
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
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-healing/10 rounded-lg flex items-center justify-center">
                          <Heart className="h-5 w-5 text-healing" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground">4.8</p>
                          <p className="text-sm text-muted-foreground">Health Score</p>
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
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                          <Clock className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground">12</p>
                          <p className="text-sm text-muted-foreground">Days Left</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Progress Breakdown */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-primary" />
                      <span>Recovery Progress</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Overall Recovery</span>
                        <span className="text-sm font-medium text-foreground">85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Detox Phase</span>
                        <span className="text-sm font-medium text-foreground">Complete</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Rejuvenation</span>
                        <span className="text-sm font-medium text-foreground">85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>

                    <div className="bg-success/10 rounded-lg p-3 mt-4">
                      <p className="text-sm text-success">
                        <strong>Excellent progress!</strong> You're showing significant improvement in energy levels and overall wellness.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="h-5 w-5 text-healing" />
                      <span>Symptom Improvement</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            dataKey="value"
                            data={symptomData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                          >
                            {symptomData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value}%`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center space-x-4 mt-4">
                      {symptomData.map((item) => (
                        <div key={item.name} className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className="text-sm text-muted-foreground">
                            {item.name} ({item.value}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Trends Tab */}
            <TabsContent value="trends" className="space-y-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <span>Progress Trends</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={progressData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="overall" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          name="Overall Progress"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="detox" 
                          stroke="hsl(var(--healing))" 
                          strokeWidth={2}
                          name="Detox Progress"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="rejuvenation" 
                          stroke="hsl(var(--wellness))" 
                          strokeWidth={2}
                          name="Rejuvenation"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Therapies Tab */}
            {!isMobile && (
              <TabsContent value="therapies" className="space-y-6">
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span>Therapy Progress</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {therapyData.map((therapy) => (
                        <div key={therapy.therapy} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-foreground">{therapy.therapy}</span>
                            <span className="text-sm text-muted-foreground">
                              {therapy.completed}/{therapy.total} sessions
                            </span>
                          </div>
                          <Progress 
                            value={(therapy.completed / therapy.total) * 100} 
                            className="h-2"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Milestones Tab */}
            {!isMobile && (
              <TabsContent value="milestones" className="space-y-6">
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Award className="h-5 w-5 text-primary" />
                      <span>Treatment Milestones</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {milestones.map((milestone, index) => (
                        <motion.div
                          key={milestone.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`flex items-start space-x-4 p-4 rounded-lg border ${
                            milestone.completed 
                              ? 'bg-success/5 border-success/20' 
                              : 'bg-muted/30 border-border/50'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            milestone.completed 
                              ? 'bg-success text-white' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {milestone.completed ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Target className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">{milestone.title}</h3>
                            <p className="text-sm text-muted-foreground mb-1">{milestone.description}</p>
                            <p className="text-xs text-muted-foreground">{milestone.date}</p>
                          </div>
                          <Badge 
                            variant={milestone.completed ? "default" : "secondary"}
                            className={milestone.completed ? "bg-success" : ""}
                          >
                            {milestone.completed ? "Completed" : "Pending"}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobile && <MobileNavigation userType="patient" />}

      {/* Mobile Sidebar */}
      {isMobile && (
        <ResponsiveSidebar 
          userType="patient" 
          userName={((): string => { try { const raw = localStorage.getItem('user'); if (!raw) return 'Patient'; const user = JSON.parse(raw); return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Patient'; } catch { return 'Patient'; } })()}
          userRole="Patient"
        />
      )}
    </div>
  );
};

export default ProgressTracking;