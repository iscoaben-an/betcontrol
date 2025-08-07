import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Brain, 
  Target, 
  AlertTriangle,
  Loader2,
  Sparkles,
  BarChart3,
  Zap
} from 'lucide-react';

const AISuggestions = () => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [selectedSport, setSelectedSport] = useState('all');
  const [confidence, setConfidence] = useState('medium');

  const sports = [
    { value: 'all', label: 'Todos los deportes' },
    { value: 'Fútbol', label: 'Fútbol' },
    { value: 'Baloncesto', label: 'Baloncesto' },
    { value: 'Tenis', label: 'Tenis' },
    { value: 'Béisbol', label: 'Béisbol' },
    { value: 'Hockey', label: 'Hockey' }
  ];

  const confidenceLevels = [
    { value: 'low', label: 'Baja (Más seguro)', color: '#28a745' },
    { value: 'medium', label: 'Media (Equilibrado)', color: '#ffc107' },
    { value: 'high', label: 'Alta (Más riesgo)', color: '#dc3545' }
  ];

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const response = await axios.get('/api/stats/dashboard');
      setUserStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/ai/suggestions', {
        sport: selectedSport,
        confidence: confidence,
        userStats: userStats
      });

      setSuggestions(response.data.suggestions);
      toast.success('¡Sugerencias generadas con éxito!');
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error('Error al generar sugerencias');
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (level) => {
    switch (level) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getOddsColor = (odds) => {
    if (odds >= 2.0) return '#dc3545';
    if (odds >= 1.5) return '#ffc107';
    return '#28a745';
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <Brain size={32} style={{ color: '#667eea' }} />
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#333',
            margin: 0
          }}>
            Sugerencias de IA
          </h1>
          <Sparkles size={24} style={{ color: '#ffc107' }} />
        </div>
        <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
          Nuestro sistema de IA analiza tus estadísticas y el mercado para sugerir las mejores oportunidades de apuestas.
        </p>
      </div>

      {/* Configuration Panel */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ padding: '1.5rem' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#333',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Zap size={20} style={{ color: '#667eea' }} />
            Configuración de Sugerencias
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            alignItems: 'end'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '500',
                color: '#495057',
                marginBottom: '0.5rem'
              }}>
                Deporte
              </label>
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ced4da',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  backgroundColor: '#fff'
                }}
              >
                {sports.map((sport) => (
                  <option key={sport.value} value={sport.value}>
                    {sport.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '500',
                color: '#495057',
                marginBottom: '0.5rem'
              }}>
                Nivel de Confianza
              </label>
              <select
                value={confidence}
                onChange={(e) => setConfidence(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ced4da',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  backgroundColor: '#fff'
                }}
              >
                {confidenceLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <button
                onClick={generateSuggestions}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Generando...
                  </>
                ) : (
                  <>
                    <Brain size={16} />
                    Generar Sugerencias
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Stats Summary */}
      {userStats && (
        <div style={{
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#333',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <BarChart3 size={20} style={{ color: '#667eea' }} />
            Tu Perfil de Apuestas
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#667eea'
              }}>
                {userStats.totalBets}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#6c757d'
              }}>
                Total Apuestas
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#28a745'
              }}>
                {userStats.winRate}%
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#6c757d'
              }}>
                Tasa de Éxito
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: userStats.netProfit >= 0 ? '#28a745' : '#dc3545'
              }}>
                ${userStats.netProfit}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#6c757d'
              }}>
                Beneficio Neto
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#6f42c1'
              }}>
                {userStats.avgOdds}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#6c757d'
              }}>
                Promedio de Cuotas
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Suggestions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {suggestions.length > 0 ? (
          suggestions.map((suggestion, index) => (
            <div key={index} className="card" style={{
              borderLeft: '4px solid #667eea',
              padding: '1.5rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}>
                <div>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '0.25rem'
                  }}>
                    {suggestion.event}
                  </h3>
                  <p style={{
                    color: '#6c757d',
                    fontSize: '0.875rem'
                  }}>
                    {suggestion.description}
                  </p>
                </div>
                <div style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  backgroundColor: getConfidenceColor(suggestion.confidence) + '20',
                  color: getConfidenceColor(suggestion.confidence)
                }}>
                  {suggestion.confidence === 'high' ? 'Alta Confianza' : 
                   suggestion.confidence === 'medium' ? 'Confianza Media' : 'Baja Confianza'}
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#6c757d'
                  }}>
                    Deporte
                  </div>
                  <div style={{
                    fontWeight: '500',
                    color: '#333'
                  }}>
                    {suggestion.sport}
                  </div>
                </div>
                <div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#6c757d'
                  }}>
                    Categoría
                  </div>
                  <div style={{
                    fontWeight: '500',
                    color: '#333'
                  }}>
                    {suggestion.category}
                  </div>
                </div>
                <div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#6c757d'
                  }}>
                    Cuota Sugerida
                  </div>
                  <div style={{
                    fontWeight: '700',
                    color: getOddsColor(suggestion.suggestedOdds)
                  }}>
                    {suggestion.suggestedOdds}
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor: '#f8f9fa',
                borderRadius: '0.375rem',
                padding: '1rem'
              }}>
                <h4 style={{
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Target size={16} style={{ color: '#667eea' }} />
                  Análisis de IA
                </h4>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#495057',
                  marginBottom: '0.75rem'
                }}>
                  {suggestion.aiAnalysis}
                </p>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  fontSize: '0.875rem'
                }}>
                  <div>
                    <span style={{ color: '#6c757d' }}>Probabilidad de Éxito:</span>
                    <span style={{
                      marginLeft: '0.5rem',
                      fontWeight: '500',
                      color: '#28a745'
                    }}>
                      {suggestion.successProbability}%
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#6c757d' }}>ROI Esperado:</span>
                    <span style={{
                      marginLeft: '0.5rem',
                      fontWeight: '500',
                      color: suggestion.expectedRoi >= 0 ? '#28a745' : '#dc3545'
                    }}>
                      {suggestion.expectedRoi}%
                    </span>
                  </div>
                </div>
              </div>

              <div style={{
                marginTop: '1rem',
                display: 'flex',
                gap: '0.5rem'
              }}>
                <button style={{
                  flex: 1,
                  backgroundColor: '#28a745',
                  color: 'white',
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}>
                  Crear Apuesta
                </button>
                <button style={{
                  padding: '0.75rem 1rem',
                  border: '1px solid #ced4da',
                  borderRadius: '0.375rem',
                  backgroundColor: '#fff',
                  color: '#495057',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}>
                  Más Detalles
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1rem'
          }}>
            <Brain size={64} style={{ color: '#ced4da', marginBottom: '1rem' }} />
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '500',
              color: '#333',
              marginBottom: '0.5rem'
            }}>
              No hay sugerencias disponibles
            </h3>
            <p style={{
              color: '#6c757d'
            }}>
              Configura los parámetros y genera sugerencias personalizadas basadas en tu perfil de apuestas.
            </p>
          </div>
        )}
      </div>

      {/* AI Disclaimer */}
      <div style={{
        marginTop: '2rem',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '0.375rem',
        padding: '1rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem'
        }}>
          <AlertTriangle size={20} style={{ color: '#856404', marginTop: '2px' }} />
          <div>
            <h4 style={{
              fontWeight: '500',
              color: '#856404',
              marginBottom: '0.25rem'
            }}>
              Importante
            </h4>
            <p style={{
              fontSize: '0.875rem',
              color: '#856404'
            }}>
              Las sugerencias de IA son herramientas informativas y no garantizan ganancias. 
              Siempre apuesta de manera responsable y dentro de tus límites financieros.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISuggestions;
