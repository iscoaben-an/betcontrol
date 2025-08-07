# Integración de N8N con BetControl AI

## Descripción

Este documento explica cómo integrar N8N con el sistema de sugerencias de IA de BetControl para proporcionar recomendaciones de apuestas inteligentes.

## Configuración de N8N

### 1. Instalación de N8N

```bash
# Instalar N8N globalmente
npm install -g n8n

# O usar Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### 2. Configuración del Webhook

En N8N, crear un nuevo workflow con:

1. **Webhook Trigger**
   - URL: `http://localhost:5678/webhook/ai-suggestions`
   - Method: POST
   - Response Mode: Respond to Webhook

2. **HTTP Request Node** (para obtener datos externos)
   - URL: APIs de datos deportivos
   - Headers: API keys necesarias

3. **Code Node** (procesamiento de IA)
   - Análisis de datos
   - Algoritmos de predicción
   - Generación de sugerencias

4. **HTTP Response Node**
   - Return processed suggestions

## Estructura del Webhook

### Entrada (desde BetControl)
```json
{
  "userId": 123,
  "sport": "Fútbol",
  "confidence": "medium",
  "userStats": {
    "totalBets": 50,
    "winRate": 65.5,
    "avgOdds": 1.75,
    "netProfit": 250.00,
    "currentBalance": 1250.00
  },
  "timestamp": "2025-08-07T18:30:00.000Z"
}
```

### Salida (hacia BetControl)
```json
{
  "suggestions": [
    {
      "event": "Real Madrid vs Barcelona",
      "description": "Clásico con tendencias favorables",
      "sport": "Fútbol",
      "category": "Resultado Final",
      "suggestedOdds": 1.85,
      "confidence": "medium",
      "successProbability": 72.5,
      "expectedRoi": 15.7,
      "aiAnalysis": "Análisis basado en datos históricos...",
      "marketTrend": "Alcista",
      "riskLevel": 2,
      "recommendedAmount": 75.00
    }
  ],
  "metadata": {
    "generatedAt": "2025-08-07T18:30:00.000Z",
    "totalSuggestions": 6,
    "confidenceLevel": "medium",
    "sportFilter": "Fútbol"
  }
}
```

## APIs Externas Recomendadas

### 1. Datos Deportivos
- **API-Football**: Estadísticas de fútbol
- **ESPN API**: Datos de múltiples deportes
- **Odds API**: Cuotas en tiempo real

### 2. Análisis de IA
- **OpenAI GPT**: Análisis de texto y contexto
- **TensorFlow.js**: Modelos de predicción
- **Scikit-learn**: Algoritmos de ML

## Workflow de N8N

### Paso 1: Recepción de Datos
```javascript
// En el nodo Code de N8N
const inputData = $input.all()[0].json;

// Extraer datos del usuario
const { userId, sport, confidence, userStats } = inputData;

// Validar datos
if (!userStats || !sport) {
  throw new Error('Datos incompletos');
}
```

### Paso 2: Obtención de Datos Externos
```javascript
// Obtener estadísticas del deporte
const sportStats = await $http.get({
  url: `https://api.football-data.org/v2/competitions`,
  headers: {
    'X-Auth-Token': process.env.FOOTBALL_API_KEY
  }
});

// Obtener cuotas actuales
const oddsData = await $http.get({
  url: `https://api.the-odds-api.com/v4/sports/${sport}/odds`,
  headers: {
    'apiKey': process.env.ODDS_API_KEY
  }
});
```

### Paso 3: Análisis de IA
```javascript
// Análisis basado en patrones del usuario
const userPattern = analyzeUserPattern(userStats);
const marketAnalysis = analyzeMarketData(oddsData);
const historicalData = analyzeHistoricalData(sportStats);

// Generar sugerencias
const suggestions = generateSuggestions({
  userPattern,
  marketAnalysis,
  historicalData,
  confidence,
  sport
});
```

### Paso 4: Respuesta
```javascript
// Formatear respuesta
return {
  suggestions: suggestions,
  metadata: {
    generatedAt: new Date().toISOString(),
    totalSuggestions: suggestions.length,
    confidenceLevel: confidence,
    sportFilter: sport
  }
};
```

## Variables de Entorno

Crear archivo `.env` en el servidor:

```env
# N8N Configuration
N8N_WEBHOOK_URL=http://localhost:5678/webhook/ai-suggestions

# External APIs
FOOTBALL_API_KEY=your_football_api_key
ODDS_API_KEY=your_odds_api_key
OPENAI_API_KEY=your_openai_api_key

# AI Model Configuration
AI_CONFIDENCE_THRESHOLD=0.7
AI_MAX_SUGGESTIONS=10
AI_UPDATE_FREQUENCY=3600
```

## Características del Sistema de IA

### 1. Análisis de Patrones del Usuario
- Historial de apuestas
- Tasa de éxito por deporte
- Preferencias de cuotas
- Patrones de riesgo

### 2. Análisis de Mercado
- Cuotas en tiempo real
- Tendencias del mercado
- Volumen de apuestas
- Movimientos de línea

### 3. Análisis Histórico
- Resultados pasados
- Estadísticas de equipos/jugadores
- Condiciones del evento
- Factores externos

### 4. Algoritmos de Predicción
- Regresión logística
- Redes neuronales
- Análisis de series temporales
- Ensemble methods

## Seguridad y Privacidad

### 1. Autenticación
- JWT tokens para autenticación
- Rate limiting en webhooks
- Validación de datos de entrada

### 2. Privacidad
- Encriptación de datos sensibles
- Anonimización de datos de usuario
- Cumplimiento GDPR

### 3. Monitoreo
- Logs de todas las operaciones
- Métricas de rendimiento
- Alertas de errores

## Escalabilidad

### 1. Caché
- Redis para datos frecuentes
- Cache de resultados de IA
- Invalidación inteligente

### 2. Cola de Procesamiento
- RabbitMQ para tareas pesadas
- Procesamiento asíncrono
- Retry automático

### 3. Base de Datos
- Particionamiento por usuario
- Índices optimizados
- Backup automático

## Monitoreo y Analytics

### 1. Métricas Clave
- Precisión de predicciones
- ROI de sugerencias
- Tiempo de respuesta
- Uso del sistema

### 2. Dashboards
- Grafana para métricas
- Kibana para logs
- Dashboard personalizado

### 3. Alertas
- Baja precisión de IA
- Errores de API
- Tiempo de respuesta alto

## Próximos Pasos

1. **Implementar N8N localmente**
2. **Configurar APIs externas**
3. **Desarrollar algoritmos de IA**
4. **Testing y validación**
5. **Deployment en producción**
6. **Monitoreo continuo**

## Recursos Adicionales

- [Documentación de N8N](https://docs.n8n.io/)
- [APIs de Datos Deportivos](https://rapidapi.com/hub/sports-apis)
- [Machine Learning para Apuestas](https://towardsdatascience.com/sports-betting-machine-learning)
- [Análisis de Riesgo](https://www.investopedia.com/articles/trading/11/calculating-risk-reward.asp)
