import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Send, ThumbsUp, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface RatingComponentProps {
  appointment: {
    id: string;
    practitioner: string;
    practitionerId: string;
    therapy: string;
    date: string;
    time: string;
  };
  onReviewSubmitted?: () => void;
  existingReview?: {
    id: string;
    rating: number;
    reviewText: string;
    aspects: {
      effectiveness?: number;
      communication?: number;
      comfort?: number;
      value?: number;
    };
    wouldRecommend: boolean;
    isAnonymous: boolean;
  };
}

const RatingComponent: React.FC<RatingComponentProps> = ({ 
  appointment, 
  onReviewSubmitted,
  existingReview 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState(existingReview?.reviewText || '');
  const [aspects, setAspects] = useState({
    effectiveness: existingReview?.aspects?.effectiveness || 0,
    communication: existingReview?.aspects?.communication || 0,
    comfort: existingReview?.aspects?.comfort || 0,
    value: existingReview?.aspects?.value || 0
  });
  const [wouldRecommend, setWouldRecommend] = useState(existingReview?.wouldRecommend ?? true);
  const [isAnonymous, setIsAnonymous] = useState(existingReview?.isAnonymous || false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const aspectLabels = {
    effectiveness: 'Treatment Effectiveness',
    communication: 'Practitioner Communication',
    comfort: 'Comfort & Environment',
    value: 'Value for Money'
  };

  const handleStarClick = (starRating: number, aspectKey?: string) => {
    if (aspectKey) {
      setAspects(prev => ({ ...prev, [aspectKey]: starRating }));
    } else {
      setRating(starRating);
    }
  };

  const renderStars = (currentRating: number, onStarClick: (rating: number) => void, hoverRating?: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="p-0 hover:scale-110 transition-transform"
            onClick={() => onStarClick(star)}
            onMouseEnter={() => hoverRating !== undefined && setHoverRating(star)}
            onMouseLeave={() => hoverRating !== undefined && setHoverRating(0)}
          >
            <Star
              className={`h-6 w-6 ${
                star <= (hoverRating || currentRating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please provide an overall rating');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token'); // Using correct token key
      const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
      
      // Debug logging
      console.log('Review submission debug:');
      console.log('- Token present:', !!token);
      console.log('- Appointment ID:', appointment.id);
      console.log('- API URL:', `${API_BASE_URL}/reviews`);
      console.log('- Rating:', rating);
      console.log('- Review text:', reviewText);
      
      if (!token) {
        toast.error('You must be logged in to submit a review');
        return;
      }
      
      const url = existingReview 
        ? `${API_BASE_URL}/reviews/${existingReview.id}`
        : `${API_BASE_URL}/reviews`;
      
      const method = existingReview ? 'PUT' : 'POST';

      const requestBody = {
        appointmentId: appointment.id,
        rating,
        reviewText,
        aspects,
        wouldRecommend,
        isAnonymous
      };
      
      console.log('- Request method:', method);
      console.log('- Request body:', requestBody);

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('- Response status:', response.status);
      console.log('- Response headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('- Response data:', data);

      if (data.success) {
        toast.success(existingReview ? 'Review updated successfully!' : 'Review submitted successfully!');
        setIsOpen(false);
        onReviewSubmitted?.();
      } else {
        toast.error(data.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    if (!existingReview) {
      setRating(0);
      setReviewText('');
      setAspects({ effectiveness: 0, communication: 0, comfort: 0, value: 0 });
      setWouldRecommend(true);
      setIsAnonymous(false);
    }
    setHoverRating(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button 
          variant={existingReview ? "outline" : "default"}
          size="sm"
          className={existingReview ? "border-yellow-300 text-yellow-700 hover:bg-yellow-50" : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"}
        >
          <Star className="h-4 w-4 mr-1" />
          {existingReview ? 'Edit Review' : 'Rate & Review'}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            {existingReview ? 'Edit Your Review' : 'Rate Your Session'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Session Details */}
          <Card className="p-4 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-800">{appointment.therapy}</h4>
              <p className="text-green-700">with {appointment.practitioner}</p>
              <p className="text-sm text-green-600">
                {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
              </p>
            </div>
          </Card>

          {/* Overall Rating */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Overall Experience</Label>
            <div className="flex items-center gap-4">
              {renderStars(rating, setRating, hoverRating)}
              <span className="text-sm text-muted-foreground">
                {rating === 0 ? 'Rate your experience' : 
                 rating === 1 ? 'Poor' :
                 rating === 2 ? 'Fair' :
                 rating === 3 ? 'Good' :
                 rating === 4 ? 'Very Good' : 'Excellent'}
              </span>
            </div>
          </div>

          {/* Detailed Aspects */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Rate Specific Aspects</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(aspectLabels).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <Label className="text-sm">{label}</Label>
                  <div className="flex items-center gap-2">
                    {renderStars(aspects[key as keyof typeof aspects], (rating) => handleStarClick(rating, key))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Written Review */}
          <div className="space-y-3">
            <Label htmlFor="review-text" className="text-base font-semibold">
              Share Your Experience (Optional)
            </Label>
            <Textarea
              id="review-text"
              placeholder="Tell others about your experience. What did you like? How do you feel? Any suggestions?"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {reviewText.length}/1000 characters
            </p>
          </div>

          {/* Recommendation */}
          <div className="flex items-center space-x-3">
            <Checkbox
              id="recommend"
              checked={wouldRecommend}
              onCheckedChange={(checked) => setWouldRecommend(checked as boolean)}
            />
            <Label htmlFor="recommend" className="flex items-center gap-2">
              <ThumbsUp className="h-4 w-4" />
              I would recommend this practitioner to others
            </Label>
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center space-x-3">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
            />
            <Label htmlFor="anonymous" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Post this review anonymously
            </Label>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              {isSubmitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {existingReview ? 'Update Review' : 'Submit Review'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RatingComponent;