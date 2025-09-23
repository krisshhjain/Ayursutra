import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  AlertCircle, 
  Clock,
  Save,
  Trash2,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface UnavailableDate {
  _id: string;
  date: string;
  reason?: string;
  createdAt: string;
}

interface AppointmentSettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const AppointmentSettingsPopup = ({ isOpen, onClose }: AppointmentSettingsPopupProps) => {
  const { toast } = useToast();
  const [unavailableDates, setUnavailableDates] = useState<UnavailableDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [reason, setReason] = useState('');
  const [isAddingDate, setIsAddingDate] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch unavailable dates
  const fetchUnavailableDates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/unavailable-dates', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setUnavailableDates(data.data);
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to fetch unavailable dates',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching unavailable dates:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch unavailable dates',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Add unavailable date
  const addUnavailableDate = async () => {
    if (!selectedDate) {
      toast({
        title: 'Error',
        description: 'Please select a date',
        variant: 'destructive'
      });
      return;
    }

    setIsAddingDate(true);
    try {
      const token = localStorage.getItem('token');
      const dateString = selectedDate.toISOString().split('T')[0];

      const response = await fetch('http://localhost:5000/api/unavailable-dates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: dateString,
          reason: reason.trim()
        })
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Date marked as unavailable successfully'
        });
        setSelectedDate(undefined);
        setReason('');
        setShowAddForm(false);
        fetchUnavailableDates();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to add unavailable date',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error adding unavailable date:', error);
      toast({
        title: 'Error',
        description: 'Failed to add unavailable date',
        variant: 'destructive'
      });
    } finally {
      setIsAddingDate(false);
    }
  };

  // Remove unavailable date
  const removeUnavailableDate = async (dateId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/unavailable-dates/${dateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Unavailable date removed successfully'
        });
        fetchUnavailableDates();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to remove unavailable date',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error removing unavailable date:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove unavailable date',
        variant: 'destructive'
      });
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Check if date is in the past
  const isDateInPast = (dateString: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString < today;
  };

  // Get unavailable dates for calendar
  const getUnavailableDatesForCalendar = () => {
    return unavailableDates.map(item => new Date(item.date + 'T00:00:00'));
  };

  useEffect(() => {
    if (isOpen) {
      fetchUnavailableDates();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-green-600" />
            Availability Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Date Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Block Dates</CardTitle>
              <CardDescription>
                Mark dates when you're not available for appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showAddForm ? (
                <Button 
                  onClick={() => setShowAddForm(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Unavailable Date
                </Button>
              ) : (
                <div className="space-y-4 border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Add New Unavailable Date</h4>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setShowAddForm(false);
                        setSelectedDate(undefined);
                        setReason('');
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Select Date</label>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                        className="rounded-md border w-fit"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Reason (Optional)</label>
                      <Textarea
                        placeholder="e.g., Personal leave, Medical conference, etc."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        maxLength={200}
                        className="resize-none"
                        rows={4}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {reason.length}/200 characters
                      </p>
                      
                      <div className="flex gap-2 mt-4">
                        <Button 
                          onClick={addUnavailableDate}
                          disabled={isAddingDate || !selectedDate}
                          className="flex-1"
                        >
                          {isAddingDate ? (
                            <>
                              <Clock className="h-4 w-4 mr-2 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Add Date
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Unavailable Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Unavailable Dates
              </CardTitle>
              <CardDescription>
                Dates when you're not available for appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Clock className="h-6 w-6 animate-spin text-green-600" />
                  <span className="ml-2">Loading...</span>
                </div>
              ) : unavailableDates.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No unavailable dates</h3>
                  <p className="text-gray-500">
                    You haven't blocked any dates yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {unavailableDates.map((item) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border",
                        isDateInPast(item.date) 
                          ? "bg-gray-50 border-gray-200" 
                          : "bg-white border-gray-200 hover:border-green-300 transition-colors"
                      )}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col">
                            <span className={cn(
                              "font-medium",
                              isDateInPast(item.date) ? "text-gray-500" : "text-gray-900"
                            )}>
                              {formatDate(item.date)}
                            </span>
                            {item.reason && (
                              <span className="text-sm text-gray-600 mt-1">
                                {item.reason}
                              </span>
                            )}
                          </div>
                          {isDateInPast(item.date) && (
                            <Badge variant="secondary" className="text-xs">
                              Past Date
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {!isDateInPast(item.date) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUnavailableDate(item._id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </motion.div>
                  ))}
                  
                  {unavailableDates.some(item => isDateInPast(item.date)) && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Past dates are shown for reference and cannot be removed.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Calendar Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Calendar Overview</CardTitle>
              <CardDescription>
                Visual overview of your unavailable dates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <Calendar
                  mode="multiple"
                  selected={getUnavailableDatesForCalendar()}
                  className="rounded-md border w-fit"
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today;
                  }}
                />
              </div>
              <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-600 rounded"></div>
                  <span>Unavailable dates</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <span>Available dates</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentSettingsPopup;