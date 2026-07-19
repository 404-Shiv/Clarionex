import React from 'react';
import {
  Clock, Sliders, Activity, AlertTriangle,
  CheckCircle2, Info, BarChart2
} from 'lucide-react';
import Dashboard from '../components/Dashboard';

/* ── Hardcoded demo data for the Insights panels ── */
const anomalies = [
  {
    icon: AlertTriangle,
    iconColor: '#f59e0b',
    iconBg: 'rgba(245, 158, 11, 0.1)',
    title: 'Data Spike Vector 7A',
    sub: 'Deviation at +4.5σ from median',
    time: '14:02:11',
  },
  {
    icon: CheckCircle2,
    iconColor: '#06d6a0',
    iconBg: 'rgba(6, 214, 160, 0.1)',
    title: 'Auto-Correction Applied',
    sub: 'Node reassignment successful',
    time: '13:45:00',
  },
  {
    icon: Info,
    iconColor: '#64748b',
    iconBg: 'rgba(100, 116, 139, 0.1)',
    title: 'Routine Indexing',
    sub: '1,284 parameters updated',
    time: '13:00:00',
  },
];

/* ── Mini SVG line chart for the variance stream ── */
const VarianceStreamChart = () => {
  // Two curves: expected (dashed) and observed (solid)
  const w = 700, h = 180;
  const points = 40;

  const makeCurve = (seed, amplitude, offset) => {
    const pts = [];
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * w;
      const y = offset + Math.sin((i + seed) * 0.25) * amplitude
        + Math.sin((i + seed) * 0.12) * (amplitude * 0.6)
        + Math.cos((i + seed) * 0.08) * (amplitude * 0.3);
      pts.push(`${x},${y}`);
    }
    return pts.join(' ');
  };

  const expectedCurve = makeCurve(0, 25, h / 2);
  const observedCurve = makeCurve(3, 22, h / 2 - 8);

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map(frac => (
        <line
          key={frac}
          x1="0" y1={h * frac} x2={w} y2={h * frac}
          stroke="rgba(148, 163, 184, 0.06)"
          strokeWidth="1"
        />
      ))}
      {/* Expected (dashed purple) */}
      <polyline
        points={expectedCurve}
        fill="none"
        stroke="#7c3aed"
        strokeWidth="2"
        strokeDasharray="6,4"
        opacity="0.7"
      />
      {/* Observed (solid cyan) */}
      <polyline
        points={observedCurve}
        fill="none"
        stroke="#1df2a4"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Glow area under observed */}
      <polyline
        points={`0,${h} ${observedCurve} ${w},${h}`}
        fill="url(#cyanGrad)"
        opacity="0.15"
      />
      <defs>
        <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1df2a4" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
    </svg>
  );
};

/* ── Correlation Matrix mini grid ──────────────── */
const CorrelationMatrix = () => {
  const size = 8;
  const cellSize = 36;
  const gap = 3;

  const getColor = (r, c) => {
    const val = Math.abs(Math.sin(r * 3.7 + c * 2.3 + r * c * 0.5));
    if (val > 0.8) return 'rgba(29, 242, 164, 0.85)';
    if (val > 0.6) return 'rgba(29, 242, 164, 0.55)';
    if (val > 0.4) return 'rgba(29, 242, 164, 0.3)';
    if (val > 0.2) return 'rgba(29, 242, 164, 0.15)';
    return 'rgba(29, 242, 164, 0.05)';
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${size}, ${cellSize}px)`,
      gap: `${gap}px`,
      justifyContent: 'center',
    }}>
      {Array.from({ length: size * size }).map((_, idx) => {
        const r = Math.floor(idx / size);
        const c = idx % size;
        return (
          <div
            key={idx}
            style={{
              width: cellSize,
              height: cellSize,
              borderRadius: '4px',
              background: getColor(r, c),
              transition: 'transform 0.15s, box-shadow 0.15s',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 0 8px rgba(29, 242, 164, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        );
      })}
    </div>
  );
};

const InsightsView = ({ selectedCharts, onRemoveChart, onAddMore }) => {
  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>

      {/* ── Header ─────────────────────────────── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '2rem',
      }}>
        <div>
          <h2 style={{
            fontSize: '2rem', fontWeight: 700,
            marginBottom: '0.4rem', color: '#fff',
          }}>
            Advanced Insights
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Real-time telemetry and predictive modeling vectors.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: '0.45rem',
            padding: '0.5rem 1rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)',
            fontSize: '0.78rem', fontWeight: 500,
          }}>
            <Clock size={14} /> Last 12 Hours
          </button>
          <button style={{
            display: 'flex', alignItems: 'center', gap: '0.45rem',
            padding: '0.5rem 1rem',
            background: 'transparent',
            border: '1px solid var(--accent-cyan-border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--accent-cyan)',
            fontSize: '0.78rem', fontWeight: 600,
          }}>
            <Sliders size={14} /> Parameters
          </button>
        </div>
      </div>

      {/* ── Row 1: Variance Stream + Neural State ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        gap: '1.25rem',
        marginBottom: '1.25rem',
      }}>

        {/* Variance Stream */}
        <div className="panel animate-fade-in stagger-1" style={{ padding: '1.25rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}>
            <div>
              <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.2rem' }}>
                Dimensional Variance Stream
              </h3>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                fontSize: '0.72rem', color: 'var(--text-muted)',
              }}>
                <span className="live-dot" style={{
                  width: 5, height: 5,
                  background: 'var(--accent-blue)',
                }} />
                Live Synapse Connection
              </div>
            </div>
            <div style={{
              display: 'flex', gap: '1rem', fontSize: '0.72rem',
            }}>
              <span style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                color: 'var(--accent-cyan)',
              }}>
                <span style={{
                  width: 8, height: 3,
                  borderRadius: 2,
                  background: 'var(--accent-cyan)',
                  display: 'inline-block',
                }} />
                Expected
              </span>
              <span style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                color: '#7c3aed',
              }}>
                <span style={{
                  width: 8, height: 3,
                  borderRadius: 2,
                  background: '#7c3aed',
                  display: 'inline-block',
                }} />
                Observed
              </span>
            </div>
          </div>

          <VarianceStreamChart />

          <div style={{
            display: 'flex', justifyContent: 'space-between',
            marginTop: '0.5rem',
            color: 'var(--text-dim)',
            fontSize: '0.68rem',
          }}>
            {['T-00', 'T-15', 'T-30', 'T-45', 'T-60'].map(t => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>

        {/* Neural State */}
        <div className="panel-glow animate-fade-in stagger-2" style={{ padding: '1.25rem' }}>
          <h3 style={{
            fontSize: '0.95rem', color: '#fff',
            marginBottom: '1.5rem',
          }}>
            Neural State
          </h3>

          {/* Confidence */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              marginBottom: '0.4rem',
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Model Confidence
              </span>
              <span style={{
                fontSize: '1.15rem', fontWeight: 700,
                color: 'var(--accent-cyan)',
              }}>
                98.4%
              </span>
            </div>
            <div style={{
              height: 4, borderRadius: 10,
              background: 'rgba(255,255,255,0.06)',
              overflow: 'hidden',
            }}>
              <div style={{
                width: '98.4%', height: '100%',
                borderRadius: 10,
                background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-blue))',
              }} />
            </div>
          </div>

          {/* Latency */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              marginBottom: '0.4rem',
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Processing Latency
              </span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>
                12<span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ms</span>
              </span>
            </div>
            <div style={{
              height: 4, borderRadius: 10,
              background: 'rgba(255,255,255,0.06)',
              overflow: 'hidden',
            }}>
              <div style={{
                width: '12%', height: '100%',
                borderRadius: 10,
                background: 'var(--accent-blue)',
              }} />
            </div>
          </div>

          {/* Cluster info */}
          <div style={{
            marginTop: 'auto',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{
              fontSize: '0.72rem', color: 'var(--text-muted)',
              letterSpacing: '0.04em',
            }}>
              NODE CLUSTER: ALPHA
            </span>
            <span style={{
              fontSize: '0.7rem', fontWeight: 600,
              color: 'var(--accent-cyan)',
              display: 'flex', alignItems: 'center', gap: '0.3rem',
            }}>
              <span className="live-dot" style={{ width: 5, height: 5 }} />
              ONLINE
            </span>
          </div>
        </div>
      </div>

      {/* ── Row 2: Correlation Matrix + Anomalies ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.25rem',
        marginBottom: '2.5rem',
      }}>

        {/* Correlation Matrix */}
        <div className="panel animate-fade-in stagger-3" style={{ padding: '1.25rem' }}>
          <h3 style={{
            fontSize: '1rem', color: '#fff',
            marginBottom: '1.25rem',
          }}>
            Entity Correlation Matrix
          </h3>
          <CorrelationMatrix />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '1rem',
            fontSize: '0.68rem',
            color: 'var(--text-dim)',
          }}>
            <span>Low Correlation</span>
            <div style={{
              width: 100, height: 6,
              borderRadius: 3,
              background: 'linear-gradient(90deg, rgba(29,242,164,0.05), rgba(29,242,164,0.85))',
            }} />
            <span>High Correlation</span>
          </div>
        </div>

        {/* Detected Anomalies */}
        <div className="panel animate-fade-in stagger-4" style={{ padding: '1.25rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
          }}>
            <h3 style={{ fontSize: '1rem', color: '#fff' }}>Detected Anomalies</h3>
            <button style={{
              background: 'transparent',
              color: 'var(--accent-cyan)',
              fontSize: '0.75rem',
              fontWeight: 500,
            }}>
              View Logs
            </button>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}>
            {anomalies.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-subtle)',
                    transition: 'background 0.15s',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  }}
                >
                  <div style={{
                    width: 32, height: 32,
                    borderRadius: 'var(--radius-sm)',
                    background: item.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={15} color={item.iconColor} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      marginBottom: '0.1rem',
                    }}>
                      {item.title}
                    </div>
                    <div style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)',
                    }}>
                      {item.sub}
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    fontWeight: 500,
                    flexShrink: 0,
                  }}>
                    {item.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── User's selected charts (if any) ──────── */}
      {selectedCharts.length > 0 && (
        <div className="animate-fade-in">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.25rem',
            paddingBottom: '0.85rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            <div style={{
              width: 3, height: '1.1rem',
              background: 'var(--accent-cyan)',
              borderRadius: '2px',
            }} />
            <h3 style={{ fontSize: '1.05rem', color: '#fff' }}>Your Analytics</h3>
          </div>
          <Dashboard selectedCharts={selectedCharts} onRemoveChart={onRemoveChart} />
        </div>
      )}

      {selectedCharts.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '2.5rem 2rem',
          background: 'var(--bg-card)',
          border: '1px dashed var(--border-medium)',
          borderRadius: 'var(--radius-lg)',
          color: 'var(--text-muted)',
        }}>
          <BarChart2 size={32} style={{ opacity: 0.2, marginBottom: '0.6rem' }} />
          <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
            No telemetry streams activated.
          </p>
          <button
            onClick={onAddMore}
            style={{
              background: 'var(--accent-cyan)',
              color: '#000',
              padding: '0.55rem 1.2rem',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
              fontSize: '0.8rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            Launch Models from Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default InsightsView;
