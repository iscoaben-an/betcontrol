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
const statsRoutes = require('../../routes/stats');
app.use('/api/stats', statsRoutes);

describe('Stats Routes', () => {
  let testUserId;
  let authToken;

  beforeEach(async () => {
    await initTestDB();
    
    // Create a test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const username = 'statstest' + Date.now();
    const email = 'statstest' + Date.now() + '@example.com';
    
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

  describe('GET /api/stats/dashboard', () => {
    it('should return correct dashboard statistics', async () => {
      // Create test bets
      await getTestPool().query(`
        INSERT INTO bets (user_id, sport, category, amount, odds, result) VALUES 
        ($1, 'Fútbol', 'Resultado Final', 100.00, 1.50, 'won'),
        ($1, 'Baloncesto', 'Primera Mitad', 50.00, 2.00, 'lost'),
        ($1, 'Tenis', 'Específico', 75.00, 1.75, 'pending')
      `, [testUserId]);

      const response = await request(app)
        .get('/api/stats/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('stats');
      const stats = response.body.stats;
      
      expect(stats.totalBets).toBe(3);
      expect(stats.wonBets).toBe(1);
      expect(stats.lostBets).toBe(1);
      expect(stats.pendingBets).toBe(1);
      expect(stats.totalAmount).toBe(225.00);
      expect(stats.totalWinnings).toBe(150.00); // 100 * 1.50
      expect(stats.netProfit).toBe(50.00); // 150 - 100
      expect(stats.winRate).toBe(50.0); // 1 won / 2 completed bets
      expect(stats.roi).toBe(22.22); // (50 / 225) * 100
      expect(stats.avgOdds).toBe(1.75); // (1.50 + 2.00 + 1.75) / 3
    });

    it('should handle empty bets correctly', async () => {
      const response = await request(app)
        .get('/api/stats/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('stats');
      const stats = response.body.stats;
      
      expect(stats.totalBets).toBe(0);
      expect(stats.wonBets).toBe(0);
      expect(stats.lostBets).toBe(0);
      expect(stats.pendingBets).toBe(0);
      expect(stats.totalAmount).toBe(0);
      expect(stats.totalWinnings).toBe(0);
      expect(stats.netProfit).toBe(0);
      expect(stats.winRate).toBe(0);
      expect(stats.roi).toBe(0);
      expect(stats.avgOdds).toBe(0);
    });
  });

  describe('GET /api/stats/by-sport', () => {
    it('should return correct sport statistics', async () => {
      // Create test bets for different sports
      await getTestPool().query(`
        INSERT INTO bets (user_id, sport, category, amount, odds, result) VALUES 
        ($1, 'Fútbol', 'Resultado Final', 100.00, 1.50, 'won'),
        ($1, 'Fútbol', 'Primera Mitad', 50.00, 2.00, 'lost'),
        ($1, 'Baloncesto', 'Específico', 75.00, 1.75, 'won')
      `, [testUserId]);

      const response = await request(app)
        .get('/api/stats/by-sport')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('stats');
      const stats = response.body.stats;
      
      expect(stats).toHaveLength(2);
      
      const futbolStats = stats.find(s => s.sport === 'Fútbol');
      expect(parseInt(futbolStats.total_bets)).toBe(2);
      expect(parseInt(futbolStats.won_bets)).toBe(1);
      expect(parseInt(futbolStats.lost_bets)).toBe(1);
      expect(parseFloat(futbolStats.total_amount)).toBe(150.00);
      expect(parseFloat(futbolStats.total_winnings)).toBe(150.00);
      expect(parseFloat(futbolStats.net_profit)).toBe(50.00); // 100 * 1.50 - 100 = 50
      expect(parseFloat(futbolStats.win_rate)).toBe(50.0);
      expect(parseFloat(futbolStats.roi)).toBe(33.33); // (50 / 150) * 100
      expect(parseFloat(futbolStats.avg_odds)).toBe(1.75);
      
      const baloncestoStats = stats.find(s => s.sport === 'Baloncesto');
      expect(parseInt(baloncestoStats.total_bets)).toBe(1);
      expect(parseInt(baloncestoStats.won_bets)).toBe(1);
      expect(parseInt(baloncestoStats.lost_bets)).toBe(0);
      expect(parseFloat(baloncestoStats.total_amount)).toBe(75.00);
      expect(parseFloat(baloncestoStats.total_winnings)).toBe(131.25); // 75 * 1.75
      expect(parseFloat(baloncestoStats.net_profit)).toBe(56.25); // 131.25 - 75
      expect(parseFloat(baloncestoStats.win_rate)).toBe(100.0);
      expect(parseFloat(baloncestoStats.roi)).toBe(75.0); // (56.25 / 75) * 100
      expect(parseFloat(baloncestoStats.avg_odds)).toBe(1.75);
    });
  });

  describe('GET /api/stats/by-category', () => {
    it('should return correct category statistics', async () => {
      // Create test bets
      await getTestPool().query(`
        INSERT INTO bets (user_id, sport, category, amount, odds, result) VALUES 
        ($1, 'Fútbol', 'Resultado Final', 100.00, 1.50, 'won'),
        ($1, 'Baloncesto', 'Resultado Final', 50.00, 2.00, 'lost'),
        ($1, 'Tenis', 'Primera Mitad', 75.00, 1.75, 'won')
      `, [testUserId]);

      const response = await request(app)
        .get('/api/stats/by-category')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('stats');
      const stats = response.body.stats;
      
      expect(stats).toHaveLength(2);
      
      const resultadoFinalStats = stats.find(s => s.category === 'Resultado Final');
      expect(parseInt(resultadoFinalStats.total_bets)).toBe(2);
      expect(parseInt(resultadoFinalStats.won_bets)).toBe(1);
      expect(parseInt(resultadoFinalStats.lost_bets)).toBe(1);
      expect(parseFloat(resultadoFinalStats.total_amount)).toBe(150.00);
      expect(parseFloat(resultadoFinalStats.total_winnings)).toBe(150.00);
      expect(parseFloat(resultadoFinalStats.net_profit)).toBe(50.00); // 100 * 1.50 - 100 = 50
      expect(parseFloat(resultadoFinalStats.win_rate)).toBe(50.0);
      expect(parseFloat(resultadoFinalStats.roi)).toBe(33.33); // (50 / 150) * 100
      expect(parseFloat(resultadoFinalStats.avg_odds)).toBe(1.75);
      
      const primeraMitadStats = stats.find(s => s.category === 'Primera Mitad');
      expect(parseInt(primeraMitadStats.total_bets)).toBe(1);
      expect(parseInt(primeraMitadStats.won_bets)).toBe(1);
      expect(parseInt(primeraMitadStats.lost_bets)).toBe(0);
      expect(parseFloat(primeraMitadStats.total_amount)).toBe(75.00);
      expect(parseFloat(primeraMitadStats.total_winnings)).toBe(131.25);
      expect(parseFloat(primeraMitadStats.net_profit)).toBe(56.25);
      expect(parseFloat(primeraMitadStats.win_rate)).toBe(100.0);
      expect(parseFloat(primeraMitadStats.roi)).toBe(75.0);
      expect(parseFloat(primeraMitadStats.avg_odds)).toBe(1.75);
    });
  });
}); 