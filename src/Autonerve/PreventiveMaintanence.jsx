import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from './../redux/features/user/userSlice';
import './PreventiveMaintenance.css';
import DashboardSam from '../pages/Dashboard/DashboardSam'
import HeaderSim from '../pages/Header/HeaderSim'
import wipro from '../assests/images/wipro.png'
const PreventiveMaintenance = () => {
  const dispatch = useDispatch();
  const { userData, loading, error } = useSelector((state) => state.user);
  const [selectedSystem, setSelectedSystem] = useState('pump');

  useEffect(() => {
    if (!userData) {
      dispatch(fetchUser());
    }
  }, [dispatch, userData]);

  // System data organized by category
  const systemsData = {
    pump: {
      title: 'Pump Systems',
      subtitle: 'Real-time pump monitoring and health assessment',
      icon: '⚙️',
      items: [
        {
          id: 1,
          name: 'Raw Water Intake Pump #1',
          category: 'Intake Station',
          status: 'operational',
          health: 92,
          failureRisk: 8,
          vibration: '3.2 mm/s',
          temp: '68°C'
        },
        {
          id: 2,
          name: 'High Service Pump #3',
          category: 'Distribution',
          status: 'warning',
          health: 76,
          failureRisk: 24,
          vibration: '6.8 mm/s',
          temp: '82°C'
        },
        {
          id: 3,
          name: 'Backwash Pump #2',
          category: 'Filtration',
          status: 'operational',
          health: 88,
          failureRisk: 12,
          vibration: '4.1 mm/s',
          temp: '71°C'
        }
      ]
    },
    blower: {
      title: 'Blower Systems',
      subtitle: 'Aeration and ozone generation monitoring',
      icon: '💨',
      items: [
        {
          id: 1,
          name: 'Aeration Blower #1',
          category: 'Pre-treatment',
          status: 'operational',
          health: 94,
          failureRisk: 6,
          pressure: '28.5 kPa',
          power: '145 kW'
        },
        {
          id: 2,
          name: 'Ozone Generation Blower',
          category: 'Disinfection',
          status: 'operational',
          health: 89,
          failureRisk: 11,
          pressure: '32.1 kPa',
          power: '162 kW'
        }
      ]
    },
    highPressure: {
      title: 'High Pressure Pumps (4 Units)',
      subtitle: 'Real-time pump condition monitoring',
      icon: '🔧',
      items: [
        {
          id: 1,
          name: 'HP-01',
          status: 'risk-low',
          pressure: '58 bar',
          vibration: '3.2 mm/s',
          temperature: '42°C',
          efficiency: '94%',
          failureRisk: 8
        },
        {
          id: 2,
          name: 'HP-02',
          status: 'risk-medium',
          pressure: '56 bar',
          vibration: '4.1 mm/s',
          temperature: '45°C',
          efficiency: '91%',
          failureRisk: 15
        },
        {
          id: 3,
          name: 'HP-03',
          status: 'risk-low',
          pressure: '59 bar',
          vibration: '2.8 mm/s',
          temperature: '41°C',
          efficiency: '96%',
          failureRisk: 5
        },
        {
          id: 4,
          name: 'HP-04',
          status: 'risk-high',
          pressure: '57 bar',
          vibration: '5.2 mm/s',
          temperature: '48°C',
          efficiency: '88%',
          failureRisk: 28
        }
      ]
    },
    roMembrane: {
      title: 'RO Membrane Systems (8 Trains)',
      subtitle: 'Membrane performance and fouling analysis',
      icon: '💧',
      items: [
        {
          id: 1,
          name: 'RO-T1',
          status: 'risk-low',
          fluxRate: '18.5 L/m²/h',
          saltRejection: '99.6%',
          tmp: '55 bar',
          foulingIndex: '12%',
          failureRisk: 6
        },
        {
          id: 2,
          name: 'RO-T2',
          status: 'risk-medium',
          fluxRate: '17.8 L/m²/h',
          saltRejection: '99.4%',
          tmp: '57 bar',
          foulingIndex: '18%',
          failureRisk: 14
        },
        {
          id: 3,
          name: 'RO-T3',
          status: 'risk-low',
          fluxRate: '19.1 L/m²/h',
          saltRejection: '99.7%',
          tmp: '54 bar',
          foulingIndex: '8%',
          failureRisk: 4
        },
        {
          id: 4,
          name: 'RO-T4',
          status: 'risk-high',
          fluxRate: '16.2 L/m²/h',
          saltRejection: '99.2%',
          tmp: '59 bar',
          foulingIndex: '25%',
          failureRisk: 32
        }
      ]
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      operational: '#4caf50',
      warning: '#ff9800',
      'risk-low': '#4caf50',
      'risk-medium': '#ff9800',
      'risk-high': '#f44336'
    };
    return colors[status] || '#757575';
  };

  const getStatusLabel = (status) => {
    const labels = {
      operational: 'operational',
      warning: 'warning',
      'risk-low': `${systemsData[selectedSystem].items.find(item => item.status === 'risk-low')?.failureRisk || 0}% failure risk`,
      'risk-medium': `${systemsData[selectedSystem].items.find(item => item.status === 'risk-medium')?.failureRisk || 0}% failure risk`,
      'risk-high': `${systemsData[selectedSystem].items.find(item => item.status === 'risk-high')?.failureRisk || 0}% failure risk`
    };
    return labels[status] || status;
  };

  if (loading) {
    return <div className="pm-loading">Loading...</div>;
  }

  if (error) {
    return <div className="pm-error">Error: {error.message}</div>;
  }

  const currentSystem = systemsData[selectedSystem];

  return (
    <div className="pm-container">
      <div className="row w-100">
        {/* Sidebar */}
        <div className="col-lg-3 d-none d-lg-block">
          <DashboardSam />
        </div>

        {/* Main Content */}
        <div className="col-lg-9 col-12">
          <div className="header-sim">
  {/* existing header content */} <HeaderSim/>
</div>
         
          <div className="pm-content">
            {/* Header */}
            <div className="pm-header">
              <div className="pm-header-top">
                <h1 className="pm-title">Predictive Maintenance</h1>
                <img src={wipro} alt=""  width={'210px'} height={'70px'}/>
              {/*   <div className="pm-user-info">
                  <span className="pm-user-name">{userData?.validUserOne?.fname || 'User'}</span>
                  <img
                    src={wipro}
                    alt="Profile"
                    className="pm-user-avatar"
                  />
                </div> */}
              </div>

              {/* System Selector Dropdown */}
              <div className="pm-system-selector">
                <label htmlFor="system-dropdown" className="pm-dropdown-label">
                  Select System
                </label>
                <select
                  id="system-dropdown"
                  value={selectedSystem}
                  onChange={(e) => setSelectedSystem(e.target.value)}
                  className="pm-dropdown"
                >
                  <option value="pump">Pump Systems</option>
                  <option value="blower">Blower Systems</option>
                  <option value="highPressure">High Pressure Pumps</option>
                  <option value="roMembrane">RO Membrane Systems</option>
                </select>
              </div>
            </div>

            {/* System Details */}
            <div className="pm-system-details">
              <div className="pm-system-header">
                
                <div className="pm-system-info">
                  <h2 className="pm-system-title">{currentSystem.title}</h2>
                  <p className="pm-system-subtitle">{currentSystem.subtitle}</p>
                </div>
              </div>

              {/* Equipment Cards */}
              <div className="pm-equipment-grid">
                {currentSystem.items.map((item) => (
                  <div key={item.id} className="pm-equipment-card">
                    <div className="pm-card-header">
                      <div className="pm-card-title-section">
                        <h3 className="pm-card-title">{item.name}</h3>
                        {item.category && (
                          <span className="pm-card-category">{item.category}</span>
                        )}
                      </div>
                      <span
                        className="pm-status-badge"
                        style={{ backgroundColor: getStatusColor(item.status) }}
                      >
                        {item.status === 'operational' || item.status === 'warning'
                          ? item.status
                          : `${item.failureRisk}% failure risk`}
                      </span>
                    </div>

                    <div className="pm-card-body">
                      <div className="pm-metrics-row">
                        {item.health && (
                          <div className="pm-metric">
                            <span className="pm-metric-label">Health:</span>
                            <span className="pm-metric-value" style={{ color: '#4caf50' }}>
                              {item.health}%
                            </span>
                          </div>
                        )}
                        {item.failureRisk && (
                          <div className="pm-metric">
                            <span className="pm-metric-label">Failure Risk:</span>
                            <span
                              className="pm-metric-value"
                              style={{
                                color:
                                  item.failureRisk > 20
                                    ? '#f44336'
                                    : item.failureRisk > 10
                                    ? '#ff9800'
                                    : '#4caf50'
                              }}
                            >
                              {item.failureRisk}%
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="pm-metrics-row">
                        {item.vibration && (
                          <div className="pm-metric">
                            <span className="pm-metric-label">Vibration:</span>
                            <span className="pm-metric-value">{item.vibration}</span>
                          </div>
                        )}
                        {item.temp && (
                          <div className="pm-metric">
                            <span className="pm-metric-label">Temp:</span>
                            <span className="pm-metric-value">{item.temp}</span>
                          </div>
                        )}
                        {item.pressure && (
                          <div className="pm-metric">
                            <span className="pm-metric-label">Pressure:</span>
                            <span className="pm-metric-value">{item.pressure}</span>
                          </div>
                        )}
                        {item.power && (
                          <div className="pm-metric">
                            <span className="pm-metric-label">Power:</span>
                            <span className="pm-metric-value">{item.power}</span>
                          </div>
                        )}
                        {item.temperature && (
                          <div className="pm-metric">
                            <span className="pm-metric-label">Temperature:</span>
                            <span className="pm-metric-value">{item.temperature}</span>
                          </div>
                        )}
                        {item.efficiency && (
                          <div className="pm-metric">
                            <span className="pm-metric-label">Efficiency:</span>
                            <span className="pm-metric-value">{item.efficiency}</span>
                          </div>
                        )}
                        {item.fluxRate && (
                          <div className="pm-metric">
                            <span className="pm-metric-label">Flux Rate:</span>
                            <span className="pm-metric-value">{item.fluxRate}</span>
                          </div>
                        )}
                        {item.saltRejection && (
                          <div className="pm-metric">
                            <span className="pm-metric-label">Salt Rejection:</span>
                            <span className="pm-metric-value">{item.saltRejection}</span>
                          </div>
                        )}
                        {item.tmp && (
                          <div className="pm-metric">
                            <span className="pm-metric-label">TMP:</span>
                            <span className="pm-metric-value">{item.tmp}</span>
                          </div>
                        )}
                        {item.foulingIndex && (
                          <div className="pm-metric">
                            <span className="pm-metric-label">Fouling Index:</span>
                            <span className="pm-metric-value">{item.foulingIndex}</span>
                          </div>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="pm-progress-container">
                        <div
                          className="pm-progress-bar"
                          style={{
                            width: `${item.health || 100 - (item.failureRisk || 0)}%`,
                            backgroundColor: getStatusColor(item.status)
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreventiveMaintenance;