import React, { useState } from 'react';
import {
  Search, Filter, Plus, Upload, Cloud, Snowflake,
  MoreVertical, ArrowRight, RefreshCw
} from 'lucide-react';

/* ── Demo data ─────────────────────────────────── */
const datasets = [
  {
    name: 'Customer_Sentiment_Q3',
    updated: 'Updated 2h ago',
    format: 'Parquet',
    formatColor: '#7c3aed',
    tokens: '45.2M',
    status: 'Clustering',
    statusColor: '#06d6a0',
    health: 98,
    healthColor: '#06d6a0',
  },
  {
    name: 'Global_Sales_2023',
    updated: 'Updated 1d ago',
    format: 'CSV',
    formatColor: '#3b82f6',
    tokens: '12.8M',
    status: 'Indexed',
    statusColor: '#06d6a0',
    health: 100,
    healthColor: '#06d6a0',
  },
  {
    name: 'User_Telemetry_Raw',
    updated: 'Sync Failed',
    updatedColor: '#ef4444',
    format: 'JSON',
    formatColor: '#f59e0b',
    tokens: '1.2B',
    status: 'Error',
    statusColor: '#ef4444',
    statusIcon: 'warning',
    health: 40,
    healthColor: '#ef4444',
    hasRetry: true,
  },
];

const connectors = [
  {
    name: 'AWS S3 Bucket',
    sub: 'us-east-1-data-lake',
    datasets: '3 Datasets',
    status: 'ACTIVE',
    statusBg: 'rgba(6, 214, 160, 0.1)',
    statusColor: '#06d6a0',
    icon: Cloud,
    iconBg: 'rgba(59, 130, 246, 0.1)',
    iconColor: '#3b82f6',
  },
  {
    name: 'Snowflake',
    sub: 'analytics_wh_prod',
    datasets: '12 Datasets',
    status: 'PAUSED',
    statusBg: 'rgba(245, 158, 11, 0.1)',
    statusColor: '#f59e0b',
    icon: Snowflake,
    iconBg: 'rgba(56, 189, 248, 0.1)',
    iconColor: '#38bdf8',
  },
];

const DatasetsView = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>

      {/* ── Header ────────────────────────────── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '2rem',
      }}>
        <div>
          <h2 style={{
            fontSize: '1.6rem', fontWeight: 700,
            marginBottom: '0.4rem', color: '#fff',
          }}>
            Dataset Management
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Connect, monitor, and configure active data streams for the Prism Observatory.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            id="new-connection-btn"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.55rem 1rem',
              background: 'transparent',
              border: '1px solid var(--accent-cyan-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--accent-cyan)',
              fontSize: '0.8rem', fontWeight: 600,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent-cyan-dim)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <Plus size={15} /> New Connection
          </button>
          <button
            id="upload-dataset-btn"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.55rem 1rem',
              background: 'var(--accent-cyan)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              color: '#000',
              fontSize: '0.8rem', fontWeight: 700,
              boxShadow: '0 2px 10px rgba(29, 242, 164, 0.2)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(29, 242, 164, 0.3)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(29, 242, 164, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Upload size={15} /> Upload Dataset
          </button>
        </div>
      </div>

      {/* ── Main grid ────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        gap: '1.5rem',
        alignItems: 'start',
      }}>

        {/* ── Left: Search + Table ─────────────── */}
        <div>
          {/* Search bar */}
          <div style={{
            display: 'flex',
            gap: '0.65rem',
            marginBottom: '1.25rem',
          }}>
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '0.55rem 1rem',
            }}>
              <Search size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              <input
                id="datasets-search"
                type="text"
                placeholder="Search datasets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  width: '100%',
                  padding: 0,
                }}
              />
            </div>
            <button style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.55rem 1rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem', fontWeight: 500,
              transition: 'all 0.15s',
            }}>
              <Filter size={14} /> Filter
            </button>
          </div>

          {/* Dataset table */}
          <div className="panel" style={{ overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: '1.25rem' }}>Dataset Name</th>
                  <th>Format</th>
                  <th>Token Count</th>
                  <th>Status</th>
                  <th>Health</th>
                  <th style={{ width: '48px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {datasets.map((ds, idx) => (
                  <tr key={ds.name} className={`animate-fade-in stagger-${idx + 1}`}>
                    <td style={{ paddingLeft: '1.25rem' }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                      }}>
                        <div style={{
                          width: 32, height: 32,
                          borderRadius: 'var(--radius-sm)',
                          background: 'rgba(124, 58, 237, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <Cloud size={15} color="#7c3aed" />
                        </div>
                        <div>
                          <div style={{
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            marginBottom: '0.1rem',
                          }}>
                            {ds.name}
                          </div>
                          <div style={{
                            fontSize: '0.68rem',
                            color: ds.updatedColor || 'var(--text-muted)',
                            fontWeight: ds.updatedColor ? 500 : 400,
                          }}>
                            {ds.updated}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '4px',
                        background: `${ds.formatColor}15`,
                        color: ds.formatColor,
                        fontSize: '0.72rem',
                        fontWeight: 600,
                      }}>
                        {ds.format}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                      {ds.tokens}
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        fontSize: '0.8rem', color: ds.statusColor,
                      }}>
                        <span style={{
                          width: 6, height: 6,
                          borderRadius: '50%',
                          background: ds.statusColor,
                          display: 'inline-block',
                        }} />
                        {ds.status}
                      </span>
                    </td>
                    <td>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                      }}>
                        <div className="health-bar">
                          <div
                            className="health-bar-fill"
                            style={{
                              width: `${ds.health}%`,
                              background: ds.healthColor,
                            }}
                          />
                        </div>
                        <span style={{
                          fontSize: '0.72rem',
                          color: 'var(--text-muted)',
                          fontWeight: 500,
                        }}>
                          {ds.health}%
                        </span>
                      </div>
                    </td>
                    <td>
                      {ds.hasRetry ? (
                        <button style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          color: '#ef4444',
                          padding: '0.3rem 0.6rem',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}>
                          Retry
                        </button>
                      ) : (
                        <button style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          padding: '0.3rem',
                          display: 'flex',
                          alignItems: 'center',
                          transition: 'color 0.15s',
                        }}
                          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                        >
                          <MoreVertical size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Right: External Connectors ────────── */}
        <div>
          <h3 style={{
            fontSize: '1.05rem', color: '#fff',
            marginBottom: '1rem',
            textAlign: 'center',
          }}>
            External Connectors
          </h3>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}>
            {connectors.map((conn, idx) => {
              const Icon = conn.icon;
              return (
                <div
                  key={conn.name}
                  className={`panel animate-slide-right stagger-${idx + 1}`}
                  style={{
                    padding: '1.1rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-medium)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                  }}
                >
                  {/* Status badge */}
                  <span style={{
                    position: 'absolute',
                    top: '0.75rem',
                    right: '0.75rem',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '10px',
                    background: conn.statusBg,
                    color: conn.statusColor,
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                  }}>
                    {conn.status}
                  </span>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '0.75rem',
                  }}>
                    <div style={{
                      width: 38, height: 38,
                      borderRadius: 'var(--radius-md)',
                      background: conn.iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Icon size={18} color={conn.iconColor} />
                    </div>
                    <div>
                      <div style={{
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        marginBottom: '0.1rem',
                      }}>
                        {conn.name}
                      </div>
                      <div style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                      }}>
                        {conn.sub}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{
                      fontSize: '0.78rem',
                      color: 'var(--text-secondary)',
                      fontWeight: 500,
                    }}>
                      {conn.datasets}
                    </span>
                    <ArrowRight size={16} color="var(--text-muted)" />
                  </div>
                </div>
              );
            })}

            {/* Add Provider card */}
            <div
              className="panel animate-slide-right stagger-3"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s',
                borderStyle: 'dashed',
                minHeight: '100px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-medium)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                e.currentTarget.style.background = 'var(--bg-card)';
              }}
            >
              <div style={{
                width: 36, height: 36,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.5rem',
              }}>
                <Plus size={18} color="var(--text-muted)" />
              </div>
              <span style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                fontWeight: 500,
              }}>
                Add Provider
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatasetsView;
