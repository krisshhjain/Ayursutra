import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  className?: string;
}

export function StarRating({ 
  rating, 
  maxRating = 5, 
  size = 'md', 
  showNumber = true,
  className 
}: StarRatingProps) {
  const clampedRating = Math.max(0, Math.min(maxRating, rating));
  
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };
  
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const renderStar = (index: number) => {
    const starValue = index + 1;
    const isFilled = starValue <= clampedRating;
    const isPartial = starValue > clampedRating && starValue - 1 < clampedRating;
    
    if (isPartial) {
      const fillPercentage = ((clampedRating % 1) * 100);
      return (
        <div key={index} className="relative">
          <Star className={cn(sizeClasses[size], "text-muted-foreground")} />
          <div 
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${fillPercentage}%` }}
          >
            <Star className={cn(sizeClasses[size], "text-yellow-400 fill-yellow-400")} />
          </div>
        </div>
      );
    }
    
    return (
      <Star
        key={index}
        className={cn(
          sizeClasses[size],
          isFilled 
            ? "text-yellow-400 fill-yellow-400" 
            : "text-muted-foreground"
        )}
      />
    );
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }, (_, index) => renderStar(index))}
      </div>
      {showNumber && (
        <span className={cn("font-medium text-muted-foreground", textSizeClasses[size])}>
          {clampedRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

interface ReviewSummaryProps {
  rating: number;
  totalReviews: number;
  recommendationRate?: number;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  className?: string;
}

export function ReviewSummary({ 
  rating, 
  totalReviews, 
  recommendationRate,
  size = 'md',
  showDetails = true,
  className 
}: ReviewSummaryProps) {
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={cn("space-y-1", className)}>
      <StarRating rating={rating} size={size} showNumber={true} />
      {showDetails && (
        <div className={cn("text-muted-foreground", textSizeClasses[size])}>
          {totalReviews > 0 ? (
            <span>
              {totalReviews} review{totalReviews !== 1 ? 's' : ''}
              {recommendationRate !== undefined && (
                <span className="ml-1">
                  • {recommendationRate}% recommend
                </span>
              )}
            </span>
          ) : (
            <span>No reviews yet</span>
          )}
        </div>
      )}
    </div>
  );
}