import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, TrendingUp, TrendingDown, Calendar, User, Award, Activity } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ProgressReportProps {
  programId: string;
  onClose?: () => void;
}

interface ProgressReportData {
  programInfo: {
    programId: string;
    programName: string;
    patient: {
      name: string;
      age: number;
      gender: string;
    };
    practitioner: {
      name: string;
      specialization: string;
    };
    startDate: string;
    endDate?: string;
    status: string;
    totalDuration: number;
  };
  progressMetrics: {
    completionRate: number;
    completedProcedures: number;
    totalProcedures: number;
    remainingProcedures: number;
  };
  procedureTimeline: Array<{
    type: string;
    status: string;
    startDate?: string;
    completionDate?: string;
    duration?: number;
    feedback?: any;
  }>;
  feedbackAnalysis: {
    // Overall metrics
    overallSatisfaction: number;
    recommendationRate: number;
    
    // Traditional metrics (backward compatibility)
    averagePainReduction: number;
    averageEnergyImprovement: number;
    averageSleepImprovement: number;
    averageAppetiteImprovement: number;
    
    // Comprehensive positive aspects averages
    positiveAspectsAverage: {
      relaxation: number;
      painRelief: number;
      energyBoost: number;
      mentalClarity: number;
      sleepImprovement: number;
      digestiveHealth: number;
      skinGlow: number;
      stressReduction: number;
      mobilityImprovement: number;
      overallWellbeing: number;
    };
    
    // Comprehensive negative aspects averages
    negativeAspectsAverage: {
      discomfort: number;
      fatigue: number;
      nausea: number;
      headache: number;
      dizziness: number;
      skinIrritation: number;
      digestiveUpset: number;
      sleepDisturbance: number;
      emotionalChanges: number;
      mobilityIssues: number;
    };
    
    // Additional metrics
    averageComfortLevel: number;
    averageTherapistRating: number;
    
    // Legacy data
    commonSideEffects: Record<string, number>;
    positiveSymptoms: Record<string, number>;
    
    // Chart data
    progressByProcedure: Array<{
      procedure: string;
      overallExperience: number;
      painLevel: number;
      energyLevel: number;
      sleepQuality: number;
      appetiteLevel: number;
      comfortLevel: number;
      therapistRating: number;
      order: number;
      positiveAspects: Record<string, number>;
      negativeAspects: Record<string, number>;
    }>;
    healthMetricsTrend: Array<{
      procedure: string;
      painReduction: number;
      energyLevel: number;
      sleepQuality: number;
      appetiteLevel: number;
      overallSatisfaction: number;
      comfortLevel: number;
      therapistRating: number;
    }>;
    positiveAspectsTrend: Array<{
      procedure: string;
      procedureIndex: number;
      [key: string]: any;
    }>;
    negativeAspectsTrend: Array<{
      procedure: string;
      procedureIndex: number;
      [key: string]: any;
    }>;
  };
  recommendations: Array<{
    type: string;
    priority: string;
    message: string;
  }>;
  generatedAt: string;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

const ProgressReport: React.FC<ProgressReportProps> = ({ programId, onClose }) => {
  const [reportData, setReportData] = useState<ProgressReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate random demo data for demonstration
  const generateDemoData = (): ProgressReportData => {
    const procedures = ['Abhyanga', 'Shirodhara', 'Udvartana', 'Swedana', 'Basti'];
    const positiveAspects = ['relaxation', 'painRelief', 'energyBoost', 'mentalClarity', 'sleepImprovement', 'digestiveHealth', 'skinGlow', 'stressReduction', 'mobilityImprovement', 'overallWellbeing'];
    const negativeAspects = ['discomfort', 'fatigue', 'nausea', 'headache', 'dizziness', 'skinIrritation', 'digestiveUpset', 'sleepDisturbance', 'emotionalChanges', 'mobilityIssues'];
    
    // Generate random positive aspects averages
    const positiveAspectsAverage = {
      relaxation: Math.random() * 3 + 2,
      painRelief: Math.random() * 3 + 2,
      energyBoost: Math.random() * 3 + 2,
      mentalClarity: Math.random() * 3 + 2,
      sleepImprovement: Math.random() * 3 + 2,
      digestiveHealth: Math.random() * 3 + 2,
      skinGlow: Math.random() * 3 + 2,
      stressReduction: Math.random() * 3 + 2,
      mobilityImprovement: Math.random() * 3 + 2,
      overallWellbeing: Math.random() * 3 + 2
    };
    
    // Generate random negative aspects averages (lower is better)
    const negativeAspectsAverage = {
      discomfort: Math.random() * 2,
      fatigue: Math.random() * 2,
      nausea: Math.random() * 2,
      headache: Math.random() * 2,
      dizziness: Math.random() * 2,
      skinIrritation: Math.random() * 2,
      digestiveUpset: Math.random() * 2,
      sleepDisturbance: Math.random() * 2,
      emotionalChanges: Math.random() * 2,
      mobilityIssues: Math.random() * 2
    };
    
    // Generate health metrics trend data
    const healthMetricsTrend = procedures.map((procedure, index) => ({
      procedure,
      painReduction: Math.random() * 3 + 5, // 5-8 range
      energyLevel: Math.random() * 2 + 6, // 6-8 range
      sleepQuality: Math.random() * 2 + 6, // 6-8 range
      appetiteLevel: Math.random() * 2 + 6, // 6-8 range
      overallSatisfaction: Math.random() * 1.5 + 3.5, // 3.5-5 range
      comfortLevel: Math.random() * 1.5 + 3.5, // 3.5-5 range
      therapistRating: Math.random() * 1 + 4 // 4-5 range
    }));
    
    // Generate progress by procedure data
    const progressByProcedure = procedures.map((procedure, index) => ({
      procedure,
      overallExperience: Math.random() * 1.5 + 3.5, // 3.5-5 range
      painLevel: Math.random() * 3 + 5,
      energyLevel: Math.random() * 2 + 6,
      sleepQuality: Math.random() * 2 + 6,
      appetiteLevel: Math.random() * 2 + 6,
      comfortLevel: Math.random() * 1.5 + 3.5,
      therapistRating: Math.random() * 1 + 4,
      order: index + 1,
      positiveAspects: Object.fromEntries(
        positiveAspects.map(aspect => [aspect, Math.random() * 3 + 2])
      ),
      negativeAspects: Object.fromEntries(
        negativeAspects.map(aspect => [aspect, Math.random() * 2])
      )
    }));
    
    // Generate positive aspects trend data
    const positiveAspectsTrend = procedures.map((procedure, index) => {
      const data: any = {
        procedure,
        procedureIndex: index + 1
      };
      positiveAspects.forEach(aspect => {
        data[aspect] = Math.random() * 3 + 2; // 2-5 range
      });
      return data;
    });
    
    // Generate negative aspects trend data
    const negativeAspectsTrend = procedures.map((procedure, index) => {
      const data: any = {
        procedure,
        procedureIndex: index + 1
      };
      negativeAspects.forEach(aspect => {
        data[aspect] = Math.random() * 2; // 0-2 range
      });
      return data;
    });

    return {
      programInfo: {
        programId: programId || 'demo-program-123',
        programName: 'Complete Panchakarma Therapy Program',
        patient: {
          name: 'Mr Harsh Jain',
          age: 34,
          gender: 'Male'
        },
        practitioner: {
          name: 'Dr. Suyash Dangi',
          specialization: 'Panchakarma Specialist'
        },
        startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        endDate: new Date().toISOString(),
        status: 'completed',
        totalDuration: 1
      },
      progressMetrics: {
        completionRate: 100,
        completedProcedures: 5,
        totalProcedures: 5,
        remainingProcedures: 0
      },
      procedureTimeline: procedures.map((procedure, index) => ({
        type: procedure.toLowerCase(),
        status: 'completed',
        startDate: new Date(Date.now() - (25 - index * 5) * 24 * 60 * 60 * 1000).toISOString(),
        completionDate: new Date(Date.now() - (20 - index * 5) * 24 * 60 * 60 * 1000).toISOString(),
        duration: 3,
        feedback: {
          overallExperience: Math.random() * 1.5 + 3.5,
          painLevel: Math.random() * 3 + 2,
          energyLevel: Math.random() * 2 + 6
        }
      })),
      feedbackAnalysis: {
        overallSatisfaction: 4.3,
        recommendationRate: 92,
        averagePainReduction: 6.8,
        averageEnergyImprovement: 7.2,
        averageSleepImprovement: 7.5,
        averageAppetiteImprovement: 6.9,
        positiveAspectsAverage,
        negativeAspectsAverage,
        averageComfortLevel: 4.4,
        averageTherapistRating: 4.7,
        commonSideEffects: {
          'Mild fatigue': 2,
          'Temporary headache': 1,
          'Skin sensitivity': 1
        },
        positiveSymptoms: {
          'Deep relaxation': 5,
          'Better sleep': 4,
          'Reduced stress': 5,
          'Improved energy': 4,
          'Pain relief': 3
        },
        progressByProcedure,
        healthMetricsTrend,
        positiveAspectsTrend,
        negativeAspectsTrend
      },
      recommendations: [
        {
          type: 'follow-up',
          priority: 'medium',
          message: 'Schedule a follow-up consultation in 2-4 weeks to assess long-term benefits and plan maintenance therapy.'
        },
        {
          type: 'lifestyle',
          priority: 'high',
          message: 'Continue daily meditation and yoga practice to maintain the stress reduction benefits achieved during therapy.'
        },
        {
          type: 'diet',
          priority: 'medium',
          message: 'Follow the prescribed Ayurvedic diet plan for at least 6 more weeks to support digestive health improvements.'
        },
        {
          type: 'exercise',
          priority: 'low',
          message: 'Gradually increase physical activity while maintaining the improved energy levels from treatment.'
        }
      ],
      generatedAt: new Date().toISOString()
    };
  };

  useEffect(() => {
    const fetchProgressReport = async () => {
      try {
        setLoading(true);
        
        // Simulate API loading time
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // For demo purposes, always use generated demo data
        const demoData = generateDemoData();
        console.log('Using demo progress report data:', demoData);
        setReportData(demoData);
        
        /* 
        // Original API call (commented out for demo)
        const token = localStorage.getItem('token');
        console.log('Fetching progress report for programId:', programId);
        
        const response = await fetch(`http://localhost:5000/api/therapy/programs/${programId}/progress-report`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch progress report: ${response.status}`);
        }

        const result = await response.json();
        console.log('Progress report API response:', result);
        
        if (result.success) {
          console.log('Progress report data:', result.data);
          setReportData(result.data);
        } else {
          throw new Error('Failed to generate progress report');
        }
        */
      } catch (error) {
        console.error('Error fetching progress report:', error);
        // In case of error, still show demo data for demonstration
        const demoData = generateDemoData();
        setReportData(demoData);
        // setError(error instanceof Error ? error.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProgressReport();
  }, [programId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Generating comprehensive progress report with demo data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="m-4">
        <AlertDescription>
          Error loading progress report: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!reportData) {
    return (
      <Alert className="m-4">
        <AlertDescription>
          No progress report data available.
        </AlertDescription>
      </Alert>
    );
  }

  const { programInfo, progressMetrics, feedbackAnalysis, procedureTimeline, recommendations } = reportData;

  // Prepare data for different chart types with proper fallbacks
  const healthMetricsData = feedbackAnalysis?.healthMetricsTrend || [];
  
  console.log('Health metrics data:', healthMetricsData);
  console.log('Feedback analysis:', feedbackAnalysis);
  
  // Enhanced radar chart with comprehensive positive aspects
  const radarData = [
    {
      metric: 'Relaxation',
      value: feedbackAnalysis?.positiveAspectsAverage?.relaxation || 0,
      fullMark: 5
    },
    {
      metric: 'Pain Relief',
      value: feedbackAnalysis?.positiveAspectsAverage?.painRelief || 0,
      fullMark: 5
    },
    {
      metric: 'Energy Boost',
      value: feedbackAnalysis?.positiveAspectsAverage?.energyBoost || 0,
      fullMark: 5
    },
    {
      metric: 'Mental Clarity',
      value: feedbackAnalysis?.positiveAspectsAverage?.mentalClarity || 0,
      fullMark: 5
    },
    {
      metric: 'Sleep Quality',
      value: feedbackAnalysis?.positiveAspectsAverage?.sleepImprovement || 0,
      fullMark: 5
    },
    {
      metric: 'Digestive Health',
      value: feedbackAnalysis?.positiveAspectsAverage?.digestiveHealth || 0,
      fullMark: 5
    },
    {
      metric: 'Stress Reduction',
      value: feedbackAnalysis?.positiveAspectsAverage?.stressReduction || 0,
      fullMark: 5
    },
    {
      metric: 'Overall Wellbeing',
      value: feedbackAnalysis?.positiveAspectsAverage?.overallWellbeing || 0,
      fullMark: 5
    }
  ];

  console.log('Radar chart data:', radarData);

  // Prepare positive aspects trend data for line chart
  const positiveAspectsData = feedbackAnalysis?.positiveAspectsTrend || [];
  
  console.log('Positive aspects trend data:', positiveAspectsData);
  
  // Prepare negative aspects data for monitoring
  const negativeAspectsData = Object.entries(feedbackAnalysis?.negativeAspectsAverage || {})
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));

  console.log('Negative aspects data:', negativeAspectsData);

  const sideEffectsData = Object.entries(feedbackAnalysis?.commonSideEffects || {}).map(([name, value]) => ({
    name,
    value
  }));

  const positiveSymptoms = Object.entries(feedbackAnalysis?.positiveSymptoms || {}).map(([name, value]) => ({
    name,
    value
  }));

  console.log('Side effects data:', sideEffectsData);
  console.log('Positive symptoms data:', positiveSymptoms);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'upcoming': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Demo Banner */}


      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Progress Report</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive analysis of {programInfo.programName} program
          </p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close Report
          </Button>
        )}
      </div>

      {/* Program Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Program Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Patient</p>
              <p className="font-semibold">{programInfo.patient.name}</p>
              <p className="text-sm text-gray-500">
                {programInfo.patient.age} years, {programInfo.patient.gender}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Practitioner</p>
              <p className="font-semibold">{programInfo.practitioner.name}</p>
              <p className="text-sm text-gray-500">{programInfo.practitioner.specialization}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="font-semibold">{programInfo.totalDuration} days</p>
              <p className="text-sm text-gray-500">
                {new Date(programInfo.startDate).toLocaleDateString()} - 
                {programInfo.endDate ? new Date(programInfo.endDate).toLocaleDateString() : 'Ongoing'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <Badge variant={programInfo.status === 'completed' ? 'default' : 'secondary'}>
                {programInfo.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold">{progressMetrics.completionRate}%</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={progressMetrics.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Procedures</p>
                <p className="text-2xl font-bold">{progressMetrics.completedProcedures}</p>
              </div>
              <Award className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              of {progressMetrics.totalProcedures} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overall Satisfaction</p>
                <p className="text-2xl font-bold">{(feedbackAnalysis?.overallSatisfaction || 0).toFixed(1)}/5</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {Math.round(feedbackAnalysis?.recommendationRate || 0)}% would recommend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Therapist Rating</p>
                <p className="text-2xl font-bold">{(feedbackAnalysis?.averageTherapistRating || 0).toFixed(1)}/5</p>
              </div>
              <User className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-sm text-gray-500 mt-1">Average practitioner rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Progress Metrics - Additional Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Comfort Level</p>
                <p className="text-2xl font-bold">{(feedbackAnalysis?.averageComfortLevel || 0).toFixed(1)}/5</p>
              </div>
              <span className="text-2xl">😌</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Average treatment comfort</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stress Reduction</p>
                <p className="text-2xl font-bold">{(feedbackAnalysis?.positiveAspectsAverage?.stressReduction || 0).toFixed(1)}/5</p>
              </div>
              <span className="text-2xl">🎯</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Average stress relief rating</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Wellbeing Improvement</p>
                <p className="text-2xl font-bold">{(feedbackAnalysis?.positiveAspectsAverage?.overallWellbeing || 0).toFixed(1)}/5</p>
              </div>
              <span className="text-2xl">🌟</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Overall wellness rating</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pain Relief</p>
                <p className="text-2xl font-bold">{(feedbackAnalysis?.positiveAspectsAverage?.painRelief || 0).toFixed(1)}/5</p>
              </div>
              <TrendingDown className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-sm text-gray-500 mt-1">Pain relief effectiveness</p>
          </CardContent>
        </Card>
      </div>

      {/* Health Metrics Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Health Metrics Progression</CardTitle>
          <CardDescription>
            Track improvement across different health indicators throughout the program
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={healthMetricsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="procedure" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="painReduction" stroke="#ef4444" strokeWidth={2} name="Pain Reduction" />
              <Line type="monotone" dataKey="energyLevel" stroke="#22c55e" strokeWidth={2} name="Energy Level" />
              <Line type="monotone" dataKey="sleepQuality" stroke="#3b82f6" strokeWidth={2} name="Sleep Quality" />
              <Line type="monotone" dataKey="appetiteLevel" stroke="#f59e0b" strokeWidth={2} name="Appetite" />
              <Line type="monotone" dataKey="overallSatisfaction" stroke="#8b5cf6" strokeWidth={2} name="Satisfaction" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Radar Chart for Overall Health Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Health Profile Overview</CardTitle>
            <CardDescription>
              Comprehensive view of health improvements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={18} domain={[0, 5]} tick={false} />
                <Radar name="Positive Health Effects" dataKey="value" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Procedure Progress Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Progress by Procedure</CardTitle>
            <CardDescription>
              Individual procedure satisfaction ratings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={feedbackAnalysis?.progressByProcedure || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="procedure" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar dataKey="overallExperience" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Comprehensive Positive Aspects Trend */}
      {positiveAspectsData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Positive Effects Progression</CardTitle>
            <CardDescription>
              Track improvement in positive health aspects across procedures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={positiveAspectsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="procedure" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="relaxation" stroke="#8b5cf6" strokeWidth={2} name="Relaxation" />
                <Line type="monotone" dataKey="painRelief" stroke="#ef4444" strokeWidth={2} name="Pain Relief" />
                <Line type="monotone" dataKey="energyBoost" stroke="#22c55e" strokeWidth={2} name="Energy Boost" />
                <Line type="monotone" dataKey="mentalClarity" stroke="#3b82f6" strokeWidth={2} name="Mental Clarity" />
                <Line type="monotone" dataKey="stressReduction" stroke="#f59e0b" strokeWidth={2} name="Stress Reduction" />
                <Line type="monotone" dataKey="overallWellbeing" stroke="#10b981" strokeWidth={2} name="Overall Wellbeing" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Negative Aspects Monitoring */}
      {negativeAspectsData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Side Effects Monitoring</CardTitle>
            <CardDescription>
              Average severity of reported negative effects (lower is better)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={negativeAspectsData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 5]} />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="value" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Side Effects and Positive Symptoms */}
      {(sideEffectsData.length > 0 || positiveSymptoms.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sideEffectsData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Reported Side Effects</CardTitle>
                <CardDescription>
                  Frequency of side effects reported during treatment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sideEffectsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sideEffectsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {positiveSymptoms.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Positive Symptoms</CardTitle>
                <CardDescription>
                  Beneficial effects reported by patients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={positiveSymptoms}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#82ca9d"
                      dataKey="value"
                    >
                      {positiveSymptoms.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Procedure Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Procedure Timeline
          </CardTitle>
          <CardDescription>
            Detailed timeline of all procedures in the program
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {procedureTimeline.map((procedure, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(procedure.status)}`}></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold capitalize">{procedure.type.replace('_', ' ')}</h4>
                    <Badge variant="outline">{procedure.status.replace('_', ' ')}</Badge>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {procedure.startDate && (
                      <span>Started: {new Date(procedure.startDate).toLocaleDateString()}</span>
                    )}
                    {procedure.completionDate && (
                      <span className="ml-4">
                        Completed: {new Date(procedure.completionDate).toLocaleDateString()}
                      </span>
                    )}
                    {procedure.duration && (
                      <span className="ml-4">Duration: {procedure.duration} days</span>
                    )}
                  </div>
                  {procedure.feedback && (
                    <div className="mt-2 text-sm">
                      <span className="text-gray-600">Patient feedback: </span>
                      <span className="font-medium">
                        {procedure.feedback.overallExperience}/10 satisfaction
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>
              Personalized recommendations based on progress and feedback
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <Alert key={index}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getPriorityColor(rec.priority)}>
                          {rec.priority} priority
                        </Badge>
                        <span className="text-sm text-gray-600 capitalize">
                          {rec.type.replace('-', ' ')}
                        </span>
                      </div>
                      <AlertDescription>{rec.message}</AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Footer */}
      <div className="text-center text-sm text-gray-500 pt-4 border-t">
        Report generated on {new Date(reportData.generatedAt).toLocaleString()}
      </div>
    </div>
  );
};

export default ProgressReport;