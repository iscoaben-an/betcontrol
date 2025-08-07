const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// AI Suggestions endpoint
router.post('/suggestions', [
  auth,
  body('sport').optional().isString(),
  body('confidence').isIn(['low', 'medium', 'high']).withMessage('Confidence must be low, medium, or high'),
  body('userStats').isObject().withMessage('User stats are required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sport, confidence, userStats } = req.body;

    // Generate suggestions using local logic (no N8N dependency)
    const suggestions = await generateAISuggestions(userStats, sport, confidence);

    res.json({
      suggestions: suggestions,
      metadata: {
        generatedAt: new Date().toISOString(),
        totalSuggestions: suggestions.length,
        confidenceLevel: confidence,
        sportFilter: sport
      }
    });

  } catch (error) {
    console.error('AI suggestions error:', error);
    res.status(500).json({ error: 'Error generating AI suggestions' });
  }
});

// Generate AI suggestions based on user stats and preferences
const generateAISuggestions = async (userStats, sport, confidence) => {
  // This would typically call an AI service or use ML models
  // For now, we'll generate mock suggestions based on user patterns

  const suggestions = [];
  const sports = sport === 'all' ? ['Fútbol', 'Baloncesto', 'Tenis'] : [sport];

  // Generate suggestions based on user's betting patterns
  const baseOdds = userStats.avgOdds || 1.5;
  const winRate = userStats.winRate || 50;

  sports.forEach((selectedSport, index) => {
    // Generate 2-3 suggestions per sport
    for (let i = 0; i < 2; i++) {
      const confidenceMultiplier = confidence === 'high' ? 1.3 : confidence === 'medium' ? 1.0 : 0.7;
      const suggestedOdds = (baseOdds * confidenceMultiplier + Math.random() * 0.5).toFixed(2);

      const suggestion = {
        event: generateEventName(selectedSport, i),
        description: generateEventDescription(selectedSport),
        sport: selectedSport,
        category: generateCategory(selectedSport),
        suggestedOdds: parseFloat(suggestedOdds),
        confidence: confidence,
        successProbability: calculateSuccessProbability(winRate, confidence, suggestedOdds),
        expectedRoi: calculateExpectedRoi(suggestedOdds, confidence),
        aiAnalysis: generateAIAnalysis(userStats, selectedSport, confidence, suggestedOdds),
        marketTrend: generateMarketTrend(),
        riskLevel: calculateRiskLevel(confidence, suggestedOdds),
        recommendedAmount: calculateRecommendedAmount(userStats, confidence, suggestedOdds)
      };

      suggestions.push(suggestion);
    }
  });

  return suggestions;
};

// Helper functions for generating realistic suggestions
const generateEventName = (sport, index) => {
  const events = {
    'Fútbol': [
      'Real Madrid vs Barcelona',
      'Manchester City vs Liverpool',
      'Bayern Munich vs Borussia Dortmund',
      'PSG vs Marseille',
      'Juventus vs Inter Milan'
    ],
    'Baloncesto': [
      'Lakers vs Warriors',
      'Celtics vs Heat',
      'Bulls vs Knicks',
      'Mavericks vs Suns',
      'Nets vs 76ers'
    ],
    'Tenis': [
      'Nadal vs Djokovic',
      'Federer vs Medvedev',
      'Williams vs Osaka',
      'Thiem vs Zverev',
      'Tsitsipas vs Rublev'
    ]
  };

  return events[sport]?.[index] || `${sport} Event ${index + 1}`;
};

const generateEventDescription = (sport) => {
  const descriptions = {
    'Fútbol': 'Partido de liga con equipos en buena forma',
    'Baloncesto': 'Encuentro NBA con equipos competitivos',
    'Tenis': 'Torneo importante con jugadores de élite'
  };

  return descriptions[sport] || 'Evento deportivo competitivo';
};

const generateCategory = (sport) => {
  const categories = {
    'Fútbol': ['Resultado Final', 'Goles Totales', 'Ambos Marcan'],
    'Baloncesto': ['Resultado Final', 'Puntos Totales', 'Diferencia'],
    'Tenis': ['Ganador del Partido', 'Sets Totales', 'Juegos Totales']
  };

  const sportCategories = categories[sport] || ['Resultado Final'];
  return sportCategories[Math.floor(Math.random() * sportCategories.length)];
};

const calculateSuccessProbability = (userWinRate, confidence, odds) => {
  const baseProbability = 100 / parseFloat(odds);
  const confidenceBonus = confidence === 'high' ? 15 : confidence === 'medium' ? 5 : -5;
  const userSkillBonus = (userWinRate - 50) * 0.2;

  return Math.min(95, Math.max(5, baseProbability + confidenceBonus + userSkillBonus)).toFixed(1);
};

const calculateExpectedRoi = (odds, confidence) => {
  const baseRoi = (parseFloat(odds) - 1) * 100;
  const confidenceMultiplier = confidence === 'high' ? 1.2 : confidence === 'medium' ? 1.0 : 0.8;

  return (baseRoi * confidenceMultiplier).toFixed(1);
};

const generateAIAnalysis = (userStats, sport, confidence, odds) => {
  const analyses = [
    `Basado en tu historial de ${userStats.totalBets} apuestas con ${userStats.winRate}% de éxito, esta oportunidad se alinea bien con tu perfil.`,
    `El análisis de mercado muestra tendencias favorables para este tipo de apuestas en ${sport}.`,
    `Tu patrón de apuestas con cuotas promedio de ${userStats.avgOdds} sugiere que esta oportunidad es adecuada.`,
    `La confianza ${confidence} se basa en el análisis de datos históricos y tendencias actuales.`
  ];

  return analyses.join(' ');
};

const generateMarketTrend = () => {
  const trends = ['Alcista', 'Estable', 'Bajista'];
  return trends[Math.floor(Math.random() * trends.length)];
};

const calculateRiskLevel = (confidence, odds) => {
  const riskFactors = {
    'high': 3,
    'medium': 2,
    'low': 1
  };

  const oddsRisk = parseFloat(odds) > 2.0 ? 3 : parseFloat(odds) > 1.5 ? 2 : 1;
  return Math.min(5, Math.max(1, Math.floor((riskFactors[confidence] + oddsRisk) / 2)));
};

const calculateRecommendedAmount = (userStats, confidence, odds) => {
  const baseAmount = 50; // Base recommendation
  const confidenceMultiplier = confidence === 'high' ? 1.5 : confidence === 'medium' ? 1.0 : 0.5;
  const userBalance = userStats.currentBalance || 1000;
  const maxPercentage = 0.1; // Max 10% of balance

  return Math.min(
    baseAmount * confidenceMultiplier,
    userBalance * maxPercentage
  ).toFixed(2);
};

// AI Analytics endpoint
router.get('/analytics', auth, async (req, res) => {
  try {
    // Get user's betting analytics for AI insights
    const analytics = {
      bettingPatterns: await analyzeBettingPatterns(req.user.id),
      riskProfile: await calculateRiskProfile(req.user.id),
      recommendations: await generatePersonalizedRecommendations(req.user.id)
    };

    res.json({ analytics });
  } catch (error) {
    console.error('AI analytics error:', error);
    res.status(500).json({ error: 'Error generating AI analytics' });
  }
});

// Analyze user's betting patterns
const analyzeBettingPatterns = async (userId) => {
  // This would analyze the user's betting history
  // For now, return mock data
  return {
    preferredSports: ['Fútbol', 'Baloncesto'],
    averageOdds: 1.75,
    successRateBySport: {
      'Fútbol': 65,
      'Baloncesto': 45,
      'Tenis': 55
    },
    bettingFrequency: '2-3 times per week',
    averageBetAmount: 75
  };
};

// Calculate user's risk profile
const calculateRiskProfile = async (userId) => {
  return {
    riskTolerance: 'medium',
    preferredOddsRange: '1.3 - 2.1',
    maxBetPercentage: 8,
    consistencyScore: 7.5
  };
};

// Generate personalized recommendations
const generatePersonalizedRecommendations = async (userId) => {
  return [
    'Considera diversificar en más deportes para reducir riesgo',
    'Tu tasa de éxito en fútbol es excelente, mantén ese enfoque',
    'Evita apuestas con cuotas superiores a 2.5',
    'Aumenta gradualmente el tamaño de tus apuestas exitosas'
  ];
};

module.exports = router;
