import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  AlertTriangle,
  Brain,
  Activity,
  PieChart
} from 'lucide-react';

const AIAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/ai/analytics');
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Error al cargar analytics');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'low': return '#28a745';
      case 'medium': return '#ffc107';
      case 'high': return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Brain size={48} style={{ color: '#667eea', marginBottom: '1rem' }} />
          <p style={{ color: '#6c757d' }}>
            Analizando tus patrones de apuestas...
          </p>
        </div>
      </div>
    );
  }

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
            Analytics de IA
          </h1>
          <Activity size={24} style={{ color: '#667eea' }} />
        </div>
        <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
          Análisis profundo de tus patrones de apuestas y recomendaciones personalizadas.
        </p>
      </div>

      {analytics ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Patrones de Apuestas */}
          <div className="card">
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
                <BarChart3 size={20} style={{ color: '#667eea' }} />
                Patrones de Apuestas
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                <div style={{
                  backgroundColor: '#e3f2fd',
                  borderRadius: '0.5rem',
                  padding: '1rem'
                }}>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#1976d2',
                    marginBottom: '0.5rem'
                  }}>
                    Deportes Preferidos
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {analytics.bettingPatterns.preferredSports.map((sport, index) => (
                      <div key={index} style={{
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#333'
                      }}>
                        {sport}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#e8f5e8',
                  borderRadius: '0.5rem',
                  padding: '1rem'
                }}>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#28a745',
                    marginBottom: '0.5rem'
                  }}>
                    Cuotas Promedio
                  </div>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#333'
                  }}>
                    {analytics.bettingPatterns.averageOdds}
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#f3e5f5',
                  borderRadius: '0.5rem',
                  padding: '1rem'
                }}>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#6f42c1',
                    marginBottom: '0.5rem'
                  }}>
                    Frecuencia
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#333'
                  }}>
                    {analytics.bettingPatterns.bettingFrequency}
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#fff3e0',
                  borderRadius: '0.5rem',
                  padding: '1rem'
                }}>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#f57c00',
                    marginBottom: '0.5rem'
                  }}>
                    Apuesta Promedio
                  </div>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#333'
                  }}>
                    ${analytics.bettingPatterns.averageBetAmount}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tasa de Éxito por Deporte */}
          <div className="card">
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
                <PieChart size={20} style={{ color: '#28a745' }} />
                Tasa de Éxito por Deporte
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem'
              }}>
                {Object.entries(analytics.bettingPatterns.successRateBySport).map(([sport, rate]) => (
                  <div key={sport} style={{
                    backgroundColor: '#f8f9fa',
                    borderRadius: '0.5rem',
                    padding: '1rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{
                        fontWeight: '500',
                        color: '#333'
                      }}>
                        {sport}
                      </span>
                      <span style={{
                        fontWeight: '700',
                        color: rate >= 60 ? '#28a745' : rate >= 40 ? '#ffc107' : '#dc3545'
                      }}>
                        {rate}%
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      backgroundColor: '#e9ecef',
                      borderRadius: '9999px',
                      height: '0.5rem'
                    }}>
                      <div 
                        style={{
                          height: '100%',
                          borderRadius: '9999px',
                          backgroundColor: rate >= 60 ? '#28a745' : rate >= 40 ? '#ffc107' : '#dc3545',
                          width: `${rate}%`
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Perfil de Riesgo */}
          <div className="card">
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
                <Target size={20} style={{ color: '#dc3545' }} />
                Perfil de Riesgo
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                <div style={{
                  backgroundColor: '#f8d7da',
                  borderRadius: '0.5rem',
                  padding: '1rem'
                }}>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#721c24',
                    marginBottom: '0.5rem'
                  }}>
                    Tolerancia al Riesgo
                  </div>
                  <div style={{
                    fontWeight: '700',
                    color: getRiskColor(analytics.riskProfile.riskTolerance)
                  }}>
                    {analytics.riskProfile.riskTolerance === 'low' ? 'Baja' : 
                     analytics.riskProfile.riskTolerance === 'medium' ? 'Media' : 'Alta'}
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#d1ecf1',
                  borderRadius: '0.5rem',
                  padding: '1rem'
                }}>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#0c5460',
                    marginBottom: '0.5rem'
                  }}>
                    Rango de Cuotas Preferido
                  </div>
                  <div style={{
                    fontWeight: '500',
                    color: '#333'
                  }}>
                    {analytics.riskProfile.preferredOddsRange}
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#d4edda',
                  borderRadius: '0.5rem',
                  padding: '1rem'
                }}>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#155724',
                    marginBottom: '0.5rem'
                  }}>
                    Máximo % por Apuesta
                  </div>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#333'
                  }}>
                    {analytics.riskProfile.maxBetPercentage}%
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#e2e3e5',
                  borderRadius: '0.5rem',
                  padding: '1rem'
                }}>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#383d41',
                    marginBottom: '0.5rem'
                  }}>
                    Puntuación de Consistencia
                  </div>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#333'
                  }}>
                    {analytics.riskProfile.consistencyScore}/10
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recomendaciones Personalizadas */}
          <div className="card">
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
                <TrendingUp size={20} style={{ color: '#667eea' }} />
                Recomendaciones Personalizadas
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {analytics.recommendations.map((recommendation, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '0.375rem'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#667eea',
                      borderRadius: '50%',
                      marginTop: '6px',
                      flexShrink: 0
                    }}></div>
                    <p style={{
                      color: '#495057',
                      margin: 0
                    }}>
                      {recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Insights de IA */}
          <div style={{
            background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
            borderRadius: '0.5rem',
            padding: '1.5rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#333',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Brain size={20} style={{ color: '#667eea' }} />
              Insights de IA
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              <div>
                <h3 style={{
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '0.5rem'
                }}>
                  Fortalezas Identificadas
                </h3>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: '#495057' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#28a745',
                      borderRadius: '50%'
                    }}></div>
                    Excelente tasa de éxito en fútbol (65%)
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#28a745',
                      borderRadius: '50%'
                    }}></div>
                    Gestión de riesgo consistente
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#28a745',
                      borderRadius: '50%'
                    }}></div>
                    Patrón de apuestas disciplinado
                  </li>
                </ul>
              </div>

              <div>
                <h3 style={{
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '0.5rem'
                }}>
                  Áreas de Mejora
                </h3>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: '#495057' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#ffc107',
                      borderRadius: '50%'
                    }}></div>
                    Diversificar en más deportes
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#ffc107',
                      borderRadius: '50%'
                    }}></div>
                    Considerar apuestas con cuotas más altas
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#ffc107',
                      borderRadius: '50%'
                    }}></div>
                    Aumentar gradualmente el tamaño de apuestas exitosas
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
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
            No hay datos de analytics disponibles
          </h3>
          <p style={{
            color: '#6c757d'
          }}>
            Realiza algunas apuestas para que podamos analizar tus patrones.
          </p>
        </div>
      )}

      {/* Disclaimer */}
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
              Análisis de IA
            </h4>
            <p style={{
              fontSize: '0.875rem',
              color: '#856404'
            }}>
              Los insights y recomendaciones se basan en análisis de datos y patrones históricos. 
              No garantizan resultados futuros. Siempre apuesta de manera responsable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalytics;
