import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ResponsiveSidebar from '@/components/navigation/ResponsiveSidebar';
import MobileNavigation from '@/components/navigation/MobileNavigation';
import BookAppointmentDialog from '@/components/appointments/BookAppointmentDialog';
import { AppointmentList } from '@/components/appointments/AppointmentList';
import { useMediaQuery } from '@mui/material';

const AppointmentDemo = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
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
          userName="Demo User" 
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
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Appointment Booking System
                </h1>
                <p className="text-lg text-muted-foreground">
                  Demo & Integration Test
                </p>
              </div>
            </div>
          </motion.div>

          {/* Status Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <Card className="p-6 border-green-200 bg-green-50">
              <div className="flex items-start gap-4">
                <CheckCircle className="h-8 w-8 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-green-800 mb-2">Backend Ready</h3>
                  <p className="text-sm text-green-700 mb-3">
                    Appointment booking APIs are fully implemented and tested
                  </p>
                  <Badge className="bg-green-100 text-green-800">
                    ✅ 5 Phases Complete
                  </Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-blue-200 bg-blue-50">
              <div className="flex items-start gap-4">
                <Info className="h-8 w-8 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-800 mb-2">Frontend Integration</h3>
                  <p className="text-sm text-blue-700 mb-3">
                    React components with full booking workflow
                  </p>
                  <Badge className="bg-blue-100 text-blue-800">
                    🚀 Live Components
                  </Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-yellow-200 bg-yellow-50">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-8 w-8 text-yellow-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-2">Demo Mode</h3>
                  <p className="text-sm text-yellow-700 mb-3">
                    Test the booking system with demo data
                  </p>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    🧪 Testing Phase
                  </Badge>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Features Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">✨ Features Implemented</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-primary">🎯 Core Booking</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Practitioner selection</li>
                    <li>• Real-time availability checking</li>
                    <li>• Time slot booking</li>
                    <li>• Conflict prevention</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-primary">⚡ Advanced Features</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Request → Confirm workflow</li>
                    <li>• Appointment management</li>
                    <li>• Notification system</li>
                    <li>• Buffer time handling</li>
                  </ul>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-4 mb-8"
          >
            <Button 
              size="lg"
              onClick={() => setShowBookingDialog(true)}
              className="gap-2"
            >
              <Calendar className="h-5 w-5" />
              Test Book Appointment
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setRefreshKey(prev => prev + 1)}
            >
              Refresh Appointments
            </Button>
          </motion.div>

          {/* Appointments List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-xl font-semibold mb-4">Your Appointments</h3>
            <AppointmentList 
              userType="patient" 
              statusFilter="all"
              key={refreshKey}
            />
          </motion.div>

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

export default AppointmentDemo;