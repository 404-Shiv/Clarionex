import React from 'react';
import {
  Database, Box, CheckCircle, FileSpreadsheet,
  Columns, Hash, Tag, Calendar, ArrowRight
} from 'lucide-react';
import UploadZone from '../components/UploadZone';

const UploadView = ({ onUploadSuccess, uploadReport }) => {
  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>

      {/* ── Header ──────────────────────────────── */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{
          fontSize: '2rem', fontWeight: 700,
          marginBottom: '0.4rem', color: '#fff',
          letterSpacing: '-0.02em',
        }}>
          Upload Dataset
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Drop your CSV file to auto-clean, analyze, and generate chart suggestions.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: uploadReport ? '1fr 360px' : '1fr',
        gap: '1.5rem',
        alignItems: 'start',
      }}>

        {/* ── Upload Panel ──────────────────────── */}
        <div className="panel" style={{
          padding: '1.75rem',
          background: 'var(--bg-card)',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
          }}>
            <span style={{
              fontSize: '0.68rem',
              color: 'var(--accent-cyan)',
              letterSpacing: '0.06em',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}>
              <Database size={13} />
              DATASET INGESTION
            </span>
            <div style={{
              width: 30, height: 30,
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Box size={14} color="var(--text-muted)" />
            </div>
          </div>

          <h3 style={{
            fontSize: '1.3rem', color: '#fff',
            marginBottom: '1.25rem', fontWeight: 600,
          }}>
            Drop Telemetry Data
          </h3>

          <div style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px dashed var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: '0.5rem',
          }}>
            <UploadZone onUploadSuccess={onUploadSuccess} />
          </div>

          <p style={{
            color: 'var(--text-dim)',
            fontSize: '0.72rem',
            marginTop: '0.85rem',
            textAlign: 'center',
          }}>
            Supported format: CSV · Max file size 50 GB · Encrypted at rest
          </p>

          {/* ── How it works ──────────────────────── */}
          <div style={{
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-subtle)',
          }}>
            <h4 style={{
              fontSize: '0.8rem', color: 'var(--text-secondary)',
              fontWeight: 600, letterSpacing: '0.04em',
              marginBottom: '1rem',
            }}>
              HOW IT WORKS
            </h4>
            <div style={{
              display: 'flex', gap: '1rem',
            }}>
              {[
                { step: '1', title: 'Upload', desc: 'Drop your CSV file here' },
                { step: '2', title: 'Auto-Clean', desc: 'Data is cleaned & analyzed' },
                { step: '3', title: 'Visualize', desc: 'Charts suggested automatically' },
                { step: '4', title: 'Export', desc: 'Download results in any format' },
              ].map((item, idx) => (
                <div key={item.step} style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  position: 'relative',
                }}>
                  <div style={{
                    width: 32, height: 32,
                    borderRadius: '50%',
                    background: 'var(--accent-cyan-dim)',
                    border: '1px solid var(--accent-cyan-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--accent-cyan)',
                    marginBottom: '0.5rem',
                  }}>
                    {item.step}
                  </div>
                  <div style={{
                    fontSize: '0.78rem', fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '0.15rem',
                  }}>
                    {item.title}
                  </div>
                  <div style={{
                    fontSize: '0.68rem',
                    color: 'var(--text-muted)',
                  }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Dataset Info Panel (shown after upload) ── */}
        {uploadReport && (
          <div className="animate-slide-right" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}>

            {/* Success Card */}
            <div className="panel-glow" style={{ padding: '1.25rem' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.65rem',
                marginBottom: '1rem',
              }}>
                <div style={{
                  width: 36, height: 36,
                  borderRadius: '50%',
                  background: 'rgba(6, 214, 160, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <CheckCircle size={18} color="var(--accent-cyan)" />
                </div>
                <div>
                  <div style={{
                    fontSize: '0.88rem', fontWeight: 600,
                    color: 'var(--text-primary)',
                  }}>
                    Upload Successful
                  </div>
                  <div style={{
                    fontSize: '0.72rem',
                    color: 'var(--accent-cyan)',
                  }}>
                    {uploadReport.filename}
                  </div>
                </div>
              </div>

              {/* Stats */}
              {uploadReport.dataset_info && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.65rem',
                }}>
                  {[
                    { icon: FileSpreadsheet, label: 'Rows', value: uploadReport.dataset_info.rows, color: '#3b82f6' },
                    { icon: Columns, label: 'Columns', value: uploadReport.dataset_info.columns, color: '#7c3aed' },
                    { icon: Hash, label: 'Numeric', value: uploadReport.dataset_info.numeric, color: '#06d6a0' },
                    { icon: Tag, label: 'Categorical', value: uploadReport.dataset_info.categorical, color: '#f59e0b' },
                  ].map(stat => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.label} style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.7rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}>
                        <Icon size={15} color={stat.color} style={{ flexShrink: 0 }} />
                        <div>
                          <div style={{
                            fontSize: '1rem', fontWeight: 700,
                            color: 'var(--text-primary)',
                            lineHeight: 1,
                          }}>
                            {stat.value}
                          </div>
                          <div style={{
                            fontSize: '0.65rem',
                            color: 'var(--text-muted)',
                          }}>
                            {stat.label}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cleaning Report */}
            {uploadReport.cleaning_report && (
              <div className="panel" style={{ padding: '1.1rem' }}>
                <h4 style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  marginBottom: '0.75rem',
                }}>
                  CLEANING REPORT
                </h4>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                }}>
                  {Object.entries(uploadReport.cleaning_report).map(([key, val]) => (
                    <div key={key} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.35rem 0',
                      borderBottom: '1px solid var(--border-subtle)',
                    }}>
                      <span style={{
                        fontSize: '0.78rem',
                        color: 'var(--text-secondary)',
                        textTransform: 'capitalize',
                      }}>
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span style={{
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: typeof val === 'number' && val > 0
                          ? 'var(--accent-cyan)'
                          : 'var(--text-muted)',
                      }}>
                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Charts available count */}
            {uploadReport.charts && (
              <div className="panel" style={{
                padding: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{
                    fontSize: '1.5rem', fontWeight: 700,
                    color: 'var(--accent-cyan)',
                    lineHeight: 1,
                  }}>
                    {uploadReport.charts.length}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    marginTop: '0.2rem',
                  }}>
                    charts available
                  </div>
                </div>
                <ArrowRight size={18} color="var(--text-muted)" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadView;
