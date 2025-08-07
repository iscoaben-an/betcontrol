const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { initTestDB, cleanupTestDB, closeTestDB, getTestPool } = require('../../config/test-db');

// Set up environment variables for tests
process.env.JWT_SECRET = 'test-secret-key';

// Mock the database module
jest.mock('../../config/database', () => require('../../config/test-db').getTestPool());

const app = express();
app.use(express.json());

// Import routes
const betRoutes = require('../../routes/bets');
app.use('/api/bets', betRoutes);

describe('Bets Routes', () => {
  let testUserId;
  let authToken;

  beforeEach(async () => {
    await initTestDB();
    
    // Create a test user with a unique timestamp to avoid conflicts
    const hashedPassword = await bcrypt.hash('password123', 10);
    const timestamp = Date.now();
    const username = `betstest${timestamp}`;
    const email = `betstest${timestamp}@example.com`;
    
    const result = await getTestPool().query(
      'INSERT INTO users (username, email, password, balance) VALUES ($1, $2, $3, $4) RETURNING id',
      [username, email, hashedPassword, 1000.00]
    );
    testUserId = result.rows[0].id;

    // Generate auth token
    authToken = jwt.sign({ id: testUserId }, process.env.JWT_SECRET);
  });

  afterEach(async () => {
    await cleanupTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe('GET /api/bets', () => {
    it('should return empty array when no bets exist', async () => {
      const response = await request(app)
        .get('/api/bets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('bets');
      expect(response.body.bets).toEqual([]);
    });

    it('should return user bets', async () => {
      // Create a test bet
      await getTestPool().query(
        'INSERT INTO bets (user_id, sport, category, amount, odds, result, description) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [testUserId, 'Fútbol', 'Resultado Final', 100.00, 1.50, 'pending', 'Test bet']
      );

      const response = await request(app)
        .get('/api/bets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('bets');
      expect(response.body.bets).toHaveLength(1);
      expect(response.body.bets[0].sport).toBe('Fútbol');
      expect(response.body.bets[0].category).toBe('Resultado Final');
      expect(response.body.bets[0].amount).toBe('100.00');
      expect(response.body.bets[0].odds).toBe('1.50');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/bets')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access denied. No token provided.');
    });
  });

  describe('POST /api/bets', () => {
    it('should create a new bet successfully', async () => {
      const betData = {
        sport: 'Fútbol',
        category: 'Resultado Final',
        amount: 100.00,
        odds: 1.50,
        result: 'pending',
        description: 'Test bet'
      };

      const response = await request(app)
        .post('/api/bets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(betData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Bet created successfully');
      expect(response.body).toHaveProperty('bet');
      expect(response.body.bet.sport).toBe(betData.sport);
      expect(response.body.bet.category).toBe(betData.category);
      expect(parseFloat(response.body.bet.amount)).toBe(betData.amount);
      expect(parseFloat(response.body.bet.odds)).toBe(betData.odds);

      // Check that user balance was deducted
      const userResult = await getTestPool().query('SELECT balance FROM users WHERE id = $1', [testUserId]);
      expect(parseFloat(userResult.rows[0].balance)).toBe(900.00);
    });

    it('should return 400 for insufficient balance', async () => {
      const betData = {
        sport: 'Fútbol',
        category: 'Resultado Final',
        amount: 2000.00, // More than user's balance
        odds: 1.50,
        result: 'pending',
        description: 'Test bet'
      };

      const response = await request(app)
        .post('/api/bets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(betData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Insufficient balance');
    });

    it('should return 400 for missing sport', async () => {
      const betData = {
        category: 'Resultado Final',
        amount: 100.00,
        odds: 1.50,
        result: 'pending'
      };

      const response = await request(app)
        .post('/api/bets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(betData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should return 400 for missing category', async () => {
      const betData = {
        sport: 'Fútbol',
        amount: 100.00,
        odds: 1.50,
        result: 'pending'
      };

      const response = await request(app)
        .post('/api/bets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(betData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should return 400 for invalid amount', async () => {
      const betData = {
        sport: 'Fútbol',
        category: 'Resultado Final',
        amount: -10.00,
        odds: 1.50,
        result: 'pending'
      };

      const response = await request(app)
        .post('/api/bets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(betData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should return 400 for invalid odds', async () => {
      const betData = {
        sport: 'Fútbol',
        category: 'Resultado Final',
        amount: 100.00,
        odds: 0.5, // Less than 1.0
        result: 'pending'
      };

      const response = await request(app)
        .post('/api/bets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(betData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should return 400 for invalid result', async () => {
      const betData = {
        sport: 'Fútbol',
        category: 'Resultado Final',
        amount: 100.00,
        odds: 1.50,
        result: 'invalid'
      };

      const response = await request(app)
        .post('/api/bets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(betData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('PUT /api/bets/:id', () => {
    let betId;

    beforeEach(async () => {
      // Create a test bet
      const result = await getTestPool().query(
        'INSERT INTO bets (user_id, sport, category, amount, odds, result, description) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
        [testUserId, 'Fútbol', 'Resultado Final', 100.00, 1.50, 'pending', 'Test bet']
      );
      betId = result.rows[0].id;
      
      // Manually deduct the balance since we created the bet directly
      await getTestPool().query(
        'UPDATE users SET balance = balance - $1 WHERE id = $2',
        [100.00, testUserId]
      );
    });

    it('should update bet result successfully', async () => {
      const updateData = {
        result: 'won'
      };

      const response = await request(app)
        .put(`/api/bets/${betId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Bet updated successfully');

      // Check that user balance was updated (winnings added)
      const userResult = await getTestPool().query('SELECT balance FROM users WHERE id = $1', [testUserId]);
      expect(parseFloat(userResult.rows[0].balance)).toBe(1050.00); // 1000 - 100 + (100 * 1.5) = 900 + 150 = 1050
    });

    it('should return 404 for non-existent bet', async () => {
      const updateData = {
        result: 'won'
      };

      const response = await request(app)
        .put('/api/bets/999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Bet not found');
    });

    it('should return 400 for invalid result', async () => {
      const updateData = {
        result: 'invalid'
      };

      const response = await request(app)
        .put(`/api/bets/${betId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('DELETE /api/bets/:id', () => {
    let betId;

    beforeEach(async () => {
      // Create a test bet
      const result = await getTestPool().query(
        'INSERT INTO bets (user_id, sport, category, amount, odds, result, description) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
        [testUserId, 'Fútbol', 'Resultado Final', 100.00, 1.50, 'pending', 'Test bet']
      );
      betId = result.rows[0].id;
      
      // Manually deduct the balance since we created the bet directly
      await getTestPool().query(
        'UPDATE users SET balance = balance - $1 WHERE id = $2',
        [100.00, testUserId]
      );
    });

    it('should delete bet successfully', async () => {
      const response = await request(app)
        .delete(`/api/bets/${betId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Bet deleted successfully');

      // Check that bet was deleted
      const betResult = await getTestPool().query('SELECT * FROM bets WHERE id = $1', [betId]);
      expect(betResult.rows).toHaveLength(0);

      // Check that user balance was refunded (for pending bets)
      const userResult = await getTestPool().query('SELECT balance FROM users WHERE id = $1', [testUserId]);
      expect(parseFloat(userResult.rows[0].balance)).toBe(1000.00);
    });

    it('should return 404 for non-existent bet', async () => {
      const response = await request(app)
        .delete('/api/bets/999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Bet not found');
    });
  });
}); 