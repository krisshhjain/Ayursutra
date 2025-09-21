import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Award, 
  Edit, 
  Save,
  Camera,
  Bell,
  Shield,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ResponsiveSidebar from '@/components/navigation/ResponsiveSidebar';
import MobileNavigation from '@/components/navigation/MobileNavigation';
import { useMediaQuery } from '@mui/material';

const PractitionerProfile = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isEditing, setIsEditing] = useState(false);
  const [practitionerInfo, setPractitionerInfo] = useState({ firstName: '', lastName: '', specialization: '' });
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experience: '',
    location: '',
    bio: 'Experienced Ayurvedic practitioner specializing in Panchakarma therapies with a focus on holistic wellness and natural healing approaches.',
    qualifications: '',
    languages: 'English, Hindi',
    clinicHours: '9:00 AM - 6:00 PM',
    consultationFee: '₹1,500'
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    patientUpdates: true,
    marketingEmails: false
  });

  useEffect(() => {
    fetchPractitionerProfile();
  }, []);

  const fetchPractitionerProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/practitioner/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        const practitioner = data.data.practitioner;
        setPractitionerInfo(practitioner);
        setProfile(prev => ({
          ...prev,
          name: `Dr. ${practitioner.firstName} ${practitioner.lastName}`,
          specialization: practitioner.specialization || 'Ayurvedic Practitioner',
          experience: `${practitioner.experience || 5} years`,
          qualifications: practitioner.qualification || 'BAMS'
        }));
      }
    } catch (error) {
      console.error('Error fetching practitioner profile:', error);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to backend
    console.log('Profile saved:', profile);
  };

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && (
        <ResponsiveSidebar 
          userType="practitioner" 
          userName={`Dr. ${practitionerInfo.firstName} ${practitionerInfo.lastName}`} 
          userRole="Practitioner" 
        />
      )}
      
      <div className={`${!isMobile ? 'ml-64' : ''}`}>
        <main className="p-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
          >
            <div>
              <h1 className="text-2xl font-bold text-foreground">Profile & Settings</h1>
              <p className="text-muted-foreground">Manage your profile and preferences</p>
            </div>
            
            {isEditing ? (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </motion.div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Profile Photo & Basic Info */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                          PS
                        </div>
                        {isEditing && (
                          <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2 rounded-full p-2 h-8 w-8">
                            <Camera className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="text-center mt-4">
                        <h3 className="font-semibold text-foreground">{profile.name}</h3>
                        <p className="text-sm text-muted-foreground">{profile.specialization}</p>
                        <div className="flex items-center justify-center gap-1 mt-2">
                          <Award className="h-4 w-4 text-primary" />
                          <span className="text-sm text-muted-foreground">{profile.experience} experience</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Full Name</label>
                          {isEditing ? (
                            <Input
                              value={profile.name}
                              onChange={(e) => setProfile({...profile, name: e.target.value})}
                            />
                          ) : (
                            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="text-foreground">{profile.name}</span>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-2 block">Email</label>
                          {isEditing ? (
                            <Input
                              value={profile.email}
                              onChange={(e) => setProfile({...profile, email: e.target.value})}
                            />
                          ) : (
                            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="text-foreground">{profile.email}</span>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-2 block">Phone</label>
                          {isEditing ? (
                            <Input
                              value={profile.phone}
                              onChange={(e) => setProfile({...profile, phone: e.target.value})}
                            />
                          ) : (
                            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-foreground">{profile.phone}</span>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-2 block">Location</label>
                          {isEditing ? (
                            <Input
                              value={profile.location}
                              onChange={(e) => setProfile({...profile, location: e.target.value})}
                            />
                          ) : (
                            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-foreground">{profile.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Professional Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Bio</label>
                        {isEditing ? (
                          <Textarea
                            value={profile.bio}
                            onChange={(e) => setProfile({...profile, bio: e.target.value})}
                            rows={3}
                          />
                        ) : (
                          <p className="text-foreground p-3 bg-muted/30 rounded-lg">{profile.bio}</p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Qualifications</label>
                          {isEditing ? (
                            <Input
                              value={profile.qualifications}
                              onChange={(e) => setProfile({...profile, qualifications: e.target.value})}
                            />
                          ) : (
                            <p className="text-foreground p-3 bg-muted/30 rounded-lg">{profile.qualifications}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-2 block">Languages</label>
                          {isEditing ? (
                            <Input
                              value={profile.languages}
                              onChange={(e) => setProfile({...profile, languages: e.target.value})}
                            />
                          ) : (
                            <p className="text-foreground p-3 bg-muted/30 rounded-lg">{profile.languages}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Clinic Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Clinic Hours</label>
                        <Input
                          value={profile.clinicHours}
                          onChange={(e) => setProfile({...profile, clinicHours: e.target.value})}
                          placeholder="9:00 AM - 6:00 PM"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Consultation Fee</label>
                        <Input
                          value={profile.consultationFee}
                          onChange={(e) => setProfile({...profile, consultationFee: e.target.value})}
                          placeholder="₹1,500"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-primary" />
                      Notification Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">Email Notifications</p>
                          <p className="text-sm text-muted-foreground">Receive updates via email</p>
                        </div>
                        <Switch
                          checked={notifications.emailNotifications}
                          onCheckedChange={(checked) => 
                            setNotifications({...notifications, emailNotifications: checked})
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">SMS Notifications</p>
                          <p className="text-sm text-muted-foreground">Receive updates via SMS</p>
                        </div>
                        <Switch
                          checked={notifications.smsNotifications}
                          onCheckedChange={(checked) => 
                            setNotifications({...notifications, smsNotifications: checked})
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">Appointment Reminders</p>
                          <p className="text-sm text-muted-foreground">Get notified about upcoming appointments</p>
                        </div>
                        <Switch
                          checked={notifications.appointmentReminders}
                          onCheckedChange={(checked) => 
                            setNotifications({...notifications, appointmentReminders: checked})
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">Patient Updates</p>
                          <p className="text-sm text-muted-foreground">Notifications about patient progress</p>
                        </div>
                        <Switch
                          checked={notifications.patientUpdates}
                          onCheckedChange={(checked) => 
                            setNotifications({...notifications, patientUpdates: checked})
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="preferences" className="mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-primary" />
                      Application Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">Dark Mode</p>
                          <p className="text-sm text-muted-foreground">Use dark theme for the application</p>
                        </div>
                        <Switch />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">Auto-backup Data</p>
                          <p className="text-sm text-muted-foreground">Automatically backup patient data</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">Show Advanced Features</p>
                          <p className="text-sm text-muted-foreground">Enable advanced practitioner tools</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Security & Privacy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full md:w-auto">
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full md:w-auto">
                      Two-Factor Authentication
                    </Button>
                    <Button variant="outline" className="w-full md:w-auto">
                      Download My Data
                    </Button>
                    <Button variant="destructive" className="w-full md:w-auto">
                      Delete Account
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {isMobile && <MobileNavigation userType="practitioner" />}
    </div>
  );
};

export default PractitionerProfile;