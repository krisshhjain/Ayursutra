import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileCheck, 
  Clock, 
  User, 
  Calendar,
  CheckCircle, 
  XCircle,
  AlertCircle,
  Loader2,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import ResponsiveSidebar from '@/components/navigation/ResponsiveSidebar';
import MobileNavigation from '@/components/navigation/MobileNavigation';
import { useToast } from '@/hooks/use-toast';
import { useMediaQuery } from '@mui/material';
import { getUser } from '@/lib/auth';
import { 
  appointmentAPI, 
  appointmentUtils, 
  type Appointment 
} from '@/lib/api/appointments';

interface AppointmentRequestCardProps {
  appointment: Appointment;
  onUpdate: () => void;
}

const AppointmentRequestCard = ({ appointment, onUpdate }: AppointmentRequestCardProps) => {
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const { toast } = useToast();

  const handleApprove = async () => {
    try {
      setLoading(true);
      await appointmentAPI.confirmAppointment(appointment._id);
      
      toast({
        title: 'Success!',
        description: 'Appointment request approved successfully',
      });
      
      onUpdate();
      setShowConfirmDialog(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to approve appointment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setLoading(true);
      await appointmentAPI.updateAppointment(appointment._id, {
        action: 'cancel',
        reason: 'Cancelled by practitioner'
      });
      
      toast({
        title: 'Cancelled',
        description: 'Appointment request cancelled',
      });
      
      onUpdate();
      setShowCancelDialog(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to cancel appointment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="p-6 hover:shadow-md transition-all duration-200 border-l-4 border-l-yellow-400">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Patient Info */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-lg">
                  {appointment.patientId.firstName} {appointment.patientId.lastName}
                </h3>
                <Badge variant="outline" className="text-xs">
                  New Request
                </Badge>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{appointmentUtils.formatDate(appointment.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {appointmentUtils.toLocalTimeString(appointment.slotStartUtc)} - 
                  {appointmentUtils.toLocalTimeString(appointment.slotEndUtc)}
                </span>
              </div>
            </div>

            {/* Notes */}
            {appointment.notes && (
              <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Patient Notes:</p>
                <p className="text-sm">{appointment.notes}</p>
              </div>
            )}

            {/* Request Time */}
            <div className="text-xs text-muted-foreground">
              Requested {new Date(appointment.createdAt).toLocaleString()}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 ml-4">
            <Button
              size="sm"
              onClick={() => setShowConfirmDialog(true)}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setShowCancelDialog(true)}
              disabled={loading}
            >
              <XCircle className="h-4 w-4" />
              Decline
            </Button>
          </div>
        </div>
      </Card>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Appointment Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this appointment request from{' '}
              {appointment.patientId.firstName} {appointment.patientId.lastName}?
              <br />
              <br />
              <strong>Date:</strong> {appointmentUtils.formatDate(appointment.date)}
              <br />
              <strong>Time:</strong> {appointmentUtils.toLocalTimeString(appointment.slotStartUtc)} - 
              {appointmentUtils.toLocalTimeString(appointment.slotEndUtc)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Approve Appointment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Decline Appointment Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to decline this appointment request from{' '}
              {appointment.patientId.firstName} {appointment.patientId.lastName}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancel} 
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Decline Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const PractitionerRequests = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Get current user info
  const currentUser = getUser();
  const practitionerName = currentUser ? `Dr. ${currentUser.firstName} ${currentUser.lastName}` : 'Dr. Practitioner';

  // Load appointment requests
  const loadRequests = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      // Only fetch requested appointments
      const data = await appointmentAPI.getAppointments({ status: 'requested' });
      setAppointments(data.appointments);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load appointment requests';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadRequests();
  }, []);

  const handleRefresh = () => {
    loadRequests(true);
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
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <FileCheck className="h-8 w-8 text-primary" />
                Appointment Requests
              </h1>
              <p className="text-lg text-muted-foreground">
                Review and manage incoming appointment requests
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </motion.div>

          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {appointments.length} Pending Request{appointments.length !== 1 ? 's' : ''}
                  </h3>
                  <p className="text-muted-foreground">
                    {appointments.length === 0 
                      ? 'No appointment requests at the moment' 
                      : 'Review and respond to patient appointment requests'
                    }
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Appointment Requests List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading requests...</span>
              </div>
            ) : error ? (
              <Card className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Error Loading Requests</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={() => loadRequests()}>Try Again</Button>
              </Card>
            ) : appointments.length === 0 ? (
              <Card className="p-8 text-center">
                <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Pending Requests</h3>
                <p className="text-muted-foreground">
                  All caught up! You'll see new appointment requests here as they come in.
                </p>
              </Card>
            ) : (
              appointments.map((appointment) => (
                <AppointmentRequestCard 
                  key={appointment._id} 
                  appointment={appointment}
                  onUpdate={handleRefresh}
                />
              ))
            )}
          </motion.div>
        </main>
      </div>

      {isMobile && <MobileNavigation userType="practitioner" />}
    </div>
  );
};

export default PractitionerRequests;