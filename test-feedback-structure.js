// Test script to verify enhanced feedback data structure
console.log('Testing Enhanced Feedback Structure...\n');

// Sample comprehensive feedback data that would be sent from frontend
const sampleFeedbackData = {
  // Overall experience
  overallExperience: 4,
  wouldRecommend: true,
  
  // Positive aspects (1-5 scale)
  positiveAspects: {
    relaxation: 5,
    painRelief: 4,
    energyBoost: 3,
    mentalClarity: 4,
    sleepImprovement: 5,
    digestiveHealth: 3,
    skinGlow: 2,
    stressReduction: 5,
    mobilityImprovement: 3,
    overallWellbeing: 4
  },
  
  // Negative aspects (1-5 scale, where 1 = minimal, 5 = severe)
  negativeAspects: {
    discomfort: 2,
    fatigue: 1,
    nausea: 0,
    headache: 1,
    dizziness: 0,
    skinIrritation: 0,
    digestiveUpset: 1,
    sleepDisturbance: 0,
    emotionalChanges: 0,
    mobilityIssues: 0
  },
  
  // Traditional metrics (backward compatibility)
  painLevel: 3,
  energyLevel: 7,
  sleepQuality: 4,
  appetiteLevel: 4,
  
  // Additional metrics
  comfortLevel: 4,
  therapistRating: 5,
  treatmentDuration: '45 minutes',
  
  // Descriptive feedback
  symptoms: ['Reduced stress', 'Better digestion', 'Improved circulation'],
  sideEffects: ['Temporary fatigue'],
  specificSymptoms: ['Less muscle tension', 'Improved mood'],
  additionalComments: 'Really enjoyed the Abhyanga massage. Felt very relaxed and the therapist was excellent.'
};

console.log('Sample Feedback Data Structure:');
console.log(JSON.stringify(sampleFeedbackData, null, 2));

// Test analytics calculations
function calculatePositiveAspectsAverage(feedbacks) {
  const positiveAspectsAverage = {};
  const aspectKeys = Object.keys(feedbacks[0].positiveAspects || {});
  
  aspectKeys.forEach(aspect => {
    positiveAspectsAverage[aspect] = 
      feedbacks.reduce((sum, f) => sum + (f.positiveAspects?.[aspect] || 0), 0) / feedbacks.length;
  });
  
  return positiveAspectsAverage;
}

function calculateNegativeAspectsAverage(feedbacks) {
  const negativeAspectsAverage = {};
  const aspectKeys = Object.keys(feedbacks[0].negativeAspects || {});
  
  aspectKeys.forEach(aspect => {
    negativeAspectsAverage[aspect] = 
      feedbacks.reduce((sum, f) => sum + (f.negativeAspects?.[aspect] || 0), 0) / feedbacks.length;
  });
  
  return negativeAspectsAverage;
}

// Test with multiple feedback samples
const multipleFeedbacks = [
  sampleFeedbackData,
  {
    ...sampleFeedbackData,
    overallExperience: 5,
    positiveAspects: {
      relaxation: 4,
      painRelief: 5,
      energyBoost: 4,
      mentalClarity: 3,
      sleepImprovement: 4,
      digestiveHealth: 4,
      skinGlow: 3,
      stressReduction: 4,
      mobilityImprovement: 4,
      overallWellbeing: 5
    },
    negativeAspects: {
      discomfort: 1,
      fatigue: 0,
      nausea: 0,
      headache: 0,
      dizziness: 0,
      skinIrritation: 0,
      digestiveUpset: 0,
      sleepDisturbance: 0,
      emotionalChanges: 0,
      mobilityIssues: 0
    }
  }
];

console.log('\n=== Analytics Test Results ===\n');

const positiveAverage = calculatePositiveAspectsAverage(multipleFeedbacks);
console.log('Positive Aspects Average:');
console.log(JSON.stringify(positiveAverage, null, 2));

const negativeAverage = calculateNegativeAspectsAverage(multipleFeedbacks);
console.log('\nNegative Aspects Average:');
console.log(JSON.stringify(negativeAverage, null, 2));

console.log('\n=== Chart Data Preparation ===\n');

// Test chart data preparation
const chartData = multipleFeedbacks.map((feedback, index) => {
  const data = {
    procedure: `Procedure ${index + 1}`,
    procedureIndex: index + 1
  };
  
  // Add all positive aspects
  Object.keys(positiveAverage).forEach(aspect => {
    data[aspect] = feedback.positiveAspects?.[aspect] || 0;
  });
  
  return data;
});

console.log('Positive Aspects Trend Data for Charts:');
console.log(JSON.stringify(chartData, null, 2));

console.log('\n✅ Enhanced feedback structure test completed successfully!');
console.log('📊 Data is ready for comprehensive analytics and visualizations.');