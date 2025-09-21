import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Filter, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ResponsiveSidebar from '@/components/navigation/ResponsiveSidebar';
import MobileNavigation from '@/components/navigation/MobileNavigation';
import { AppointmentList } from '@/components/appointments/AppointmentList';
import { useMediaQuery } from '@mui/material';
import { getUser } from '@/lib/auth';

const PractitionerSchedule = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'all-confirmed'>('list');
  const [filterStatus, setFilterStatus] = useState<'all' | 'requested' | 'confirmed' | 'completed'>('all');
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Get current user info
  const currentUser = getUser();
  const practitionerName = currentUser ? `Dr. ${currentUser.firstName} ${currentUser.lastName}` : 'Dr. Practitioner';

  const handleAppointmentUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && (
        <ResponsiveSidebar 
          userType="practitioner" 
          userName={practitionerName}
          userRole="Practitioner" 
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
              <p className="text-muted-foreground">Manage your appointments and availability</p>
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
                <Button
                  variant={viewMode === 'all-confirmed' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('all-confirmed')}
                  className="px-3"
                >
                  <Clock className="h-4 w-4 mr-1" />
                  {!isMobile && 'Complete'}
                </Button>
              </div>

              <Button variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                {!isMobile && 'Availability Settings'}
              </Button>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
          >
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                  <p className="text-2xl font-bold text-yellow-600">3</p>
                </div>
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Appointments</p>
                  <p className="text-2xl font-bold text-green-600">5</p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold text-blue-600">24</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available Slots</p>
                  <p className="text-2xl font-bold text-purple-600">12</p>
                </div>
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
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
                className="relative"
              >
                Pending Requests
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>
              <Button
                variant={filterStatus === 'confirmed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('confirmed')}
              >
                Confirmed
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
              transition={{ delay: 0.3 }}
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
                  userType="practitioner" 
                  statusFilter={filterStatus}
                  onRefresh={handleAppointmentUpdate}
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
              transition={{ delay: 0.3 }}
            >
              <AppointmentList 
                userType="practitioner" 
                statusFilter={filterStatus}
                onRefresh={handleAppointmentUpdate}
                key={`list-${refreshKey}`}
              />
            </motion.div>
          )}

          {/* All Confirmed Appointments View for Completion */}
          {viewMode === 'all-confirmed' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-foreground mb-2">Confirmed Appointments Ready for Completion</h2>
                <p className="text-muted-foreground">Mark appointments as completed to allow patients to rate and review your service. You can complete appointments from any date.</p>
              </div>
              <AppointmentList 
                userType="practitioner" 
                statusFilter="confirmed"
                onRefresh={handleAppointmentUpdate}
                key={`confirmed-${refreshKey}`}
              />
            </motion.div>
          )}
        </main>
      </div>

      {isMobile && <MobileNavigation userType="practitioner" />}
    </div>
  );
};

export default PractitionerSchedule;