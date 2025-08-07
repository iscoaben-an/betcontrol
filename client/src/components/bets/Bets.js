import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';

const Bets = () => {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBet, setEditingBet] = useState(null);
  const [formData, setFormData] = useState({
    sport: '',
    category: '',
    amount: '',
    odds: '',
    result: 'pending',
    description: ''
  });

  const sports = [
    'Fútbol', 'Baloncesto', 'Tenis', 'Béisbol', 'Hockey',
    'Boxeo', 'MMA', 'Golf', 'Carreras', 'Otros'
  ];

  const categories = [
    'Resultado Final', 'Primera Mitad', 'Segunda Mitad',
    'Goles Totales', 'Ambos Marcan', 'Handicap',
    'Específico', 'Otros'
  ];

  useEffect(() => {
    fetchBets();
  }, []);

  const fetchBets = async () => {
    try {
      const response = await axios.get('/api/bets');
      setBets(response.data.bets);
    } catch (error) {
      toast.error('Error al cargar las apuestas');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setFormData({
      sport: '',
      category: '',
      amount: '',
      odds: '',
      result: 'pending',
      description: ''
    });
    setEditingBet(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingBet) {
        await axios.put(`/api/bets/${editingBet.id}`, formData);
        toast.success('Apuesta actualizada exitosamente');
      } else {
        await axios.post('/api/bets', formData);
        toast.success('Apuesta creada exitosamente');
      }
      
      resetForm();
      fetchBets();
    } catch (error) {
      const message = error.response?.data?.error || 'Error al procesar la apuesta';
      toast.error(message);
    }
  };

  const handleEdit = (bet) => {
    setEditingBet(bet);
    setFormData({
      sport: bet.sport,
      category: bet.category,
      amount: bet.amount,
      odds: bet.odds,
      result: bet.result,
      description: bet.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (betId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta apuesta?')) {
      return;
    }

    try {
      await axios.delete(`/api/bets/${betId}`);
      toast.success('Apuesta eliminada exitosamente');
      fetchBets();
    } catch (error) {
      toast.error('Error al eliminar la apuesta');
    }
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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div className="spinner" />
        <p style={{ marginTop: '1rem', color: '#6c757d' }}>
          Cargando apuestas...
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#333',
            marginBottom: '0.5rem'
          }}>
            Mis Apuestas
          </h1>
          <p style={{ color: '#6c757d' }}>
            Gestiona todas tus apuestas deportivas
          </p>
        </div>
        
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          <Plus size={16} />
          Nueva Apuesta
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#333'
          }}>
            {editingBet ? 'Editar Apuesta' : 'Nueva Apuesta'}
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Deporte</label>
                <select
                  name="sport"
                  value={formData.sport}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Seleccionar deporte</option>
                  {sports.map(sport => (
                    <option key={sport} value={sport}>{sport}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Categoría</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Monto ($)</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Cuotas</label>
                <input
                  type="number"
                  name="odds"
                  value={formData.odds}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="1.50"
                  step="0.01"
                  min="1.0"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Resultado</label>
                <select
                  name="result"
                  value={formData.result}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="pending">Pendiente</option>
                  <option value="won">Ganada</option>
                  <option value="lost">Perdida</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Descripción (opcional)</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Detalles de la apuesta..."
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary">
                {editingBet ? 'Actualizar' : 'Crear'} Apuesta
              </button>
              <button 
                type="button" 
                onClick={resetForm}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bets List */}
      <div className="card">
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          marginBottom: '1rem',
          color: '#333'
        }}>
          Lista de Apuestas ({bets.length})
        </h3>

        {bets.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Deporte</th>
                  <th>Categoría</th>
                  <th>Monto</th>
                  <th>Cuotas</th>
                  <th>Ganancia Potencial</th>
                  <th>Resultado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {bets.map((bet) => (
                  <tr key={bet.id}>
                    <td>{bet.sport}</td>
                    <td>{bet.category}</td>
                    <td>${formatNumber(bet.amount)}</td>
                    <td>{formatNumber(bet.odds, 2)}</td>
                    <td>${formatNumber(parseFloat(bet.amount) * parseFloat(bet.odds))}</td>
                    <td>
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
                    </td>
                    <td>
                      {new Date(bet.created_at).toLocaleDateString('es-ES')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleEdit(bet)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.5rem' }}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(bet.id)}
                          className="btn btn-danger btn-sm"
                          style={{ padding: '0.25rem 0.5rem' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#6c757d', fontSize: '1.1rem', marginBottom: '1rem' }}>
              No tienes apuestas registradas
            </p>
            <button 
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
            >
              <Plus size={16} />
              Crear Primera Apuesta
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bets; 