// Simple test to verify therapy templates API
// Run this in browser console after logging in as a practitioner

async function testTherapyTemplatesAPI() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.error('❌ No auth token found. Please log in first.');
    return;
  }

  try {
    console.log('🔍 Testing therapy templates API...');
    
    const response = await fetch('/api/therapy/templates', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Therapy templates API working!');
      console.log(`📊 Found ${data.data?.length || 0} templates:`);
      
      if (data.data && data.data.length > 0) {
        data.data.forEach((template, index) => {
          console.log(`${index + 1}. ${template.name} (${template.category}/${template.subcategory})`);
          console.log(`   Sessions: ${template.sessions?.length || 0}, Duration: ${template.totalDuration} days`);
        });
      } else {
        console.warn('⚠️ No therapy templates found. Run seeding script.');
      }
    } else {
      console.error(`❌ API Error: ${response.status} ${response.statusText}`);
      const errorData = await response.text();
      console.error(errorData);
    }
  } catch (error) {
    console.error('❌ Network Error:', error);
  }
}

// Test therapy program creation
async function testTherapyProgramCreation(patientId, templateId) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  try {
    console.log('🔍 Testing therapy program creation...');
    
    const response = await fetch('/api/therapy/programs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        patientId: patientId,
        therapyTemplateId: templateId,
        primaryPractitionerId: user.userId,
        startDate: new Date().toISOString(),
        notes: 'Test therapy program creation'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Therapy program created successfully!');
      console.log('📋 Program Details:', data.data);
      return data.data;
    } else {
      console.error(`❌ Program Creation Error: ${response.status}`);
      const errorData = await response.text();
      console.error(errorData);
    }
  } catch (error) {
    console.error('❌ Network Error:', error);
  }
}

// Export for manual testing
window.testTherapyTemplatesAPI = testTherapyTemplatesAPI;
window.testTherapyProgramCreation = testTherapyProgramCreation;

console.log('🧪 Therapy testing functions loaded!');
console.log('📝 Run: testTherapyTemplatesAPI() to test templates');
console.log('📝 Run: testTherapyProgramCreation(patientId, templateId) to test program creation');