import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Stethoscope, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  CheckCircle, 
  XCircle,
  ArrowLeft,
  Plus,
  Star,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Practitioner {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  specialization: string;
  experience: number;
  isVerified: boolean;
  isActive: boolean;
  isSuspended: boolean;
  rating: number;
  consultationFee: number;
  totalPatients: number;
  createdAt: string;
}

const AdminPractitioners = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSpecialization, setFilterSpecialization] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const specializations = [
    'Ayurvedic Medicine',
    'Panchakarma',
    'Herbal Medicine',
    'Yoga Therapy',
    'Meditation',
    'Nutrition & Diet',
    'Pulse Diagnosis',
    'Marma Therapy',
    'General Practice'
  ];

  useEffect(() => {
    // Check admin auth
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/auth');
      return;
    }

    fetchPractitioners();
  }, [navigate, currentPage, searchTerm, filterStatus, filterSpecialization]);

  const fetchPractitioners = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        userType: 'practitioner',
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus !== 'all' && { 
          ...(filterStatus === 'verified' && { isVerified: 'true' }),
          ...(filterStatus === 'unverified' && { isVerified: 'false' }),
          ...(filterStatus === 'suspended' && { isSuspended: 'true' })
        }),
        ...(filterSpecialization !== 'all' && { specialization: filterSpecialization })
      });

      // Use practitioners endpoint specifically
      const response = await fetch(`http://localhost:5000/api/admin/practitioners?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        // backend returns { data: { practitioners, pagination } }
        setPractitioners(data.data.practitioners || []);
        setTotalPages(data.data.pagination?.totalPages || 1);
      } else {
        toast({
          title: "Error",
          description: "Failed to load practitioners",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error while loading practitioners",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPractitioner = async (practitionerId: string, isVerified: boolean) => {
    try {
      const token = localStorage.getItem('adminToken');
      // Backend expects POST with { verified, notes }
      const response = await fetch(`http://localhost:5000/api/admin/practitioners/${practitionerId}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          verified: !isVerified,
          notes: !isVerified ? 'Verified by admin' : 'Verification revoked by admin'
        })
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: `Practitioner ${!isVerified ? 'verified' : 'unverified'} successfully`,
        });
        fetchPractitioners(); // Refresh the list
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update verification status",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error while updating verification",
        variant: "destructive"
      });
    }
  };

  const getPractitionerStatusBadge = (practitioner: Practitioner) => {
    if (practitioner.isSuspended) {
      return <Badge variant="destructive">Suspended</Badge>;
    }
    if (!practitioner.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (!practitioner.isVerified) {
      return <Badge variant="outline">Unverified</Badge>;
    }
    return <Badge variant="default">Verified</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
                onClick={() => navigate('/admin/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <Stethoscope className="h-6 w-6 text-purple-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Practitioner Management</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={() => navigate('/admin/practitioners/create')} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Practitioner
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search practitioners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Verification Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterSpecialization} onValueChange={setFilterSpecialization}>
                <SelectTrigger>
                  <SelectValue placeholder="Specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specializations</SelectItem>
                  {specializations.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterSpecialization('all');
                setCurrentPage(1);
              }} variant="outline">
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Practitioners Table */}
        <Card>
          <CardHeader>
            <CardTitle>Practitioners ({practitioners.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Patients</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {practitioners.map((practitioner) => (
                  <TableRow key={practitioner._id}>
                    <TableCell className="font-medium">
                      <div>
                        <p className="font-semibold">{practitioner.firstName} {practitioner.lastName}</p>
                        <p className="text-sm text-gray-500">{practitioner.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{practitioner.specialization}</Badge>
                    </TableCell>
                    <TableCell>{practitioner.experience} years</TableCell>
                    <TableCell>{getPractitionerStatusBadge(practitioner)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span>{practitioner.rating?.toFixed(1) || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{practitioner.totalPatients || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/admin/practitioners/${practitioner._id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/admin/practitioners/${practitioner._id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={practitioner.isVerified ? "destructive" : "default"}
                          onClick={() => handleVerifyPractitioner(practitioner._id, practitioner.isVerified)}
                        >
                          {practitioner.isVerified ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {practitioners.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No practitioners found matching your criteria
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 space-x-2">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPractitioners;