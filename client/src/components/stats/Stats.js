import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import BalanceManager from '../dashboard/BalanceManager';
import { 
  TrendingUp, 
  DollarSign,
  Target,
  BarChart3,
  Award,
  Percent
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Stats = () => {
  const [sportStats, setSportStats] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#667eea', '#28a745', '#dc3545', '#ffc107', '#17a2b8', '#6f42c1', '#fd7e14', '#e83e8c'];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [dashboardResponse, sportResponse, categoryResponse] = await Promise.all([
        axios.get('/api/stats/dashboard'),
        axios.get('/api/stats/by-sport'),
        axios.get('/api/stats/by-category')
      ]);

      setDashboardStats(dashboardResponse.data.stats);
      setSportStats(sportResponse.data.stats);
      setCategoryStats(categoryResponse.data.stats);
    } catch (error) {
      toast.error('Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const handleBalanceUpdate = (newBalance) => {
    setDashboardStats(prevStats => ({
      ...prevStats,
      currentBalance: newBalance,
      availableBalance: newBalance + (prevStats.totalWinnings || 0)
    }));
    
    // Refresh navbar balance if the function exists
    if (window.refreshNavbarBalance) {
      window.refreshNavbarBalance();
    }
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '$0.00';
    const numValue = parseFloat(value);
    return isNaN(numValue) ? '$0.00' : `$${numValue.toFixed(2)}`;
  };

  const formatPercentage = (value) => {
    if (value === null || value === undefined) return '0.0%';
    const numValue = parseFloat(value);
    return isNaN(numValue) ? '0.0%' : `${numValue.toFixed(1)}%`;
  };

  const formatNumber = (value, decimals = 2) => {
    if (value === null || value === undefined) return '0.00';
    const numValue = parseFloat(value);
    return isNaN(numValue) ? '0.00' : numValue.toFixed(decimals);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div className="spinner" />
        <p style={{ marginTop: '1rem', color: '#6c757d' }}>
          Cargando estadísticas...
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
          Estadísticas
        </h1>
        <p style={{ color: '#6c757d' }}>
          Análisis detallado de tus apuestas
        </p>
      </div>

      {/* Dashboard Summary Cards */}
      {dashboardStats && (
        <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
          <div className="card stats-card">
            <TrendingUp size={32} style={{ color: '#667eea', marginBottom: '1rem' }} />
            <div className="stats-number">
              {dashboardStats.totalBets}
            </div>
            <div className="stats-label">Total Apuestas</div>
          </div>

          <div className="card stats-card">
            <Target size={32} style={{ color: '#28a745', marginBottom: '1rem' }} />
            <div className="stats-number">
              {formatPercentage(dashboardStats.winRate)}
            </div>
            <div className="stats-label">% Éxito</div>
          </div>

          <div className="card stats-card">
            <Award size={32} style={{ color: dashboardStats.netProfit >= 0 ? '#28a745' : '#dc3545', marginBottom: '1rem' }} />
            <div className="stats-number" style={{ color: dashboardStats.netProfit >= 0 ? '#28a745' : '#dc3545' }}>
              {formatCurrency(dashboardStats.netProfit)}
            </div>
            <div className="stats-label">Beneficio Neto</div>
          </div>

          <div className="card stats-card">
            <Percent size={32} style={{ color: '#6f42c1', marginBottom: '1rem' }} />
            <div className="stats-number" style={{ color: '#6f42c1' }}>
              {formatPercentage(dashboardStats.roi)}
            </div>
            <div className="stats-label">ROI</div>
          </div>
        </div>
      )}

      {/* Financial Summary */}
      {dashboardStats && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <DollarSign size={20} />
            Resumen Financiero
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{
              padding: '1rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '0.875rem',
                color: '#6c757d',
                marginBottom: '0.5rem'
              }}>
                Saldo Inicial
              </div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#6c757d'
              }}>
                {formatCurrency(dashboardStats.initialBalance)}
              </div>
            </div>

            <div style={{
              padding: '1rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '0.875rem',
                color: '#6c757d',
                marginBottom: '0.5rem'
              }}>
                Saldo Actual
              </div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#28a745'
              }}>
                {formatCurrency(dashboardStats.currentBalance)}
              </div>
            </div>

            <div style={{
              padding: '1rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '0.875rem',
                color: '#6c757d',
                marginBottom: '0.5rem'
              }}>
                Total Apostado
              </div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#495057'
              }}>
                {formatCurrency(dashboardStats.totalAmount)}
              </div>
            </div>

            <div style={{
              padding: '1rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '0.875rem',
                color: '#6c757d',
                marginBottom: '0.5rem'
              }}>
                Ganancias Totales
              </div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#28a745'
              }}>
                {formatCurrency(dashboardStats.totalWinnings)}
              </div>
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
                ${formatNumber(dashboardStats?.availableBalance)}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>
                Saldo + Ganancias
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Balance Manager */}
      <BalanceManager 
        availableBalance={dashboardStats?.availableBalance} 
        onBalanceUpdate={handleBalanceUpdate}
      />

      {/* Sport Statistics */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          marginBottom: '1rem',
          color: '#333',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Target size={20} />
          Estadísticas por Deporte
        </h3>

        {sportStats.length > 0 ? (
          <div className="grid grid-2">
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sportStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sport" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'total_bets' ? value : formatCurrency(value),
                      name === 'total_bets' ? 'Total Apuestas' : 
                      name === 'won_bets' ? 'Ganadas' :
                      name === 'lost_bets' ? 'Perdidas' :
                      name === 'total_amount' ? 'Monto Total' :
                      name === 'total_winnings' ? 'Ganancias' : name
                    ]}
                  />
                  <Bar dataKey="total_bets" fill="#667eea" name="Total Apuestas" />
                  <Bar dataKey="won_bets" fill="#28a745" name="Ganadas" />
                  <Bar dataKey="lost_bets" fill="#dc3545" name="Perdidas" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <div style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Deporte</th>
                      <th>Total</th>
                      <th>Ganadas</th>
                      <th>Perdidas</th>
                      <th>% Éxito</th>
                      <th>ROI</th>
                      <th>Monto</th>
                      <th>Beneficio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sportStats.map((stat, index) => (
                      <tr key={stat.sport}>
                        <td>{stat.sport}</td>
                        <td>{stat.total_bets}</td>
                        <td style={{ color: '#28a745' }}>{stat.won_bets}</td>
                        <td style={{ color: '#dc3545' }}>{stat.lost_bets}</td>
                        <td style={{ color: '#667eea', fontWeight: '600' }}>
                          {formatPercentage(stat.win_rate)}
                        </td>
                        <td style={{ color: parseFloat(stat.roi) >= 0 ? '#28a745' : '#dc3545', fontWeight: '600' }}>
                          {formatPercentage(stat.roi)}
                        </td>
                        <td>{formatCurrency(stat.total_amount)}</td>
                        <td style={{ color: parseFloat(stat.net_profit) >= 0 ? '#28a745' : '#dc3545', fontWeight: '600' }}>
                          {formatCurrency(stat.net_profit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <p style={{ color: '#6c757d', textAlign: 'center', padding: '2rem' }}>
            No hay estadísticas disponibles por deporte
          </p>
        )}
      </div>

      {/* Category Statistics */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          marginBottom: '1rem',
          color: '#333',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <BarChart3 size={20} />
          Estadísticas por Categoría
        </h3>

        {categoryStats.length > 0 ? (
          <div className="grid grid-2">
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, total_bets }) => `${category}: ${total_bets}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total_bets"
                  >
                    {categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, 'Apuestas']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div>
              <div style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Categoría</th>
                      <th>Total</th>
                      <th>Ganadas</th>
                      <th>Perdidas</th>
                      <th>% Éxito</th>
                      <th>ROI</th>
                      <th>Monto</th>
                      <th>Beneficio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryStats.map((stat, index) => (
                      <tr key={stat.category}>
                        <td>{stat.category}</td>
                        <td>{stat.total_bets}</td>
                        <td style={{ color: '#28a745' }}>{stat.won_bets}</td>
                        <td style={{ color: '#dc3545' }}>{stat.lost_bets}</td>
                        <td style={{ color: '#667eea', fontWeight: '600' }}>
                          {formatPercentage(stat.win_rate)}
                        </td>
                        <td style={{ color: parseFloat(stat.roi) >= 0 ? '#28a745' : '#dc3545', fontWeight: '600' }}>
                          {formatPercentage(stat.roi)}
                        </td>
                        <td>{formatCurrency(stat.total_amount)}</td>
                        <td style={{ color: parseFloat(stat.net_profit) >= 0 ? '#28a745' : '#dc3545', fontWeight: '600' }}>
                          {formatCurrency(stat.net_profit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <p style={{ color: '#6c757d', textAlign: 'center', padding: '2rem' }}>
            No hay estadísticas disponibles por categoría
          </p>
        )}
      </div>

      {/* Additional Summary Cards */}
      {dashboardStats && (
        <div className="grid grid-3">
          <div className="card stats-card">
            <Percent size={32} style={{ color: '#17a2b8', marginBottom: '1rem' }} />
            <div className="stats-number">
              {formatNumber(dashboardStats.avgOdds, 2)}
            </div>
            <div className="stats-label">Promedio Cuotas</div>
          </div>

          <div className="card stats-card">
            <DollarSign size={32} style={{ color: '#28a745', marginBottom: '1rem' }} />
            <div className="stats-number">
              {formatCurrency(dashboardStats.totalWinnings)}
            </div>
            <div className="stats-label">Ganancias Totales</div>
          </div>

          <div className="card stats-card">
            <TrendingUp size={32} style={{ color: dashboardStats.roi >= 0 ? '#28a745' : '#dc3545', marginBottom: '1rem' }} />
            <div className="stats-number" style={{ color: dashboardStats.roi >= 0 ? '#28a745' : '#dc3545' }}>
              {formatPercentage(dashboardStats.roi)}
            </div>
            <div className="stats-label">ROI General</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stats; 