import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Edit3, Save, X, Camera, Bell, Shield, Heart, Calendar, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import ResponsiveSidebar from '@/components/navigation/ResponsiveSidebar';
import MobileNavigation from '@/components/navigation/MobileNavigation';
import ProfileImageUploader from '@/components/ProfileImageUploader';
import { useMediaQuery } from '@mui/material';
import { useToast } from '@/hooks/use-toast';

const PatientProfile = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyContact: '',
    bloodGroup: '',
    height: '',
    weight: '',
    medicalHistory: '',
    allergies: '',
    currentMedications: '',
  });

  const [notifications, setNotifications] = useState({
    inApp: true,
    email: true,
    sms: false,
    reminders: true,
    updates: true,
    feedback: false,
  });

  const [preferences, setPreferences] = useState({
    language: 'English',
    timezone: 'Asia/Kolkata',
    therapyReminders: '1 hour before',
    followUpFrequency: 'Weekly',
  });

  const handleSave = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
    setIsEditing(false);
  };

  // Fetch patient dashboard/profile data from backend and populate form
  useState(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        
        // Fetch dashboard data
        const res = await fetch(`${API_BASE_URL}/patient/dashboard`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (data && data.success && data.data && data.data.patient) {
          const p = data.data.patient;
          setProfileData(prev => ({
            ...prev,
            name: `${p.firstName || ''} ${p.lastName || ''}`.trim(),
            email: p.email || prev.email,
            phone: p.mobile || prev.phone,
            // The backend patient model may not include these fields in dashboard; leave empty if not present
            dateOfBirth: p.dateOfBirth || prev.dateOfBirth,
            gender: p.gender || prev.gender,
            address: p.address || prev.address,
            emergencyContact: p.emergencyContact?.phone || prev.emergencyContact,
            medicalHistory: Array.isArray(p.medicalHistory) ? p.medicalHistory.map(m=>m.condition).join('; ') : prev.medicalHistory,
            allergies: Array.isArray(p.allergies) ? p.allergies.join(', ') : prev.allergies,
            currentMedications: Array.isArray(p.currentMedications) ? p.currentMedications.join(', ') : prev.currentMedications,
          }));
        }

        // Fetch profile image
        const imageRes = await fetch(`${API_BASE_URL}/patient/profile/image`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const imageData = await imageRes.json();
        if (imageData.success && imageData.data.profileImage) {
          setProfileImage(imageData.data.profileImage);
        }
      } catch (error) {
        console.error('Failed to fetch patient profile:', error);
      }
    };

    fetchProfile();
  });

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data if needed
  };

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && (
        <ResponsiveSidebar 
          userType="patient" 
          userName={profileData.name || 'Patient'} 
          userRole="Patient" 
        />
      )}
      
      <div className={`${!isMobile ? 'ml-64' : ''} min-h-screen`}>
        {isMobile && <div className="h-16" />}
        
        <main className={`p-4 md:p-6 ${isMobile ? 'pb-20' : ''} max-w-6xl mx-auto`}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
          >
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
              <p className="text-muted-foreground">Manage your personal information and preferences</p>
            </div>
            
            <div className="flex gap-2">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="gap-2">
                  <Edit3 className="h-4 w-4" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancel} className="gap-2">
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </motion.div>

          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="medical">Medical</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            {/* Personal Information */}
            <TabsContent value="personal" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Picture */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="p-6 text-center">
                    <div className="mb-4">
                      <ProfileImageUploader
                        userType="patient"
                        currentImageUrl={profileImage}
                        userName={profileData.name}
                        onImageUpdate={setProfileImage}
                        editable={isEditing}
                        size="lg"
                      />
                    </div>
                    <h3 className="font-semibold text-foreground">{profileData.name}</h3>
                    <p className="text-sm text-muted-foreground">Patient ID: PT001</p>
                  </Card>
                </motion.div>

                {/* Basic Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="lg:col-span-2"
                >
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-6">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                            disabled={!isEditing}
                            className="mt-1 pl-10"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                            disabled={!isEditing}
                            className="mt-1 pl-10"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="dob">Date of Birth</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="dob"
                            type="date"
                            value={profileData.dateOfBirth}
                            onChange={(e) => setProfileData({...profileData, dateOfBirth: e.target.value})}
                            disabled={!isEditing}
                            className="mt-1 pl-10"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="gender">Gender</Label>
                        <Select value={profileData.gender} disabled={!isEditing}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="emergency">Emergency Contact</Label>
                        <Input
                          id="emergency"
                          value={profileData.emergencyContact}
                          onChange={(e) => setProfileData({...profileData, emergencyContact: e.target.value})}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Label htmlFor="address">Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Textarea
                          id="address"
                          value={profileData.address}
                          onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                          disabled={!isEditing}
                          className="mt-1 pl-10"
                        />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            {/* Medical Information */}
            <TabsContent value="medical" className="mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Heart className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Health Details</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bloodGroup">Blood Group</Label>
                        <Input
                          id="bloodGroup"
                          value={profileData.bloodGroup}
                          onChange={(e) => setProfileData({...profileData, bloodGroup: e.target.value})}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="height">Height</Label>
                        <Input
                          id="height"
                          value={profileData.height}
                          onChange={(e) => setProfileData({...profileData, height: e.target.value})}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="weight">Current Weight</Label>
                      <Input
                        id="weight"
                        value={profileData.weight}
                        onChange={(e) => setProfileData({...profileData, weight: e.target.value})}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="allergies">Known Allergies</Label>
                      <Textarea
                        id="allergies"
                        value={profileData.allergies}
                        onChange={(e) => setProfileData({...profileData, allergies: e.target.value})}
                        disabled={!isEditing}
                        className="mt-1"
                        placeholder="List any known allergies..."
                      />
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Shield className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Medical History</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="medicalHistory">Medical History</Label>
                      <Textarea
                        id="medicalHistory"
                        value={profileData.medicalHistory}
                        onChange={(e) => setProfileData({...profileData, medicalHistory: e.target.value})}
                        disabled={!isEditing}
                        className="mt-1"
                        placeholder="Describe any past medical conditions, surgeries, or significant health events..."
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="medications">Current Medications</Label>
                      <Textarea
                        id="medications"
                        value={profileData.currentMedications}
                        onChange={(e) => setProfileData({...profileData, currentMedications: e.target.value})}
                        disabled={!isEditing}
                        className="mt-1"
                        placeholder="List current medications, dosages, and frequency..."
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Notifications */}
            <TabsContent value="notifications" className="mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Bell className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Notification Preferences</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-foreground mb-4">Communication Channels</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">In-App Notifications</p>
                            <p className="text-sm text-muted-foreground">Receive notifications within the app</p>
                          </div>
                          <Switch
                            checked={notifications.inApp}
                            onCheckedChange={(checked) => setNotifications({...notifications, inApp: checked})}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Email Notifications</p>
                            <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                          </div>
                          <Switch
                            checked={notifications.email}
                            onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">SMS Notifications</p>
                            <p className="text-sm text-muted-foreground">Receive notifications via text message</p>
                          </div>
                          <Switch
                            checked={notifications.sms}
                            onCheckedChange={(checked) => setNotifications({...notifications, sms: checked})}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-medium text-foreground mb-4">Notification Types</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Appointment Reminders</p>
                            <p className="text-sm text-muted-foreground">Get reminded about upcoming sessions</p>
                          </div>
                          <Switch
                            checked={notifications.reminders}
                            onCheckedChange={(checked) => setNotifications({...notifications, reminders: checked})}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Treatment Updates</p>
                            <p className="text-sm text-muted-foreground">Updates about your treatment progress</p>
                          </div>
                          <Switch
                            checked={notifications.updates}
                            onCheckedChange={(checked) => setNotifications({...notifications, updates: checked})}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Feedback Requests</p>
                            <p className="text-sm text-muted-foreground">Requests to provide session feedback</p>
                          </div>
                          <Switch
                            checked={notifications.feedback}
                            onCheckedChange={(checked) => setNotifications({...notifications, feedback: checked})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Preferences */}
            <TabsContent value="preferences" className="mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-6">General Preferences</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="language">Language</Label>
                      <Select value={preferences.language}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Hindi">Hindi</SelectItem>
                          <SelectItem value="Marathi">Marathi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select value={preferences.timezone}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                          <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                          <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-6">Treatment Preferences</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="reminders">Therapy Reminders</Label>
                      <Select value={preferences.therapyReminders}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30 minutes before">30 minutes before</SelectItem>
                          <SelectItem value="1 hour before">1 hour before</SelectItem>
                          <SelectItem value="2 hours before">2 hours before</SelectItem>
                          <SelectItem value="1 day before">1 day before</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="followUp">Follow-up Frequency</Label>
                      <Select value={preferences.followUpFrequency}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Daily">Daily</SelectItem>
                          <SelectItem value="Weekly">Weekly</SelectItem>
                          <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
                          <SelectItem value="Monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </main>
      </div>

  {isMobile && <MobileNavigation userType="patient" />}
    </div>
  );
};

export default PatientProfile;