import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import BalanceManager from './BalanceManager';
import BalanceHistory from './BalanceHistory';
import { 
  TrendingUp, 
  DollarSign,
  Target,
  BarChart3,
  Award,
  Percent
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentBets, setRecentBets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, recentBetsResponse] = await Promise.all([
        axios.get('/api/stats/dashboard'),
        axios.get('/api/stats/recent')
      ]);

      setStats(statsResponse.data.stats);
      setRecentBets(recentBetsResponse.data.recentBets);
    } catch (error) {
      toast.error('Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleBalanceUpdate = (newBalance) => {
    setStats(prevStats => ({
      ...prevStats,
      currentBalance: newBalance,
      availableBalance: newBalance + (prevStats.totalWinnings || 0)
    }));
    
    // Refresh dashboard data to get updated stats
    fetchDashboardData();
  };

  const getResultColor = (result) => {
    switch (result) {
      case 'won': return '#28a745';
      case 'lost': return '#dc3545';
      case 'pending': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getResultText = (result) => {
    switch (result) {
      case 'won': return 'Ganada';
      case 'lost': return 'Perdida';
      case 'pending': return 'Pendiente';
      default: return 'Desconocido';
    }
  };

  // Helper function to safely format numbers
  const formatNumber = (value, decimals = 2) => {
    if (value === null || value === undefined) return '0.00';
    const numValue = parseFloat(value);
    return isNaN(numValue) ? '0.00' : numValue.toFixed(decimals);
  };

  const formatPercentage = (value) => {
    if (value === null || value === undefined) return '0.0%';
    const numValue = parseFloat(value);
    return isNaN(numValue) ? '0.0%' : `${numValue.toFixed(1)}%`;
  };

  const calculateBetProfit = (bet) => {
    if (bet.result === 'won') {
      const winnings = bet.amount * bet.odds;
      const profit = winnings - bet.amount;
      return { amount: profit, type: 'profit' };
    } else if (bet.result === 'lost') {
      return { amount: bet.amount, type: 'loss' };
    } else {
      return { amount: 0, type: 'pending' };
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div className="spinner" />
        <p style={{ marginTop: '1rem', color: '#6c757d' }}>
          Cargando dashboard...
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: '#333',
          marginBottom: '0.5rem'
        }}>
          Dashboard
        </h1>
        <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
          Bienvenido de vuelta, {user?.username}
        </p>
      </div>

      {/* Current Balance Display */}
      {stats && (
        <div className="card" style={{ 
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.5rem'
          }}>
            <div>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}>
                Saldo Disponible
              </h2>
              <div style={{
                fontSize: '3rem',
                fontWeight: '700',
                marginBottom: '0.5rem'
              }}>
                ${formatNumber(stats.availableBalance)}
              </div>
              <p style={{ opacity: 0.9, fontSize: '1rem' }}>
                Saldo actual + Ganancias disponibles
              </p>
            </div>
            <DollarSign size={64} style={{ opacity: 0.8 }} />
          </div>
        </div>
      )}

      {/* Balance Manager */}
      <BalanceManager 
        availableBalance={stats?.availableBalance} 
        onBalanceUpdate={handleBalanceUpdate}
      />

      {/* Stats Cards */}
      <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
        <div className="card stats-card">
          <Target size={32} style={{ color: '#667eea', marginBottom: '1rem' }} />
          <div className="stats-number">{stats?.totalBets || 0}</div>
          <div className="stats-label">Total Apuestas</div>
        </div>

        <div className="card stats-card">
          <TrendingUp size={32} style={{ color: '#28a745', marginBottom: '1rem' }} />
          <div className="stats-number">{formatPercentage(stats?.winRate)}</div>
          <div className="stats-label">% Éxito</div>
        </div>

        <div className="card stats-card">
          <Award size={32} style={{ color: stats?.netProfit >= 0 ? '#28a745' : '#dc3545', marginBottom: '1rem' }} />
          <div className="stats-number" style={{ color: stats?.netProfit >= 0 ? '#28a745' : '#dc3545' }}>
            ${formatNumber(stats?.netProfit)}
          </div>
          <div className="stats-label">Beneficio Neto</div>
        </div>

        <div className="card stats-card">
          <Percent size={32} style={{ color: stats?.roi >= 0 ? '#28a745' : '#dc3545', marginBottom: '1rem' }} />
          <div className="stats-number" style={{ color: stats?.roi >= 0 ? '#28a745' : '#dc3545' }}>
            {formatPercentage(stats?.roi)}
          </div>
          <div className="stats-label">ROI</div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#333'
          }}>
            <DollarSign size={20} style={{ marginRight: '0.5rem' }} />
            Resumen Financiero
          </h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0.75rem',
              background: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <span>Saldo Inicial:</span>
              <span style={{ fontWeight: '600', color: '#6c757d' }}>
                ${formatNumber(stats?.initialBalance)}
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0.75rem',
              background: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <span>Saldo Actual:</span>
              <span style={{ fontWeight: '600', color: '#28a745' }}>
                ${formatNumber(stats?.currentBalance)}
              </span>
            </div>
            
            <div style={{
              padding: '1rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.5rem' }}>
                Saldo Disponible
              </div>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                color: '#28a745',
                marginBottom: '0.25rem'
              }}>
                ${formatNumber(stats?.availableBalance)}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>
                Saldo + Ganancias
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0.75rem',
              background: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <span>Total Apostado:</span>
              <span style={{ fontWeight: '600', color: '#495057' }}>
                ${formatNumber(stats?.totalAmount)}
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0.75rem',
              background: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <span>Ganancias Totales:</span>
              <span style={{ fontWeight: '600', color: '#28a745' }}>
                ${formatNumber(stats?.totalWinnings)}
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0.75rem',
              background: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <span>Promedio Cuotas:</span>
              <span style={{ fontWeight: '600', color: '#17a2b8' }}>
                {formatNumber(stats?.avgOdds, 2)}
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0.75rem',
              background: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <span>Apuestas Ganadas:</span>
              <span style={{ fontWeight: '600', color: '#28a745' }}>
                {stats?.wonBets || 0}
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0.75rem',
              background: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <span>Apuestas Perdidas:</span>
              <span style={{ fontWeight: '600', color: '#dc3545' }}>
                {stats?.lostBets || 0}
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0.75rem',
              background: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <span>Apuestas Pendientes:</span>
              <span style={{ fontWeight: '600', color: '#ffc107' }}>
                {stats?.pendingBets || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#333'
          }}>
            <BarChart3 size={20} style={{ marginRight: '0.5rem' }} />
            Apuestas Recientes
          </h3>
          
          {recentBets.length > 0 ? (
            <div className="recent-bets-scroll" style={{ 
              maxHeight: '500px', 
              overflowY: 'auto',
              overflowX: 'hidden'
            }}>
              {recentBets.map((bet) => {
                const profitLoss = calculateBetProfit(bet);
                return (
                  <div key={bet.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    borderBottom: '1px solid #e9ecef',
                    fontSize: '0.875rem',
                    minHeight: '60px',
                    transition: 'background-color 0.2s ease'
                  }}>
                    <div>
                      <div style={{ fontWeight: '600' }}>
                        {bet.sport} - {bet.category}
                      </div>
                      <div style={{ color: '#6c757d', fontSize: '0.75rem' }}>
                        ${formatNumber(bet.amount)} @ {formatNumber(bet.odds, 2)}
                      </div>
                    </div>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      background: getResultColor(bet.result) + '20',
                      color: getResultColor(bet.result)
                    }}>
                      {getResultText(bet.result)}
                    </span>
                    {profitLoss.type === 'profit' && (
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        background: '#28a74520',
                        color: '#28a745'
                      }}>
                        +${formatNumber(profitLoss.amount)}
                      </span>
                    )}
                    {profitLoss.type === 'loss' && (
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        background: '#dc354520',
                        color: '#dc3545'
                      }}>
                        -${formatNumber(profitLoss.amount)}
                      </span>
                    )}
                    {profitLoss.type === 'pending' && (
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        background: '#ffc10720',
                        color: '#ffc107'
                      }}>
                        ${formatNumber(profitLoss.amount)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: '#6c757d', textAlign: 'center', padding: '2rem' }}>
              No hay apuestas recientes
            </p>
          )}
        </div>
      </div>

      {/* Balance History */}
      <BalanceHistory />
    </div>
  );
};

export default Dashboard; 