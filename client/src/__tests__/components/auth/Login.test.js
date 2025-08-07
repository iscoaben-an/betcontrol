import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import Login from '../../components/auth/Login';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn(),
}));

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form correctly', () => {
    renderWithProviders(<Login />);

    expect(screen.getByText('Bienvenido a BetControl')).toBeInTheDocument();
    expect(screen.getByText('Inicia sesión para continuar')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Iniciar Sesión/ })).toBeInTheDocument();
    expect(screen.getByText('¿No tienes una cuenta?')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Crear Cuenta/ })).toBeInTheDocument();
  });

  it('updates form fields when user types', () => {
    renderWithProviders(<Login />);

    const emailInput = screen.getByLabelText(/Email/);
    const passwordInput = screen.getByLabelText(/Contraseña/);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('shows loading state when form is submitted', async () => {
    const mockAxios = require('axios');
    mockAxios.post.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderWithProviders(<Login />);

    const emailInput = screen.getByLabelText(/Email/);
    const passwordInput = screen.getByLabelText(/Contraseña/);
    const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/ });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
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

    renderWithProviders(<Login />);

    const emailInput = screen.getByLabelText(/Email/);
    const passwordInput = screen.getByLabelText(/Contraseña/);
    const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/ });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Invalid credentials');
    });
  });

  it('validates required fields', async () => {
    renderWithProviders(<Login />);

    const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/ });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/Email/)).toBeInvalid();
      expect(screen.getByLabelText(/Contraseña/)).toBeInvalid();
    });
  });

  it('validates email format', async () => {
    renderWithProviders(<Login />);

    const emailInput = screen.getByLabelText(/Email/);
    const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/ });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(emailInput).toBeInvalid();
    });
  });
}); 