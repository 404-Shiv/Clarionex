import React, { useState, useEffect } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import ChartCard from './ChartCard';

// Full-width charts (12 cols)
const FULL_WIDTH = new Set([
  'correlation_heatmap', 'density_heatmap', 'heatmap',
  'line_chart', 'area_chart', 'stacked_area_chart',
  'waterfall_chart', 'pareto_chart', 'candlestick_chart', 'ohlc_chart',
  'data_table', 'sparkline', 'radar_chart',
]);

// Tall charts (need more vertical space)
const TALL = new Set([
  'sunburst_chart', 'treemap', 'funnel_chart', 'bullet_graph',
  'violin_plot', 'box_plot',
]);

// Small charts (indicators / KPIs)
const SMALL = new Set([
  'kpi_indicator', 'gauge_chart', 'sparkline',
]);

const getSize = (chartName) => {
  if (SMALL.has(chartName))      return { w: 4, h: 9 };
  if (FULL_WIDTH.has(chartName)) return { w: 12, h: 13 };
  if (TALL.has(chartName))       return { w: 6, h: 14 };
  return { w: 6, h: 11 };
};

const Dashboard = ({ selectedCharts, onRemoveChart }) => {
  const [layout, setLayout] = useState([]);
  const [width, setWidth] = useState(1200);

  useEffect(() => {
    let col = 0;
    let row = 0;

    const newLayout = selectedCharts.map((chart) => {
      const existing = layout.find(l => l.i === chart);
      if (existing) return existing;

      const { w, h } = getSize(chart);

      // Simple bin-packing: wrap to next row if won't fit
      if (col + w > 12) { col = 0; row += 11; }
      const entry = { i: chart, x: col, y: row, w, h, minW: 3, minH: 7 };
      col += w;
      return entry;
    });

    setLayout(newLayout);
  }, [selectedCharts]);

  useEffect(() => {
    const handleResize = () => {
      // Account for the Layout having no sidebar now
      setWidth(Math.min(window.innerWidth - 130, 1400));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!selectedCharts || selectedCharts.length === 0) return null;

  return (
    <div>
      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={30}
        width={width}
        onLayoutChange={(newLayout) => setLayout(newLayout)}
        draggableHandle=".chart-drag-handle"
        margin={[16, 16]}
        containerPadding={[0, 0]}
      >
        {selectedCharts.map(chartName => (
          <div key={chartName} style={{ overflow: 'hidden', borderRadius: '10px' }}>
            <ChartCard
              chartName={chartName}
              onRemove={() => onRemoveChart(chartName)}
            />
          </div>
        ))}
      </GridLayout>
    </div>
  );
};

export default Dashboard;
