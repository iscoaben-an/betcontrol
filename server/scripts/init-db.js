const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuración de la base de datos
const pool = new Pool({
  connectionString: process.env.POSTGRES_URI || process.env.DATABASE_URL || 'postgres://localhost:5432/betcontrol'
});

async function initDatabase() {
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
      return;
    }
    
    // Crear hash de la contraseña
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // Insertar usuario de prueba
    const result = await client.query(
      'INSERT INTO users (username, email, password, balance, initial_balance) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email',
      ['admin', 'admin@betcontrol.com', hashedPassword, 1000.00, 1000.00]
    );
    
    console.log('✅ Usuario de prueba creado exitosamente:');
    console.log(`   ID: ${result.rows[0].id}`);
    console.log(`   Usuario: ${result.rows[0].username}`);
    console.log(`   Email: ${result.rows[0].email}`);
    console.log(`   Contraseña: 123456`);
    console.log('\n🔐 Credenciales para iniciar sesión:');
    console.log('   Email: admin@betcontrol.com');
    console.log('   Contraseña: 123456');
    
    client.release();
    console.log('\n🎉 Base de datos inicializada correctamente');
    
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await pool.end();
  }
}

// Ejecutar el script
initDatabase();
