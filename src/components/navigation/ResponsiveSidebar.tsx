import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Activity,
  Calendar, 
  Bell, 
  TrendingUp,
  User,
  MessageSquare,
  Settings,
  LogOut,
  Leaf,
  Menu,
  X,
  BarChart3,
  Users,
  FileCheck,
  CalendarCheck,
  MessageCircle
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@mui/material';
import NotificationBell from '@/components/ui/NotificationBell';

interface SidebarProps {
  userType: 'patient' | 'practitioner';
  userName: string;
  userRole: string;
}

const ResponsiveSidebar = ({ userType, userName, userRole }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const patientMenuItems = [
    { icon: Activity, label: 'Dashboard', path: '/patient-dashboard', active: true },
    { icon: Calendar, label: 'Schedule', path: '/patient-schedule' },
    { icon: CalendarCheck, label: 'Appointments', path: '/patient-appointments' },
    { icon: Leaf, label: 'Therapy Portal', path: '/therapy-portal' },
    { icon: TrendingUp, label: 'Progress', path: '/progress' },
    { icon: MessageSquare, label: 'Feedback', path: '/feedback' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const practitionerMenuItems = [
    { icon: Activity, label: 'Dashboard', path: '/practitioner-dashboard', active: true },
    { icon: Users, label: 'Patients', path: '/practitioner-patients' },
    { icon: Calendar, label: 'Schedule', path: '/practitioner-schedule-new' },
    { icon: Leaf, label: 'Therapy Management', path: '/therapy-management' },
    { icon: FileCheck, label: 'Appointment Requests', path: '/practitioner-requests' },
    { icon: MessageCircle, label: 'Chat', path: '/practitioner-chat' },
    { icon: BarChart3, label: 'Analytics', path: '/practitioner-analytics' },
    { icon: User, label: 'Profile', path: '/practitioner-profile' },
  ];

  const menuItems = userType === 'patient' ? patientMenuItems : practitionerMenuItems;

  const isActive = (path: string) => location.pathname === path;

  if (isMobile) {
    return (
      <>
        {/* Mobile Header */}
        <header className="fixed top-0 left-0 right-0 z-40 bg-card border-b border-border/50 backdrop-blur-lg bg-card/95">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <img src="/Ayursutra.png" alt="AyurSutra Logo" className="h-15 w-15 object-contain" />
              <span className="text-xl font-bold text-primary">AyurSutra</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <NotificationBell onNotificationClick={() => navigate('/notifications')} />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(true)}
                className="md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Mobile Slide-out Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
                className="fixed left-0 top-0 h-full w-80 bg-card border-r border-border/50 p-6 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <img src="/Ayursutra.png" alt="AyurSutra Logo" className="h-12 w-12 object-contain" />
                  <span className="text-2xl font-bold text-primary">AyurSutra</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <Button
                    key={item.label}
                    variant={isActive(item.path) ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isActive(item.path) ? 'bg-primary/10 text-primary' : ''
                    )}
                    onClick={() => {
                      navigate(item.path);
                      setIsOpen(false);
                    }}
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.label}
                  </Button>
                ))}
              </nav>

              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center space-x-3 mb-4 p-3 bg-muted/50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{userName}</p>
                    <p className="text-sm text-muted-foreground">{userRole}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={() => navigate('/')}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </>
    );
  }

  // Desktop Sidebar
  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border/50 flex-col hidden md:flex z-30">
      {/* Logo */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/Ayursutra.png" alt="AyurSutra Logo" className="h-12 w-12 object-contain" />
            <span className="text-xl font-bold text-primary">AyurSutra</span>
          </div>
          <NotificationBell onNotificationClick={() => navigate('/notifications')} />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Button
            key={item.label}
            variant={isActive(item.path) ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start",
              isActive(item.path) ? 'bg-primary/10 text-primary' : ''
            )}
            onClick={() => navigate(item.path)}
          >
            <item.icon className="mr-3 h-4 w-4" />
            {item.label}
          </Button>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-border/50">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-foreground">{userName}</p>
            <p className="text-sm text-muted-foreground">{userRole}</p>
          </div>
        </div>
        <div className="space-y-2">
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={() => navigate('/')}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveSidebar;