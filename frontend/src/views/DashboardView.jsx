import React, { useState, useRef } from 'react';
import {
  BarChart2, Download, FileDown, Image, FileText,
  Upload, ChevronDown
} from 'lucide-react';
import ChartSelector from '../components/ChartSelector';
import Dashboard from '../components/Dashboard';

const DashboardView = ({ uploadReport, selectedCharts, onSelectChart, onRemoveChart, onGoUpload }) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportRef = useRef(null);

  /* ── Export: download all visible charts as PNGs ── */
  const exportChartsAsPNG = async () => {
    setShowExportMenu(false);
    const chartElements = document.querySelectorAll('.js-plotly-plot');
    if (chartElements.length === 0) {
      alert('No charts to export. Select charts first.');
      return;
    }

    for (let i = 0; i < chartElements.length; i++) {
      try {
        const Plotly = (await import('plotly.js-dist')).default;
        await Plotly.downloadImage(chartElements[i], {
          format: 'png',
          width: 1200,
          height: 700,
          filename: `clarionex_chart_${i + 1}`,
        });
      } catch (err) {
        console.error('Export PNG failed for chart', i, err);
      }
    }
  };

  /* ── Export: download all charts as SVG ── */
  const exportChartsAsSVG = async () => {
    setShowExportMenu(false);
    const chartElements = document.querySelectorAll('.js-plotly-plot');
    if (chartElements.length === 0) {
      alert('No charts to export. Select charts first.');
      return;
    }

    for (let i = 0; i < chartElements.length; i++) {
      try {
        const Plotly = (await import('plotly.js-dist')).default;
        await Plotly.downloadImage(chartElements[i], {
          format: 'svg',
          width: 1200,
          height: 700,
          filename: `clarionex_chart_${i + 1}`,
        });
      } catch (err) {
        console.error('Export SVG failed for chart', i, err);
      }
    }
  };

  /* ── Export: download chart data as CSV ── */
  const exportDataAsCSV = () => {
    setShowExportMenu(false);
    if (!uploadReport) return;

    // Build a summary CSV from the dataset info
    const lines = [];
    lines.push('Clarionex AI — Export Summary');
    lines.push(`File: ${uploadReport.filename}`);
    lines.push(`Date: ${new Date().toISOString()}`);
    lines.push('');

    if (uploadReport.dataset_info) {
      lines.push('Dataset Info');
      lines.push(`Rows,${uploadReport.dataset_info.rows}`);
      lines.push(`Columns,${uploadReport.dataset_info.columns}`);
      lines.push(`Numeric Columns,${uploadReport.dataset_info.numeric}`);
      lines.push(`Categorical Columns,${uploadReport.dataset_info.categorical}`);
      lines.push(`Date Columns,${uploadReport.dataset_info.date || 0}`);
      lines.push('');
    }

    if (uploadReport.cleaning_report) {
      lines.push('Cleaning Report');
      Object.entries(uploadReport.cleaning_report).forEach(([k, v]) => {
        lines.push(`${k.replace(/_/g, ' ')},${typeof v === 'object' ? JSON.stringify(v) : v}`);
      });
      lines.push('');
    }

    lines.push('Selected Charts');
    selectedCharts.forEach((c, i) => {
      lines.push(`${i + 1},${c.replace(/_/g, ' ')}`);
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clarionex_report_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ── Export: download as JSON report ── */
  const exportAsJSON = () => {
    setShowExportMenu(false);
    if (!uploadReport) return;

    const report = {
      app: 'Clarionex AI',
      exportedAt: new Date().toISOString(),
      filename: uploadReport.filename,
      datasetInfo: uploadReport.dataset_info,
      cleaningReport: uploadReport.cleaning_report,
      selectedCharts: selectedCharts,
      availableCharts: uploadReport.charts?.map(c =>
        typeof c === 'string' ? c : c.name
      ),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clarionex_report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Close menu on outside click
  React.useEffect(() => {
    const handler = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ═══ No data uploaded yet ═══ */
  if (!uploadReport) {
    return (
      <div className="animate-fade-in" style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
      }}>
        <div style={{
          width: 72, height: 72,
          borderRadius: '50%',
          background: 'rgba(29, 242, 164, 0.06)',
          border: '1px solid var(--accent-cyan-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
        }}>
          <BarChart2 size={28} color="var(--accent-cyan)" style={{ opacity: 0.6 }} />
        </div>
        <h2 style={{
          fontSize: '1.4rem', fontWeight: 600,
          color: '#fff', marginBottom: '0.5rem',
        }}>
          No Dataset Loaded
        </h2>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.88rem',
          marginBottom: '1.5rem',
          maxWidth: '400px',
        }}>
          Upload a CSV file first to generate charts and visualize your data.
        </p>
        <button
          onClick={onGoUpload}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'var(--accent-cyan)',
            color: '#000',
            padding: '0.65rem 1.5rem',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 700,
            fontSize: '0.85rem',
            boxShadow: '0 2px 12px rgba(29, 242, 164, 0.2)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(29, 242, 164, 0.35)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 2px 12px rgba(29, 242, 164, 0.2)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Upload size={16} />
          Go to Upload
        </button>
      </div>
    );
  }

  /* ═══ Dashboard with data ═══ */
  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>

      {/* ── Header + Export ───────────────────── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1.75rem',
      }}>
        <div>
          <h2 style={{
            fontSize: '2rem', fontWeight: 700,
            marginBottom: '0.4rem', color: '#fff',
          }}>
            Dashboard
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Select charts to visualize · Export your results in any format.
          </p>
        </div>

        {/* Export dropdown */}
        <div ref={exportRef} style={{ position: 'relative' }}>
          <button
            id="export-btn"
            onClick={() => setShowExportMenu(!showExportMenu)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 1.1rem',
              background: selectedCharts.length > 0
                ? 'var(--accent-cyan)'
                : 'var(--bg-card)',
              border: selectedCharts.length > 0
                ? 'none'
                : '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)',
              color: selectedCharts.length > 0 ? '#000' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.82rem',
              transition: 'all 0.15s',
              boxShadow: selectedCharts.length > 0
                ? '0 2px 10px rgba(29, 242, 164, 0.2)'
                : 'none',
            }}
          >
            <Download size={15} />
            Export
            <ChevronDown size={14} style={{
              transform: showExportMenu ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }} />
          </button>

          {/* Dropdown menu */}
          {showExportMenu && (
            <div className="animate-fade-in-scale" style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              width: '220px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-elevated)',
              overflow: 'hidden',
              zIndex: 50,
            }}>
              {[
                { label: 'Export as PNG', desc: 'Download chart images', icon: Image, action: exportChartsAsPNG, disabled: selectedCharts.length === 0 },
                { label: 'Export as SVG', desc: 'Vector chart images', icon: FileDown, action: exportChartsAsSVG, disabled: selectedCharts.length === 0 },
                { label: 'Export as CSV', desc: 'Dataset summary report', icon: FileText, action: exportDataAsCSV, disabled: false },
                { label: 'Export as JSON', desc: 'Full analysis report', icon: FileDown, action: exportAsJSON, disabled: false },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={item.action}
                    disabled={item.disabled}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.7rem',
                      padding: '0.7rem 1rem',
                      background: 'transparent',
                      color: item.disabled ? 'var(--text-dim)' : 'var(--text-primary)',
                      fontSize: '0.82rem',
                      textAlign: 'left',
                      cursor: item.disabled ? 'not-allowed' : 'pointer',
                      borderBottom: idx < 3 ? '1px solid var(--border-subtle)' : 'none',
                      transition: 'background 0.1s',
                      opacity: item.disabled ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!item.disabled) e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <Icon size={16} style={{
                      color: item.disabled ? 'var(--text-dim)' : 'var(--accent-cyan)',
                      flexShrink: 0,
                    }} />
                    <div>
                      <div style={{ fontWeight: 600 }}>{item.label}</div>
                      <div style={{
                        fontSize: '0.68rem',
                        color: 'var(--text-muted)',
                        marginTop: '0.05rem',
                      }}>
                        {item.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Dataset pill ─────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        padding: '0.75rem 1.1rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '1.75rem',
        flexWrap: 'wrap',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <div style={{
            width: 8, height: 8,
            borderRadius: '50%',
            background: 'var(--accent-cyan)',
          }} />
          <span style={{
            fontSize: '0.82rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}>
            {uploadReport.filename}
          </span>
        </div>
        {uploadReport.dataset_info && (
          <>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {uploadReport.dataset_info.rows} rows
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {uploadReport.dataset_info.columns} columns
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {uploadReport.dataset_info.numeric} numeric · {uploadReport.dataset_info.categorical} categorical
            </span>
          </>
        )}
      </div>

      {/* ── Suggested Charts ─────────────────── */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
        }}>
          <div>
            <h3 style={{
              fontSize: '1.1rem', color: '#fff', marginBottom: '0.2rem',
            }}>
              <span style={{ color: 'var(--accent-cyan)' }}>Suggested</span> Charts
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Click a card to render it — click again to remove it from the view.
            </p>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--accent-cyan-dim)',
            border: '1px solid var(--accent-cyan-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.4rem 0.8rem',
            fontSize: '0.75rem',
            color: 'var(--accent-cyan)',
            fontWeight: 600,
          }}>
            <BarChart2 size={14} />
            {selectedCharts.length} chart{selectedCharts.length !== 1 ? 's' : ''} selected
          </div>
        </div>
        <ChartSelector
          charts={uploadReport.charts}
          selectedCharts={selectedCharts}
          onSelectChart={onSelectChart}
        />
      </div>

      {/* ── Analytics Grid ───────────────────── */}
      {selectedCharts.length > 0 && (
        <div>
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
            <span style={{
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              marginLeft: 'auto',
            }}>
              Drag to reposition · Resize from corners
            </span>
          </div>
          <Dashboard
            selectedCharts={selectedCharts}
            onRemoveChart={onRemoveChart}
          />
        </div>
      )}

      {/* ── Empty state ──────────────────────── */}
      {selectedCharts.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem 2rem',
          background: 'var(--bg-card)',
          border: '1px dashed var(--border-medium)',
          borderRadius: 'var(--radius-lg)',
          color: 'var(--text-muted)',
        }}>
          <BarChart2 size={36} style={{ opacity: 0.25, marginBottom: '0.75rem' }} />
          <p style={{ fontSize: '0.88rem' }}>
            Select one or more charts above to start visualizing
          </p>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
