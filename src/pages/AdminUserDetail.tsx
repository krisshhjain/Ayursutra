import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Briefcase, 
  Star,
  ArrowLeft,
  Edit,
  UserX,
  UserCheck,
  Activity
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface UserDetail {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  userType: 'patient' | 'practitioner';
  isActive: boolean;
  isSuspended: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  // Practitioner specific
  isVerified?: boolean;
  specialization?: string;
  experience?: number;
  rating?: number;
  consultationFee?: number;
  bio?: string;
  qualifications?: string[];
  // Patient specific
  age?: number;
  gender?: string;
  address?: string;
  medicalHistory?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
}

interface ActivityLog {
  _id: string;
  action: string;
  description: string;
  admin: string;
  timestamp: string;
  targetType: string;
  targetId: string;
}

const AdminUserDetail = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userId } = useParams();
  
  const [user, setUser] = useState<UserDetail | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(false);

  useEffect(() => {
    // Check admin auth
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/auth');
      return;
    }
    
    if (userId) {
      fetchUserDetail();
      fetchUserActivities();
    }
  }, [navigate, userId]);

  const fetchUserDetail = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setUser(data.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load user details",
          variant: "destructive"
        });
        navigate('/admin/users');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error while loading user details",
        variant: "destructive"
      });
      navigate('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserActivities = async () => {
    try {
      setActivityLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/logs?targetId=${userId}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setActivities(data.data.logs || []);
      }
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setActivityLoading(false);
    }
  };

  const handleToggleSuspension = async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/suspend`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          suspended: !user.isSuspended,
          reason: user.isSuspended ? 'Account reactivated by admin' : 'Account suspended by admin'
        })
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: `User ${user.isSuspended ? 'reactivated' : 'suspended'} successfully`,
        });
        fetchUserDetail(); // Refresh user data
        fetchUserActivities(); // Refresh activities
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update user status",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error while updating user status",
        variant: "destructive"
      });
    }
  };

  const getUserStatusBadge = (user: UserDetail) => {
    if (user.isSuspended) {
      return <Badge variant="destructive">Suspended</Badge>;
    }
    if (!user.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (user.userType === 'practitioner' && !user.isVerified) {
      return <Badge variant="outline">Unverified</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">User not found</h2>
          <Button onClick={() => navigate('/admin/users')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/admin/users')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Users
              </Button>
              <User className="h-6 w-6 text-purple-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </h1>
              <div className="ml-3">
                {getUserStatusBadge(user)}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={() => navigate(`/admin/users/${userId}/edit`)} 
                variant="outline" 
                size="sm"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button 
                onClick={handleToggleSuspension}
                variant={user.isSuspended ? "default" : "destructive"}
                size="sm"
              >
                {user.isSuspended ? (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Reactivate
                  </>
                ) : (
                  <>
                    <UserX className="h-4 w-4 mr-2" />
                    Suspend
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Mobile</p>
                      <p className="font-medium">{user.mobile}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">User Type</p>
                      <Badge variant={user.userType === 'practitioner' ? 'default' : 'secondary'}>
                        {user.userType}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Joined</p>
                      <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {user.lastLogin && (
                    <div className="flex items-center space-x-3">
                      <Activity className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Last Login</p>
                        <p className="font-medium">{new Date(user.lastLogin).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Type-specific Information */}
            {user.userType === 'practitioner' && (
              <Card>
                <CardHeader>
                  <CardTitle>Practitioner Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Specialization</p>
                      <p className="font-medium">{user.specialization || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Experience</p>
                      <p className="font-medium">{user.experience || 0} years</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <div>
                        <p className="text-sm text-gray-500">Rating</p>
                        <p className="font-medium">{user.rating || 'Not rated'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Consultation Fee</p>
                      <p className="font-medium">₹{user.consultationFee || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Verification Status</p>
                      <Badge variant={user.isVerified ? 'default' : 'outline'}>
                        {user.isVerified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </div>
                  </div>
                  
                  {user.bio && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Bio</p>
                        <p className="text-sm">{user.bio}</p>
                      </div>
                    </>
                  )}
                  
                  {user.qualifications && user.qualifications.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Qualifications</p>
                        <div className="space-y-1">
                          {user.qualifications.map((qual, index) => (
                            <Badge key={index} variant="outline" className="mr-2">
                              {qual}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {user.userType === 'patient' && (
              <Card>
                <CardHeader>
                  <CardTitle>Patient Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Age</p>
                      <p className="font-medium">{user.age || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="font-medium">{user.gender || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  {user.address && (
                    <>
                      <Separator />
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Address</p>
                          <p className="text-sm">{user.address}</p>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {user.emergencyContact && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Emergency Contact</p>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium">{user.emergencyContact.name}</p>
                          <p className="text-sm text-gray-600">{user.emergencyContact.phone}</p>
                          <p className="text-sm text-gray-600">{user.emergencyContact.relation}</p>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {user.medicalHistory && user.medicalHistory.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Medical History</p>
                        <div className="space-y-2">
                          {user.medicalHistory.map((condition, index) => (
                            <div key={index} className="bg-red-50 border border-red-200 p-2 rounded text-sm">
                              {condition}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Activity Log */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activityLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
                  </div>
                ) : activities.length > 0 ? (
                  <div className="space-y-3">
                    {activities.map((activity) => (
                      <div key={activity._id} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-gray-500">
                          by {activity.admin} • {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">No recent activity</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetail;