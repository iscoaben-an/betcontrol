import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { History, TrendingUp, TrendingDown } from 'lucide-react';

const BalanceHistory = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalanceHistory();
  }, []);

  const fetchBalanceHistory = async () => {
    try {
      const response = await axios.get('/api/stats/balance/history');
      setMovements(response.data.movements);
    } catch (error) {
      toast.error('Error al cargar el historial de movimientos');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ color: '#6c757d' }}>Cargando historial...</div>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginTop: '2rem' }}>
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: '600',
        marginBottom: '1rem',
        color: '#333',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <History size={20} />
        Historial de Movimientos
      </h3>

      {movements.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          color: '#6c757d'
        }}>
          No hay movimientos registrados
        </div>
      ) : (
        <div style={{
          maxHeight: '400px',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          {movements.map((movement) => (
            <div key={movement.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              borderBottom: '1px solid #e9ecef',
              backgroundColor: movement.type === 'deposit' ? '#f8fff8' : '#fff8f8'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {movement.type === 'deposit' ? (
                  <TrendingUp size={20} style={{ color: '#28a745' }} />
                ) : (
                  <TrendingDown size={20} style={{ color: '#dc3545' }} />
                )}
                <div>
                  <div style={{
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '0.25rem'
                  }}>
                    {movement.description}
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#6c757d'
                  }}>
                    {formatDate(movement.created_at)}
                  </div>
                </div>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontWeight: '600',
                  color: movement.type === 'deposit' ? '#28a745' : '#dc3545',
                  fontSize: '1.1rem'
                }}>
                  {movement.type === 'deposit' ? '+' : '-'}{formatNumber(movement.amount)}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#6c757d'
                }}>
                  Saldo: {formatNumber(movement.new_balance)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BalanceHistory;
