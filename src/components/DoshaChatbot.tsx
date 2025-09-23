import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Send, 
  Sparkles, 
  Leaf, 
  CheckCircle2, 
  RotateCcw,
  TrendingUp,
  Heart,
  Brain,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  SYMPTOMS, 
  DoshaAssessment, 
  TREATMENT_PLANS,
  type DoshaType,
  type Symptom,
  type TreatmentPlan
} from '@/lib/doshaEngine';
import { generateAyurvedaResponse, isAyurvedaRelated } from '@/lib/geminiAPI';

interface ChatMessage {
  id: string;
  type: 'bot' | 'user';
  content: string | React.ReactNode;
  timestamp: Date;
}

type ChatStep = 'welcome' | 'symptoms' | 'assessment' | 'results' | 'chat';

const DoshaChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<ChatStep>('welcome');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [doshaAssessment] = useState(new DoshaAssessment());
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [assessmentResults, setAssessmentResults] = useState<{
    dosha: DoshaType;
    treatmentPlan: TreatmentPlan;
    scores: any;
  } | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  console.log('DoshaChatbot render - symptoms count:', SYMPTOMS.length); // Debug log

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChat();
    }
  }, [isOpen]);

  // Listen for assessment completion from SymptomSelector
  useEffect(() => {
    const handleCompleteAssessment = (event: any) => {
      const symptoms = event.detail.symptoms;
      console.log('Completing assessment with symptoms:', symptoms);
      
      // Update the main state
      setSelectedSymptoms(symptoms);
      
      // Update dosha assessment
      doshaAssessment.reset();
      symptoms.forEach((symptomId: string) => {
        doshaAssessment.addSymptom(symptomId);
      });
      
      completeAssessment();
    };

    window.addEventListener('completeAssessment', handleCompleteAssessment);
    return () => {
      window.removeEventListener('completeAssessment', handleCompleteAssessment);
    };
  }, []);

  const addMessage = (content: string | React.ReactNode, type: 'bot' | 'user' = 'bot') => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const addTypingEffect = (content: string | React.ReactNode, delay = 1000) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage(content);
    }, delay);
  };

  const initializeChat = () => {
    const welcomeMessage = (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          <span className="font-semibold text-primary">Welcome to AyurSutra AI</span>
        </div>
        <p>I'm your personal Ayurvedic wellness assistant! I can help you:</p>
        <ul className="space-y-1 text-sm">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Discover your unique dosha (constitution)
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Get personalized treatment recommendations
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Learn about Ayurvedic lifestyle practices
          </li>
        </ul>
        <p className="text-sm text-muted-foreground">
          Ready to begin your wellness journey?
        </p>
      </div>
    );
    
    addMessage(welcomeMessage);
    
    setTimeout(() => {
      addMessage(
        <div className="flex gap-2">
          <Button 
            onClick={() => startAssessment()}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Start Dosha Assessment
          </Button>
          <Button 
            variant="outline"
            onClick={() => startGeneralChat()}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Ask Questions
          </Button>
        </div>
      );
    }, 1500);
  };

  const startAssessment = () => {
    console.log('Starting assessment...'); // Debug log
    console.log('Total symptoms available:', SYMPTOMS.length); // Debug log
    console.log('First few symptoms:', SYMPTOMS.slice(0, 3)); // Debug log
    setCurrentStep('symptoms');
    doshaAssessment.reset();
    setSelectedSymptoms([]);
    
    addMessage("Perfect! Let's discover your dosha through a personalized assessment.");
    
    setTimeout(() => {
      console.log('Adding symptom selector...'); // Debug log
      addMessage(
        <div className="space-y-4">
          <p>Please select any symptoms or characteristics that apply to you:</p>
          <SymptomSelector 
            onSymptomsChange={handleSymptomsChange}
            selectedSymptoms={selectedSymptoms}
          />
        </div>
      );
    }, 1000);
  };

  const startGeneralChat = () => {
    setCurrentStep('chat');
    addMessage("I'm here to answer any questions about Ayurveda! What would you like to know?");
  };

  const handleSymptomsChange = (symptoms: string[]) => {
    console.log('handleSymptomsChange called with:', symptoms);
    setSelectedSymptoms(symptoms);
    
    // Update dosha assessment in real-time
    doshaAssessment.reset();
    symptoms.forEach(symptomId => {
      doshaAssessment.addSymptom(symptomId);
    });
  };

  const completeAssessment = () => {
    setCurrentStep('assessment');
    addMessage("Analyzing your responses...");
    
    setTimeout(() => {
      const dosha = doshaAssessment.getDominantDosha();
      const treatmentPlan = doshaAssessment.getTreatmentPlan();
      const scores = doshaAssessment.getScores();
      
      setAssessmentResults({ dosha, treatmentPlan, scores });
      setCurrentStep('results');
      
      addMessage(
        <AssessmentResults 
          dosha={dosha}
          treatmentPlan={treatmentPlan}
          scores={scores}
          onStartOver={() => startAssessment()}
          onAskQuestion={() => setCurrentStep('chat')}
        />
      );
    }, 2000);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    
    addMessage(userInput, 'user');
    const question = userInput;
    setUserInput('');
    setIsTyping(true);
    
    try {
      // Check if question is Ayurveda-related
      if (!isAyurvedaRelated(question)) {
        setIsTyping(false);
        addMessage("I specialize in Ayurvedic wisdom and wellness practices. Please ask me about doshas (Vata, Pitta, Kapha), Ayurvedic diet, herbs, yoga, meditation, or traditional wellness practices. I'd be happy to help you with any Ayurveda-related questions!");
        return;
      }

      // Generate AI response using Gemini
      const response = await generateAyurvedaResponse(question);
      setIsTyping(false);
      addMessage(response);
    } catch (error) {
      console.error('Error generating response:', error);
      setIsTyping(false);
      addMessage("I apologize, but I'm having trouble generating a response right now. Please try asking your Ayurveda question again, or consider taking our dosha assessment for personalized recommendations.");
    }
  };

  const doshaColors = {
    vata: 'from-purple-500 to-blue-500',
    pitta: 'from-red-500 to-orange-500',
    kapha: 'from-green-500 to-teal-500',
    'vata-pitta': 'from-purple-500 to-orange-500',
    'pitta-kapha': 'from-orange-500 to-green-500',
    'vata-kapha': 'from-purple-500 to-green-500',
    tridosha: 'from-purple-500 via-orange-500 to-green-500'
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="h-14 w-14 rounded-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[480px] h-[700px] bg-background border rounded-xl shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Leaf className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-semibold text-lg">AyurSutra AI</span>
                  <p className="text-xs opacity-90">Your Ayurvedic Wellness Assistant</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 h-9 w-9 p-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {message.content}
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {currentStep === 'chat' && (
              <div className="p-4 border-t bg-gray-50/50">
                <div className="flex gap-3">
                  <Textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Ask me about Ayurveda, doshas, treatments..."
                    className="flex-1 min-h-[50px] max-h-[120px] resize-none"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!userInput.trim() || isTyping}
                    size="lg"
                    className="h-[50px] px-4"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Powered by Gemini AI • Ayurveda-focused responses
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Symptom Selector Component
const SymptomSelector: React.FC<{
  onSymptomsChange: (symptoms: string[]) => void;
  selectedSymptoms: string[];
}> = ({ onSymptomsChange, selectedSymptoms }) => {
  const [localSelectedSymptoms, setLocalSelectedSymptoms] = useState<string[]>(selectedSymptoms);
  
  const categories = ['physical', 'digestive', 'mental', 'sleep', 'energy'];
  
  const toggleSymptom = useCallback((symptomId: string) => {
    console.log('Toggling symptom:', symptomId);
    const updated = localSelectedSymptoms.includes(symptomId)
      ? localSelectedSymptoms.filter(id => id !== symptomId)
      : [...localSelectedSymptoms, symptomId];
    
    console.log('Updated symptoms:', updated);
    setLocalSelectedSymptoms(updated);
    onSymptomsChange(updated);
  }, [localSelectedSymptoms, onSymptomsChange]);

  // Sync with parent state
  useEffect(() => {
    setLocalSelectedSymptoms(selectedSymptoms);
  }, [selectedSymptoms]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg">
        <div className="flex-1">
          <Progress value={Math.min((localSelectedSymptoms.length / 5) * 100, 100)} className="h-2" />
        </div>
        <div className="text-sm font-medium text-gray-700">
          {localSelectedSymptoms.length} selected
        </div>
      </div>
      
      {categories.map(category => {
        const categorySymptoms = SYMPTOMS.filter(s => s.category === category);
        console.log(`${category} symptoms:`, categorySymptoms.length);
        return (
          <div key={category} className="space-y-3">
            <h4 className="font-semibold capitalize flex items-center gap-2 text-base text-gray-800 border-b pb-2">
              {category === 'physical' && <Heart className="h-5 w-5 text-red-500" />}
              {category === 'mental' && <Brain className="h-5 w-5 text-purple-500" />}
              {category === 'energy' && <Zap className="h-5 w-5 text-yellow-500" />}
              {category === 'digestive' && <div className="h-5 w-5 bg-orange-500 rounded-full" />}
              {category === 'sleep' && <div className="h-5 w-5 bg-blue-500 rounded-full" />}
              {category} ({categorySymptoms.length})
            </h4>
            <div className="space-y-2">
              {categorySymptoms.length === 0 ? (
                <p className="text-sm text-muted-foreground">No symptoms found for this category</p>
              ) : (
                categorySymptoms.map(symptom => {
                  const isSelected = localSelectedSymptoms.includes(symptom.id);
                  return (
                    <div
                      key={symptom.id}
                      onClick={() => toggleSymptom(symptom.id)}
                      className={`cursor-pointer p-4 text-sm border-2 rounded-lg transition-all duration-200 hover:shadow-md ${
                        isSelected 
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 text-blue-900 shadow-sm' 
                          : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                        }`}>
                          {isSelected && <CheckCircle2 className="h-3 w-3 text-white" />}
                        </div>
                        <span className="flex-1 leading-relaxed">{symptom.text}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
      
      {localSelectedSymptoms.length >= 3 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
          <Button
            onClick={() => {
              // Trigger completion directly from here
              const event = new CustomEvent('completeAssessment', { 
                detail: { symptoms: localSelectedSymptoms } 
              });
              window.dispatchEvent(event);
            }}
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
          >
            <TrendingUp className="h-5 w-5 mr-2" />
            Get My Dosha Results ({localSelectedSymptoms.length} symptoms)
          </Button>
        </div>
      )}
    </div>
  );
};

// Assessment Results Component
const AssessmentResults: React.FC<{
  dosha: DoshaType;
  treatmentPlan: TreatmentPlan;
  scores: any;
  onStartOver: () => void;
  onAskQuestion: () => void;
}> = ({ dosha, treatmentPlan, scores, onStartOver, onAskQuestion }) => {
  const doshaColors = {
    vata: 'from-purple-500 to-blue-500',
    pitta: 'from-red-500 to-orange-500',
    kapha: 'from-green-500 to-teal-500',
    'vata-pitta': 'from-purple-500 to-orange-500',
    'pitta-kapha': 'from-orange-500 to-green-500',
    'vata-kapha': 'from-purple-500 to-green-500',
    tridosha: 'from-purple-500 via-orange-500 to-green-500'
  };

  return (
    <div className="space-y-4">
      <Card className={`p-4 bg-gradient-to-r ${doshaColors[dosha]} text-white`}>
        <div className="text-center">
          <h3 className="text-xl font-bold capitalize">{dosha.replace('-', '-')} Constitution</h3>
          <p className="text-sm opacity-90 mt-1">{treatmentPlan.description}</p>
        </div>
      </Card>

      <div className="space-y-3">
        <h4 className="font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Key Recommendations
        </h4>
        
        <Card className="p-3">
          <h5 className="font-medium text-sm mb-2">🍽️ Diet Guidelines</h5>
          <div className="text-xs space-y-1">
            <p><strong>Include:</strong> {treatmentPlan.diet.foods_to_eat.slice(0, 3).join(', ')}</p>
            <p><strong>Avoid:</strong> {treatmentPlan.diet.foods_to_avoid.slice(0, 3).join(', ')}</p>
          </div>
        </Card>

        <Card className="p-3">
          <h5 className="font-medium text-sm mb-2">🧘 Lifestyle</h5>
          <div className="text-xs space-y-1">
            {treatmentPlan.lifestyle.daily_routine.slice(0, 3).map((item, idx) => (
              <p key={idx}>• {item}</p>
            ))}
          </div>
        </Card>

        <Card className="p-3">
          <h5 className="font-medium text-sm mb-2">🌿 Recommended Herbs</h5>
          <div className="text-xs space-y-1">
            {treatmentPlan.herbs.slice(0, 2).map((herb, idx) => (
              <p key={idx}><strong>{herb.name}:</strong> {herb.benefits}</p>
            ))}
          </div>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button onClick={onStartOver} variant="outline" size="sm">
          <RotateCcw className="h-4 w-4 mr-1" />
          Retake
        </Button>
        <Button onClick={onAskQuestion} size="sm">
          <MessageCircle className="h-4 w-4 mr-1" />
          Ask Questions
        </Button>
      </div>
    </div>
  );
};

export default DoshaChatbot;