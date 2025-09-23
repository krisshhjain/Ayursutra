// Dosha Assessment and Treatment Engine
// This module provides hardcoded logic for determining doshas and treatment plans

export type DoshaType = 'vata' | 'pitta' | 'kapha' | 'vata-pitta' | 'pitta-kapha' | 'vata-kapha' | 'tridosha';

export interface DoshaScores {
  vata: number;
  pitta: number;
  kapha: number;
}

export interface Symptom {
  id: string;
  text: string;
  category: 'physical' | 'mental' | 'digestive' | 'skin' | 'sleep' | 'energy';
  vataScore: number;
  pittaScore: number;
  kaphaScore: number;
}

export interface TreatmentPlan {
  dosha: DoshaType;
  description: string;
  diet: {
    foods_to_eat: string[];
    foods_to_avoid: string[];
    meal_timing: string[];
  };
  lifestyle: {
    daily_routine: string[];
    exercise: string[];
    stress_management: string[];
  };
  herbs: {
    name: string;
    benefits: string;
    usage: string;
  }[];
  yoga_pranayama: string[];
  seasonal_tips: string[];
}

// Comprehensive symptom database for dosha assessment
export const SYMPTOMS: Symptom[] = [
  // Physical Symptoms
  {
    id: 'dry_skin',
    text: 'Dry, rough, or cracked skin',
    category: 'physical',
    vataScore: 3,
    pittaScore: 0,
    kaphaScore: 0
  },
  {
    id: 'oily_skin',
    text: 'Oily, acne-prone skin',
    category: 'physical',
    vataScore: 0,
    pittaScore: 3,
    kaphaScore: 1
  },
  {
    id: 'thick_skin',
    text: 'Thick, smooth, cool skin',
    category: 'physical',
    vataScore: 0,
    pittaScore: 0,
    kaphaScore: 3
  },
  {
    id: 'joint_pain',
    text: 'Joint pain or stiffness',
    category: 'physical',
    vataScore: 3,
    pittaScore: 1,
    kaphaScore: 2
  },
  {
    id: 'excessive_heat',
    text: 'Feeling hot frequently, excessive sweating',
    category: 'physical',
    vataScore: 0,
    pittaScore: 3,
    kaphaScore: 0
  },
  {
    id: 'weight_gain',
    text: 'Easy weight gain, difficulty losing weight',
    category: 'physical',
    vataScore: 0,
    pittaScore: 1,
    kaphaScore: 3
  },
  {
    id: 'weight_loss',
    text: 'Difficulty gaining weight, thin build',
    category: 'physical',
    vataScore: 3,
    pittaScore: 1,
    kaphaScore: 0
  },
  
  // Digestive Symptoms
  {
    id: 'irregular_appetite',
    text: 'Irregular or variable appetite',
    category: 'digestive',
    vataScore: 3,
    pittaScore: 0,
    kaphaScore: 0
  },
  {
    id: 'strong_appetite',
    text: 'Strong appetite, get angry when hungry',
    category: 'digestive',
    vataScore: 0,
    pittaScore: 3,
    kaphaScore: 0
  },
  {
    id: 'slow_digestion',
    text: 'Slow digestion, feeling heavy after meals',
    category: 'digestive',
    vataScore: 0,
    pittaScore: 0,
    kaphaScore: 3
  },
  {
    id: 'gas_bloating',
    text: 'Gas, bloating, constipation',
    category: 'digestive',
    vataScore: 3,
    pittaScore: 1,
    kaphaScore: 0
  },
  {
    id: 'acid_reflux',
    text: 'Acid reflux, heartburn, loose stools',
    category: 'digestive',
    vataScore: 0,
    pittaScore: 3,
    kaphaScore: 0
  },
  
  // Mental/Emotional Symptoms
  {
    id: 'anxiety_worry',
    text: 'Anxiety, worry, restless mind',
    category: 'mental',
    vataScore: 3,
    pittaScore: 0,
    kaphaScore: 0
  },
  {
    id: 'anger_irritability',
    text: 'Anger, irritability, impatience',
    category: 'mental',
    vataScore: 0,
    pittaScore: 3,
    kaphaScore: 0
  },
  {
    id: 'lethargy_depression',
    text: 'Lethargy, depression, attachment',
    category: 'mental',
    vataScore: 0,
    pittaScore: 0,
    kaphaScore: 3
  },
  {
    id: 'creative_enthusiastic',
    text: 'Very creative and enthusiastic',
    category: 'mental',
    vataScore: 3,
    pittaScore: 1,
    kaphaScore: 0
  },
  {
    id: 'focused_competitive',
    text: 'Highly focused and competitive',
    category: 'mental',
    vataScore: 0,
    pittaScore: 3,
    kaphaScore: 1
  },
  
  // Sleep Symptoms
  {
    id: 'light_sleep',
    text: 'Light sleep, wake up frequently',
    category: 'sleep',
    vataScore: 3,
    pittaScore: 1,
    kaphaScore: 0
  },
  {
    id: 'moderate_sleep',
    text: 'Moderate sleep, occasional interruptions',
    category: 'sleep',
    vataScore: 1,
    pittaScore: 3,
    kaphaScore: 1
  },
  {
    id: 'deep_sleep',
    text: 'Deep, long sleep, hard to wake up',
    category: 'sleep',
    vataScore: 0,
    pittaScore: 0,
    kaphaScore: 3
  },
  
  // Energy Symptoms
  {
    id: 'variable_energy',
    text: 'Energy comes in bursts, then crashes',
    category: 'energy',
    vataScore: 3,
    pittaScore: 0,
    kaphaScore: 0
  },
  {
    id: 'intense_energy',
    text: 'Intense, consistent energy',
    category: 'energy',
    vataScore: 0,
    pittaScore: 3,
    kaphaScore: 0
  },
  {
    id: 'steady_energy',
    text: 'Steady, enduring energy',
    category: 'energy',
    vataScore: 0,
    pittaScore: 1,
    kaphaScore: 3
  }
];

// Treatment plans for each dosha type
export const TREATMENT_PLANS: Record<DoshaType, TreatmentPlan> = {
  vata: {
    dosha: 'vata',
    description: 'Vata dosha governs movement and is characterized by air and space elements. When imbalanced, it causes dryness, irregularity, and anxiety.',
    diet: {
      foods_to_eat: [
        'Warm, moist, and oily foods',
        'Sweet, sour, and salty tastes',
        'Cooked grains: rice, oats, quinoa',
        'Root vegetables: sweet potato, carrots, beets',
        'Warm milk with spices',
        'Ghee, sesame oil, olive oil',
        'Nuts and seeds (soaked)',
        'Sweet fruits: bananas, mangoes, avocados'
      ],
      foods_to_avoid: [
        'Cold, dry, and raw foods',
        'Bitter, astringent, and pungent tastes',
        'Excessive caffeine',
        'Dried fruits and nuts',
        'Frozen or leftover foods',
        'Beans and legumes (except mung)',
        'Cruciferous vegetables in excess'
      ],
      meal_timing: [
        'Eat at regular times daily',
        'Never skip meals',
        'Largest meal at lunch (12-1 PM)',
        'Light dinner before 7 PM',
        'Warm drinks throughout the day'
      ]
    },
    lifestyle: {
      daily_routine: [
        'Wake up by 6 AM',
        'Oil massage (Abhyanga) with sesame oil',
        'Warm bath or shower',
        'Regular meal times',
        'Early bedtime (9-10 PM)',
        'Avoid overstimulation'
      ],
      exercise: [
        'Gentle, grounding exercises',
        'Yoga: slow, held poses',
        'Walking in nature',
        'Swimming in warm water',
        'Tai Chi or Qigong',
        'Avoid excessive cardio'
      ],
      stress_management: [
        'Daily meditation (10-20 minutes)',
        'Deep breathing exercises',
        'Calming music or mantras',
        'Aromatherapy with lavender',
        'Journaling before bed',
        'Limit screen time'
      ]
    },
    herbs: [
      {
        name: 'Ashwagandha',
        benefits: 'Reduces anxiety, improves sleep, builds strength',
        usage: '1-2 capsules or 1/2 tsp powder with warm milk before bed'
      },
      {
        name: 'Brahmi',
        benefits: 'Calms the mind, improves memory and focus',
        usage: '1 capsule twice daily or 1/4 tsp powder with honey'
      },
      {
        name: 'Jatamansi',
        benefits: 'Natural sedative, reduces restlessness',
        usage: '1 capsule before bed or as directed by practitioner'
      }
    ],
    yoga_pranayama: [
      'Nadi Shodhana (Alternate Nostril Breathing)',
      'Bhramari (Bee Breath)',
      'Gentle Sun Salutations',
      'Restorative poses with props',
      'Yoga Nidra for deep relaxation'
    ],
    seasonal_tips: [
      'Extra care during autumn and early winter',
      'Increase warm, oily foods in cold weather',
      'Use humidifiers in dry climates',
      'Wear warm colors: red, orange, yellow'
    ]
  },
  
  pitta: {
    dosha: 'pitta',
    description: 'Pitta dosha governs metabolism and is characterized by fire and water elements. When imbalanced, it causes heat, inflammation, and anger.',
    diet: {
      foods_to_eat: [
        'Cool, refreshing foods',
        'Sweet, bitter, and astringent tastes',
        'Fresh fruits: melons, grapes, coconut',
        'Leafy greens and cucumber',
        'Basmati rice and barley',
        'Coconut oil and ghee (in moderation)',
        'Fresh herbs: cilantro, mint, fennel',
        'Room temperature or cool water'
      ],
      foods_to_avoid: [
        'Hot, spicy, and oily foods',
        'Sour and salty tastes in excess',
        'Red meat and seafood',
        'Alcohol and caffeine',
        'Fermented foods',
        'Citrus fruits (except lime)',
        'Tomatoes, onions, garlic in excess'
      ],
      meal_timing: [
        'Never skip meals, especially lunch',
        'Largest meal at lunch when digestive fire is strongest',
        'Light breakfast and dinner',
        'Avoid eating when angry or stressed',
        'Cool drinks between meals'
      ]
    },
    lifestyle: {
      daily_routine: [
        'Wake up by 5:30 AM',
        'Cool oil massage with coconut oil',
        'Cool shower',
        'Avoid midday sun',
        'Take breaks from intense work',
        'Sleep by 10 PM'
      ],
      exercise: [
        'Moderate, cooling exercises',
        'Swimming',
        'Yoga in cool environment',
        'Evening walks',
        'Cycling',
        'Avoid competitive sports in heat'
      ],
      stress_management: [
        'Cooling pranayama (Sitali, Sitkari)',
        'Meditation near water',
        'Avoid confrontations',
        'Spending time in nature',
        'Cool colors: blue, green, white',
        'Moonlight meditation'
      ]
    },
    herbs: [
      {
        name: 'Amalaki',
        benefits: 'Cooling, reduces acidity, supports liver',
        usage: '1-2 capsules or 1/2 tsp powder with cool water'
      },
      {
        name: 'Brahmi',
        benefits: 'Cools the mind, reduces anger and irritability',
        usage: '1 capsule twice daily with cool water'
      },
      {
        name: 'Neem',
        benefits: 'Purifies blood, reduces skin inflammation',
        usage: '1 capsule daily or as directed by practitioner'
      }
    ],
    yoga_pranayama: [
      'Sitali (Cooling Breath)',
      'Sitkari (Hissing Breath)',
      'Chandra Bhedana (Left Nostril Breathing)',
      'Moon Salutations',
      'Restorative poses in cool environment'
    ],
    seasonal_tips: [
      'Extra care during summer',
      'Increase cooling foods in hot weather',
      'Avoid sun exposure during peak hours',
      'Use cooling oils: coconut, sandalwood'
    ]
  },
  
  kapha: {
    dosha: 'kapha',
    description: 'Kapha dosha governs structure and is characterized by earth and water elements. When imbalanced, it causes heaviness, congestion, and lethargy.',
    diet: {
      foods_to_eat: [
        'Light, warm, and spicy foods',
        'Pungent, bitter, and astringent tastes',
        'Ginger, black pepper, turmeric',
        'Leafy greens and cruciferous vegetables',
        'Quinoa, millet, buckwheat',
        'Small amounts of honey',
        'Herbal teas: ginger, cinnamon',
        'Apples, pears, pomegranates'
      ],
      foods_to_avoid: [
        'Heavy, oily, and cold foods',
        'Sweet and salty tastes in excess',
        'Dairy products',
        'Wheat and white rice',
        'Fried foods',
        'Ice cream and frozen foods',
        'Bananas and sweet fruits',
        'Excessive water intake'
      ],
      meal_timing: [
        'Light breakfast or skip it',
        'Largest meal at lunch',
        'Very light dinner',
        'Avoid snacking',
        'Warm drinks throughout day'
      ]
    },
    lifestyle: {
      daily_routine: [
        'Wake up by 5 AM',
        'Vigorous dry brushing',
        'Hot shower',
        'Stay active throughout day',
        'Avoid daytime naps',
        'Early bedtime (9-10 PM)'
      ],
      exercise: [
        'Vigorous, energizing exercises',
        'Running and jogging',
        'Hot yoga',
        'Weight training',
        'High-intensity interval training',
        'Daily exercise is essential'
      ],
      stress_management: [
        'Energizing pranayama (Bhastrika, Kapalabhati)',
        'Active meditation',
        'Challenging activities',
        'Social interactions',
        'Bright colors: red, orange, yellow',
        'Morning sunlight exposure'
      ]
    },
    herbs: [
      {
        name: 'Guggulu',
        benefits: 'Reduces cholesterol, supports weight management',
        usage: '1-2 capsules twice daily before meals'
      },
      {
        name: 'Trikatu',
        benefits: 'Stimulates digestion, reduces congestion',
        usage: '1/4 tsp with honey before meals'
      },
      {
        name: 'Punarnava',
        benefits: 'Reduces water retention, supports kidney function',
        usage: '1 capsule twice daily or as directed'
      }
    ],
    yoga_pranayama: [
      'Bhastrika (Bellows Breath)',
      'Kapalabhati (Skull Shining Breath)',
      'Surya Bhedana (Right Nostril Breathing)',
      'Dynamic Sun Salutations',
      'Energizing backbends'
    ],
    seasonal_tips: [
      'Extra care during spring and early summer',
      'Increase spicy foods in damp weather',
      'Stay warm and dry',
      'Use stimulating oils: eucalyptus, rosemary'
    ]
  },
  
  'vata-pitta': {
    dosha: 'vata-pitta',
    description: 'Dual constitution with both Vata and Pitta characteristics. Requires balance between grounding and cooling.',
    diet: {
      foods_to_eat: [
        'Warm but not hot foods',
        'Sweet taste predominant',
        'Moderately spiced foods',
        'Fresh fruits and vegetables',
        'Whole grains: rice, oats',
        'Moderate amounts of ghee',
        'Cool-warm beverages'
      ],
      foods_to_avoid: [
        'Very hot or very cold foods',
        'Excessive spicy foods',
        'Dried or processed foods',
        'Caffeine in excess',
        'Very sour or fermented foods'
      ],
      meal_timing: [
        'Regular meal times essential',
        'Moderate portions',
        'Don\'t skip meals',
        'Calm eating environment'
      ]
    },
    lifestyle: {
      daily_routine: [
        'Consistent daily routine',
        'Moderate oil massage',
        'Avoid extreme temperatures',
        'Regular but not excessive exercise',
        'Adequate rest'
      ],
      exercise: [
        'Moderate intensity exercises',
        'Swimming (not too cold)',
        'Gentle yoga',
        'Walking',
        'Avoid overexertion'
      ],
      stress_management: [
        'Regular meditation',
        'Cooling and calming practices',
        'Time in nature',
        'Moderate social activity'
      ]
    },
    herbs: [
      {
        name: 'Saraswatarishta',
        benefits: 'Balances both doshas, improves mental clarity',
        usage: '2 tsp twice daily after meals'
      }
    ],
    yoga_pranayama: [
      'Nadi Shodhana (balancing)',
      'Gentle breathing practices',
      'Moderate yoga practice'
    ],
    seasonal_tips: [
      'Adjust practices seasonally',
      'Cool in summer, warm in winter',
      'Maintain consistent routine'
    ]
  },
  
  'pitta-kapha': {
    dosha: 'pitta-kapha',
    description: 'Dual constitution combining Pitta\'s intensity with Kapha\'s stability. Needs cooling and lightening.',
    diet: {
      foods_to_eat: [
        'Light, cooling foods',
        'Bitter and astringent tastes',
        'Fresh vegetables and fruits',
        'Spices in moderation',
        'Light grains: quinoa, millet'
      ],
      foods_to_avoid: [
        'Heavy, oily foods',
        'Excessive sweet and sour',
        'Dairy in large amounts',
        'Very hot spices'
      ],
      meal_timing: [
        'Light breakfast',
        'Substantial lunch',
        'Light dinner',
        'Avoid late eating'
      ]
    },
    lifestyle: {
      daily_routine: [
        'Active morning routine',
        'Cool environment',
        'Regular exercise',
        'Avoid overheating'
      ],
      exercise: [
        'Moderate to vigorous exercise',
        'Swimming',
        'Yoga in cool place',
        'Avoid hot environments'
      ],
      stress_management: [
        'Cooling practices',
        'Regular physical activity',
        'Avoid competitive stress'
      ]
    },
    herbs: [
      {
        name: 'Triphala',
        benefits: 'Balances digestion, supports elimination',
        usage: '1-2 capsules before bed'
      }
    ],
    yoga_pranayama: [
      'Cooling pranayama',
      'Moderate intensity yoga',
      'Avoid hot yoga'
    ],
    seasonal_tips: [
      'Extra cooling in summer',
      'Light, energizing in spring',
      'Avoid heavy foods'
    ]
  },
  
  'vata-kapha': {
    dosha: 'vata-kapha',
    description: 'Dual constitution with opposing qualities. Requires warming and energizing while maintaining stability.',
    diet: {
      foods_to_eat: [
        'Warm, light, spiced foods',
        'Ginger and warming spices',
        'Cooked vegetables',
        'Light proteins',
        'Warm beverages'
      ],
      foods_to_avoid: [
        'Cold, heavy foods',
        'Dairy in excess',
        'Raw foods',
        'Sweet and salty excess'
      ],
      meal_timing: [
        'Regular, warm meals',
        'Light breakfast',
        'Good lunch',
        'Early, light dinner'
      ]
    },
    lifestyle: {
      daily_routine: [
        'Consistent warming routine',
        'Regular exercise',
        'Stay warm',
        'Energizing activities'
      ],
      exercise: [
        'Regular, warming exercise',
        'Yoga with heating poses',
        'Strength training',
        'Avoid excessive cardio'
      ],
      stress_management: [
        'Warming, grounding practices',
        'Regular routine',
        'Energizing but calming activities'
      ]
    },
    herbs: [
      {
        name: 'Trikatu with Ashwagandha',
        benefits: 'Warming and strengthening combination',
        usage: 'As directed by practitioner'
      }
    ],
    yoga_pranayama: [
      'Warming pranayama',
      'Energizing but stable practice',
      'Sun Salutations'
    ],
    seasonal_tips: [
      'Extra warming in cold weather',
      'Light, energizing foods',
      'Maintain consistent routine'
    ]
  },
  
  tridosha: {
    dosha: 'tridosha',
    description: 'Balanced constitution with all three doshas in harmony. Focus on maintaining balance through seasonal adjustments.',
    diet: {
      foods_to_eat: [
        'Seasonal, fresh foods',
        'All six tastes in balance',
        'Variety in diet',
        'Locally grown produce',
        'Balanced nutrition'
      ],
      foods_to_avoid: [
        'Processed foods',
        'Excessive amounts of any taste',
        'Out-of-season foods',
        'Foods that don\'t suit current season'
      ],
      meal_timing: [
        'Seasonal meal patterns',
        'Adjust to current needs',
        'Regular but flexible timing'
      ]
    },
    lifestyle: {
      daily_routine: [
        'Seasonal daily routines',
        'Balanced lifestyle',
        'Variety in activities',
        'Seasonal adjustments'
      ],
      exercise: [
        'Varied exercise routine',
        'Seasonal activities',
        'Balanced intensity',
        'Listen to body\'s needs'
      ],
      stress_management: [
        'Variety in practices',
        'Seasonal stress management',
        'Balanced approach'
      ]
    },
    herbs: [
      {
        name: 'Chyavanprash',
        benefits: 'Overall rejuvenation and balance',
        usage: '1-2 tsp daily, preferably in morning'
      }
    ],
    yoga_pranayama: [
      'Varied practice',
      'Seasonal adjustments',
      'All types of pranayama'
    ],
    seasonal_tips: [
      'Adjust all practices seasonally',
      'Maintain flexibility',
      'Listen to body\'s changing needs'
    ]
  }
};

// Dosha assessment engine
export class DoshaAssessment {
  private scores: DoshaScores = { vata: 0, pitta: 0, kapha: 0 };
  private selectedSymptoms: string[] = [];

  addSymptom(symptomId: string): void {
    if (this.selectedSymptoms.includes(symptomId)) return;
    
    const symptom = SYMPTOMS.find(s => s.id === symptomId);
    if (!symptom) return;

    this.selectedSymptoms.push(symptomId);
    this.scores.vata += symptom.vataScore;
    this.scores.pitta += symptom.pittaScore;
    this.scores.kapha += symptom.kaphaScore;
  }

  removeSymptom(symptomId: string): void {
    const index = this.selectedSymptoms.indexOf(symptomId);
    if (index === -1) return;

    const symptom = SYMPTOMS.find(s => s.id === symptomId);
    if (!symptom) return;

    this.selectedSymptoms.splice(index, 1);
    this.scores.vata -= symptom.vataScore;
    this.scores.pitta -= symptom.pittaScore;
    this.scores.kapha -= symptom.kaphaScore;
  }

  getScores(): DoshaScores {
    return { ...this.scores };
  }

  getDominantDosha(): DoshaType {
    const { vata, pitta, kapha } = this.scores;
    const total = vata + pitta + kapha;
    
    if (total === 0) return 'tridosha';

    const vataPercent = (vata / total) * 100;
    const pittaPercent = (pitta / total) * 100;
    const kaphaPercent = (kapha / total) * 100;

    // Check for dual doshas (within 10% of each other)
    if (Math.abs(vataPercent - pittaPercent) <= 10 && 
        vataPercent > kaphaPercent && pittaPercent > kaphaPercent) {
      return 'vata-pitta';
    }
    if (Math.abs(pittaPercent - kaphaPercent) <= 10 && 
        pittaPercent > vataPercent && kaphaPercent > vataPercent) {
      return 'pitta-kapha';
    }
    if (Math.abs(vataPercent - kaphaPercent) <= 10 && 
        vataPercent > pittaPercent && kaphaPercent > pittaPercent) {
      return 'vata-kapha';
    }

    // Check for tridosha (all within 15% of each other)
    if (Math.abs(vataPercent - pittaPercent) <= 15 && 
        Math.abs(pittaPercent - kaphaPercent) <= 15 && 
        Math.abs(vataPercent - kaphaPercent) <= 15) {
      return 'tridosha';
    }

    // Single dominant dosha
    if (vataPercent > pittaPercent && vataPercent > kaphaPercent) return 'vata';
    if (pittaPercent > vataPercent && pittaPercent > kaphaPercent) return 'pitta';
    return 'kapha';
  }

  getTreatmentPlan(): TreatmentPlan {
    const dominantDosha = this.getDominantDosha();
    return TREATMENT_PLANS[dominantDosha];
  }

  reset(): void {
    this.scores = { vata: 0, pitta: 0, kapha: 0 };
    this.selectedSymptoms = [];
  }

  getProgress(): number {
    return Math.min((this.selectedSymptoms.length / 10) * 100, 100);
  }
}