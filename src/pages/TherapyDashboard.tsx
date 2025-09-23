import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import RealTimeTherapyTracker from '../components/therapy/RealTimeTherapyTracker';

const API_BASE_URL = 'http://localhost:5000/api';
import { 
  ArrowLeft, 
  Activity, 
  Calendar, 
  Clock, 
  FileText, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Plus,
  Edit
} from 'lucide-react';
import { motion } from 'framer-motion';

interface TherapyDashboardProps {
  userType: 'patient' | 'practitioner';
}

interface TherapyProgram {
  programId: string;
  programName: string;
  status: string;
  startDate: string;
  estimatedEndDate: string;
  patient: {
    firstName: string;
    lastName: string;
    email: string;
    age: number;
  };
  practitioner: {
    firstName: string;
    lastName: string;
    specialization: string;
  };
  sessions: Array<{
    sessionId: string;
    sessionNumber: number;
    scheduledDate: string;
    scheduledTime: string;
    status: 'scheduled' | 'completed' | 'cancelled' | 'missed';
    notes?: string;
    healthMetrics?: {
      weight?: number;
      bloodPressure?: {
        systolic: number;
        diastolic: number;
      };
      pulse?: number;
      notes?: string;
    };
  }>;
  healthProgress: Array<{
    date: string;
    metrics: {
      energy: number;
      sleep: number;
      digestion: number;
      mood: number;
      stress: number;
    };
    notes?: string;
  }>;
}

const TherapyDashboard: React.FC<TherapyDashboardProps> = ({ userType }) => {
  const { programId } = useParams<{ programId: string }>();
  const navigate = useNavigate();
  const [program, setProgram] = useState<TherapyProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (programId) {
      fetchProgramDetails();
    }
  }, [programId]);

  const fetchProgramDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/therapy/programs/${programId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProgram(data.data);
      } else {
        setError('Failed to fetch therapy program details');
      }
    } catch (error) {
      console.error('Error fetching program details:', error);
      setError('Failed to load therapy program');
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (update: any) => {
    try {
      const response = await fetch(`/api/therapy/programs/${programId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(update)
      });

      if (response.ok) {
        // Refresh the program data
        fetchProgramDetails();
      } else {
        console.error('Failed to update progress');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-purple-100 text-purple-700';
      case 'paused': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getSessionStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'scheduled': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'missed': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Loading therapy dashboard...</div>
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Therapy program not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{program.programName}</h1>
            <p className="text-muted-foreground">
              {userType === 'patient' 
                ? `Dr. ${program.practitioner.firstName} ${program.practitioner.lastName} - ${program.practitioner.specialization}`
                : `${program.patient.firstName} ${program.patient.lastName} - Age ${program.patient.age}`
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={getStatusColor(program.status)}>
            {program.status.charAt(0).toUpperCase() + program.status.slice(1)}
          </Badge>
          {userType === 'practitioner' && (
            <Button size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit Program
            </Button>
          )}
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div 
        className="grid gap-4 md:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Start Date</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(program.startDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Estimated End</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(program.estimatedEndDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Sessions</div>
                <div className="text-xs text-muted-foreground">
                  {program.sessions.filter(s => s.status === 'completed').length} / {program.sessions.length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Progress</div>
                <div className="text-xs text-muted-foreground">
                  {Math.round((program.sessions.filter(s => s.status === 'completed').length / program.sessions.length) * 100)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Real-Time Tracking</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="progress">Health Progress</TabsTrigger>
            <TabsTrigger value="notes">Notes & Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <RealTimeTherapyTracker 
              programId={programId!}
              userType={userType}
              onUpdateProgress={updateProgress}
            />
          </TabsContent>

          <TabsContent value="sessions" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Session History</h3>
                {userType === 'practitioner' && (
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Session
                  </Button>
                )}
              </div>
              
              <div className="space-y-3">
                {program.sessions.map((session, index) => (
                  <motion.div
                    key={session.sessionId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getSessionStatusIcon(session.status)}
                            <div>
                              <div className="font-medium">Session #{session.sessionNumber}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(session.scheduledDate).toLocaleDateString()} at {session.scheduledTime}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                            </Badge>
                            {session.healthMetrics && (
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        {session.notes && (
                          <div className="mt-3 p-3 bg-muted/50 rounded-md text-sm">
                            {session.notes}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Health Progress Tracking</h3>
              
              {program.healthProgress.length > 0 ? (
                <div className="space-y-3">
                  {program.healthProgress.slice(-10).map((entry, index) => (
                    <motion.div
                      key={entry.date}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="font-medium">{new Date(entry.date).toLocaleDateString()}</div>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="grid grid-cols-5 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Energy</div>
                              <div className="font-medium">{entry.metrics.energy}/10</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Sleep</div>
                              <div className="font-medium">{entry.metrics.sleep}/10</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Digestion</div>
                              <div className="font-medium">{entry.metrics.digestion}/10</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Mood</div>
                              <div className="font-medium">{entry.metrics.mood}/10</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Stress</div>
                              <div className="font-medium">{entry.metrics.stress}/10</div>
                            </div>
                          </div>
                          {entry.notes && (
                            <div className="mt-3 p-3 bg-muted/50 rounded-md text-sm">
                              {entry.notes}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-muted-foreground">No health progress data recorded yet</div>
                    {userType === 'patient' && (
                      <Button className="mt-4" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Health Entry
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="notes" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notes & Reports</CardTitle>
                <CardDescription>
                  Clinical notes, assessments, and progress reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Notes and reports feature coming soon</p>
                  <p className="text-sm mt-2">This will include detailed clinical assessments and progress reports</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default TherapyDashboard;