import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Calendar, Info, Shield, Heart, FileText, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import ResponsiveSidebar from '@/components/navigation/ResponsiveSidebar';
import MobileNavigation from '@/components/navigation/MobileNavigation';
import { useMediaQuery } from '@mui/material';

const TherapyDetails = () => {
  const navigate = useNavigate();
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
  const [activeTab, setActiveTab] = useState('overview');

  const therapyData = {
    name: 'Panchakarma Detoxification Program',
    duration: '21 Days',
    phase: 'Purva Karma (Preparation)',
    progress: 35,
    nextSession: 'Tomorrow, 10:00 AM',
    practitioner: 'Dr. Priya Sharma',
    description: 'A comprehensive detoxification program designed to eliminate toxins and restore balance to your body and mind.',
  };

  const precareSteps = [
    { title: 'Oil Massage', description: 'Self-massage with warm sesame oil 30 minutes before therapy', time: '30 min before' },
    { title: 'Light Breakfast', description: 'Consume easily digestible foods like fruits or porridge', time: '2 hours before' },
    { title: 'Hydration', description: 'Drink warm water infused with ginger and lemon', time: '1 hour before' },
    { title: 'Mental Preparation', description: 'Practice 10 minutes of meditation or deep breathing', time: '15 min before' },
  ];

  const postcareSteps = [
    { title: 'Rest Period', description: 'Avoid physical activity for 2-3 hours post-therapy', time: '2-3 hours after' },
    { title: 'Warm Shower', description: 'Take a warm shower with herbal oils if recommended', time: '30 min after' },
    { title: 'Light Meal', description: 'Consume warm, cooked foods. Avoid raw or cold foods', time: '1 hour after' },
    { title: 'Hydration', description: 'Continue drinking warm water throughout the day', time: 'Ongoing' },
  ];

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
        <main className="p-6">{isMobile && <div className="pb-20" />}
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-6"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/patient-dashboard')}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{therapyData.name}</h1>
              <p className="text-muted-foreground">Comprehensive healing journey</p>
            </div>
          </motion.div>

          {/* Therapy Overview Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 mb-6 bg-gradient-subtle border-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-semibold text-foreground">{therapyData.duration}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Next Session</p>
                    <p className="font-semibold text-foreground">{therapyData.nextSession}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <p className="font-semibold text-foreground">{therapyData.progress}% Complete</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">Treatment Progress</span>
                  <Badge variant="secondary">{therapyData.phase}</Badge>
                </div>
                <Progress value={therapyData.progress} className="h-3" />
              </div>
            </Card>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="precare">Pre-care</TabsTrigger>
                <TabsTrigger value="postcare">Post-care</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="feedback">Feedback</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Info className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">About This Therapy</h3>
                    </div>
                    <p className="text-muted-foreground mb-4">{therapyData.description}</p>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Practitioner</span>
                        <span className="text-sm font-medium text-foreground">{therapyData.practitioner}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Treatment Type</span>
                        <span className="text-sm font-medium text-foreground">Panchakarma</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Intensity</span>
                        <span className="text-sm font-medium text-foreground">Moderate</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Heart className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">Expected Benefits</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Complete body detoxification</li>
                      <li>• Improved digestion and metabolism</li>
                      <li>• Enhanced mental clarity and focus</li>
                      <li>• Balanced doshas (Vata, Pitta, Kapha)</li>
                      <li>• Strengthened immune system</li>
                      <li>• Stress reduction and relaxation</li>
                    </ul>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="precare" className="mt-6">
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Shield className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Pre-Treatment Care</h3>
                  </div>
                  <div className="space-y-4">
                    {precareSteps.map((step, index) => (
                      <div key={index} className="flex gap-4 p-4 bg-muted/50 rounded-lg">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-primary">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-medium text-foreground">{step.title}</h4>
                            <Badge variant="outline" className="text-xs">{step.time}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="postcare" className="mt-6">
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Heart className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Post-Treatment Care</h3>
                  </div>
                  <div className="space-y-4">
                    {postcareSteps.map((step, index) => (
                      <div key={index} className="flex gap-4 p-4 bg-muted/50 rounded-lg">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-primary">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-medium text-foreground">{step.title}</h4>
                            <Badge variant="outline" className="text-xs">{step.time}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="progress" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Treatment Phases</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        <div>
                          <p className="font-medium text-foreground">Purva Karma (Preparation)</p>
                          <p className="text-sm text-muted-foreground">Days 1-7 • Current Phase</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="w-3 h-3 bg-muted-foreground/50 rounded-full"></div>
                        <div>
                          <p className="font-medium text-muted-foreground">Pradhan Karma (Main Treatment)</p>
                          <p className="text-sm text-muted-foreground">Days 8-14 • Upcoming</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="w-3 h-3 bg-muted-foreground/50 rounded-full"></div>
                        <div>
                          <p className="font-medium text-muted-foreground">Paschat Karma (Rejuvenation)</p>
                          <p className="text-sm text-muted-foreground">Days 15-21 • Upcoming</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Recent Milestones</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-muted-foreground">Consultation completed</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-muted-foreground">Dietary plan customized</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-muted-foreground">Oil massage sessions started</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full"></div>
                        <span className="text-muted-foreground/70">Steam therapy sessions (upcoming)</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="feedback" className="mt-6">
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Star className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Session Feedback</h3>
                  </div>
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No feedback submitted yet</p>
                    <Button onClick={() => navigate('/feedback')}>
                      Submit Feedback
                    </Button>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>
      </div>

      {isMobile && <MobileNavigation userType="patient" />}
    </div>
  );
};

export default TherapyDetails;