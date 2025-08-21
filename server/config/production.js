// Configuración para producción
module.exports = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  database: {
    connectionString: process.env.POSTGRES_URI || process.env.DATABASE_URL,
  },
  cors: {
    origin: process.env.CLIENT_URL || 'https://betcontrol-client.onrender.com',
    credentials: true,
  },
  // Configuración de seguridad adicional para producción
  security: {
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    },
  },
};
