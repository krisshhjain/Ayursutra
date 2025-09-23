import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: [true, 'Appointment ID is required'],
    unique: true, // One review per appointment
    index: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient ID is required'],
    index: true
  },
  practitionerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Practitioner',
    required: [true, 'Practitioner ID is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be a whole number'
    }
  },
  reviewText: {
    type: String,
    maxlength: [1000, 'Review cannot exceed 1000 characters'],
    trim: true
  },
  aspects: {
    effectiveness: {
      type: Number,
      min: [1, 'Effectiveness rating must be at least 1'],
      max: [5, 'Effectiveness rating cannot exceed 5'],
      validate: {
        validator: Number.isInteger,
        message: 'Effectiveness rating must be a whole number'
      }
    },
    communication: {
      type: Number,
      min: [1, 'Communication rating must be at least 1'],
      max: [5, 'Communication rating cannot exceed 5'],
      validate: {
        validator: Number.isInteger,
        message: 'Communication rating must be a whole number'
      }
    },
    comfort: {
      type: Number,
      min: [1, 'Comfort rating must be at least 1'],
      max: [5, 'Comfort rating cannot exceed 5'],
      validate: {
        validator: Number.isInteger,
        message: 'Comfort rating must be a whole number'
      }
    },
    value: {
      type: Number,
      min: [1, 'Value rating must be at least 1'],
      max: [5, 'Value rating cannot exceed 5'],
      validate: {
        validator: Number.isInteger,
        message: 'Value rating must be a whole number'
      }
    }
  },
  wouldRecommend: {
    type: Boolean,
    default: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  isVisible: {
    type: Boolean,
    default: true // Admin can hide inappropriate reviews
  },
  reportedCount: {
    type: Number,
    default: 0
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  practitionerResponse: {
    text: {
      type: String,
      maxlength: [500, 'Response cannot exceed 500 characters'],
      trim: true
    },
    respondedAt: Date,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Practitioner'
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
reviewSchema.index({ practitionerId: 1, rating: -1 }); // For practitioner rating queries
reviewSchema.index({ createdAt: -1 }); // For recent reviews
reviewSchema.index({ rating: -1, createdAt: -1 }); // For filtering by rating
reviewSchema.index({ isVisible: 1, practitionerId: 1 }); // For visible reviews

// Virtual for calculating average aspect rating
reviewSchema.virtual('aspectAverage').get(function() {
  if (!this.aspects) return null;
  
  const aspects = Object.values(this.aspects).filter(val => val !== undefined && val !== null);
  if (aspects.length === 0) return null;
  
  const sum = aspects.reduce((acc, val) => acc + val, 0);
  return Number((sum / aspects.length).toFixed(1));
});

// Pre-save middleware to ensure patient owns the appointment
reviewSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const Appointment = mongoose.model('Appointment');
      const appointment = await Appointment.findById(this.appointmentId);
      
      if (!appointment) {
        return next(new Error('Appointment not found'));
      }
      
      if (appointment.patientId.toString() !== this.patientId.toString()) {
        return next(new Error('Patient does not own this appointment'));
      }
      
      if (appointment.practitionerId.toString() !== this.practitionerId.toString()) {
        return next(new Error('Practitioner does not match appointment'));
      }
      
      if (appointment.status !== 'completed') {
        return next(new Error('Can only review completed appointments'));
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Static method to get practitioner statistics
reviewSchema.statics.getPractitionerStats = async function(practitionerId) {
  const stats = await this.aggregate([
    {
      $match: {
        practitionerId: new mongoose.Types.ObjectId(practitionerId),
        isVisible: true
      }
    },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        ratingDistribution: {
          $push: '$rating'
        },
        totalRecommendations: {
          $sum: { $cond: ['$wouldRecommend', 1, 0] }
        },
        aspectAverages: {
          $push: {
            effectiveness: '$aspects.effectiveness',
            communication: '$aspects.communication',
            comfort: '$aspects.comfort',
            value: '$aspects.value'
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalReviews: 1,
        averageRating: { $round: ['$averageRating', 1] },
        recommendationRate: {
          $round: [
            { $multiply: [{ $divide: ['$totalRecommendations', '$totalReviews'] }, 100] },
            1
          ]
        },
        ratingDistribution: {
          $arrayToObject: [
            {
              $map: {
                input: [1, 2, 3, 4, 5],
                as: 'rating',
                in: {
                  k: { $toString: '$$rating' },
                  v: {
                    $size: {
                      $filter: {
                        input: '$ratingDistribution',
                        cond: { $eq: ['$$this', '$$rating'] }
                      }
                    }
                  }
                }
              }
            }
          ]
        },
        aspectAverages: {
          $let: {
            vars: {
              validAspects: {
                $filter: {
                  input: '$aspectAverages',
                  cond: {
                    $and: [
                      { $ne: ['$$this.effectiveness', null] },
                      { $ne: ['$$this.communication', null] },
                      { $ne: ['$$this.comfort', null] },
                      { $ne: ['$$this.value', null] }
                    ]
                  }
                }
              }
            },
            in: {
              $cond: {
                if: { $gt: [{ $size: '$$validAspects' }, 0] },
                then: {
                  effectiveness: { $round: [{ $avg: '$$validAspects.effectiveness' }, 1] },
                  communication: { $round: [{ $avg: '$$validAspects.communication' }, 1] },
                  comfort: { $round: [{ $avg: '$$validAspects.comfort' }, 1] },
                  value: { $round: [{ $avg: '$$validAspects.value' }, 1] }
                },
                else: null
              }
            }
          }
        }
      }
    }
  ]);

  return stats[0] || {
    totalReviews: 0,
    averageRating: 0,
    recommendationRate: 0,
    ratingDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
    aspectAverages: null
  };
};

// Ensure virtuals are included in JSON output
reviewSchema.set('toJSON', { virtuals: true });
reviewSchema.set('toObject', { virtuals: true });

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

export default Review;