import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, MapPin, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ReviewSummary } from '@/components/ui/StarRating';
import { useToast } from '@/hooks/use-toast';
import { 
  appointmentAPI, 
  appointmentUtils, 
  type Practitioner, 
  type SlotAvailability,
  type TimeSlot 
} from '@/lib/api/appointments';
import { reviewAPI, type ReviewStats } from '@/lib/api/reviews';

interface BookAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const BookAppointmentDialog = ({ open, onOpenChange, onSuccess }: BookAppointmentDialogProps) => {
  const [step, setStep] = useState<'practitioner' | 'datetime' | 'details' | 'confirm'>('practitioner');
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [practitionerStats, setPractitionerStats] = useState<Record<string, ReviewStats>>({});
  const [selectedPractitioner, setSelectedPractitioner] = useState<Practitioner | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [availability, setAvailability] = useState<SlotAvailability | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const { toast } = useToast();

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      loadPractitioners();
      setStep('practitioner');
      setSelectedPractitioner(null);
      setSelectedDate('');
      setSelectedSlot(null);
      setAvailability(null);
      setNotes('');
    }
  }, [open]);

  // Load practitioners and their review stats
  const loadPractitioners = async () => {
    try {
      setLoading(true);
      const practitionerData = await appointmentAPI.getPractitioners();
      setPractitioners(practitionerData);
      
      // Load review stats for each practitioner
      const statsPromises = practitionerData.map(async (practitioner) => {
        try {
          const stats = await reviewAPI.getPractitionerStats(practitioner._id);
          return { id: practitioner._id, stats };
        } catch (error) {
          // If no reviews exist, return default stats
          return { 
            id: practitioner._id, 
            stats: {
              totalReviews: 0,
              averageRating: 0,
              recommendationRate: 0,
              ratingDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
              aspectAverages: null
            }
          };
        }
      });
      
      const statsResults = await Promise.all(statsPromises);
      const statsMap = statsResults.reduce((acc, { id, stats }) => {
        acc[id] = stats;
        return acc;
      }, {} as Record<string, ReviewStats>);
      
      setPractitionerStats(statsMap);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load practitioners',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Load availability when date/practitioner changes
  useEffect(() => {
    if (selectedPractitioner && selectedDate) {
      loadAvailability();
    }
  }, [selectedPractitioner, selectedDate]);

  const loadAvailability = async () => {
    if (!selectedPractitioner || !selectedDate) return;

    try {
      setLoadingSlots(true);
      const data = await appointmentAPI.getAvailability(selectedPractitioner._id, selectedDate);
      setAvailability(data);
      setSelectedSlot(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load availability',
        variant: 'destructive',
      });
      setAvailability(null);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Handle booking
  const handleBookAppointment = async () => {
    if (!selectedPractitioner || !selectedDate || !selectedSlot) return;

    try {
      setLoading(true);
      
      await appointmentAPI.createAppointment({
        practitionerId: selectedPractitioner._id,
        date: selectedDate,
        slotStartUtc: selectedSlot.startTime,
        duration: 30, // Default duration
        notes: notes.trim() || undefined,
      });

      toast({
        title: 'Success!',
        description: 'Appointment request submitted successfully',
      });

      onOpenChange(false);
      onSuccess?.();
      
    } catch (error) {
      toast({
        title: 'Booking Failed',
        description: error instanceof Error ? error.message : 'Failed to book appointment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate next 7 days for date selection
  const availableDates = appointmentUtils.getNext7Days();

  const canProceedToDateTime = selectedPractitioner !== null;
  const canProceedToDetails = selectedDate && selectedSlot;
  const canConfirm = selectedPractitioner && selectedDate && selectedSlot;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Book Appointment
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-6">
            {['practitioner', 'datetime', 'details', 'confirm'].map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === stepName ? 'bg-primary text-primary-foreground' :
                  ['practitioner', 'datetime', 'details', 'confirm'].indexOf(step) > index ? 'bg-green-500 text-white' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {['practitioner', 'datetime', 'details', 'confirm'].indexOf(step) > index ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < 3 && (
                  <div className={`h-0.5 w-12 mx-2 ${
                    ['practitioner', 'datetime', 'details', 'confirm'].indexOf(step) > index ? 'bg-green-500' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Select Practitioner */}
          {step === 'practitioner' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div>
                <Label className="text-base font-medium">Select Practitioner</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose your preferred practitioner for the appointment
                </p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="grid gap-3">
                  {practitioners.map((practitioner) => {
                    const stats = practitionerStats[practitioner._id];
                    return (
                      <Card
                        key={practitioner._id}
                        className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                          selectedPractitioner?._id === practitioner._id 
                            ? 'ring-2 ring-primary bg-primary/5' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedPractitioner(practitioner)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium">
                              Dr. {practitioner.firstName} {practitioner.lastName}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {practitioner.specialization}
                            </p>
                            {practitioner.experience && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {practitioner.experience} years experience
                              </p>
                            )}
                            {stats && (
                              <div className="mt-2">
                                <ReviewSummary
                                  rating={stats.averageRating}
                                  totalReviews={stats.totalReviews}
                                  recommendationRate={stats.recommendationRate}
                                  size="sm"
                                  showDetails={true}
                                />
                              </div>
                            )}
                          </div>
                          {selectedPractitioner?._id === practitioner._id && (
                            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  onClick={() => setStep('datetime')}
                  disabled={!canProceedToDateTime}
                >
                  Next: Select Date & Time
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Select Date & Time */}
          {step === 'datetime' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <Label className="text-base font-medium">Select Date & Time</Label>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred date and time slot
                </p>
              </div>

              {/* Date Selection */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Select Date</Label>
                <Select value={selectedDate} onValueChange={setSelectedDate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a date" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDates.map((date) => (
                      <SelectItem key={date} value={date}>
                        {appointmentUtils.formatDate(date)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Available Time Slots</Label>
                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : availability?.slots.length ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {availability.slots.filter(slot => slot.available).map((slot, index) => (
                        <Button
                          key={index}
                          variant={selectedSlot === slot ? "default" : "outline"}
                          className="justify-start"
                          onClick={() => setSelectedSlot(slot)}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          {appointmentUtils.formatSlotTime(slot.startTime)}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <Card className="p-4 text-center">
                      <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No available slots for this date
                      </p>
                    </Card>
                  )}
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep('practitioner')}>
                  Back
                </Button>
                <Button 
                  onClick={() => setStep('details')}
                  disabled={!canProceedToDetails}
                >
                  Next: Add Details
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Add Details */}
          {step === 'details' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div>
                <Label className="text-base font-medium">Appointment Details</Label>
                <p className="text-sm text-muted-foreground">
                  Add any notes or special requirements
                </p>
              </div>

              <div>
                <Label htmlFor="notes" className="text-sm font-medium">
                  Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Any specific concerns, symptoms, or requests..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep('datetime')}>
                  Back
                </Button>
                <Button onClick={() => setStep('confirm')}>
                  Next: Review & Confirm
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Confirm */}
          {step === 'confirm' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <Label className="text-base font-medium">Review & Confirm</Label>
                <p className="text-sm text-muted-foreground">
                  Please review your appointment details before confirming
                </p>
              </div>

              <Card className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">
                        Dr. {selectedPractitioner?.firstName} {selectedPractitioner?.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedPractitioner?.specialization}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{appointmentUtils.formatDate(selectedDate)}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedSlot && appointmentUtils.formatSlotTime(selectedSlot.startTime)} - {selectedSlot && appointmentUtils.formatSlotTime(selectedSlot.endTime)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">AyurSutra Clinic</p>
                      <p className="text-sm text-muted-foreground">
                        30 minutes session
                      </p>
                    </div>
                  </div>

                  {notes && (
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-1">Notes:</p>
                      <p className="text-sm text-muted-foreground">{notes}</p>
                    </div>
                  )}
                </div>
              </Card>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Your appointment request will be sent to the practitioner for confirmation. 
                  You will receive a notification once it's confirmed.
                </p>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep('details')}>
                  Back
                </Button>
                <Button 
                  onClick={handleBookAppointment}
                  disabled={!canConfirm || loading}
                >
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Confirm Booking
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookAppointmentDialog;