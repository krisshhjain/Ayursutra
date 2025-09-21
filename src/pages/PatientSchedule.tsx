import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Plus, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ResponsiveSidebar from '@/components/navigation/ResponsiveSidebar';
import MobileNavigation from '@/components/navigation/MobileNavigation';
import BookAppointmentDialog from '@/components/appointments/BookAppointmentDialog';
import { AppointmentList } from '@/components/appointments/AppointmentList';
import RatingComponent from '@/components/ui/RatingComponent';
import { useMediaQuery } from '@mui/material';

const PatientSchedule = () => {
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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'completed' | 'requested'>('all');
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleBookingSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && (
        <ResponsiveSidebar 
          userType="patient" 
          userName={getUserName()} 
          userRole="Patient" 
        />
      )}
      
      <div className={`${!isMobile ? 'ml-64' : ''}`}>
        <main className="p-6">
          {isMobile && <div className="pb-20" />}
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
          >
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Schedule</h1>
              <p className="text-muted-foreground">Manage your therapy appointments</p>
            </div>
            
            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="flex bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                  className="px-3"
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  {!isMobile && 'Calendar'}
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="px-3"
                >
                  <Filter className="h-4 w-4 mr-1" />
                  {!isMobile && 'List'}
                </Button>
              </div>

              <Button 
                className="gap-2"
                onClick={() => setShowBookingDialog(true)}
              >
                <Plus className="h-4 w-4" />
                {!isMobile && 'Book Appointment'}
              </Button>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                All Appointments
              </Button>
              <Button
                variant={filterStatus === 'requested' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('requested')}
              >
                Pending
              </Button>
              <Button
                variant={filterStatus === 'upcoming' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('upcoming')}
              >
                Upcoming
              </Button>
              <Button
                variant={filterStatus === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('completed')}
              >
                Completed
              </Button>
            </div>
          </motion.div>

          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Mini Calendar */}
              <Card className="p-6 lg:col-span-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">
                    {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        const newDate = new Date(selectedDate);
                        newDate.setMonth(newDate.getMonth() - 1);
                        setSelectedDate(newDate);
                      }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        const newDate = new Date(selectedDate);
                        newDate.setMonth(newDate.getMonth() + 1);
                        setSelectedDate(newDate);
                      }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
                  <div>Sun</div>
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <button
                      key={day}
                      className={`aspect-square flex items-center justify-center text-sm rounded-md hover:bg-muted transition-colors ${
                        day === new Date().getDate() ? 'bg-primary text-primary-foreground font-semibold' : ''
                      }`}
                      onClick={() => {
                        const newDate = new Date(selectedDate);
                        newDate.setDate(day);
                        setSelectedDate(newDate);
                      }}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Appointments for selected date */}
              <div className="lg:col-span-2">
                <h3 className="font-semibold text-foreground mb-4">
                  Appointments for {selectedDate.toLocaleDateString()}
                </h3>
                <AppointmentList 
                  userType="patient" 
                  statusFilter={filterStatus}
                  key={`calendar-${refreshKey}`}
                />
              </div>
            </motion.div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <AppointmentList 
                userType="patient" 
                statusFilter={filterStatus}
                key={`list-${refreshKey}`}
              />
            </motion.div>
          )}

          {/* Book Appointment Dialog */}
          <BookAppointmentDialog
            open={showBookingDialog}
            onOpenChange={setShowBookingDialog}
            onSuccess={handleBookingSuccess}
          />
        </main>
      </div>

      {isMobile && <MobileNavigation userType="patient" />}
    </div>
  );
};

export default PatientSchedule;