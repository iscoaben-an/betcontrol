import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn(),
  get: jest.fn(),
  defaults: {
    headers: {
      common: {}
    }
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Test component to access context
const TestComponent = () => {
  const { user, isAuthenticated, login, register, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
      <div data-testid="isAuthenticated">{isAuthenticated.toString()}</div>
      <button onClick={() => login('test@example.com', 'password')}>Login</button>
      <button onClick={() => register('testuser', 'test@example.com', 'password')}>Register</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('provides initial state correctly', () => {
    renderWithProviders(<TestComponent />);

    expect(screen.getByTestId('user')).toHaveTextContent('null');
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
  });

  it('handles successful login', async () => {
    const mockAxios = require('axios');
    const mockToast = require('react-hot-toast');

    mockAxios.post.mockResolvedValue({
      data: {
        token: 'test-token',
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          balance: 1000
        }
      }
    });

    renderWithProviders(<TestComponent />);

    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'test@example.com',
        password: 'password'
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'test-token');
      expect(mockToast.success).toHaveBeenCalledWith('¡Inicio de sesión exitoso!');
    });
  });

  it('handles login error', async () => {
    const mockAxios = require('axios');
    const mockToast = require('react-hot-toast');

    mockAxios.post.mockRejectedValue({
      response: {
        data: {
          error: 'Invalid credentials'
        }
      }
    });

    renderWithProviders(<TestComponent />);

    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Invalid credentials');
    });
  });

  it('handles successful registration', async () => {
    const mockAxios = require('axios');
    const mockToast = require('react-hot-toast');

    mockAxios.post.mockResolvedValue({
      data: {
        token: 'test-token',
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          balance: 1000
        }
      }
    });

    renderWithProviders(<TestComponent />);

    const registerButton = screen.getByText('Register');
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith('/api/auth/register', {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password'
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'test-token');
      expect(mockToast.success).toHaveBeenCalledWith('¡Registro exitoso!');
    });
  });

  it('handles registration error', async () => {
    const mockAxios = require('axios');
    const mockToast = require('react-hot-toast');

    mockAxios.post.mockRejectedValue({
      response: {
        data: {
          error: 'User already exists'
        }
      }
    });

    renderWithProviders(<TestComponent />);

    const registerButton = screen.getByText('Register');
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('User already exists');
    });
  });

  it('handles logout', () => {
    const mockToast = require('react-hot-toast');

    renderWithProviders(<TestComponent />);

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(mockToast.success).toHaveBeenCalledWith('Sesión cerrada');
  });

  it('loads user from localStorage on mount', async () => {
    const mockAxios = require('axios');

    localStorageMock.getItem.mockReturnValue('existing-token');
    mockAxios.get.mockResolvedValue({
      data: {
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          balance: 1000
        }
      }
    });

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        balance: 1000
      }));
    });
  });

  it('handles invalid token on mount', async () => {
    const mockAxios = require('axios');

    localStorageMock.getItem.mockReturnValue('invalid-token');
    mockAxios.get.mockRejectedValue(new Error('Invalid token'));

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    });
  });
}); 