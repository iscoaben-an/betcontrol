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
const authRoutes = require('../../routes/auth');
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  let testUserId;
  let authToken;

  beforeEach(async () => {
    await initTestDB();
  });

  afterEach(async () => {
    await cleanupTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'newuser' + Date.now(),
        email: 'newuser' + Date.now() + '@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('username', userData.username);
      expect(response.body.user).toHaveProperty('email', userData.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 400 for missing fields', async () => {
      const userData = {
        username: 'testuser',
        // Missing email and password
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should return 400 for duplicate email', async () => {
      const userData = {
        username: 'user1' + Date.now(),
        email: 'duplicate@example.com',
        password: 'password123'
      };

      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'user2' + Date.now(),
          email: 'duplicate@example.com',
          password: 'password123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    let testEmail;
    let testUsername;

    beforeEach(async () => {
      // Create a test user
      const hashedPassword = await bcrypt.hash('password123', 10);
      testUsername = 'logintest' + Date.now();
      testEmail = 'logintest' + Date.now() + '@example.com';
      
      await getTestPool().query(
        'INSERT INTO users (username, email, password, balance) VALUES ($1, $2, $3, $4)',
        [testUsername, testEmail, hashedPassword, 1000.00]
      );
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: testEmail,
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 400 for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid password', async () => {
      const loginData = {
        email: testEmail,
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/auth/me', () => {
    let token;
    let userId;

    beforeEach(async () => {
      // Create a test user
      const hashedPassword = await bcrypt.hash('password123', 10);
      const result = await getTestPool().query(
        'INSERT INTO users (username, email, password, balance) VALUES ($1, $2, $3, $4) RETURNING id',
        ['testuser', 'test@example.com', hashedPassword, 1000.00]
      );
      userId = result.rows[0].id;
      token = jwt.sign(
        { id: userId, username: 'testuser' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
    });

    it('should return user data for valid token', async () => {
      // Create a test user and get their token
      const hashedPassword = await bcrypt.hash('password123', 10);
      const username = 'metest' + Date.now();
      const email = 'metest' + Date.now() + '@example.com';
      
      const userResult = await getTestPool().query(
        'INSERT INTO users (username, email, password, balance) VALUES ($1, $2, $3, $4) RETURNING id',
        [username, email, hashedPassword, 1000.00]
      );
      const userId = userResult.rows[0].id;
      const token = jwt.sign({ id: userId }, process.env.JWT_SECRET);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.id).toBe(userId);
      expect(response.body.user.username).toBe(username);
      expect(response.body.user.email).toBe(email);
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid token.');
    });

    it('should return 401 for missing token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access denied. No token provided.');
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentToken = jwt.sign(
        { id: 999, username: 'nonexistent' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${nonExistentToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'User not found');
    });
  });
}); 