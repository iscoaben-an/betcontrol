# 🤖 Sistema de IA para Sugerencias de Apuestas - BetControl

## Descripción

BetControl ahora incluye un sistema de Inteligencia Artificial integrado con N8N que proporciona sugerencias de apuestas personalizadas basadas en el análisis de patrones del usuario, datos de mercado y algoritmos de predicción.

## 🚀 Características Principales

### ✨ Sugerencias Inteligentes
- **Análisis Personalizado**: Basado en tu historial de apuestas
- **Múltiples Deportes**: Fútbol, Baloncesto, Tenis, Béisbol, Hockey
- **Niveles de Confianza**: Baja, Media, Alta según tu perfil de riesgo
- **ROI Esperado**: Cálculo de retorno de inversión esperado
- **Probabilidad de Éxito**: Estimaciones basadas en datos históricos

### 📊 Analytics Avanzados
- **Patrones de Apuestas**: Análisis de tus preferencias
- **Perfil de Riesgo**: Evaluación de tu tolerancia al riesgo
- **Tasa de Éxito por Deporte**: Rendimiento desglosado
- **Recomendaciones Personalizadas**: Consejos específicos para mejorar

### 🔧 Integración con N8N
- **Webhooks Automatizados**: Procesamiento en tiempo real
- **APIs Externas**: Datos de mercado y estadísticas
- **Algoritmos de IA**: Machine Learning para predicciones
- **Escalabilidad**: Sistema preparado para crecimiento

## 🛠️ Instalación y Configuración

### 1. Dependencias del Servidor

```bash
# Instalar axios para llamadas HTTP
npm install axios

# Configurar variables de entorno
cp .env.example .env
```

### 2. Variables de Entorno

```env
# N8N Configuration
N8N_WEBHOOK_URL=http://localhost:5678/webhook/ai-suggestions

# External APIs (opcional)
FOOTBALL_API_KEY=your_football_api_key
ODDS_API_KEY=your_odds_api_key
OPENAI_API_KEY=your_openai_api_key

# AI Configuration
AI_CONFIDENCE_THRESHOLD=0.7
AI_MAX_SUGGESTIONS=10
AI_UPDATE_FREQUENCY=3600
```

### 3. Instalación de N8N

```bash
# Opción 1: Instalación global
npm install -g n8n

# Opción 2: Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Opción 3: Docker Compose
docker-compose up -d n8n
```

## 📁 Estructura de Archivos

```
betcontrol/
├── client/src/components/ai/
│   ├── AISuggestions.js     # Componente principal de sugerencias
│   └── AIAnalytics.js       # Componente de analytics
├── server/routes/
│   └── ai.js                # Backend para IA
├── n8n-integration.md       # Documentación de integración
└── AI-README.md            # Este archivo
```

## 🎯 Uso del Sistema

### 1. Generar Sugerencias

1. Navega a la sección "IA" en el navbar
2. Selecciona el deporte deseado
3. Elige el nivel de confianza
4. Haz clic en "Generar Sugerencias"
5. Revisa las recomendaciones personalizadas

### 2. Ver Analytics

1. Accede a la sección de Analytics
2. Revisa tus patrones de apuestas
3. Analiza tu perfil de riesgo
4. Lee las recomendaciones personalizadas

### 3. Crear Apuestas desde Sugerencias

1. En las sugerencias, haz clic en "Crear Apuesta"
2. Se pre-llenarán los datos automáticamente
3. Ajusta el monto según tus preferencias
4. Confirma la apuesta

## 🔬 Algoritmos de IA

### Análisis de Patrones del Usuario
```javascript
// Ejemplo de análisis
const userPattern = {
  preferredSports: ['Fútbol', 'Baloncesto'],
  averageOdds: 1.75,
  successRate: 65.5,
  riskTolerance: 'medium',
  bettingFrequency: '2-3 times per week'
};
```

### Cálculo de Probabilidad
```javascript
const calculateSuccessProbability = (userWinRate, confidence, odds) => {
  const baseProbability = 100 / parseFloat(odds);
  const confidenceBonus = confidence === 'high' ? 15 : confidence === 'medium' ? 5 : -5;
  const userSkillBonus = (userWinRate - 50) * 0.2;
  
  return Math.min(95, Math.max(5, baseProbability + confidenceBonus + userSkillBonus));
};
```

### Análisis de Riesgo
```javascript
const calculateRiskLevel = (confidence, odds) => {
  const riskFactors = { 'high': 3, 'medium': 2, 'low': 1 };
  const oddsRisk = parseFloat(odds) > 2.0 ? 3 : parseFloat(odds) > 1.5 ? 2 : 1;
  
  return Math.min(5, Math.max(1, Math.floor((riskFactors[confidence] + oddsRisk) / 2)));
};
```

## 📈 APIs Externas Recomendadas

### Datos Deportivos
- **API-Football**: Estadísticas detalladas de fútbol
- **ESPN API**: Datos de múltiples deportes
- **The Odds API**: Cuotas en tiempo real

### Análisis de IA
- **OpenAI GPT**: Análisis de texto y contexto
- **TensorFlow.js**: Modelos de predicción
- **Scikit-learn**: Algoritmos de Machine Learning

## 🔒 Seguridad y Privacidad

### Autenticación
- JWT tokens para todas las operaciones
- Rate limiting en webhooks
- Validación de datos de entrada

### Privacidad
- Encriptación de datos sensibles
- Anonimización de datos de usuario
- Cumplimiento GDPR

### Monitoreo
- Logs de todas las operaciones
- Métricas de rendimiento
- Alertas de errores

## 📊 Métricas y Monitoreo

### Métricas Clave
- **Precisión de Predicciones**: % de sugerencias exitosas
- **ROI de Sugerencias**: Retorno promedio de sugerencias
- **Tiempo de Respuesta**: Latencia del sistema
- **Uso del Sistema**: Frecuencia de uso por usuario

### Dashboards
- Grafana para métricas en tiempo real
- Kibana para análisis de logs
- Dashboard personalizado de BetControl

## 🚀 Escalabilidad

### Caché
- Redis para datos frecuentes
- Cache de resultados de IA
- Invalidación inteligente

### Cola de Procesamiento
- RabbitMQ para tareas pesadas
- Procesamiento asíncrono
- Retry automático

### Base de Datos
- Particionamiento por usuario
- Índices optimizados
- Backup automático

## 🧪 Testing

### Tests Unitarios
```bash
# Ejecutar tests de IA
npm test -- --testPathPattern=ai

# Tests específicos
npm test -- --testPathPattern=AISuggestions
npm test -- --testPathPattern=AIAnalytics
```

### Tests de Integración
```bash
# Test de webhook N8N
curl -X POST http://localhost:5678/webhook/ai-suggestions \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "sport": "Fútbol", "confidence": "medium"}'
```

## 🔧 Configuración de N8N

### Workflow Básico
1. **Webhook Trigger**: Recibe datos de BetControl
2. **HTTP Request**: Obtiene datos externos
3. **Code Node**: Procesa con algoritmos de IA
4. **HTTP Response**: Retorna sugerencias

### Variables de Entorno en N8N
```env
FOOTBALL_API_KEY=your_key
ODDS_API_KEY=your_key
OPENAI_API_KEY=your_key
AI_MODEL_PATH=/path/to/model
```

## 📝 Ejemplos de Uso

### Generar Sugerencias
```javascript
// Frontend
const generateSuggestions = async () => {
  const response = await axios.post('/api/ai/suggestions', {
    sport: 'Fútbol',
    confidence: 'medium',
    userStats: userStats
  });
  
  setSuggestions(response.data.suggestions);
};
```

### Obtener Analytics
```javascript
// Frontend
const fetchAnalytics = async () => {
  const response = await axios.get('/api/ai/analytics');
  setAnalytics(response.data.analytics);
};
```

## 🎨 Personalización

### Temas Visuales
- Colores personalizables
- Iconos configurables
- Layouts adaptables

### Configuración de IA
- Umbrales de confianza ajustables
- Número máximo de sugerencias
- Frecuencia de actualización

## 🔮 Roadmap

### Fase 1 (Actual)
- ✅ Sugerencias básicas
- ✅ Analytics simples
- ✅ Integración N8N básica

### Fase 2 (Próxima)
- 🔄 Machine Learning avanzado
- 🔄 APIs externas reales
- 🔄 Predicciones en tiempo real

### Fase 3 (Futura)
- 📋 IA conversacional
- 📋 Análisis de sentimientos
- 📋 Predicciones multi-deporte

## 🤝 Contribución

### Reportar Bugs
1. Crear issue en GitHub
2. Incluir pasos para reproducir
3. Adjuntar logs de error

### Sugerir Mejoras
1. Crear feature request
2. Describir caso de uso
3. Proponer implementación

### Pull Requests
1. Fork del repositorio
2. Crear rama feature
3. Implementar cambios
4. Ejecutar tests
5. Crear PR

## 📞 Soporte

### Documentación
- [Guía de N8N](https://docs.n8n.io/)
- [APIs Deportivas](https://rapidapi.com/hub/sports-apis)
- [Machine Learning](https://towardsdatascience.com/)

### Comunidad
- Discord: [BetControl Community]
- GitHub: [Issues y Discussions]
- Email: support@betcontrol.ai

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

**¡Disfruta de las sugerencias inteligentes de BetControl! 🎯🤖**
