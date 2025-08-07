const { Pool } = require('pg');

let testPool = null;
let isInitialized = false;

const getTestPool = () => {
  if (!testPool) {
    testPool = new Pool({
      user: 'arkus1234',
      host: 'localhost',
      database: 'betcontrol_test',
      password: '',
      port: 5432,
    });
  }
  return testPool;
};

const log = (message) => {
  console.log(message);
};

const initTestDB = async () => {
  try {
    // Only initialize if not already done
    if (isInitialized) {
      return;
    }

    const pool = getTestPool();

    // Check if database exists, if not create it
    const adminPool = new Pool({
      user: 'arkus1234',
      host: 'localhost',
      database: 'postgres',
      password: '',
      port: 5432,
    });

    try {
      await adminPool.query('SELECT 1 FROM pg_database WHERE datname = $1', ['betcontrol_test']);
    } catch (error) {
      // Database doesn't exist, create it
      await adminPool.query('CREATE DATABASE betcontrol_test');
    } finally {
      await adminPool.end();
    }

    // Wait a moment for database to be ready
    await new Promise(resolve => setTimeout(resolve, 500));

    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        balance DECIMAL(10,2) DEFAULT 1000.00,
        initial_balance DECIMAL(10,2) DEFAULT 1000.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS bets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        sport VARCHAR(50) NOT NULL,
        category VARCHAR(50) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        odds DECIMAL(5,2) NOT NULL,
        result VARCHAR(20) DEFAULT 'pending',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS balance_movements (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
        amount DECIMAL(10,2) NOT NULL,
        previous_balance DECIMAL(10,2) NOT NULL,
        new_balance DECIMAL(10,2) NOT NULL,
        description VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    isInitialized = true;
    log('✅ Test database initialized');
  } catch (error) {
    console.error('❌ Error initializing test database:', error);
    throw error;
  }
};

const cleanupTestDB = async () => {
  try {
    const pool = getTestPool();
    
    // Disable foreign key checks temporarily
    await pool.query('SET session_replication_role = replica;');
    
    // Truncate all tables in the correct order (respecting foreign keys)
    await pool.query('TRUNCATE TABLE balance_movements, bets, users RESTART IDENTITY CASCADE');
    
    // Re-enable foreign key checks
    await pool.query('SET session_replication_role = DEFAULT;');
    
    log('✅ Test database cleaned up');
  } catch (error) {
    console.error('❌ Error cleaning up test database:', error);
    // If cleanup fails, try to reinitialize the database
    try {
      await initTestDB();
      log('✅ Test database reinitialized after cleanup failure');
    } catch (reinitError) {
      console.error('❌ Failed to reinitialize test database:', reinitError);
    }
  }
};

const closeTestDB = async () => {
  try {
    if (testPool) {
      await testPool.end();
      testPool = null;
      isInitialized = false;
      log('✅ Test database connection closed');
    }
  } catch (error) {
    console.error('❌ Error closing test database:', error);
  }
};

module.exports = {
  getTestPool,
  initTestDB,
  cleanupTestDB,
  closeTestDB
}; 