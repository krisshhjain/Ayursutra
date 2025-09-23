import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  User,
  MapPin,
  Edit,
  Trash2,
  CheckCircle,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import ResponsiveSidebar from '@/components/navigation/ResponsiveSidebar';
import MobileNavigation from '@/components/navigation/MobileNavigation';
import { useMediaQuery } from '@mui/material';
import { toast } from 'sonner';

const PractitionerSchedule = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'all-confirmed'>('calendar');
  const [practitioner, setPractitioner] = useState({ firstName: '', lastName: '', specialization: '' });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completingAppointment, setCompletingAppointment] = useState(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [showTherapyOptions, setShowTherapyOptions] = useState(false);
  const [selectedAppointmentForTherapy, setSelectedAppointmentForTherapy] = useState(null);
  const [therapyTemplates, setTherapyTemplates] = useState([]);
  const [selectedTherapy, setSelectedTherapy] = useState('');

  useEffect(() => {
    fetchPractitionerInfo();
    fetchSchedule();
    fetchTherapyTemplates();
  }, [selectedDate, viewMode]);

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

  const fetchTherapyTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/therapy/templates', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTherapyTemplates(data.success ? data.data : []);
      }
    } catch (error) {
      console.error('Error fetching therapy templates:', error);
    }
  };

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      let url;
      if (viewMode === 'all-confirmed') {
        // Fetch all confirmed appointments for completion
        url = 'http://localhost:5000/api/practitioner/appointments?status=confirmed';
      } else {
        // Fetch appointments for specific date
        const dateStr = selectedDate.toISOString().split('T')[0];
        url = `http://localhost:5000/api/practitioner/schedule?date=${dateStr}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setAppointments(data.data.appointments || data.data);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = 9 + i;
    return `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionNotes: sessionNotes,
          completionTime: new Date().toISOString()
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Appointment marked as completed successfully!');
        setCompletingAppointment(null);
        setSessionNotes('');
        fetchSchedule(); // Refresh the schedule
      } else {
        toast.error(data.message || 'Failed to complete appointment');
      }
    } catch (error) {
      console.error('Error completing appointment:', error);
      toast.error('Failed to complete appointment');
    }
  };

  const handleAddToTherapy = async () => {
    if (!selectedAppointmentForTherapy || !selectedTherapy) {
      toast.error('Please select a therapy program');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch('http://localhost:5000/api/therapy/programs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: selectedAppointmentForTherapy.patientId,
          therapyTemplateId: selectedTherapy,
          primaryPractitionerId: user.userId,
          startDate: new Date().toISOString(),
          notes: `Created from appointment completion on ${new Date().toLocaleDateString()}`
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Patient successfully added to therapy program!');
        setShowTherapyOptions(false);
        setSelectedAppointmentForTherapy(null);
        setSelectedTherapy('');
      } else {
        toast.error(data.message || 'Failed to add patient to therapy program');
      }
    } catch (error) {
      console.error('Error adding patient to therapy:', error);
      toast.error('Failed to add patient to therapy program');
    }
  };

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
              <h1 className="text-2xl font-bold text-foreground">Schedule Management</h1>
              <p className="text-muted-foreground">Manage appointments and therapy sessions</p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Calendar
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <Filter className="h-4 w-4 mr-1" />
                  List
                </Button>
                <Button
                  variant={viewMode === 'all-confirmed' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('all-confirmed')}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Complete
                </Button>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Appointment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Schedule New Appointment</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Patient</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select patient" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="arjun">Arjun Patel</SelectItem>
                          <SelectItem value="priya">Priya Singh</SelectItem>
                          <SelectItem value="raj">Raj Kumar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Therapy Type</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select therapy" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="abhyanga">Abhyanga</SelectItem>
                          <SelectItem value="shirodhara">Shirodhara</SelectItem>
                          <SelectItem value="consultation">Consultation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Date</label>
                        <Input type="date" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Time</label>
                        <Input type="time" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Notes (Optional)</label>
                      <Input placeholder="Special instructions or notes" />
                    </div>
                    <Button className="w-full">Schedule Appointment</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>

          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-6"
            >
              {/* Mini Calendar */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">January 2024</h3>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day}>{day}</div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <button
                      key={day}
                      className={`aspect-square flex items-center justify-center text-sm rounded-md hover:bg-muted transition-colors ${
                        day === 20 ? 'bg-primary text-primary-foreground font-semibold' : 
                        [18, 22].includes(day) ? 'bg-primary/10 text-primary font-medium' : ''
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Daily Schedule */}
              <div className="lg:col-span-3">
                <Card className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Today's Schedule - January 20, 2024</h3>
                  <div className="space-y-2">
                    {timeSlots.map((time, index) => {
                      const appointment = appointments.find(apt => apt.time === time);
                      
                      return (
                        <div key={time} className="grid grid-cols-12 gap-4 py-2 border-b border-border/50 last:border-0">
                          <div className="col-span-2 text-sm text-muted-foreground font-medium">
                            {time}
                          </div>
                          
                          {appointment ? (
                            <div className="col-span-10">
                              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-medium text-foreground">{appointment.patient}</h4>
                                      <Badge className={getStatusColor(appointment.status)}>
                                        {appointment.status}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-1">{appointment.therapy} • {appointment.duration}</p>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {appointment.room}
                                      </span>
                                      {appointment.notes && (
                                        <span>{appointment.notes}</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button variant="ghost" size="sm">
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="col-span-10">
                              <div className="h-12 border-2 border-dashed border-muted rounded-lg flex items-center justify-center text-muted-foreground text-sm hover:bg-muted/50 cursor-pointer transition-colors">
                                Available
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading appointments...</p>
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No appointments scheduled for this date.</p>
                </div>
              ) : (
                appointments.map((appointment) => (
                <Card key={appointment.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{appointment.patient}</h3>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{appointment.therapy}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(appointment.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {appointment.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {appointment.room}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        Reschedule
                      </Button>
                      {appointment.status === 'confirmed' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedAppointmentForTherapy(appointment);
                              setShowTherapyOptions(true);
                            }}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add to Therapy
                          </Button>
                          <Dialog 
                            open={completingAppointment === appointment.id} 
                            onOpenChange={(open) => !open && setCompletingAppointment(null)}
                          >
                            <DialogTrigger asChild>
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => setCompletingAppointment(appointment.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Complete
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Complete Appointment</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Patient: {appointment.patient}</Label>
                                <Label>Therapy: {appointment.therapy}</Label>
                                <Label>Date: {new Date(appointment.date).toLocaleDateString()}</Label>
                                <Label>Time: {appointment.time}</Label>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="session-notes">Session Notes (Optional)</Label>
                                <Textarea
                                  id="session-notes"
                                  placeholder="Add any notes about the session, patient progress, or recommendations..."
                                  value={sessionNotes}
                                  onChange={(e) => setSessionNotes(e.target.value)}
                                  rows={4}
                                />
                              </div>
                              
                              <div className="flex gap-2 justify-end">
                                <Button 
                                  variant="outline" 
                                  onClick={() => {
                                    setCompletingAppointment(null);
                                    setSessionNotes('');
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedAppointmentForTherapy(appointment);
                                    setShowTherapyOptions(true);
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add to Therapy
                                </Button>
                                <Button 
                                  onClick={() => handleCompleteAppointment(appointment.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark as Complete
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        </>
                      )}
                      {appointment.status === 'completed' && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          <Star className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))
              )}
            </motion.div>
          )}

          {/* All Confirmed Appointments View */}
          {viewMode === 'all-confirmed' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-foreground mb-2">Confirmed Appointments Ready for Completion</h2>
                <p className="text-sm text-muted-foreground">Mark appointments as completed to allow patients to rate and review your service.</p>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading confirmed appointments...</p>
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No confirmed appointments available for completion.</p>
                </div>
              ) : (
                appointments.map((appointment) => (
                <Card key={appointment.id} className="p-6 border-l-4 border-l-green-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{appointment.patient}</h3>
                          <Badge className="bg-green-100 text-green-700">
                            {appointment.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{appointment.therapy}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(appointment.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {appointment.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {appointment.location || 'Clinic'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedAppointmentForTherapy(appointment);
                          setShowTherapyOptions(true);
                        }}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add to Therapy
                      </Button>
                      <Dialog 
                        open={completingAppointment === appointment.id} 
                        onOpenChange={(open) => !open && setCompletingAppointment(null)}
                      >
                        <DialogTrigger asChild>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => setCompletingAppointment(appointment.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Complete
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Complete Appointment</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Patient: {appointment.patient}</Label>
                              <Label>Therapy: {appointment.therapy}</Label>
                              <Label>Date: {new Date(appointment.date).toLocaleDateString()}</Label>
                              <Label>Time: {appointment.time}</Label>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="session-notes">Session Notes (Optional)</Label>
                              <Textarea
                                id="session-notes"
                                placeholder="Add notes about the session, treatment provided, recommendations, etc."
                                value={sessionNotes}
                                onChange={(e) => setSessionNotes(e.target.value)}
                                rows={4}
                              />
                            </div>
                            
                            <div className="flex gap-2 pt-4">
                              <Button
                                variant="outline"
                                onClick={() => setCompletingAppointment(null)}
                                className="flex-1"
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedAppointmentForTherapy(appointment);
                                  setShowTherapyOptions(true);
                                }}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add to Therapy
                              </Button>
                              <Button
                                onClick={() => handleCompleteAppointment(appointment.id)}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Mark as Complete
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </Card>
              ))
              )}
            </motion.div>
          )}
        </main>
      </div>

      {/* Therapy Selection Dialog */}
      <Dialog open={showTherapyOptions} onOpenChange={setShowTherapyOptions}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Patient to Therapy Program</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedAppointmentForTherapy && (
              <div className="space-y-2">
                <Label>Patient: {selectedAppointmentForTherapy.patient}</Label>
                <Label>Current Appointment: {selectedAppointmentForTherapy.therapy}</Label>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="therapy-select">Select Therapy Program</Label>
              <Select value={selectedTherapy} onValueChange={setSelectedTherapy}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose therapy program" />
                </SelectTrigger>
                <SelectContent>
                  {therapyTemplates.map(template => (
                    <SelectItem key={template._id} value={template._id}>
                      {template.name} - {template.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowTherapyOptions(false);
                  setSelectedAppointmentForTherapy(null);
                  setSelectedTherapy('');
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddToTherapy}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!selectedTherapy}
              >
                Add to Therapy Program
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isMobile && <MobileNavigation userType="practitioner" />}
    </div>
  );
};

export default PractitionerSchedule;