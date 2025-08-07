import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { DollarSign, Plus, Minus } from 'lucide-react';

const BalanceManager = ({ availableBalance, onBalanceUpdate }) => {
  const [amount, setAmount] = useState('');
  const [operation, setOperation] = useState('add');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Por favor ingresa un monto válido');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('/api/stats/balance', {
        amount: parseFloat(amount),
        operation: operation
      });

      toast.success(response.data.message);
      setAmount('');
      
      // Update parent component
      if (onBalanceUpdate) {
        onBalanceUpdate(response.data.newBalance);
      }
      
      // Refresh navbar balance if the function exists
      if (window.refreshNavbarBalance) {
        window.refreshNavbarBalance();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error al actualizar el saldo';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num) => {
    return parseFloat(num || 0).toFixed(2);
  };

  return (
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
        Gestionar Saldo
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        <div style={{
          padding: '1rem',
          backgroundColor: '#e8f5e8',
          borderRadius: '8px',
          border: '1px solid #28a745'
        }}>
          <div style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: '#28a745',
            marginBottom: '0.5rem'
          }}>
            Saldo Disponible: ${formatNumber(availableBalance)}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
            Incluye ganancias disponibles para nuevas apuestas
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <div style={{ flex: 1 }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: '#333'
            }}>
              Operación
            </label>
            <select
              value={operation}
              onChange={(e) => setOperation(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            >
              <option value="add">Añadir Fondos</option>
              <option value="withdraw">Retirar Fondos</option>
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: '#333'
            }}>
              Monto
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !amount}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: operation === 'add' ? '#28a745' : '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          {operation === 'add' ? <Plus size={20} /> : <Minus size={20} />}
          {isLoading ? 'Procesando...' : operation === 'add' ? 'Añadir Fondos' : 'Retirar Fondos'}
        </button>
      </form>
    </div>
  );
};

export default BalanceManager;
