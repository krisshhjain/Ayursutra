import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Calendar, Clock, User, Activity, CheckCircle, AlertCircle, Edit, Save, X } from 'lucide-react';
import ResponsiveSidebar from '../components/navigation/ResponsiveSidebar';
import MobileNavigation from '../components/navigation/MobileNavigation';
import ProgressReport from '../components/ProgressReport';

const API_BASE_URL = 'http://localhost:5000/api';

const TherapyManagement = () => {
  const [therapyPrograms, setTherapyPrograms] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProcedureModal, setShowProcedureModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [editingProcedure, setEditingProcedure] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [procedureData, setProcedureData] = useState([]);
  const [user, setUser] = useState(null);
  const [showProgressReport, setShowProgressReport] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState(null);
  const [userType, setUserType] = useState('');

  const handleViewProgressReport = (programId) => {
    setSelectedProgramId(programId);
    setShowProgressReport(true);
  };

  useEffect(() => {
    fetchUserData();
    fetchTherapyData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const userTypeFromStorage = localStorage.getItem('userType');
      
      if (token && userTypeFromStorage) {
        setUserType(userTypeFromStorage);
        
        // Fetch user profile data
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchTherapyData = async () => {
    try {
      // Fetch therapy programs
      const programsResponse = await fetch(`${API_BASE_URL}/therapy/programs`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (programsResponse.ok) {
        const programsData = await programsResponse.json();
        setTherapyPrograms(programsData.success ? programsData.data : []);
      }

      // Fetch upcoming sessions
      const sessionsResponse = await fetch(`${API_BASE_URL}/therapy/upcoming-sessions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setUpcomingSessions(sessionsData.success ? sessionsData.data : []);
      }
    } catch (error) {
      console.error('Error fetching therapy data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (program) => {
    setSelectedProgram(program);
    // Initialize procedure data with defaults if not present
    const defaultProcedures = program.procedureDetails && program.procedureDetails.length > 0 
      ? program.procedureDetails 
      : [
          {
            type: 'vamana',
            status: 'scheduled',
            scheduledDates: {},
            instructions: {},
            notes: '',
            canStart: true,
            isCompleted: false
          },
          {
            type: 'virechana',
            status: 'scheduled',
            scheduledDates: {},
            instructions: {},
            notes: '',
            canStart: false,
            isCompleted: false
          },
          {
            type: 'basti',
            status: 'scheduled',
            scheduledDates: {},
            instructions: {},
            notes: '',
            canStart: false,
            isCompleted: false
          },
          {
            type: 'nasya',
            status: 'scheduled',
            scheduledDates: {},
            instructions: {},
            notes: '',
            canStart: false,
            isCompleted: false
          },
          {
            type: 'raktamokshana',
            status: 'scheduled',
            scheduledDates: {},
            instructions: {},
            notes: '',
            canStart: false,
            isCompleted: false
          }
        ];
    setProcedureData(defaultProcedures);
    setShowProcedureModal(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedProgram) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/therapy/programs/${selectedProgram._id}/procedures`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ procedures: procedureData })
      });

      if (response.ok) {
        const result = await response.json();
        // Update the local state
        setTherapyPrograms(prev => prev.map(p => 
          p._id === selectedProgram._id ? result.data : p
        ));
        setSelectedProgram(result.data);
        alert('Changes saved successfully!');
      } else {
        alert('Failed to save changes');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Error saving changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartProcedure = async (procedureType, procedureData) => {
    if (!selectedProgram) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/therapy/programs/${selectedProgram._id}/procedures/${procedureType}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          scheduledDates: procedureData?.scheduledDates,
          instructions: procedureData?.instructions
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        // Update local state
        setTherapyPrograms(prev => prev.map(p => 
          p._id === selectedProgram._id ? result.data : p
        ));
        setSelectedProgram(result.data);
        setProcedureData(result.data.procedureDetails || []);
        
        alert(`${procedureType} procedure started successfully!\n\nNext Steps: ${result.nextSteps?.patientInstructions || 'Follow practitioner guidance'}`);
      } else {
        alert(`Failed to start procedure: ${result.message}`);
      }
    } catch (error) {
      console.error('Error starting procedure:', error);
      alert('Error starting procedure');
    }
  };

  const handleFinishProcedure = async (procedureType, notes = '') => {
    if (!selectedProgram) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/therapy/programs/${selectedProgram._id}/procedures/${procedureType}/finish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          notes,
          patientFeedbackRequired: true 
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        // Update local state
        setTherapyPrograms(prev => prev.map(p => 
          p._id === selectedProgram._id ? result.data : p
        ));
        setSelectedProgram(result.data);
        setProcedureData(result.data.procedureDetails || []);
        
        let message = result.message;
        if (result.feedbackRequired) {
          message += '\n\n📋 Patient feedback is required to complete this procedure.';
        }
        if (result.nextSteps?.nextProcedure) {
          message += `\n\n➡️ Next: ${result.nextSteps.nextProcedure} procedure is now available.`;
        }
        if (result.nextSteps?.action === 'program-completed') {
          message += '\n\n🎉 All procedures completed! Program finished successfully.';
        }
        
        alert(message);
      } else {
        alert(`Failed to finish procedure: ${result.message}`);
      }
    } catch (error) {
      console.error('Error finishing procedure:', error);
      alert('Error finishing procedure');
    }
  };

  const updateProcedureData = (index, field, value) => {
    setProcedureData(prev => prev.map((proc, i) => 
      i === index ? { ...proc, [field]: value } : proc
    ));
  };

  const updateNestedProcedureData = (index, parentField, childField, value) => {
    setProcedureData(prev => prev.map((proc, i) => {
      if (i !== index) return proc;
      
      let processedValue = value;
      
      // Only convert to ISO string for date fields in scheduledDates
      if (parentField === 'scheduledDates' && value) {
        const date = new Date(value);
        // Check if date is valid
        if (!isNaN(date.getTime())) {
          processedValue = date.toISOString();
        } else {
          processedValue = null;
        }
      } else if (!value) {
        processedValue = null;
      }
      
      return { 
        ...proc, 
        [parentField]: { 
          ...proc[parentField], 
          [childField]: processedValue
        } 
      };
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <ResponsiveSidebar 
          userType={(userType as "patient" | "practitioner") || "practitioner"} 
          userName={user ? `${user.firstName} ${user.lastName}` : "Loading..."}
          userRole={user?.specialization || "Ayurvedic Practitioner"} 
        />
        <MobileNavigation userType="practitioner" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading therapy management...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ResponsiveSidebar 
        userType={(userType as "patient" | "practitioner") || "practitioner"} 
        userName={user ? `${user.firstName} ${user.lastName}` : "Loading..."}
        userRole={user?.specialization || "Ayurvedic Practitioner"} 
      />
      <MobileNavigation userType="practitioner" />
      
      <div className="lg:pl-64">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Therapy Management</h1>
              <p className="text-muted-foreground">Manage existing therapy programs and track patient progress</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Programs</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {therapyPrograms.filter(p => p.status === 'active').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Today's Sessions</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {upcomingSessions.filter(s => {
                        if (!s.scheduledDate) return false;
                        const sessionDate = new Date(s.scheduledDate);
                        const today = new Date();
                        if (isNaN(sessionDate.getTime())) return false;
                        return sessionDate.toDateString() === today.toDateString();
                      }).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed This Week</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {therapyPrograms.reduce((acc, program) => acc + program.progress.completedSessions, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <User className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Patients</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {new Set(therapyPrograms.filter(p => p.patientId).map(p => p.patientId._id)).size}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Therapy Programs */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Active Therapy Programs</CardTitle>
              <CardDescription>Monitor ongoing patient therapy programs</CardDescription>
            </CardHeader>
            <CardContent>
              {therapyPrograms.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No therapy programs found</h3>
                  <p className="text-gray-500 mb-4">Therapy programs will appear here when patients are added from the appointment scheduling system</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {therapyPrograms.map((program) => (
                    <div key={program._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{program.programName}</h3>
                            <Badge className={getStatusColor(program.status)}>
                              {program.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Patient</p>
                              <p className="font-medium">
                                {program.patientId ? 
                                  `${program.patientId.firstName} ${program.patientId.lastName}` : 
                                  'Unknown'
                                }
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Duration</p>
                              <p className="font-medium">
                                {program.procedureDetails?.totalDays || program.templateId?.totalDuration || 'N/A'} days
                              </p>
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
                        </div>
                        
                        <div className="flex space-x-2 ml-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewDetails(program)}
                          >
                            Manage Procedures
                          </Button>
                          {program.procedureDetails?.some(p => p.isCompleted) && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewProgressReport(program._id)}
                              className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                            >
                              Progress Report
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Calendar className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
              <CardDescription>Next therapy sessions scheduled</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingSessions.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming sessions</h3>
                  <p className="text-gray-500">Schedule therapy sessions to see them here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingSessions.slice(0, 5).map((session, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <div>
                          <p className="font-medium">{session.programName} - Session {session.sessionNumber}</p>
                          <p className="text-sm text-gray-600">{session.patientName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatDate(session.scheduledDate)}</p>
                        <p className="text-sm text-gray-600">{session.scheduledTime}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Comprehensive Procedure Management Modal */}
      <Dialog open={showProcedureModal} onOpenChange={setShowProcedureModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Manage Panchakarma Procedures - {selectedProgram?.patientId ? 
                `${selectedProgram.patientId.firstName} ${selectedProgram.patientId.lastName}` : 
                'Unknown'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Save Changes Button */}
            <div className="flex justify-end gap-2">
              <Button 
                onClick={handleSaveChanges} 
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={() => setShowProcedureModal(false)}>
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            </div>

            {/* Procedures List */}
            {procedureData.map((procedure, index) => {
              const getStatusColor = (status) => {
                switch (status) {
                  case 'completed': return 'bg-green-100 text-green-800 border-green-200';
                  case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
                  case 'awaiting-feedback': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
                  case 'scheduled': return 'bg-gray-100 text-gray-800 border-gray-200';
                  default: return 'bg-gray-100 text-gray-800 border-gray-200';
                }
              };

              const getProcedureTitle = (type) => {
                const titles = {
                  'vamana': 'Vamana (Therapeutic Emesis)',
                  'virechana': 'Virechana (Purgation)',
                  'basti': 'Basti (Medicated Enema)',
                  'nasya': 'Nasya (Nasal Administration)',
                  'raktamokshana': 'Raktamokshana (Bloodletting)'
                };
                return titles[type] || type.charAt(0).toUpperCase() + type.slice(1);
              };

              const getProcedureSequence = (type) => {
                const sequence = {
                  'vamana': { order: 1, next: 'virechana' },
                  'virechana': { order: 2, next: 'basti' },
                  'basti': { order: 3, next: 'nasya' },
                  'nasya': { order: 4, next: 'raktamokshana' },
                  'raktamokshana': { order: 5, next: null }
                };
                return sequence[type] || { order: 0, next: null };
              };

              return (
                <Card key={index} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            procedure.isCompleted ? 'bg-green-600 text-white' :
                            procedure.status === 'in-progress' ? 'bg-blue-600 text-white' :
                            (procedure.canStart !== false || procedure.type === 'vamana') ? 'bg-yellow-600 text-white' : 'bg-gray-300 text-gray-600'
                          }`}>
                            {getProcedureSequence(procedure.type).order}
                          </div>
                          <CardTitle className="text-lg">
                            {getProcedureTitle(procedure.type)}
                          </CardTitle>
                        </div>
                        {getProcedureSequence(procedure.type).next && (
                          <div className="text-sm text-gray-500">
                            → Next: {getProcedureTitle(getProcedureSequence(procedure.type).next)}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(procedure.status)}>
                          {procedure.status}
                        </Badge>
                        {(procedure.status === 'scheduled' && (procedure.canStart !== false || procedure.type === 'vamana')) && (
                          <Button
                            size="sm"
                            onClick={() => handleStartProcedure(procedure.type, procedure)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Start Procedure
                          </Button>
                        )}
                        {(procedure.status === 'scheduled' && procedure.canStart === false && procedure.type !== 'vamana') && (
                          <Badge className="bg-gray-100 text-gray-600 border-gray-200">
                            Waiting for Previous
                          </Badge>
                        )}
                        {procedure.status === 'in-progress' && (
                          <Button
                            size="sm"
                            onClick={() => handleFinishProcedure(procedure.type)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Mark Complete
                          </Button>
                        )}
                        {procedure.status === 'awaiting-feedback' && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            Awaiting Patient Feedback
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Phase Scheduling */}
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Purva Karma Date
                        </Label>
                        <Input
                          type="date"
                          value={formatDateForInput(procedure.scheduledDates?.purvaKarma)}
                          onChange={(e) => updateNestedProcedureData(index, 'scheduledDates', 'purvaKarma', e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Pradhana Karma Date
                        </Label>
                        <Input
                          type="date"
                          value={formatDateForInput(procedure.scheduledDates?.pradhanaKarma)}
                          onChange={(e) => updateNestedProcedureData(index, 'scheduledDates', 'pradhanaKarma', e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Paschat Karma Date
                        </Label>
                        <Input
                          type="date"
                          value={formatDateForInput(procedure.scheduledDates?.paschatKarma)}
                          onChange={(e) => updateNestedProcedureData(index, 'scheduledDates', 'paschatKarma', e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Pre-procedure Instructions
                        </Label>
                        <Textarea
                          value={procedure.instructions?.preInstructions || ''}
                          onChange={(e) => updateNestedProcedureData(index, 'instructions', 'preInstructions', e.target.value)}
                          placeholder="Instructions before the procedure..."
                          className="min-h-[100px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Post-procedure Instructions
                        </Label>
                        <Textarea
                          value={procedure.instructions?.postInstructions || ''}
                          onChange={(e) => updateNestedProcedureData(index, 'instructions', 'postInstructions', e.target.value)}
                          placeholder="Instructions after the procedure..."
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Dietary Restrictions
                        </Label>
                        <Textarea
                          value={procedure.instructions?.dietaryRestrictions || ''}
                          onChange={(e) => updateNestedProcedureData(index, 'instructions', 'dietaryRestrictions', e.target.value)}
                          placeholder="Dietary guidelines and restrictions..."
                          className="min-h-[80px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Medicine Schedule
                        </Label>
                        <Textarea
                          value={procedure.instructions?.medicineSchedule || ''}
                          onChange={(e) => updateNestedProcedureData(index, 'instructions', 'medicineSchedule', e.target.value)}
                          placeholder="Medicine timings and dosage..."
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Additional Notes
                      </Label>
                      <Textarea
                        value={procedure.notes || ''}
                        onChange={(e) => updateProcedureData(index, 'notes', e.target.value)}
                        placeholder="Any additional notes or observations..."
                        className="min-h-[80px]"
                      />
                    </div>

                    {/* Completion Info */}
                    {procedure.completedAt && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-800">
                          <CheckCircle className="h-4 w-4 inline mr-1" />
                          Completed on {formatDate(procedure.completedAt)}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
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
  );
};

export default TherapyManagement;