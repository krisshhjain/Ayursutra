import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import DoshaChatbot from "@/components/DoshaChatbot";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import PatientDashboard from "./pages/PatientDashboard";
import PractitionerDashboard from "./pages/PractitionerDashboard";
import PractitionerPatients from "./pages/PractitionerPatients";
import PractitionerSchedule from "./pages/PractitionerSchedule";
import PractitionerScheduleNew from "./pages/PractitionerScheduleNew";
import PractitionerAnalytics from "./pages/PractitionerAnalytics";
import PractitionerFeedback from "./pages/PractitionerFeedback";
import PractitionerProfile from "./pages/PractitionerProfile";
import PractitionerRequests from "./pages/PractitionerRequests";
import NotificationCenter from "./pages/NotificationCenter";
import ProgressTracking from "./pages/ProgressTracking";
import TherapyDetails from "./pages/TherapyDetails";
import PatientSchedule from "./pages/PatientSchedule";
import PatientAppointments from "./pages/PatientAppointments";
import PractitionerChat from "./pages/PractitionerChat";
import FeedbackForm from "./pages/FeedbackForm";
import PatientProfile from "./pages/PatientProfile";
import AppointmentDemo from "./pages/AppointmentDemo";
import NotFound from "./pages/NotFound";
import AdminAuth from "./pages/AdminAuth";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminUserDetail from "./pages/AdminUserDetail";
import AdminCreatePractitioner from "./pages/AdminCreatePractitioner";
import AdminPractitioners from "./pages/AdminPractitioners";
import AdminNotifications from "./pages/AdminNotifications";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminSettings from "./pages/AdminSettings";
import AdminActivityLogs from "./pages/AdminActivityLogs";
import TherapyManagement from "./pages/TherapyManagement";
import PatientTherapyPortal from "./pages/PatientTherapyPortal";
import PatientFeedbackForm from "./pages/PatientFeedbackForm";
import TherapyDashboard from "./pages/TherapyDashboard";

const queryClient = new QueryClient();

// Material UI theme with Ayurveda colors
const theme = createTheme({
  palette: {
    primary: {
      main: 'hsl(120, 25%, 35%)', // sage green
      light: 'hsl(120, 35%, 85%)',
      dark: 'hsl(120, 30%, 25%)',
    },
    secondary: {
      main: 'hsl(41, 25%, 92%)', // warm beige
      dark: 'hsl(25, 15%, 25%)',
    },
    background: {
      default: 'hsl(41, 20%, 98%)',
      paper: 'hsl(0, 0%, 100%)',
    },
    text: {
      primary: 'hsl(25, 15%, 20%)',
      secondary: 'hsl(25, 8%, 45%)',
    },
  },
  typography: {
    fontFamily: "'Inter', 'system-ui', '-apple-system', sans-serif",
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/patient-dashboard" element={<PatientDashboard />} />
            <Route path="/practitioner-dashboard" element={<PractitionerDashboard />} />
            <Route path="/practitioner-patients" element={<PractitionerPatients />} />
            <Route path="/practitioner-schedule" element={<PractitionerSchedule />} />
            <Route path="/practitioner-schedule-new" element={<PractitionerScheduleNew />} />
            <Route path="/practitioner-analytics" element={<PractitionerAnalytics />} />
            <Route path="/practitioner-feedback" element={<PractitionerFeedback />} />
            <Route path="/practitioner-profile" element={<PractitionerProfile />} />
            <Route path="/practitioner-chat" element={<PractitionerChat />} />
            <Route path="/practitioner-requests" element={<PractitionerRequests />} />
            <Route path="/notifications" element={<NotificationCenter />} />
            <Route path="/progress" element={<ProgressTracking />} />
            <Route path="/therapy-details" element={<TherapyDetails />} />
            <Route path="/patient-schedule" element={<PatientSchedule />} />
            <Route path="/patient-appointments" element={<PatientAppointments />} />
            <Route path="/therapy-portal" element={<PatientTherapyPortal />} />
            <Route path="/therapy-management" element={<TherapyManagement />} />
            <Route path="/therapy/:programId" element={<TherapyDashboard userType="patient" />} />
            <Route path="/practitioner/therapy/:programId" element={<TherapyDashboard userType="practitioner" />} />
            <Route path="/patient/therapy/:programId/procedures/:procedureType/feedback" element={<PatientFeedbackForm />} />
            <Route path="/feedback" element={<FeedbackForm />} />
            <Route path="/profile" element={<PatientProfile />} />
            <Route path="/appointment-demo" element={<AppointmentDemo />} />
            {/* Admin routes */}
            <Route path="/admin/auth" element={<AdminAuth />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/users/:id" element={<AdminUserDetail />} />
            <Route path="/admin/practitioners" element={<AdminPractitioners />} />
            <Route path="/admin/practitioners/create" element={<AdminCreatePractitioner />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/logs" element={<AdminActivityLogs />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <DoshaChatbot />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;