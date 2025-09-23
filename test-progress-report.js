const fetch = require('node-fetch');

// Test the progress report API
async function testProgressReport() {
  try {
    console.log('Testing Progress Report API...');
    
    // You'll need to replace this with an actual program ID and valid token
    const programId = 'SAMPLE_PROGRAM_ID'; // Replace with real program ID
    const token = 'YOUR_TOKEN_HERE'; // Replace with valid token
    
    const response = await fetch(`http://localhost:5000/api/therapy/programs/${programId}/progress-report`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('API Response Error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return;
    }

    const result = await response.json();
    console.log('API Response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Progress report API working');
      console.log('📊 Feedback Analysis:', result.data.feedbackAnalysis);
      console.log('📈 Health Metrics Trend Length:', result.data.feedbackAnalysis.healthMetricsTrend?.length || 0);
      console.log('🎯 Positive Aspects Trend Length:', result.data.feedbackAnalysis.positiveAspectsTrend?.length || 0);
    } else {
      console.log('❌ API returned success: false');
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Instructions for testing
console.log('🔧 To test the progress report API:');
console.log('1. Start your backend server (npm run dev in Backend folder)');
console.log('2. Get a valid JWT token by logging in through the frontend');
console.log('3. Get a valid program ID from your therapy programs');
console.log('4. Update the programId and token variables in this file');
console.log('5. Run: node test-progress-report.js');
console.log('');

// Uncomment the line below when you have valid credentials
// testProgressReport();