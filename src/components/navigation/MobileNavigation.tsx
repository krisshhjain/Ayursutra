import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  Calendar, 
  Bell, 
  TrendingUp,
  User,
  MessageSquare,
  Settings,
  PlusCircle,
  BarChart3,
  CalendarCheck,
  MessageCircle,
  Leaf
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: any;
  label: string;
  path: string;
  badge?: number;
}

interface MobileNavigationProps {
  userType: 'patient' | 'practitioner';
}

const MobileNavigation = ({ userType }: MobileNavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const patientNavItems: NavItem[] = [
    { icon: Home, label: 'Dashboard', path: '/patient-dashboard' },
    { icon: Calendar, label: 'Schedule', path: '/patient-schedule' },
    { icon: Leaf, label: 'Therapy', path: '/therapy-portal' },
    { icon: TrendingUp, label: 'Progress', path: '/progress' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const practitionerNavItems: NavItem[] = [
    { icon: Home, label: 'Dashboard', path: '/practitioner-dashboard' },
    { icon: Calendar, label: 'Schedule', path: '/practitioner-schedule' },
    { icon: Leaf, label: 'Therapy', path: '/therapy-management' },
    { icon: BarChart3, label: 'Analytics', path: '/reports' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const navItems = userType === 'patient' ? patientNavItems : practitionerNavItems;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
    >
      <div className="bg-card border-t border-border/50 backdrop-blur-lg bg-card/95">
        <div className="flex justify-around items-center py-2 px-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 relative",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <div className="relative">
                  <item.icon className="h-5 w-5" />
                  {item.badge && (
                    <div className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {item.badge}
                    </div>
                  )}
                </div>
                <span className="text-xs mt-1 font-medium">{item.label}</span>
                
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default MobileNavigation;