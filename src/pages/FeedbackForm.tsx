import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ArrowLeft, CheckCircle, AlertCircle, MessageSquare, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import ResponsiveSidebar from '@/components/navigation/ResponsiveSidebar';
import MobileNavigation from '@/components/navigation/MobileNavigation';
import { useMediaQuery } from '@mui/material';
import { useToast } from '@/hooks/use-toast';

const FeedbackForm = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { toast } = useToast();
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
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [improvementAreas, setImprovementAreas] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sessionData = {
    date: 'January 20, 2024',
    time: '10:00 AM',
    therapy: 'Abhyanga (Oil Massage)',
    practitioner: 'Dr. Priya Sharma',
    duration: '60 minutes'
  };

  const symptoms = [
    { id: 'fatigue', label: 'Fatigue', type: 'negative' },
    { id: 'headache', label: 'Headache', type: 'negative' },
    { id: 'nausea', label: 'Nausea', type: 'negative' },
    { id: 'dizziness', label: 'Dizziness', type: 'negative' },
    { id: 'muscle-pain', label: 'Muscle Pain', type: 'negative' },
    { id: 'skin-irritation', label: 'Skin Irritation', type: 'negative' },
  ];

  const improvements = [
    { id: 'relaxation', label: 'Deep Relaxation', type: 'positive' },
    { id: 'better-sleep', label: 'Better Sleep Quality', type: 'positive' },
    { id: 'reduced-stress', label: 'Reduced Stress', type: 'positive' },
  ];
  const handleSymptomToggle = (symptomId: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomId) 
        ? prev.filter(id => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  const handleImprovementToggle = (improvementId: string) => {
    setImprovementAreas(prev => 
      prev.includes(improvementId) 
        ? prev.filter(id => id !== improvementId)
        : [...prev, improvementId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide a rating for your session.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Feedback Submitted",
      description: "Thank you for your feedback! It helps us improve your treatment.",
    });
    
    setIsSubmitting(false);
    navigate('/patient-dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && (
        <ResponsiveSidebar 
          userType="patient" 
          userName={getUserName()} 
          userRole="Patient" 
        />
      )}
      
      <div className={`${!isMobile ? 'ml-64' : ''} min-h-screen`}>
        {isMobile && <div className="h-16" />}
        
        <main className={`p-4 md:p-6 ${isMobile ? 'pb-20' : ''} max-w-4xl mx-auto`}>
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
              <h1 className="text-2xl font-bold text-foreground">Session Feedback</h1>
              <p className="text-muted-foreground">Help us improve your treatment experience</p>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Session Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 bg-gradient-subtle border-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{sessionData.therapy}</h3>
                    <p className="text-sm text-muted-foreground">
                      {sessionData.date} at {sessionData.time} • {sessionData.duration}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">with {sessionData.practitioner}</Badge>
                </div>
              </Card>
            </motion.div>

            {/* Rating */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  How would you rate this session?
                </h3>
                <div className="flex justify-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      className="p-1 transition-transform hover:scale-110"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= (hoveredRating || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    {rating === 0 && 'Click to rate your experience'}
                    {rating === 1 && 'Poor - Not satisfied'}
                    {rating === 2 && 'Fair - Below average'}
                    {rating === 3 && 'Good - Average experience'}
                    {rating === 4 && 'Very Good - Above average'}
                    {rating === 5 && 'Excellent - Outstanding experience'}
                  </p>
                </div>
              </Card>
            </motion.div>

            {/* Symptoms Experienced */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Any discomfort or side effects?
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Select any symptoms you experienced during or after the session
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {symptoms.map(symptom => (
                    <div key={symptom.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={symptom.id}
                        checked={selectedSymptoms.includes(symptom.id)}
                        onCheckedChange={() => handleSymptomToggle(symptom.id)}
                      />
                      <label
                        htmlFor={symptom.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {symptom.label}
                      </label>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Improvements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-semibold text-foreground">
                    What improvements did you notice?
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Select the positive effects you experienced
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {improvements.map(improvement => (
                    <div key={improvement.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={improvement.id}
                        checked={improvementAreas.includes(improvement.id)}
                        onCheckedChange={() => handleImprovementToggle(improvement.id)}
                      />
                      <label
                        htmlFor={improvement.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {improvement.label}
                      </label>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Additional Notes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Additional Comments
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Share any other thoughts or suggestions about your treatment
                </p>
                <Textarea
                  placeholder="Tell us about your experience, any concerns, or suggestions for improvement..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
              </Card>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex justify-end gap-4"
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/patient-dashboard')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || rating === 0}
                className="gap-2 min-w-[120px]"
              >
                {isSubmitting ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </motion.div>
          </form>
        </main>
      </div>

      {isMobile && <MobileNavigation userType="patient" />}
    </div>
  );
};

export default FeedbackForm;