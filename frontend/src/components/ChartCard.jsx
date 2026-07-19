import React, { useEffect, useState } from 'react';
import Plotly from 'plotly.js-dist';
import createPlotlyComponent from 'react-plotly.js/factory';
const Plot = createPlotlyComponent(Plotly);
import { generateChart } from '../api';
import { X, GripHorizontal } from 'lucide-react';

const ChartCard = ({ chartName, onRemove }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setChartData(null);

    generateChart(chartName)
      .then(response => {
        if (!cancelled) setChartData(response.chart);
      })
      .catch(err => {
        if (!cancelled) setError('Could not render this chart for the current dataset.');
        console.error('Chart error:', chartName, err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [chartName]);

  return (
    <div style={{
      height: '100%',
      width: '100%',
      overflow: 'hidden',
      position: 'relative',
      background: '#1c1c1f',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '10px',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Drag handle bar */}
      <div
        className="chart-drag-handle"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem 0.75rem',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          cursor: 'grab',
          flexShrink: 0,
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <GripHorizontal size={14} color="rgba(148,163,184,0.4)" />
          <span style={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.5)', letterSpacing: '0.05em' }}>
            {chartName.replace(/_/g, ' ').toUpperCase()}
          </span>
        </div>
        <button
          onClick={onRemove}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(148,163,184,0.35)',
            cursor: 'pointer',
            padding: '0.1rem',
            display: 'flex',
            alignItems: 'center',
            transition: 'color 0.15s',
          }}
          onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
          onMouseOut={(e) => e.currentTarget.style.color = 'rgba(148,163,184,0.35)'}
          title="Remove chart"
        >
          <X size={15} />
        </button>
      </div>

      {/* Chart body */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        {loading && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
          }}>
            <div style={{
              width: '28px', height: '28px',
              border: '2px solid rgba(6,214,160,0.2)',
              borderTop: '2px solid var(--accent-cyan)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <span style={{ fontSize: '0.75rem', color: 'rgba(148,163,184,0.5)' }}>Rendering…</span>
          </div>
        )}

        {error && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(239,68,68,0.7)', fontSize: '0.8rem', padding: '1rem', textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        {chartData && !loading && !error && (
          <Plot
            data={chartData.data}
            layout={{
              ...chartData.layout,
              autosize: true,
              margin: { l: 42, r: 20, t: 42, b: 40 },
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'transparent',
            }}
            config={{ responsive: true, displayModeBar: false }}
            useResizeHandler
            style={{ width: '100%', height: '100%' }}
          />
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { 100% { transform: rotate(360deg); } }` }} />
    </div>
  );
};

export default ChartCard;
