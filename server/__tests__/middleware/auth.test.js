const jwt = require('jsonwebtoken');
const auth = require('../../middleware/auth');

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key';

describe('Auth Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      header: jest.fn()
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  describe('Valid token', () => {
    it('should call next() with decoded user data', () => {
      const token = jwt.sign(
        { id: 1, username: 'testuser' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      mockReq.header.mockReturnValue(`Bearer ${token}`);

      auth(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeDefined();
      expect(mockReq.user.id).toBe(1);
      expect(mockReq.user.username).toBe('testuser');
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe('Invalid token', () => {
    it('should return 401 for invalid token', () => {
      mockReq.header.mockReturnValue('Bearer invalid-token');

      auth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid token.' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 for expired token', () => {
      const expiredToken = jwt.sign(
        { id: 1, username: 'testuser' },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }
      );

      mockReq.header.mockReturnValue(`Bearer ${expiredToken}`);

      auth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid token.' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Missing token', () => {
    it('should return 401 when no token provided', () => {
      mockReq.header.mockReturnValue(undefined);

      auth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        error: 'Access denied. No token provided.' 
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when Authorization header is empty', () => {
      mockReq.header.mockReturnValue('');

      auth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        error: 'Access denied. No token provided.' 
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Token format', () => {
    it('should handle token without Bearer prefix', () => {
      const token = jwt.sign(
        { id: 1, username: 'testuser' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      mockReq.header.mockReturnValue(token);

      auth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        error: 'Access denied. No token provided.' 
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle malformed Bearer token', () => {
      mockReq.header.mockReturnValue('Bearer');

      auth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Access denied. No token provided.' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
}); 