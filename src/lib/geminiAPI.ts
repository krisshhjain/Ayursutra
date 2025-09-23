// Gemini API integration for Ayurveda-focused responses
const GEMINI_API_KEY = 'AIzaSyCdLUL8dJ_PKpGDYTclLNcuqcs8bwg4BWs';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

export const generateAyurvedaResponse = async (question: string): Promise<string> => {
  try {
    // Create a focused Ayurveda prompt
    const ayurvedaPrompt = `You are an expert Ayurvedic practitioner and wellness advisor. You ONLY provide information about Ayurveda, traditional Indian medicine, doshas (Vata, Pitta, Kapha), herbs, treatments, diet, lifestyle, yoga, and related wellness practices.

STRICT RULES:
1. ONLY answer questions related to Ayurveda, doshas, traditional medicine, herbs, diet, yoga, meditation, and wellness
2. If the question is NOT about Ayurveda, politely redirect them to ask about Ayurvedic topics
3. Keep responses informative but concise (2-3 paragraphs maximum)
4. Always mention that for serious health issues, they should consult a qualified Ayurvedic practitioner
5. Use simple, easy-to-understand language
6. Focus on practical, actionable advice when possible

User Question: "${question}"

Response:`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: ayurvedaPrompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 300,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const generatedText = data.candidates[0].content.parts[0].text;
      return generatedText.trim();
    } else {
      throw new Error('No response generated');
    }
  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Fallback to hardcoded Ayurveda responses
    return getFallbackAyurvedaResponse(question);
  }
};

// Fallback responses for when API fails
const getFallbackAyurvedaResponse = (question: string): string => {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('vata')) {
    return "Vata dosha governs movement in the body and is associated with air and space elements. When balanced, it promotes creativity and flexibility. When imbalanced, it can cause anxiety, dryness, and irregular digestion. To balance Vata, focus on warm, moist foods, regular routines, gentle exercise, and calming practices like meditation. For personalized guidance, please consult with a qualified Ayurvedic practitioner.";
  }
  
  if (lowerQuestion.includes('pitta')) {
    return "Pitta dosha governs metabolism and transformation, associated with fire and water elements. Balanced Pitta promotes intelligence and good digestion. Imbalanced Pitta can cause anger, inflammation, and excessive heat. To balance Pitta, choose cooling foods, avoid spicy meals, practice moderation, and spend time in nature. Swimming and moonlight meditation are particularly beneficial for Pitta types.";
  }
  
  if (lowerQuestion.includes('kapha')) {
    return "Kapha dosha provides structure and stability, associated with earth and water elements. Balanced Kapha gives strength and immunity. Imbalanced Kapha can cause lethargy, weight gain, and congestion. To balance Kapha, engage in vigorous exercise, eat light and spicy foods, wake up early, and stay active throughout the day. Avoid heavy, oily foods and excessive rest.";
  }
  
  if (lowerQuestion.includes('diet') || lowerQuestion.includes('food')) {
    return "Ayurvedic nutrition is based on your unique constitution and current imbalances. Generally, eat fresh, seasonal foods appropriate for your dosha. Vata benefits from warm, moist foods; Pitta from cooling foods; Kapha from light, spicy foods. Always eat in a calm environment, chew thoroughly, and avoid overeating. The largest meal should be at midday when digestive fire is strongest.";
  }
  
  if (lowerQuestion.includes('herb') || lowerQuestion.includes('medicine')) {
    return "Ayurvedic herbs work synergistically to restore balance. Popular herbs include Ashwagandha for stress and vitality, Turmeric for inflammation, Triphala for digestion, and Brahmi for mental clarity. However, herbs should be chosen based on your individual constitution and current imbalances. Always consult with a qualified Ayurvedic practitioner before starting any herbal regimen.";
  }
  
  if (lowerQuestion.includes('yoga') || lowerQuestion.includes('exercise')) {
    return "Ayurveda recommends different exercises for each dosha. Vata types benefit from gentle, grounding practices like slow yoga and walking. Pitta types should choose moderate, cooling exercises like swimming and yoga in cool environments. Kapha types need vigorous, energizing activities like running, hot yoga, and strength training. Listen to your body and adjust intensity based on your energy levels.";
  }
  
  if (lowerQuestion.includes('sleep') || lowerQuestion.includes('insomnia')) {
    return "Good sleep is essential for health in Ayurveda. Create a regular bedtime routine, avoid screens before bed, and sleep in a cool, dark room. Vata types benefit from warm oil massage and calming herbs like Ashwagandha. Pitta types should avoid late dinners and practice cooling pranayama. Kapha types should avoid daytime naps and go to bed early. For persistent sleep issues, consult an Ayurvedic practitioner.";
  }
  
  if (lowerQuestion.includes('stress') || lowerQuestion.includes('anxiety')) {
    return "Stress and anxiety are primarily Vata imbalances in Ayurveda. Managing stress involves creating routine, practicing daily meditation, doing gentle yoga, and eating warm, nourishing foods. Pranayama (breathing exercises) like Nadi Shodhana can be very helpful. Herbs like Ashwagandha and Brahmi support nervous system health. Regular oil massage (Abhyanga) is also deeply calming for Vata.";
  }

  // For non-Ayurveda questions
  if (!lowerQuestion.includes('ayurveda') && !lowerQuestion.includes('dosha') && 
      !lowerQuestion.includes('vata') && !lowerQuestion.includes('pitta') && 
      !lowerQuestion.includes('kapha') && !lowerQuestion.includes('herb') && 
      !lowerQuestion.includes('yoga') && !lowerQuestion.includes('meditation')) {
    return "I specialize in Ayurvedic wisdom and wellness practices. Please ask me about doshas (Vata, Pitta, Kapha), Ayurvedic diet, herbs, yoga, meditation, or traditional wellness practices. I'd be happy to help you with any Ayurveda-related questions! You can also take our dosha assessment to get personalized recommendations.";
  }
  
  return "That's an interesting question about Ayurveda! While I aim to provide helpful information about traditional wellness practices, I'd recommend taking our dosha assessment for personalized guidance, or consulting with one of our qualified Ayurvedic practitioners for detailed advice. Is there a specific aspect of Ayurvedic wellness you'd like to explore?";
};

// Check if question is Ayurveda-related
export const isAyurvedaRelated = (question: string): boolean => {
  const ayurvedaKeywords = [
    'ayurveda', 'ayurvedic', 'dosha', 'doshas', 'vata', 'pitta', 'kapha',
    'tridosha', 'prakriti', 'vikriti', 'panchakosha', 'panchamahabhuta',
    'herb', 'herbs', 'herbal', 'medicine', 'traditional', 'holistic',
    'yoga', 'pranayama', 'meditation', 'mindfulness', 'chakra', 'chakras',
    'diet', 'nutrition', 'food', 'spice', 'spices', 'turmeric', 'ginger',
    'ashwagandha', 'brahmi', 'triphala', 'neem', 'tulsi', 'amla',
    'massage', 'abhyanga', 'marma', 'energy', 'balance', 'wellness',
    'detox', 'cleanse', 'panchakarma', 'constitution', 'digestion',
    'agni', 'ama', 'ojas', 'tejas', 'prana', 'stress', 'anxiety',
    'sleep', 'insomnia', 'immunity', 'inflammation', 'arthritis'
  ];
  
  const lowerQuestion = question.toLowerCase();
  return ayurvedaKeywords.some(keyword => lowerQuestion.includes(keyword));
};