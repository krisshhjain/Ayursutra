import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Leaf, User, Stethoscope, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userType = searchParams.get('type') || 'patient';
  const { toast } = useToast();
  
  const [isLogin, setIsLogin] = useState(true);
  const [activeTab, setActiveTab] = useState(userType);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    password: '',
    age: '',
    gender: '',
    specialization: '',
    experience: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          userType: activeTab
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user data
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        toast({
          title: "Success",
          description: "Login successful!",
        });

        // Navigate based on user type
        if (activeTab === 'patient') {
          navigate('/patient-dashboard');
        } else {
          navigate('/practitioner-dashboard');
        }
      } else {
        toast({
          title: "Error",
          description: data.message || "Login failed",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    // Validation
    const requiredFields = ['firstName', 'lastName', 'email', 'mobile', 'password'];
    
    if (activeTab === 'patient') {
      requiredFields.push('age', 'gender');
    } else {
      requiredFields.push('specialization', 'experience');
    }

    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        toast({
          title: "Error",
          description: `Please fill in all required fields`,
          variant: "destructive"
        });
        return;
      }
    }

    setIsLoading(true);
    try {
      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
        userType: activeTab,
        ...(activeTab === 'patient' && {
          age: parseInt(formData.age),
          gender: formData.gender
        }),
        ...(activeTab === 'practitioner' && {
          specialization: formData.specialization,
          experience: parseInt(formData.experience)
        })
      };

      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user data
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        toast({
          title: "Success",
          description: "Registration successful!",
        });

        // Navigate based on user type
        if (activeTab === 'patient') {
          navigate('/patient-dashboard');
        } else {
          navigate('/practitioner-dashboard');
        }
      } else {
        toast({
          title: "Error",
          description: data.message || "Registration failed",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">AyurSutra</span>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isLogin ? 'Welcome Back' : 'Join AyurSutra'}
          </h1>
          <p className="text-muted-foreground">
            {isLogin ? 'Sign in to continue your healing journey' : 'Start your holistic healthcare journey'}
          </p>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-wellness border-border/50">
            <CardHeader className="space-y-4">
              <div className="flex justify-center">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="patient" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Patient</span>
                    </TabsTrigger>
                    <TabsTrigger value="practitioner" className="flex items-center space-x-2">
                      <Stethoscope className="h-4 w-4" />
                      <span>Practitioner</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="patient" className="mt-6">
                    <CardTitle className="text-center text-foreground">
                      {isLogin ? 'Patient Login' : 'Patient Registration'}
                    </CardTitle>
                  </TabsContent>
                  
                  <TabsContent value="practitioner" className="mt-6">
                    <CardTitle className="text-center text-foreground">
                      Practitioner Login
                    </CardTitle>
                    {!isLogin && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 text-center">
                          <strong>Note:</strong> Practitioner accounts are created by administrators only. 
                          Please contact admin for account creation.
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Login Form or Practitioner Notice */}
              {isLogin || activeTab === 'practitioner' ? (
                <div className="space-y-4">
                  {activeTab === 'practitioner' && !isLogin ? (
                    <div className="text-center py-8 space-y-4">
                      <Stethoscope className="h-12 w-12 text-blue-500 mx-auto" />
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          Practitioner Registration Unavailable
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Practitioner accounts are created and managed by system administrators only. 
                          This ensures all practitioners are properly verified and credentialed.
                        </p>
                        <p className="text-sm text-muted-foreground">
                          If you're a practitioner, please contact the administrator to create your account.
                        </p>
                      </div>
                      <Button 
                        variant="outline"
                        onClick={() => setIsLogin(true)}
                        className="mt-4"
                      >
                        Already have an account? Sign In
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="Enter your email"
                          className="focus:ring-primary"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input 
                          id="password" 
                          type="password" 
                          placeholder="Enter your password"
                          className="focus:ring-primary"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      
                      <Button 
                        className="w-full bg-gradient-primary hover:opacity-90" 
                        onClick={handleLogin}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing In...
                          </>
                        ) : (
                          `Sign In as ${activeTab === 'patient' ? 'Patient' : 'Practitioner'}`
                        )}
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                /* Registration Form - Only for Patients */
                activeTab === 'patient' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName" 
                          placeholder="First name"
                          className="focus:ring-primary"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          placeholder="Last name"
                          className="focus:ring-primary"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input 
                          id="age" 
                          type="number" 
                          placeholder="Age"
                          className="focus:ring-primary"
                          value={formData.age}
                          onChange={(e) => handleInputChange('age', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select 
                          value={formData.gender}
                          onValueChange={(value) => handleInputChange('gender', value)}
                          disabled={isLoading}
                        >
                          <SelectTrigger className="focus:ring-primary">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="Enter your email"
                        className="focus:ring-primary"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mobile">Mobile Number</Label>
                      <Input 
                        id="mobile" 
                        type="tel" 
                        placeholder="Enter mobile number"
                        className="focus:ring-primary"
                        value={formData.mobile}
                        onChange={(e) => handleInputChange('mobile', e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="Create a password"
                        className="focus:ring-primary"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <Button 
                      className="w-full bg-gradient-primary hover:opacity-90"
                      onClick={handleRegister}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        'Register as Patient'
                      )}
                    </Button>
                  </div>
                ) : null
              )}

              {/* Toggle Login/Register - Only show for patients */}
              {activeTab === 'patient' && (
                <div className="text-center pt-4 border-t border-border">
                  <p className="text-muted-foreground">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                  </p>
                  <Button 
                    variant="link" 
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-primary hover:text-primary/80"
                  >
                    {isLogin ? 'Create Account' : 'Sign In'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;