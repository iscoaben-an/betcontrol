const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

// Configuración de la base de datos
const pool = new Pool({
  connectionString: process.env.POSTGRES_URI || process.env.DATABASE_URL || 'postgres://localhost:5432/betcontrol'
});

async function createTestUser() {
  try {
    // Conectar a la base de datos
    const client = await pool.connect();
    
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
  } catch (error) {
    console.error('❌ Error al crear usuario de prueba:', error.message);
  } finally {
    await pool.end();
  }
}

// Ejecutar el script
createTestUser();
