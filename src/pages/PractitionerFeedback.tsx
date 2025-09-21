import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Star, 
  Filter, 
  Search,
  Calendar,
  User,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ResponsiveSidebar from '@/components/navigation/ResponsiveSidebar';
import MobileNavigation from '@/components/navigation/MobileNavigation';
import { useMediaQuery } from '@mui/material';

const PractitionerFeedback = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [practitioner, setPractitioner] = useState({ firstName: '', lastName: '', specialization: '' });

  useEffect(() => {
    fetchPractitionerInfo();
  }, []);

  const fetchPractitionerInfo = async () => {
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
        setPractitioner(data.data.practitioner);
      }
    } catch (error) {
      console.error('Error fetching practitioner info:', error);
    }
  };

  const feedback = [
    {
      id: 1,
      patient: 'Arjun Patel',
      therapy: 'Abhyanga',
      date: '2024-01-18',
      rating: 5,
      symptoms: ['Energy Improved', 'Better Sleep'],
      notes: 'Excellent session. The oil massage was very relaxing and helped with my back pain significantly.',
      sentiment: 'positive'
    },
    {
      id: 2,
      patient: 'Priya Singh',
      therapy: 'Shirodhara',
      date: '2024-01-17',
      rating: 4,
      symptoms: ['Stress Relief', 'Mental Clarity'],
      notes: 'Good experience overall. The therapy helped with stress, though I felt a bit dizzy afterwards.',
      sentiment: 'positive'
    },
    {
      id: 3,
      patient: 'Meera Shah',
      therapy: 'Swedana',
      date: '2024-01-16',
      rating: 3,
      symptoms: ['Mild Discomfort', 'Detox Effects'],
      notes: 'The steam therapy was intense. I experienced some discomfort but understand it\'s part of the detox process.',
      sentiment: 'neutral'
    },
    {
      id: 4,
      patient: 'Vikram Joshi',
      therapy: 'Consultation',
      date: '2024-01-15',
      rating: 5,
      symptoms: ['Satisfied with Assessment'],
      notes: 'Dr. Sharma provided excellent guidance. Very thorough assessment and clear treatment plan.',
      sentiment: 'positive'
    }
  ];

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-700';
      case 'neutral': return 'bg-yellow-100 text-yellow-700';
      case 'negative': return 'bg-red-100 text-red-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = item.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.therapy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = ratingFilter === 'all' || item.rating.toString() === ratingFilter;
    return matchesSearch && matchesRating;
  });

  const avgRating = feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length;
  const positiveCount = feedback.filter(item => item.sentiment === 'positive').length;
  const needsAttention = feedback.filter(item => item.rating <= 3).length;

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && (
        <ResponsiveSidebar 
          userType="practitioner" 
          userName={`Dr. ${practitioner.firstName} ${practitioner.lastName}`} 
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
              <h1 className="text-2xl font-bold text-foreground">Patient Feedback</h1>
              <p className="text-muted-foreground">Review and analyze patient feedback</p>
            </div>
          </motion.div>

          {/* Summary Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6"
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Star className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{avgRating.toFixed(1)}</p>
                    <p className="text-sm text-muted-foreground">Average Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <ThumbsUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{positiveCount}</p>
                    <p className="text-sm text-muted-foreground">Positive Reviews</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{feedback.length}</p>
                    <p className="text-sm text-muted-foreground">Total Reviews</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{needsAttention}</p>
                    <p className="text-sm text-muted-foreground">Need Attention</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row gap-4 mb-6"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient or therapy..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Feedback Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Tabs defaultValue="recent" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="recent">Recent Feedback</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
              </TabsList>

              <TabsContent value="recent" className="mt-6">
                <div className="space-y-4">
                  {filteredFeedback.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {item.patient.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <h4 className="font-medium text-foreground">{item.patient}</h4>
                              <p className="text-sm text-muted-foreground">{item.therapy}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < item.rating 
                                      ? 'text-yellow-500 fill-current' 
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <Badge className={getSentimentColor(item.sentiment)}>
                              {item.sentiment}
                            </Badge>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-foreground mb-2">{item.notes}</p>
                          <div className="flex flex-wrap gap-2">
                            {item.symptoms.map((symptom, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {symptom}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(item.date).toLocaleDateString()}
                          </div>
                          <Button variant="outline" size="sm">
                            Respond
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Rating Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map(rating => {
                          const count = feedback.filter(item => item.rating === rating).length;
                          const percentage = (count / feedback.length) * 100;
                          
                          return (
                            <div key={rating} className="flex items-center gap-3">
                              <div className="flex items-center gap-1 w-16">
                                <span className="text-sm font-medium">{rating}</span>
                                <Star className="h-3 w-3 text-yellow-500" />
                              </div>
                              <div className="flex-1 bg-muted rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground w-12">
                                {count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Therapy Satisfaction</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {['Abhyanga', 'Shirodhara', 'Swedana', 'Consultation'].map(therapy => {
                          const therapyFeedback = feedback.filter(item => item.therapy === therapy);
                          const avgRating = therapyFeedback.length > 0 
                            ? therapyFeedback.reduce((sum, item) => sum + item.rating, 0) / therapyFeedback.length 
                            : 0;
                          
                          return (
                            <div key={therapy} className="flex items-center justify-between">
                              <span className="text-sm font-medium text-foreground">{therapy}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-muted rounded-full h-2">
                                  <div 
                                    className="bg-primary h-2 rounded-full"
                                    style={{ width: `${(avgRating / 5) * 100}%` }}
                                  />
                                </div>
                                <span className="text-sm text-muted-foreground w-8">
                                  {avgRating.toFixed(1)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="trends" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Feedback Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-foreground mb-3">Common Positive Themes</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Relaxation & Stress Relief</span>
                            <span className="font-medium text-foreground">85%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Pain Reduction</span>
                            <span className="font-medium text-foreground">72%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Improved Sleep</span>
                            <span className="font-medium text-foreground">68%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Energy Boost</span>
                            <span className="font-medium text-foreground">61%</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-foreground mb-3">Areas for Improvement</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Initial Discomfort</span>
                            <span className="font-medium text-foreground">15%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Session Duration</span>
                            <span className="font-medium text-foreground">8%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Room Temperature</span>
                            <span className="font-medium text-foreground">5%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>
      </div>

      {isMobile && <MobileNavigation userType="practitioner" />}
    </div>
  );
};

export default PractitionerFeedback;