const express = require('express');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Configuración de la base de datos
const pool = new Pool({
  connectionString: process.env.POSTGRES_URI || process.env.DATABASE_URL || 'postgres://localhost:5432/betcontrol'
});

// Endpoint para inicializar la base de datos
router.post('/init-database', async (req, res) => {
  try {
    console.log('🚀 Inicializando base de datos...');
    
    // Conectar a la base de datos
    const client = await pool.connect();
    
    // Leer el archivo SQL de inicialización
    const initSQLPath = path.join(__dirname, '../config/init-db.sql');
    const initSQL = fs.readFileSync(initSQLPath, 'utf8');
    
    // Ejecutar el script de inicialización
    await client.query(initSQL);
    console.log('✅ Tablas creadas exitosamente');
    
    // Verificar si el usuario ya existe
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@betcontrol.com']
    );
    
    if (existingUser.rows.length > 0) {
      console.log('✅ Usuario de prueba ya existe');
      client.release();
      return res.json({ 
        success: true, 
        message: 'Base de datos ya inicializada',
        user: {
          email: 'admin@betcontrol.com',
          password: '123456'
        }
      });
    }
    
    // Crear hash de la contraseña
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // Insertar usuario de prueba
    const result = await client.query(
      'INSERT INTO users (username, email, password, balance, initial_balance) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email',
      ['admin', 'admin@betcontrol.com', hashedPassword, 1000.00, 1000.00]
    );
    
    console.log('✅ Usuario de prueba creado exitosamente');
    
    client.release();
    
    res.json({ 
      success: true, 
      message: 'Base de datos inicializada correctamente',
      user: {
        id: result.rows[0].id,
        username: result.rows[0].username,
        email: result.rows[0].email,
        password: '123456'
      }
    });
    
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Endpoint para verificar el estado de la base de datos
router.get('/status', async (req, res) => {
  try {
    const client = await pool.connect();
    
    // Verificar si las tablas existen
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'bets', 'balance_movements')
    `);
    
    // Verificar si el usuario existe
    const userResult = await client.query(
      'SELECT id, username, email FROM users WHERE email = $1',
      ['admin@betcontrol.com']
    );
    
    client.release();
    
    res.json({
      success: true,
      tables: tablesResult.rows.map(row => row.table_name),
      userExists: userResult.rows.length > 0,
      user: userResult.rows[0] || null
    });
    
  } catch (error) {
    console.error('❌ Error al verificar estado:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
