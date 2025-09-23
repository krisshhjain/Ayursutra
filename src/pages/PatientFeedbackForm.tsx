import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Checkbox } from '../components/ui/checkbox';
import { AlertCircle, CheckCircle, Star, Heart, Brain, Battery, Moon, UtensilsCrossed } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const PatientFeedbackForm = () => {
  const { programId, procedureType } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [program, setProgram] = useState(null);
  const [procedure, setProcedure] = useState(null);
  
  const [formData, setFormData] = useState({
    overallExperience: 5,
    painLevel: 5,
    energyLevel: 5,
    sleepQuality: 3,
    appetiteLevel: 3,
    symptoms: [],
    sideEffects: [],
    additionalComments: '',
    wouldRecommend: true
  });

  const symptomOptions = [
    'Reduced stress', 'Better digestion', 'Improved circulation', 'Mental clarity',
    'Reduced inflammation', 'Better joint mobility', 'Improved skin condition',
    'Enhanced immunity', 'Better respiratory health', 'Hormonal balance'
  ];

  const sideEffectOptions = [
    'Temporary fatigue', 'Mild nausea', 'Temporary headache', 'Skin irritation',
    'Digestive changes', 'Mild dizziness', 'Temporary weakness', 'Sleep disturbances'
  ];

  useEffect(() => {
    fetchProgramData();
  }, [programId, procedureType]);

  const fetchProgramData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/therapy/programs/${programId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setProgram(result.data);
        
        const currentProcedure = result.data.procedureDetails.find(p => p.type === procedureType);
        if (currentProcedure) {
          setProcedure(currentProcedure);
          // Check if procedure is completed and needs feedback
          const needsFeedback = (currentProcedure.isCompleted || currentProcedure.status === 'completed') &&
                               (!currentProcedure.patientFeedback || 
                                (currentProcedure.feedbackRequired && !currentProcedure.feedbackReceived));
          
          if (!needsFeedback) {
            alert('This procedure does not require feedback or feedback has already been submitted');
            navigate('/therapy-portal');
          }
        } else {
          alert('Procedure not found');
          navigate('/therapy-portal');
        }
      } else {
        alert('Failed to load program data');
        navigate('/therapy-portal');
      }
    } catch (error) {
      console.error('Error fetching program data:', error);
      alert('Error loading program data');
      navigate('/therapy-portal');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/therapy/programs/${programId}/procedures/${procedureType}/patient-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Feedback submitted successfully!\n\n${result.message}`);
        
        if (result.nextSteps?.nextProcedure) {
          alert(`Next procedure (${result.nextSteps.nextProcedure}) is now available for scheduling.`);
        } else if (result.nextSteps?.programCompleted) {
          alert('🎉 Congratulations! You have completed your entire Panchakarma program. A comprehensive progress report is now available.');
        }
        
        navigate('/therapy-portal');
      } else {
        alert(`Failed to submit feedback: ${result.message}`);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSymptomChange = (symptom, checked) => {
    setFormData(prev => ({
      ...prev,
      symptoms: checked 
        ? [...prev.symptoms, symptom]
        : prev.symptoms.filter(s => s !== symptom)
    }));
  };

  const handleSideEffectChange = (effect, checked) => {
    setFormData(prev => ({
      ...prev,
      sideEffects: checked 
        ? [...prev.sideEffects, effect]
        : prev.sideEffects.filter(e => e !== effect)
    }));
  };

  const getProcedureTitle = (type) => {
    const titles = {
      'vamana': 'Vamana (Therapeutic Emesis)',
      'virechana': 'Virechana (Purgation)',
      'basti': 'Basti (Medicated Enema)',
      'nasya': 'Nasya (Nasal Administration)',
      'raktamokshana': 'Raktamokshana (Bloodletting)'
    };
    return titles[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading feedback form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Procedure Feedback</h1>
          <p className="text-muted-foreground">Your feedback helps us ensure the best possible care</p>
        </div>

        {/* Procedure Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              {getProcedureTitle(procedureType)} - Completed
            </CardTitle>
            <CardDescription>
              Please provide feedback about your experience with this procedure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Badge className="bg-yellow-100 text-yellow-800">Awaiting Your Feedback</Badge>
              <span className="text-sm text-gray-600">
                Completed: {procedure?.actualDates?.practitionerCompletedAt ? 
                  new Date(procedure.actualDates.practitionerCompletedAt).toLocaleDateString() : 'Recently'
                }
              </span>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Experience */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Overall Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label className="text-base mb-4 block">How would you rate your overall experience with this procedure?</Label>
              <RadioGroup 
                value={formData.overallExperience.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, overallExperience: parseInt(value) }))}
                className="flex gap-6"
              >
                {[1, 2, 3, 4, 5].map(rating => (
                  <div key={rating} className="flex items-center space-x-2">
                    <RadioGroupItem value={rating.toString()} id={`experience-${rating}`} />
                    <Label htmlFor={`experience-${rating}`} className="flex items-center gap-1">
                      {rating} <Star className="h-4 w-4" />
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <div className="mt-2 text-sm text-gray-600">
                1 = Poor, 5 = Excellent
              </div>
            </CardContent>
          </Card>

          {/* Health Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Health Assessment</CardTitle>
              <CardDescription>Rate how you feel in different aspects after the procedure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pain Level */}
              <div>
                <Label className="flex items-center gap-2 text-base mb-3">
                  <AlertCircle className="h-5 w-5" />
                  Pain Level (1 = No pain, 10 = Severe pain)
                </Label>
                <div className="flex items-center gap-4">
                  <span>1</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.painLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, painLevel: parseInt(e.target.value) }))}
                    className="flex-1"
                  />
                  <span>10</span>
                </div>
                <div className="text-center mt-2">
                  <Badge variant="outline">Current: {formData.painLevel}/10</Badge>
                </div>
              </div>

              {/* Energy Level */}
              <div>
                <Label className="flex items-center gap-2 text-base mb-3">
                  <Battery className="h-5 w-5" />
                  Energy Level (1 = Very low, 10 = Very high)
                </Label>
                <div className="flex items-center gap-4">
                  <span>1</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.energyLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, energyLevel: parseInt(e.target.value) }))}
                    className="flex-1"
                  />
                  <span>10</span>
                </div>
                <div className="text-center mt-2">
                  <Badge variant="outline">Current: {formData.energyLevel}/10</Badge>
                </div>
              </div>

              {/* Sleep Quality */}
              <div>
                <Label className="flex items-center gap-2 text-base mb-3">
                  <Moon className="h-5 w-5" />
                  Sleep Quality (1 = Very poor, 5 = Excellent)
                </Label>
                <div className="flex items-center gap-4">
                  <span>1</span>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.sleepQuality}
                    onChange={(e) => setFormData(prev => ({ ...prev, sleepQuality: parseInt(e.target.value) }))}
                    className="flex-1"
                  />
                  <span>5</span>
                </div>
                <div className="text-center mt-2">
                  <Badge variant="outline">Current: {formData.sleepQuality}/5</Badge>
                </div>
              </div>

              {/* Appetite Level */}
              <div>
                <Label className="flex items-center gap-2 text-base mb-3">
                  <UtensilsCrossed className="h-5 w-5" />
                  Appetite Level (1 = Very poor, 5 = Excellent)
                </Label>
                <div className="flex items-center gap-4">
                  <span>1</span>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.appetiteLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, appetiteLevel: parseInt(e.target.value) }))}
                    className="flex-1"
                  />
                  <span>5</span>
                </div>
                <div className="text-center mt-2">
                  <Badge variant="outline">Current: {formData.appetiteLevel}/5</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Symptoms Experienced */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Positive Effects Experienced
              </CardTitle>
              <CardDescription>Select any positive effects you've noticed (optional)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {symptomOptions.map(symptom => (
                  <div key={symptom} className="flex items-center space-x-2">
                    <Checkbox
                      id={symptom}
                      checked={formData.symptoms.includes(symptom)}
                      onCheckedChange={(checked) => handleSymptomChange(symptom, checked)}
                    />
                    <Label htmlFor={symptom} className="text-sm">{symptom}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Side Effects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Side Effects (if any)
              </CardTitle>
              <CardDescription>Select any side effects you experienced (optional)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {sideEffectOptions.map(effect => (
                  <div key={effect} className="flex items-center space-x-2">
                    <Checkbox
                      id={effect}
                      checked={formData.sideEffects.includes(effect)}
                      onCheckedChange={(checked) => handleSideEffectChange(effect, checked)}
                    />
                    <Label htmlFor={effect} className="text-sm">{effect}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Comments */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Comments</CardTitle>
              <CardDescription>Share any additional thoughts or experiences (optional)</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.additionalComments}
                onChange={(e) => setFormData(prev => ({ ...prev, additionalComments: e.target.value }))}
                placeholder="Please share any additional feedback, concerns, or experiences..."
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>

          {/* Recommendation */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recommend"
                  checked={formData.wouldRecommend}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, wouldRecommend: Boolean(checked) }))}
                />
                <Label htmlFor="recommend" className="text-base">
                  I would recommend this procedure to others with similar conditions
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/therapy-portal')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-green-600 hover:bg-green-700">
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientFeedbackForm;