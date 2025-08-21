const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const betRoutes = require('./routes/bets');
const statsRoutes = require('./routes/stats');
const aiRoutes = require('./routes/ai');

// Configuración según el entorno
const isProduction = process.env.NODE_ENV === 'production';
const config = isProduction ? require('./config/production') : {
  port: process.env.PORT || 5000,
  cors: { origin: true },
  security: { helmet: {} }
};

const app = express();
const PORT = config.port;

// Middleware
app.use(helmet(config.security.helmet));
app.use(cors(config.cors));
app.use(morgan(isProduction ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bets', betRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'BetControl API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 BetControl API ready at http://localhost:${PORT}`);
}); 