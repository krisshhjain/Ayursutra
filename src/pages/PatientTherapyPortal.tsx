import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Calendar, Clock, Star, Activity, CheckCircle, AlertCircle, Eye, BookOpen, Leaf, Heart, RefreshCw, Send, BarChart3 } from 'lucide-react';
import ResponsiveSidebar from '../components/navigation/ResponsiveSidebar';
import MobileNavigation from '../components/navigation/MobileNavigation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Checkbox } from '../components/ui/checkbox';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import ProgressReport from '../components/ProgressReport';

const PatientTherapyPortal = () => {
  const navigate = useNavigate();
  const [therapyTemplates, setTherapyTemplates] = useState([]);
  const [myPrograms, setMyPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    programId: null,
    procedureType: null,
    procedure: null
  });
  const [feedbackData, setFeedbackData] = useState({
    // Overall experience
    overallExperience: 5,
    wouldRecommend: true,
    
    // Positive aspects (1-5 scale)
    positiveAspects: {
      relaxation: 0,
      painRelief: 0,
      energyBoost: 0,
      mentalClarity: 0,
      sleepImprovement: 0,
      digestiveHealth: 0,
      skinGlow: 0,
      stressReduction: 0,
      mobilityImprovement: 0,
      overallWellbeing: 0
    },
    
    // Negative aspects (1-5 scale)
    negativeAspects: {
      discomfort: 0,
      fatigue: 0,
      nausea: 0,
      headache: 0,
      dizziness: 0,
      skinIrritation: 0,
      digestiveUpset: 0,
      sleepDisturbance: 0,
      emotionalChanges: 0,
      mobilityIssues: 0
    },
    
    // Traditional metrics (backward compatibility)
    painLevel: 5,
    energyLevel: 5,
    sleepQuality: 3,
    appetiteLevel: 3,
    
    // Additional metrics
    comfortLevel: 3,
    therapistRating: 5,
    treatmentDuration: '',
    
    // Descriptive feedback
    symptoms: [],
    sideEffects: [],
    specificSymptoms: [],
    additionalComments: ''
  });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [showProgressReport, setShowProgressReport] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState(null);

  const handleViewProgressReport = (programId) => {
    setSelectedProgramId(programId);
    setShowProgressReport(true);
  };

  useEffect(() => {
    fetchTherapyData();
    
    // Auto-refresh every 30 seconds to stay in sync with practitioner updates
    const interval = setInterval(fetchTherapyData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchTherapyData = async () => {
    try {
      setRefreshing(true);
      // Fetch available therapy templates
      const templatesResponse = await fetch('/api/therapy/templates', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json();
        setTherapyTemplates(templatesData.success ? templatesData.data : []);
      }

      // Fetch my therapy programs
      const programsResponse = await fetch('/api/therapy/my-programs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (programsResponse.ok) {
        const programsData = await programsResponse.json();
        setMyPrograms(programsData.success ? programsData.data : []);
      }
    } catch (error) {
      console.error('Error fetching therapy data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleManualRefresh = async () => {
    await fetchTherapyData();
  };

  const requestTherapyProgram = async (templateId) => {
    try {
      const response = await fetch('/api/therapy/request-program', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          templateId,
          message: 'I would like to enroll in this therapy program'
        })
      });

      if (response.ok) {
        alert('Therapy program request sent successfully! Your practitioner will contact you soon.');
        fetchTherapyData(); // Refresh data
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error requesting therapy program:', error);
      alert('Failed to send therapy program request');
    }
  };

  const handleProvideFeedback = (programId) => {
    // Find the first completed procedure that needs feedback
    const program = myPrograms.find(p => p._id === programId);
    if (program && program.procedureDetails) {
      const procedureNeedingFeedback = program.procedureDetails.find(
        p => (p.isCompleted || p.status === 'completed') && 
             (!p.patientFeedback || (p.feedbackRequired && !p.feedbackReceived))
      );
      
      if (procedureNeedingFeedback) {
        setFeedbackModal({
          isOpen: true,
          programId: programId,
          procedureType: procedureNeedingFeedback.type,
          procedure: procedureNeedingFeedback
        });
        // Reset feedback form to match new structure
        setFeedbackData({
          // Overall experience
          overallExperience: 5,
          wouldRecommend: true,
          
          // Positive aspects (1-5 scale)
          positiveAspects: {
            relaxation: 0,
            painRelief: 0,
            energyBoost: 0,
            mentalClarity: 0,
            sleepImprovement: 0,
            digestiveHealth: 0,
            skinGlow: 0,
            stressReduction: 0,
            mobilityImprovement: 0,
            overallWellbeing: 0
          },
          
          // Negative aspects (1-5 scale)
          negativeAspects: {
            discomfort: 0,
            fatigue: 0,
            nausea: 0,
            headache: 0,
            dizziness: 0,
            skinIrritation: 0,
            digestiveUpset: 0,
            sleepDisturbance: 0,
            emotionalChanges: 0,
            mobilityIssues: 0
          },
          
          // Traditional metrics (backward compatibility)
          painLevel: 5,
          energyLevel: 5,
          sleepQuality: 3,
          appetiteLevel: 3,
          
          // Additional metrics
          comfortLevel: 3,
          therapistRating: 5,
          treatmentDuration: '',
          
          // Descriptive feedback
          symptoms: [],
          sideEffects: [],
          specificSymptoms: [],
          additionalComments: ''
        });
      }
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);

    try {
      const response = await fetch(`/api/therapy/programs/${feedbackModal.programId}/procedures/${feedbackModal.procedureType}/patient-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(feedbackData)
      });

      const result = await response.json();
      
      if (result.success) {
        alert('✅ Feedback submitted successfully! Thank you for your input.');
        
        if (result.nextSteps?.nextProcedure) {
          alert(`Next procedure (${result.nextSteps.nextProcedure}) is now available for scheduling.`);
        } else if (result.nextSteps?.programCompleted) {
          alert('🎉 Congratulations! You have completed your entire Panchakarma program. A comprehensive progress report is now available.');
        }
        
        setFeedbackModal({ isOpen: false, programId: null, procedureType: null, procedure: null });
        await fetchTherapyData(); // Refresh data
      } else {
        alert(`Failed to submit feedback: ${result.message}`);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleSymptomChange = (symptom, checked) => {
    setFeedbackData(prev => ({
      ...prev,
      symptoms: checked 
        ? [...prev.symptoms, symptom]
        : prev.symptoms.filter(s => s !== symptom)
    }));
  };

  const handleSideEffectChange = (effect, checked) => {
    setFeedbackData(prev => ({
      ...prev,
      sideEffects: checked 
        ? [...prev.sideEffects, effect]
        : prev.sideEffects.filter(e => e !== effect)
    }));
  };

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'panchakarma': return <Leaf className="h-5 w-5 text-green-600" />;
      case 'rejuvenation': return <Heart className="h-5 w-5 text-red-500" />;
      case 'therapeutic': return <Activity className="h-5 w-5 text-blue-600" />;
      default: return <BookOpen className="h-5 w-5 text-purple-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <ResponsiveSidebar userType="patient" userName="Patient" userRole="Patient" />
        <MobileNavigation userType="patient" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading therapy portal...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ResponsiveSidebar userType="patient" userName="Patient" userRole="Patient" />
      <MobileNavigation userType="patient" />
      
      <div className="lg:pl-64">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Therapy Portal</h1>
                <p className="text-muted-foreground">Explore Ayurvedic therapy programs and track your wellness journey</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleManualRefresh}
                disabled={refreshing}
                className="ml-4"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* My Active Programs */}
          {myPrograms.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>My Therapy Programs</CardTitle>
                <CardDescription>Your current and completed therapy programs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myPrograms.map((program) => {
                    // Check if this is a Panchakarma program
                    const isPanchakarmaProgram = program.category === 'Panchakarma' || 
                                               program.programName.toLowerCase().includes('panchakarma') ||
                                               (program.procedureDetails && program.procedureDetails.length > 0);
                    
                    return (
                      <div key={program._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{program.programName}</h3>
                            <p className="text-sm text-gray-600">With {program.primaryPractitionerId?.name || 'Your Practitioner'}</p>
                          </div>
                          <Badge className={getStatusColor(program.status)}>
                            {program.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Start Date</p>
                            <p className="font-medium">{formatDate(program.startDate)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Duration</p>
                            <p className="font-medium">{program.templateId?.totalDuration || 'N/A'} days</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Next Session</p>
                            <p className="font-medium">
                              {program.progress.nextSessionDate ? 
                                `${formatDate(program.progress.nextSessionDate)} at ${program.progress.nextSessionTime}` : 
                                'No upcoming sessions'
                              }
                            </p>
                          </div>
                        </div>
                        
                        {/* Enhanced Progress Display for Panchakarma Programs */}
                        {isPanchakarmaProgram && program.procedureDetails ? (
                          <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                              <span>Panchakarma Procedures Progress</span>
                              <span>
                                {program.procedureDetails.filter(p => p.isCompleted || p.status === 'completed').length}/
                                {program.procedureDetails.length} procedures completed
                              </span>
                            </div>
                            
                            {/* Procedure Status Indicators */}
                            <div className="grid grid-cols-5 gap-2 mb-3">
                              {program.procedureDetails.map((procedure, index) => {
                                const isCompleted = procedure.isCompleted || procedure.status === 'completed';
                                const isActive = procedure.status === 'in-progress';
                                
                                return (
                                  <div key={procedure.type} className="text-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium mx-auto mb-1 ${
                                      isCompleted 
                                        ? 'bg-green-500 text-white' 
                                        : isActive
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-gray-600'
                                    }`}>
                                      {index + 1}
                                    </div>
                                    <p className="text-xs text-gray-600 capitalize">
                                      {procedure.type}
                                    </p>
                                    {isActive && (
                                      <p className="text-xs text-blue-600 font-medium">Active</p>
                                    )}
                                    {isCompleted && (
                                      <p className="text-xs text-green-600 font-medium">Done</p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            
                            {/* Overall Progress Bar */}
                            <Progress 
                              value={(program.procedureDetails.filter(p => p.isCompleted || p.status === 'completed').length / program.procedureDetails.length) * 100} 
                              className="h-2" 
                            />
                          </div>
                        ) : (
                          /* Traditional Session-based Progress */
                          <div className="mb-3">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Progress</span>
                              <span>{program.progress.completedSessions}/{program.progress.totalSessions} sessions</span>
                            </div>
                            <Progress value={program.progress.percentageComplete} className="h-2" />
                          </div>
                        )}
                        
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          {program.status === 'active' && (
                            <Button variant="outline" size="sm">
                              <Calendar className="h-4 w-4 mr-2" />
                              Schedule Session
                            </Button>
                          )}
                          
                          {/* Progress Report Button */}
                          {(program.status === 'completed' || program.status === 'active') && 
                           isPanchakarmaProgram && program.procedureDetails && 
                           program.procedureDetails.some(p => p.isCompleted || p.status === 'completed') && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-purple-600 border-purple-600"
                              onClick={() => handleViewProgressReport(program._id)}
                            >
                              <BarChart3 className="h-4 w-4 mr-2" />
                              Progress Report
                            </Button>
                          )}
                          
                          {/* Feedback Button for Completed Procedures */}
                          {isPanchakarmaProgram && program.procedureDetails && 
                           program.procedureDetails.some(p => 
                             (p.isCompleted || p.status === 'completed') && 
                             (!p.patientFeedback || (p.feedbackRequired && !p.feedbackReceived))
                           ) && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-orange-600 border-orange-600"
                              onClick={() => handleProvideFeedback(program._id)}
                            >
                              <Star className="h-4 w-4 mr-2" />
                              Provide Feedback
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Available Therapy Programs */}
          <Card>
            <CardHeader>
              <CardTitle>Available Therapy Programs</CardTitle>
              <CardDescription>Discover authentic Ayurvedic treatments designed for your wellness</CardDescription>
            </CardHeader>
            <CardContent>
              {therapyTemplates.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No therapy programs available</h3>
                  <p className="text-gray-500">Contact your practitioner to set up therapy programs</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {therapyTemplates.map((template) => (
                    <Card key={template._id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getCategoryIcon(template.category)}
                            <Badge variant="secondary" className="text-xs">
                              {template.category}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">4.8</span>
                          </div>
                        </div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="text-sm line-clamp-2">
                          {template.description}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span>{template.totalDuration} days</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Activity className="h-4 w-4 text-gray-500" />
                              <span>{template.sessions?.length || 0} sessions</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-2">
                            <div>
                              <span className="text-lg font-bold text-primary">
                                ₹{template.estimatedCost?.amount?.toLocaleString() || 'N/A'}
                              </span>
                              <span className="text-sm text-gray-500 ml-1">total</span>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2 pt-2">
                            <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1"
                                  onClick={() => setSelectedTemplate(template)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Details
                                </Button>
                              </DialogTrigger>
                            </Dialog>
                            
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => requestTherapyProgram(template._id)}
                            >
                              Request Program
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Therapy Details Dialog */}
          {selectedTemplate && (
            <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
              <DialogContent className="max-w-4xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    {getCategoryIcon(selectedTemplate.category)}
                    <span>{selectedTemplate.name}</span>
                  </DialogTitle>
                  <DialogDescription>
                    {selectedTemplate.description}
                  </DialogDescription>
                </DialogHeader>
                
                <ScrollArea className="max-h-96">
                  <div className="space-y-6">
                    {/* Overview */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Program Overview</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <Clock className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="font-semibold">{selectedTemplate.totalDuration} days</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <Activity className="h-6 w-6 text-green-600 mx-auto mb-1" />
                          <p className="text-sm text-gray-600">Sessions</p>
                          <p className="font-semibold">{selectedTemplate.sessions?.length || 0}</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <Badge className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                          <p className="text-sm text-gray-600">Category</p>
                          <p className="font-semibold">{selectedTemplate.category}</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-xl font-bold text-primary">₹</span>
                          <p className="text-sm text-gray-600">Total Cost</p>
                          <p className="font-semibold">₹{selectedTemplate.estimatedCost?.amount?.toLocaleString() || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Benefits */}
                    {selectedTemplate.benefits && selectedTemplate.benefits.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Benefits</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {selectedTemplate.benefits.map((benefit, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sessions */}
                    {selectedTemplate.sessions && selectedTemplate.sessions.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Session Schedule</h3>
                        <div className="space-y-3">
                          {selectedTemplate.sessions.slice(0, 5).map((session, index) => (
                            <div key={index} className="border rounded-lg p-3">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium">Day {session.dayNumber}: {session.name}</h4>
                                <Badge variant="outline">{session.duration} mins</Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{session.description}</p>
                              {session.techniques && session.techniques.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {session.techniques.map((technique, techIndex) => (
                                    <Badge key={techIndex} variant="secondary" className="text-xs">
                                      {technique}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                          {selectedTemplate.sessions.length > 5 && (
                            <p className="text-center text-sm text-gray-500">
                              ...and {selectedTemplate.sessions.length - 5} more sessions
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Contraindications */}
                    {selectedTemplate.contraindications && selectedTemplate.contraindications.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3 text-red-600">Important Considerations</h3>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <ul className="space-y-1">
                            {selectedTemplate.contraindications.map((contraindication, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-red-800">{contraindication}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                <Separator />
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                    Close
                  </Button>
                  <Button onClick={() => {
                    requestTherapyProgram(selectedTemplate._id);
                    setIsDetailsDialogOpen(false);
                  }}>
                    Request This Program
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Patient Feedback Modal */}
          <Dialog open={feedbackModal.isOpen} onOpenChange={(open) => 
            setFeedbackModal({ isOpen: open, programId: null, procedureType: null, procedure: null })
          }>
            <DialogContent className="max-w-4xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-orange-500" />
                  <span>Procedure Feedback - {feedbackModal.procedureType?.charAt(0).toUpperCase() + feedbackModal.procedureType?.slice(1)}</span>
                </DialogTitle>
                <DialogDescription>
                  Please share your experience with the {feedbackModal.procedureType} procedure. Your feedback helps us improve your treatment.
                </DialogDescription>
              </DialogHeader>
              
              <ScrollArea className="max-h-[70vh] pr-4">
                <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                  {/* Overall Experience Rating */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Overall Experience Rating</Label>
                    <RadioGroup 
                      value={feedbackData.overallExperience.toString()} 
                      onValueChange={(value) => setFeedbackData(prev => ({ ...prev, overallExperience: parseInt(value) }))}
                      className="flex space-x-6"
                    >
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <div key={rating} className="flex items-center space-x-2">
                          <RadioGroupItem value={rating.toString()} id={`experience-${rating}`} />
                          <Label htmlFor={`experience-${rating}`} className="flex items-center">
                            {Array.from({ length: rating }, (_, i) => (
                              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                            <span className="ml-2">{rating}</span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Positive Aspects (1-5 rating for each) */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold text-green-700">Positive Effects (Rate 1-5, 0 if not applicable)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: 'relaxation', label: 'Relaxation & Calmness', icon: '🧘' },
                        { key: 'painRelief', label: 'Pain Relief', icon: '💆' },
                        { key: 'energyBoost', label: 'Energy Boost', icon: '⚡' },
                        { key: 'mentalClarity', label: 'Mental Clarity', icon: '🧠' },
                        { key: 'sleepImprovement', label: 'Sleep Improvement', icon: '😴' },
                        { key: 'digestiveHealth', label: 'Digestive Health', icon: '🌿' },
                        { key: 'skinGlow', label: 'Skin Glow & Health', icon: '✨' },
                        { key: 'stressReduction', label: 'Stress Reduction', icon: '🎯' },
                        { key: 'mobilityImprovement', label: 'Mobility Improvement', icon: '🚶' },
                        { key: 'overallWellbeing', label: 'Overall Wellbeing', icon: '🌟' }
                      ].map((aspect) => (
                        <div key={aspect.key} className="space-y-2">
                          <Label className="text-sm font-medium flex items-center">
                            <span className="mr-2">{aspect.icon}</span>
                            {aspect.label}
                          </Label>
                          <RadioGroup 
                            value={feedbackData.positiveAspects[aspect.key].toString()} 
                            onValueChange={(value) => setFeedbackData(prev => ({
                              ...prev,
                              positiveAspects: { ...prev.positiveAspects, [aspect.key]: parseInt(value) }
                            }))}
                            className="flex space-x-3"
                          >
                            {[0, 1, 2, 3, 4, 5].map((rating) => (
                              <div key={rating} className="flex items-center space-x-1">
                                <RadioGroupItem value={rating.toString()} id={`pos-${aspect.key}-${rating}`} />
                                <Label htmlFor={`pos-${aspect.key}-${rating}`} className="text-xs">{rating}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Negative Aspects (1-5 rating for severity) */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold text-red-700">Negative Effects (Rate severity 1-5, 0 if none)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: 'discomfort', label: 'Physical Discomfort', icon: '😣' },
                        { key: 'fatigue', label: 'Fatigue/Tiredness', icon: '😴' },
                        { key: 'nausea', label: 'Nausea', icon: '🤢' },
                        { key: 'headache', label: 'Headache', icon: '🤕' },
                        { key: 'dizziness', label: 'Dizziness', icon: '😵' },
                        { key: 'skinIrritation', label: 'Skin Irritation', icon: '🔴' },
                        { key: 'digestiveUpset', label: 'Digestive Upset', icon: '🤢' },
                        { key: 'sleepDisturbance', label: 'Sleep Disturbance', icon: '😪' },
                        { key: 'emotionalChanges', label: 'Emotional Changes', icon: '😢' },
                        { key: 'mobilityIssues', label: 'Mobility Issues', icon: '🦵' }
                      ].map((aspect) => (
                        <div key={aspect.key} className="space-y-2">
                          <Label className="text-sm font-medium flex items-center">
                            <span className="mr-2">{aspect.icon}</span>
                            {aspect.label}
                          </Label>
                          <RadioGroup 
                            value={feedbackData.negativeAspects[aspect.key].toString()} 
                            onValueChange={(value) => setFeedbackData(prev => ({
                              ...prev,
                              negativeAspects: { ...prev.negativeAspects, [aspect.key]: parseInt(value) }
                            }))}
                            className="flex space-x-3"
                          >
                            {[0, 1, 2, 3, 4, 5].map((rating) => (
                              <div key={rating} className="flex items-center space-x-1">
                                <RadioGroupItem value={rating.toString()} id={`neg-${aspect.key}-${rating}`} />
                                <Label htmlFor={`neg-${aspect.key}-${rating}`} className="text-xs">{rating}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional Ratings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Comfort Level */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold flex items-center">
                        <span className="mr-2">😌</span>
                        Comfort Level During Treatment (1-5)
                      </Label>
                      <RadioGroup 
                        value={feedbackData.comfortLevel.toString()} 
                        onValueChange={(value) => setFeedbackData(prev => ({ ...prev, comfortLevel: parseInt(value) }))}
                        className="flex space-x-4"
                      >
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div key={level} className="flex items-center space-x-2">
                            <RadioGroupItem value={level.toString()} id={`comfort-${level}`} />
                            <Label htmlFor={`comfort-${level}`}>{level}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Therapist Rating */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold flex items-center">
                        <span className="mr-2">👨‍⚕️</span>
                        Therapist/Practitioner Rating (1-5)
                      </Label>
                      <RadioGroup 
                        value={feedbackData.therapistRating.toString()} 
                        onValueChange={(value) => setFeedbackData(prev => ({ ...prev, therapistRating: parseInt(value) }))}
                        className="flex space-x-4"
                      >
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div key={level} className="flex items-center space-x-2">
                            <RadioGroupItem value={level.toString()} id={`therapist-${level}`} />
                            <Label htmlFor={`therapist-${level}`}>{level}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>

                  {/* Legacy Health Metrics for backward compatibility */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pain Level */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                        Pain Level (1-10)
                      </Label>
                      <RadioGroup 
                        value={feedbackData.painLevel.toString()} 
                        onValueChange={(value) => setFeedbackData(prev => ({ ...prev, painLevel: parseInt(value) }))}
                        className="grid grid-cols-5 gap-2"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                          <div key={level} className="flex items-center space-x-1">
                            <RadioGroupItem value={level.toString()} id={`pain-${level}`} />
                            <Label htmlFor={`pain-${level}`} className="text-sm">{level}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Energy Level */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold flex items-center">
                        <Activity className="h-4 w-4 mr-2 text-green-500" />
                        Energy Level (1-10)
                      </Label>
                      <RadioGroup 
                        value={feedbackData.energyLevel.toString()} 
                        onValueChange={(value) => setFeedbackData(prev => ({ ...prev, energyLevel: parseInt(value) }))}
                        className="grid grid-cols-5 gap-2"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                          <div key={level} className="flex items-center space-x-1">
                            <RadioGroupItem value={level.toString()} id={`energy-${level}`} />
                            <Label htmlFor={`energy-${level}`} className="text-sm">{level}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Sleep Quality */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold flex items-center">
                        <span className="mr-2">😴</span>
                        Sleep Quality (1-5)
                      </Label>
                      <RadioGroup 
                        value={feedbackData.sleepQuality.toString()} 
                        onValueChange={(value) => setFeedbackData(prev => ({ ...prev, sleepQuality: parseInt(value) }))}
                        className="flex space-x-4"
                      >
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div key={level} className="flex items-center space-x-2">
                            <RadioGroupItem value={level.toString()} id={`sleep-${level}`} />
                            <Label htmlFor={`sleep-${level}`}>{level}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Appetite Level */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold flex items-center">
                        <span className="mr-2">🍽️</span>
                        Appetite Level (1-5)
                      </Label>
                      <RadioGroup 
                        value={feedbackData.appetiteLevel.toString()} 
                        onValueChange={(value) => setFeedbackData(prev => ({ ...prev, appetiteLevel: parseInt(value) }))}
                        className="flex space-x-4"
                      >
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div key={level} className="flex items-center space-x-2">
                            <RadioGroupItem value={level.toString()} id={`appetite-${level}`} />
                            <Label htmlFor={`appetite-${level}`}>{level}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>

                  {/* Symptoms Experienced */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Positive Effects/Symptoms Experienced</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        'Reduced stress', 'Better digestion', 'Improved circulation', 'Mental clarity',
                        'Reduced inflammation', 'Better joint mobility', 'Improved skin condition',
                        'Enhanced immunity', 'Better respiratory health', 'Hormonal balance'
                      ].map((symptom) => (
                        <div key={symptom} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`symptom-${symptom}`}
                            checked={feedbackData.symptoms.includes(symptom)}
                            onCheckedChange={(checked) => handleSymptomChange(symptom, checked)}
                          />
                          <Label htmlFor={`symptom-${symptom}`} className="text-sm">{symptom}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Side Effects */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Side Effects (if any)</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        'Temporary fatigue', 'Mild nausea', 'Temporary headache', 'Skin irritation',
                        'Digestive changes', 'Mild dizziness', 'Temporary weakness', 'Sleep disturbances'
                      ].map((effect) => (
                        <div key={effect} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`effect-${effect}`}
                            checked={feedbackData.sideEffects.includes(effect)}
                            onCheckedChange={(checked) => handleSideEffectChange(effect, checked)}
                          />
                          <Label htmlFor={`effect-${effect}`} className="text-sm">{effect}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional Comments */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Additional Comments</Label>
                    <Textarea
                      placeholder="Please share any additional thoughts, concerns, or observations about this procedure..."
                      value={feedbackData.additionalComments}
                      onChange={(e) => setFeedbackData(prev => ({ ...prev, additionalComments: e.target.value }))}
                      className="min-h-[100px]"
                    />
                  </div>

                  {/* Would Recommend */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Would you recommend this procedure to others?</Label>
                    <RadioGroup 
                      value={feedbackData.wouldRecommend.toString()} 
                      onValueChange={(value) => setFeedbackData(prev => ({ ...prev, wouldRecommend: value === 'true' }))}
                      className="flex space-x-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="recommend-yes" />
                        <Label htmlFor="recommend-yes">Yes, definitely</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="recommend-no" />
                        <Label htmlFor="recommend-no">No, I wouldn't</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setFeedbackModal({ isOpen: false, programId: null, procedureType: null, procedure: null })}
                      disabled={submittingFeedback}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={submittingFeedback}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {submittingFeedback ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Feedback
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </ScrollArea>
            </DialogContent>
          </Dialog>

          {/* Progress Report Modal */}
          <Dialog open={showProgressReport} onOpenChange={setShowProgressReport}>
            <DialogContent className="max-w-full max-h-[95vh] p-0 overflow-y-auto">
              {selectedProgramId && (
                <ProgressReport 
                  programId={selectedProgramId} 
                  onClose={() => setShowProgressReport(false)}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default PatientTherapyPortal;