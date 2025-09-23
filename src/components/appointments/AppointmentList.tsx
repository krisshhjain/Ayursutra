import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  X, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Star,
  Check,
  Plus,
  Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import RatingComponent from '@/components/ui/RatingComponent';
import { 
  appointmentAPI, 
  appointmentUtils, 
  type Appointment,
  type SlotAvailability,
  type TimeSlot 
} from '@/lib/api/appointments';
import { buildApiUrl, getAuthHeaders } from '@/lib/api/config';

const API_BASE_URL = buildApiUrl('');

interface AppointmentCardProps {
  appointment: Appointment;
  onUpdate?: () => void;
  userType?: 'patient' | 'practitioner';
}

const AppointmentCard = ({ appointment, onUpdate, userType = 'patient' }: AppointmentCardProps) => {
  const navigate = useNavigate();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [showTherapyDialog, setShowTherapyDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const { toast } = useToast();

  // Reschedule state
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [availability, setAvailability] = useState<SlotAvailability | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [rescheduleReason, setRescheduleReason] = useState('');

  const canModify = appointmentUtils.canModifyAppointment(appointment);
  const isPractitioner = userType === 'practitioner';
  const canConfirm = isPractitioner && appointment.status === 'requested';
  const canComplete = isPractitioner && appointment.status === 'confirmed';

  // Load available slots for rescheduling
  const loadAvailableSlots = async (date: string) => {
    if (!date) return;
    
    try {
      setLoadingSlots(true);
      const practitionerId = typeof appointment.practitionerId === 'string' 
        ? appointment.practitionerId 
        : appointment.practitionerId._id;
      const slots = await appointmentAPI.getAvailability(practitionerId, date);
      setAvailability(slots);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load available slots',
        variant: 'destructive',
      });
    } finally {
      setLoadingSlots(false);
    }
  };

  // Handle reschedule
  const handleReschedule = async () => {
    if (!selectedSlot || !selectedDate) {
      toast({
        title: 'Error',
        description: 'Please select a new date and time',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      await appointmentAPI.updateAppointment(appointment._id, {
        action: 'reschedule',
        newDate: selectedDate,
        newSlotStartUtc: selectedSlot.startTime,
        reason: rescheduleReason || 'Rescheduled by practitioner'
      });

      toast({
        title: 'Success',
        description: 'Appointment rescheduled successfully',
      });

      setShowRescheduleDialog(false);
      setSelectedDate('');
      setSelectedSlot(null);
      setAvailability(null);
      setRescheduleReason('');
      onUpdate?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reschedule appointment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate date options (next 30 days)
  const getDateOptions = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip Sundays (day 0)
      if (date.getDay() !== 0) {
        const dateStr = date.toISOString().split('T')[0];
        const displayDate = date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        });
        dates.push({ value: dateStr, label: displayDate });
      }
    }
    
    return dates;
  };

  // Check if patient has already reviewed this appointment
  useEffect(() => {
    const checkExistingReview = async () => {
      if (appointment.status === 'completed' && !isPractitioner) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_BASE_URL}/reviews/appointment/${appointment._id}/exists`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const { hasReview } = await response.json();
            setHasReviewed(hasReview);
          }
        } catch (error) {
          console.log('Could not check review status:', error);
        }
      }
    };
    
    checkExistingReview();
  }, [appointment._id, appointment.status, isPractitioner]);

  // Handle adding patient to Panchakarma therapy program
  const handleAddToTherapy = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Debug logs
      console.log('Appointment data:', appointment);
      console.log('Patient ID:', appointment.patientId?._id || appointment.patientId);
      console.log('User data:', user);
      console.log('Practitioner ID:', user._id); // Changed from user.userId to user._id
      
      const requestBody = {
        patientId: appointment.patientId?._id || appointment.patientId,
        programType: 'panchakarma', // Default to Panchakarma therapy
        primaryPractitionerId: user._id, // Changed from user.userId to user._id
        startDate: new Date().toISOString(),
        notes: `Panchakarma therapy program created from appointment on ${new Date().toLocaleDateString()}`
      };
      
      console.log('Request body being sent:', requestBody);
      
      const response = await fetch(`${API_BASE_URL}/therapy/programs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('API Response:', data);
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Patient successfully added to Panchakarma therapy program!',
        });
        setShowTherapyDialog(false);
        // Just close the dialog and show success - no navigation needed
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to add patient to therapy program',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error adding patient to therapy:', error);
      toast({
        title: 'Error',
        description: 'Failed to add patient to therapy program',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle appointment completion (practitioner only)
  const handleComplete = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Debug logging
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('Appointment ID:', appointment._id);
      console.log('API URL:', `${API_BASE_URL}/appointments/${appointment._id}/complete`);
      
      if (!token) {
        toast({
          title: 'Error',
          description: 'You must be logged in to complete appointments',
          variant: 'destructive',
        });
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/appointments/${appointment._id}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionNotes: 'Session completed', // You can add a dialog for notes later
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Appointment marked as completed successfully',
        });
        onUpdate?.();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to complete appointment',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Complete appointment error:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete appointment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle appointment cancellation
  const handleCancel = async () => {
    try {
      setLoading(true);
      await appointmentAPI.updateAppointment(appointment._id, {
        action: 'cancel',
        reason: 'Cancelled by user'
      });

      toast({
        title: 'Success',
        description: 'Appointment cancelled successfully',
      });

      onUpdate?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to cancel appointment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setShowCancelDialog(false);
    }
  };

  // Handle appointment confirmation (practitioner only)
  const handleConfirm = async () => {
    try {
      setLoading(true);
      await appointmentAPI.confirmAppointment(appointment._id);

      toast({
        title: 'Success',
        description: 'Appointment confirmed successfully',
      });

      onUpdate?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to confirm appointment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium text-foreground">
                {appointment.notes || 'Consultation'}
              </h4>
              <Badge className={appointmentUtils.getStatusColor(appointment.status)}>
                {appointment.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{appointmentUtils.formatDate(appointment.date)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  {appointmentUtils.toLocalTimeString(appointment.slotStartUtc)} - {appointmentUtils.toLocalTimeString(appointment.slotEndUtc)}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>
                  {isPractitioner 
                    ? `${appointment.patientId.firstName} ${appointment.patientId.lastName}`
                    : `Dr. ${appointment.practitionerId.firstName} ${appointment.practitionerId.lastName}`
                  }
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>AyurSutra Clinic</span>
              </div>
            </div>

            {appointment.practitionerId.specialization && (
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  {appointment.practitionerId.specialization}
                </Badge>
              </div>
            )}
          </div>

          {(canModify || canConfirm || canComplete) && (
            <div className="flex items-center gap-1">
              {canConfirm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleConfirm}
                  disabled={loading}
                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                  title="Confirm Appointment"
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
              )}
              
              {canComplete && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleComplete}
                    disabled={loading}
                    className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    title="Mark as Complete"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTherapyDialog(true)}
                    disabled={loading}
                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                    title="Add to Therapy Program"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              {canModify && (
                <>
                  {/* Only show reschedule for practitioners */}
                  {isPractitioner && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowRescheduleDialog(true)}
                      className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      title="Reschedule Appointment"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCancelDialog(true)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Cancel Appointment"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Status-specific messages */}
        {appointment.status === 'requested' && !isPractitioner && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">Pending Confirmation</p>
                <p className="text-yellow-700">
                  Your appointment request is pending practitioner confirmation.
                </p>
              </div>
            </div>
          </div>
        )}

        {appointment.status === 'confirmed' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-800">Confirmed</p>
                <p className="text-green-700">
                  Your appointment is confirmed. Please arrive 15 minutes early.
                </p>
              </div>
            </div>
          </div>
        )}

        {appointment.status === 'completed' && !isPractitioner && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800">Appointment Completed</p>
                  <p className="text-blue-700">
                    {hasReviewed 
                      ? 'Thank you for your review!' 
                      : 'Your session is complete. Share your experience to help others.'
                    }
                  </p>
                </div>
              </div>
              {!hasReviewed && (
                <Button
                  onClick={() => setShowRatingDialog(true)}
                  size="sm"
                  className="ml-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Star className="h-4 w-4 mr-1" />
                  Rate & Review
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Reschedule Dialog */}
      <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Current Appointment Info */}
            <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium">Current Appointment:</p>
              <p className="text-sm text-muted-foreground">
                <strong>Patient:</strong> {appointment.patientId?.firstName} {appointment.patientId?.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Current Date:</strong> {appointmentUtils.formatDate(appointment.date)}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Current Time:</strong> {appointmentUtils.toLocalTimeString(appointment.slotStartUtc)} - {appointmentUtils.toLocalTimeString(appointment.slotEndUtc)}
              </p>
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <Label htmlFor="reschedule-date">Select New Date</Label>
              <Select 
                value={selectedDate} 
                onValueChange={(value) => {
                  setSelectedDate(value);
                  setSelectedSlot(null);
                  loadAvailableSlots(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a date" />
                </SelectTrigger>
                <SelectContent>
                  {getDateOptions().map((date) => (
                    <SelectItem key={date.value} value={date.value}>
                      {date.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div className="space-y-2">
                <Label htmlFor="reschedule-time">Select New Time</Label>
                {loadingSlots ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm">Loading available slots...</span>
                  </div>
                ) : availability?.slots.length ? (
                  <Select 
                    value={selectedSlot ? `${selectedSlot.startTime}-${selectedSlot.endTime}` : ''} 
                    onValueChange={(value) => {
                      const slot = availability.slots.find(s => `${s.startTime}-${s.endTime}` === value);
                      setSelectedSlot(slot || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {availability.slots
                        .filter(slot => slot.available)
                        .map((slot, index) => (
                          <SelectItem key={index} value={`${slot.startTime}-${slot.endTime}`}>
                            {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-muted-foreground py-2">No available slots for this date</p>
                )}
              </div>
            )}

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reschedule-reason">Reason (Optional)</Label>
              <Textarea
                id="reschedule-reason"
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                placeholder="Reason for rescheduling..."
                className="min-h-[80px]"
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowRescheduleDialog(false);
                  setSelectedDate('');
                  setSelectedSlot(null);
                  setAvailability(null);
                  setRescheduleReason('');
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleReschedule}
                disabled={loading || !selectedSlot || !selectedDate}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Reschedule Appointment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <AlertDialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Rate Your Experience</AlertDialogTitle>
            <AlertDialogDescription>
              Share your experience with Dr. {appointment.practitionerId?.firstName} {appointment.practitionerId?.lastName} to help other patients.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <RatingComponent
              appointment={{
                id: appointment._id,
                practitioner: `${appointment.practitionerId?.firstName} ${appointment.practitionerId?.lastName}`,
                practitionerId: appointment.practitionerId?._id || '',
                therapy: appointment.practitionerId?.specialization || 'Consultation',
                date: new Date(appointment.date).toLocaleDateString(),
                time: new Date(appointment.slotStartUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              }}
              onReviewSubmitted={() => {
                setShowRatingDialog(false);
                setHasReviewed(true);
                toast({
                  title: 'Thank you!',
                  description: 'Your review has been submitted successfully.',
                });
              }}
            />
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Panchakarma Therapy Confirmation Dialog */}
      <Dialog open={showTherapyDialog} onOpenChange={setShowTherapyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Patient to Panchakarma Therapy</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Patient:</strong> {appointment.patientId?.firstName} {appointment.patientId?.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Current Appointment:</strong> {appointment.practitionerId?.specialization || 'Consultation'}
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <h4 className="font-medium text-green-800">Complete Panchakarma Therapy Program</h4>
              </div>
              <p className="text-sm text-green-700">
                This will enroll the patient in a comprehensive Panchakarma therapy program including 
                all traditional procedures: Vamana, Virechana, Basti, Nasya, and Raktamokshana. 
                The doctor can then manage and schedule each procedure individually.
              </p>
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowTherapyDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddToTherapy}
                className="bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Add to Panchakarma Therapy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Yes, Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

interface AppointmentListProps {
  userType?: 'patient' | 'practitioner';
  statusFilter?: string;
  onRefresh?: () => void;
}

const AppointmentList = ({ userType = 'patient', statusFilter = 'all', onRefresh }: AppointmentListProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load appointments
  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Map frontend filter to backend status
      let params = {};
      if (statusFilter !== 'all') {
        switch (statusFilter) {
          case 'upcoming':
            // For upcoming, we don't filter by status on the backend
            // Instead we'll filter on the frontend to include both confirmed and requested appointments
            // that are in the future
            params = {};
            break;
          case 'completed':
            params = { status: 'completed' };
            break;
          case 'requested':
            params = { status: 'requested' };
            break;
          default:
            // If statusFilter is already a valid backend status, use it directly
            const validStatuses = ['requested', 'confirmed', 'rescheduled', 'cancelled', 'completed'];
            if (validStatuses.includes(statusFilter)) {
              params = { status: statusFilter };
            }
            break;
        }
      }
      
      const data = await appointmentAPI.getAppointments(params);
      
      // Apply frontend filtering for special cases
      let filteredAppointments = data.appointments;
      if (statusFilter === 'upcoming') {
        const now = new Date();
        filteredAppointments = data.appointments.filter(appointment => {
          // Include confirmed and requested appointments that are in the future
          const appointmentDate = new Date(appointment.slotStartUtc);
          return (appointment.status === 'confirmed' || appointment.status === 'requested') && 
                 appointmentDate > now;
        });
      }
      
      setAppointments(filteredAppointments);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load appointments';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [statusFilter]);

  useEffect(() => {
    if (onRefresh) {
      loadAppointments();
    }
  }, [onRefresh]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading appointments...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button onClick={loadAppointments} variant="outline">
          Try Again
        </Button>
      </Card>
    );
  }

  if (appointments.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          {statusFilter === 'all' 
            ? 'No appointments found' 
            : `No ${statusFilter} appointments found`
          }
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment, index) => (
        <motion.div
          key={appointment._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <AppointmentCard
            appointment={appointment}
            onUpdate={loadAppointments}
            userType={userType}
          />
        </motion.div>
      ))}
    </div>
  );
};

export { AppointmentCard, AppointmentList };