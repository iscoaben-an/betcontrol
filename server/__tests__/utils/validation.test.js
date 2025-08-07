const { body, validationResult } = require('express-validator');

describe('Validation Utils', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      body: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  describe('User Registration Validation', () => {
    const registerValidation = [
      body('username')
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters long'),
      body('email')
        .isEmail()
        .withMessage('Please provide a valid email'),
      body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
    ];

    it('should pass validation for valid data', async () => {
      mockReq.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      for (const validation of registerValidation) {
        await validation(mockReq, mockRes, mockNext);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail validation for short username', async () => {
      mockReq.body = {
        username: 'ab',
        email: 'test@example.com',
        password: 'password123'
      };

      for (const validation of registerValidation) {
        await validation(mockReq, mockRes, mockNext);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toBe('Username must be at least 3 characters long');
    });

    it('should fail validation for invalid email', async () => {
      mockReq.body = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123'
      };

      for (const validation of registerValidation) {
        await validation(mockReq, mockRes, mockNext);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toBe('Please provide a valid email');
    });

    it('should fail validation for short password', async () => {
      mockReq.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: '123'
      };

      for (const validation of registerValidation) {
        await validation(mockReq, mockRes, mockNext);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toBe('Password must be at least 6 characters long');
    });
  });

  describe('User Login Validation', () => {
    const loginValidation = [
      body('email')
        .isEmail()
        .withMessage('Please provide a valid email'),
      body('password')
        .notEmpty()
        .withMessage('Password is required')
    ];

    it('should pass validation for valid data', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      for (const validation of loginValidation) {
        await validation(mockReq, mockRes, mockNext);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail validation for invalid email', async () => {
      mockReq.body = {
        email: 'invalid-email',
        password: 'password123'
      };

      for (const validation of loginValidation) {
        await validation(mockReq, mockRes, mockNext);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toBe('Please provide a valid email');
    });

    it('should fail validation for missing password', async () => {
      mockReq.body = {
        email: 'test@example.com'
      };

      for (const validation of loginValidation) {
        await validation(mockReq, mockRes, mockNext);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toBe('Password is required');
    });
  });

  describe('Bet Creation Validation', () => {
    const betValidation = [
      body('sport')
        .notEmpty()
        .withMessage('Sport is required'),
      body('category')
        .notEmpty()
        .withMessage('Category is required'),
      body('amount')
        .isFloat({ min: 0.01 })
        .withMessage('Amount must be a positive number'),
      body('odds')
        .isFloat({ min: 1.0 })
        .withMessage('Odds must be at least 1.0'),
      body('result')
        .isIn(['pending', 'won', 'lost'])
        .withMessage('Result must be pending, won, or lost')
    ];

    it('should pass validation for valid bet data', async () => {
      mockReq.body = {
        sport: 'Fútbol',
        category: 'Resultado Final',
        amount: 100.00,
        odds: 1.50,
        result: 'pending'
      };

      for (const validation of betValidation) {
        await validation(mockReq, mockRes, mockNext);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail validation for missing sport', async () => {
      mockReq.body = {
        category: 'Resultado Final',
        amount: 100.00,
        odds: 1.50,
        result: 'pending'
      };

      for (const validation of betValidation) {
        await validation(mockReq, mockRes, mockNext);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toBe('Sport is required');
    });

    it('should fail validation for missing category', async () => {
      mockReq.body = {
        sport: 'Fútbol',
        amount: 100.00,
        odds: 1.50,
        result: 'pending'
      };

      for (const validation of betValidation) {
        await validation(mockReq, mockRes, mockNext);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toBe('Category is required');
    });

    it('should fail validation for negative amount', async () => {
      mockReq.body = {
        sport: 'Fútbol',
        category: 'Resultado Final',
        amount: -10.00,
        odds: 1.50,
        result: 'pending'
      };

      for (const validation of betValidation) {
        await validation(mockReq, mockRes, mockNext);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toBe('Amount must be a positive number');
    });

    it('should fail validation for odds less than 1.0', async () => {
      mockReq.body = {
        sport: 'Fútbol',
        category: 'Resultado Final',
        amount: 100.00,
        odds: 0.5,
        result: 'pending'
      };

      for (const validation of betValidation) {
        await validation(mockReq, mockRes, mockNext);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toBe('Odds must be at least 1.0');
    });

    it('should fail validation for invalid result', async () => {
      mockReq.body = {
        sport: 'Fútbol',
        category: 'Resultado Final',
        amount: 100.00,
        odds: 1.50,
        result: 'invalid'
      };

      for (const validation of betValidation) {
        await validation(mockReq, mockRes, mockNext);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toBe('Result must be pending, won, or lost');
    });
  });

  describe('Bet Update Validation', () => {
    const betUpdateValidation = [
      body('result')
        .isIn(['pending', 'won', 'lost'])
        .withMessage('Result must be pending, won, or lost')
    ];

    it('should pass validation for valid result', async () => {
      mockReq.body = {
        result: 'won'
      };

      for (const validation of betUpdateValidation) {
        await validation(mockReq, mockRes, mockNext);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail validation for invalid result', async () => {
      mockReq.body = {
        result: 'invalid'
      };

      for (const validation of betUpdateValidation) {
        await validation(mockReq, mockRes, mockNext);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toBe('Result must be pending, won, or lost');
    });
  });
}); 