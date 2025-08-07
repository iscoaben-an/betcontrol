import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User, Target, Brain, BarChart3, ChevronDown } from 'lucide-react';
import axios from 'axios';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [aiDropdownOpen, setAiDropdownOpen] = useState(false);
  const [availableBalance, setAvailableBalance] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAiDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAvailableBalance();
    }
  }, [isAuthenticated]);

  const fetchAvailableBalance = async () => {
    try {
      const response = await axios.get('/api/stats/dashboard');
      setAvailableBalance(response.data.stats.availableBalance);
    } catch (error) {
      console.error('Error fetching available balance:', error);
      // Fallback to user balance if API fails
      setAvailableBalance(user?.balance);
    }
  };

  // Expose refresh function globally for other components
  useEffect(() => {
    window.refreshNavbarBalance = fetchAvailableBalance;
    return () => {
      delete window.refreshNavbarBalance;
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  // Ensure balance is a number and handle null/undefined cases
  const formatBalance = (balance) => {
    if (balance === null || balance === undefined) return '0.00';
    const numBalance = parseFloat(balance);
    return isNaN(numBalance) ? '0.00' : numBalance.toFixed(2);
  };

  return (
    <nav style={{
      background: 'white',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      padding: '1rem 0'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#667eea',
          textDecoration: 'none'
        }}>
          <Target size={24} />
          <span>BetControl</span>
        </Link>
        
        <div style={{
          display: 'flex',
          gap: '2rem',
          alignItems: 'center'
        }}>
          <Link to="/" style={{
            color: '#495057',
            textDecoration: 'none',
            fontWeight: '500',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            transition: 'all 0.2s ease'
          }} onMouseEnter={(e) => {
            e.target.style.color = '#667eea';
            e.target.style.background = '#f8f9fa';
          }} onMouseLeave={(e) => {
            e.target.style.color = '#495057';
            e.target.style.background = 'transparent';
          }}>
            Dashboard
          </Link>
          <Link to="/bets" style={{
            color: '#495057',
            textDecoration: 'none',
            fontWeight: '500',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            transition: 'all 0.2s ease'
          }} onMouseEnter={(e) => {
            e.target.style.color = '#667eea';
            e.target.style.background = '#f8f9fa';
          }} onMouseLeave={(e) => {
            e.target.style.color = '#495057';
            e.target.style.background = 'transparent';
          }}>
            Apuestas
          </Link>
          <Link to="/stats" style={{
            color: '#495057',
            textDecoration: 'none',
            fontWeight: '500',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            transition: 'all 0.2s ease'
          }} onMouseEnter={(e) => {
            e.target.style.color = '#667eea';
            e.target.style.background = '#f8f9fa';
          }} onMouseLeave={(e) => {
            e.target.style.color = '#495057';
            e.target.style.background = 'transparent';
          }}>
            Estadísticas
          </Link>
          
          {/* AI Dropdown */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button 
              onClick={() => setAiDropdownOpen(!aiDropdownOpen)}
              style={{
                color: '#495057',
                textDecoration: 'none',
                fontWeight: '500',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#667eea';
                e.target.style.background = '#f8f9fa';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#495057';
                e.target.style.background = 'transparent';
              }}
            >
              <Brain size={16} />
              IA
              <ChevronDown size={14} />
            </button>
            
            {aiDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '0',
                background: 'white',
                border: '1px solid #e9ecef',
                borderRadius: '0.375rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                minWidth: '200px',
                zIndex: 1000,
                marginTop: '0.25rem'
              }}>
                <Link to="/ai-suggestions" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  color: '#495057',
                  textDecoration: 'none',
                  borderBottom: '1px solid #f1f3f4',
                  transition: 'background-color 0.2s ease'
                }} onMouseEnter={(e) => {
                  e.target.style.background = '#f8f9fa';
                }} onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                }} onClick={() => setAiDropdownOpen(false)}>
                  <Brain size={16} />
                  Sugerencias
                </Link>
                <Link to="/ai-analytics" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  color: '#495057',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s ease'
                }} onMouseEnter={(e) => {
                  e.target.style.background = '#f8f9fa';
                }} onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                }} onClick={() => setAiDropdownOpen(false)}>
                  <BarChart3 size={16} />
                  Analytics
                </Link>
              </div>
            )}
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#495057'
          }}>
            <User size={16} />
            <span>{user?.username}</span>
            <span style={{
              background: '#28a745',
              color: 'white',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'help',
              title: 'Saldo disponible (incluye ganancias)'
            }}>
              ${formatBalance(availableBalance)}
            </span>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm">
            <LogOut size={16} />
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 