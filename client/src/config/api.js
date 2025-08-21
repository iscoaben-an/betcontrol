// Configuración de la API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  endpoints: {
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      me: '/api/auth/me'
    },
    bets: {
      create: '/api/bets',
      getAll: '/api/bets',
      update: (id) => `/api/bets/${id}`,
      delete: (id) => `/api/bets/${id}`
    },
    stats: {
      dashboard: '/api/stats/dashboard',
      recent: '/api/stats/recent',
      bySport: '/api/stats/by-sport',
      balance: '/api/stats/balance',
      balanceHistory: '/api/stats/balance/history'
    },
    ai: {
      suggestions: '/api/ai/suggestions'
    }
  }
};

export default API_CONFIG;
