import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Activity, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Droplets,
  Wind,
  Heart,
  Brain,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

interface TherapyProgram {
  programId: string;
  programName: string;
  patient: {
    firstName: string;
    lastName: string;
  };
  practitioner: {
    firstName: string;
    lastName: string;
    specialization: string;
  };
  status: string;
  progress: {
    currentPhase: string;
    phaseInfo: {
      name: string;
      description: string;
      nextAction: string;
    };
    percentageComplete: number;
    completedSessions: number;
    totalSessions: number;
    phaseProgress: {
      purvaKarma: {
        snehanaCompleted: boolean;
        swedanaCompleted: boolean;
        preparationDays: number;
      };
      pradhanaKarma: {
        procedure: string;
        sessionCount: number;
        completed: boolean;
      };
      paschatKarma: {
        samasarjanaKrama: boolean;
        followUpDays: number;
      };
    };
    milestones: Array<{
      name: string;
      description: string;
      targetDate: string;
      achievedDate?: string;
      status: 'pending' | 'achieved' | 'delayed';
    }>;
  };
  nextSession?: {
    sessionNumber: number;
    scheduledDate: string;
    scheduledTime: string;
  };
  recentHealthMetrics: Array<{
    date: string;
    weight?: number;
    bloodPressure?: {
      systolic: number;
      diastolic: number;
    };
    notes?: string;
  }>;
}

interface RealTimeTherapyTrackerProps {
  programId: string;
  userType: 'patient' | 'practitioner';
  onUpdateProgress?: (update: any) => void;
}

const RealTimeTherapyTracker: React.FC<RealTimeTherapyTrackerProps> = ({
  programId,
  userType,
  onUpdateProgress
}) => {
  const [program, setProgram] = useState<TherapyProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTherapyStatus();
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchTherapyStatus, 30000);
    return () => clearInterval(interval);
  }, [programId]);

  const fetchTherapyStatus = async () => {
    try {
      const response = await fetch(`/api/therapy/programs/${programId}/real-time-status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProgram(data.data);
      } else {
        setError('Failed to fetch therapy status');
      }
    } catch (error) {
      console.error('Error fetching therapy status:', error);
      setError('Failed to load therapy status');
    } finally {
      setLoading(false);
    }
  };

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'preparation': return <User className="h-5 w-5" />;
      case 'purva-karma': return <Droplets className="h-5 w-5" />;
      case 'pradhana-karma': return <Heart className="h-5 w-5" />;
      case 'paschat-karma': return <Wind className="h-5 w-5" />;
      case 'completed': return <CheckCircle className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'preparation': return 'text-blue-600 bg-blue-100';
      case 'purva-karma': return 'text-orange-600 bg-orange-100';
      case 'pradhana-karma': return 'text-red-600 bg-red-100';
      case 'paschat-karma': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getProcedureIcon = (procedure: string) => {
    switch (procedure) {
      case 'vamana': return <Wind className="h-4 w-4" />;
      case 'virechana': return <Droplets className="h-4 w-4" />;
      case 'basti': return <Heart className="h-4 w-4" />;
      case 'nasya': return <Brain className="h-4 w-4" />;
      case 'raktamokshana': return <Zap className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading therapy status...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !program) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-red-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error || 'Therapy program not found'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Program Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                {program.programName}
              </CardTitle>
              <CardDescription>
                {userType === 'patient' 
                  ? `Dr. ${program.practitioner.firstName} ${program.practitioner.lastName}`
                  : `${program.patient.firstName} ${program.patient.lastName}`
                }
              </CardDescription>
            </div>
            <Badge className={getPhaseColor(program.progress.currentPhase)}>
              {getPhaseIcon(program.progress.currentPhase)}
              <span className="ml-1">{program.progress.phaseInfo.name}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Overall Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">
                  {program.progress.completedSessions}/{program.progress.totalSessions} sessions
                </span>
              </div>
              <Progress value={program.progress.percentageComplete} className="h-2" />
            </div>

            {/* Current Phase Description */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">{program.progress.phaseInfo.name}</h4>
              <p className="text-sm text-muted-foreground mb-2">
                {program.progress.phaseInfo.description}
              </p>
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <TrendingUp className="h-4 w-4" />
                Next: {program.progress.phaseInfo.nextAction}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phase Progress Details */}
      <Card>
        <CardHeader>
          <CardTitle>Panchakarma Phase Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Purva Karma */}
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-orange-600" />
                <span className="font-medium">Purva Karma</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span>Snehana (Oleation)</span>
                  {program.progress.phaseProgress.purvaKarma.snehanaCompleted ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Swedana (Sudation)</span>
                  {program.progress.phaseProgress.purvaKarma.swedanaCompleted ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                  )}
                </div>
                <div className="text-muted-foreground">
                  {program.progress.phaseProgress.purvaKarma.preparationDays} preparation days
                </div>
              </div>
            </motion.div>

            {/* Pradhana Karma */}
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2">
                {getProcedureIcon(program.progress.phaseProgress.pradhanaKarma.procedure)}
                <span className="font-medium">Pradhana Karma</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span>Procedure</span>
                  <Badge variant="outline" className="text-xs">
                    {program.progress.phaseProgress.pradhanaKarma.procedure || 'TBD'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Sessions</span>
                  <span>{program.progress.phaseProgress.pradhanaKarma.sessionCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Status</span>
                  {program.progress.phaseProgress.pradhanaKarma.completed ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <span className="text-muted-foreground">In Progress</span>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Paschat Karma */}
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-green-600" />
                <span className="font-medium">Paschat Karma</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span>Samasarjana Krama</span>
                  {program.progress.phaseProgress.paschatKarma.samasarjanaKrama ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                  )}
                </div>
                <div className="text-muted-foreground">
                  {program.progress.phaseProgress.paschatKarma.followUpDays} follow-up days
                </div>
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Next Session & Milestones */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Next Session */}
        {program.nextSession && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Next Session
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Session #{program.nextSession.sessionNumber}</span>
                  <Badge variant="outline">Scheduled</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(program.nextSession.scheduledDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {program.nextSession.scheduledTime}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Milestones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {program.progress.milestones.slice(-3).map((milestone, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center justify-between"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div>
                    <div className="font-medium text-sm">{milestone.name}</div>
                    <div className="text-xs text-muted-foreground">{milestone.description}</div>
                  </div>
                  <Badge 
                    variant={milestone.status === 'achieved' ? 'default' : 'outline'}
                    className={
                      milestone.status === 'achieved' ? 'bg-green-100 text-green-700' :
                      milestone.status === 'delayed' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }
                  >
                    {milestone.status}
                  </Badge>
                </motion.div>
              ))}
              {program.progress.milestones.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No milestones set yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RealTimeTherapyTracker;