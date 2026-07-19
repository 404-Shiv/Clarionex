import React, { useState } from 'react';
import {
  BarChart2, BarChart3, ScatterChart, PieChart,
  Activity, TrendingUp, Layers, BoxSelect,
  Grid3X3, Flame, LayoutGrid, Mountain,
  Circle, Filter, Table, AlignLeft, AlignCenter,
  Type, Gauge, CheckCircle2, Sparkles, PlusCircle
} from 'lucide-react';

const iconMap = {
  bar_chart_3:       <BarChart3 size={20} />,
  bar_chart_2:       <BarChart2 size={20} />,
  box_select:        <BoxSelect size={20} />,
  activity:          <Activity size={20} />,
  grid_3x3:          <Grid3X3 size={20} />,
  scatter_chart:     <ScatterChart size={20} />,
  flame:             <Flame size={20} />,
  layers:            <Layers size={20} />,
  layout_grid:       <LayoutGrid size={20} />,
  pie_chart:         <PieChart size={20} />,
  trending_up:       <TrendingUp size={20} />,
  mountain:          <Mountain size={20} />,
  circle:            <Circle size={20} />,
  circle_dot:        <Circle size={20} />,
  filter:            <Filter size={20} />,
  table:             <Table size={20} />,
  align_left:        <AlignLeft size={20} />,
  align_center:      <AlignCenter size={20} />,
  type:              <Type size={20} />,
  gauge:             <Gauge size={20} />,
  radar:             <Activity size={20} />,
  candlestick_chart: <BarChart2 size={20} />,
};

// Icon accent colors
const iconColor = (name, selected) => {
  if (selected) return '#06d6a0';
  const warm = new Set(['flame', 'pie_chart', 'type', 'candlestick_chart', 'gauge']);
  const purple = new Set(['grid_3x3', 'box_select', 'layers', 'align_center', 'radar']);
  if (warm.has(name)) return '#f59e0b';
  if (purple.has(name)) return '#a855f7';
  return '#94a3b8';
};

const ALL_SUPPORTED_CHARTS = [
  { name: "histogram", label: "Histogram", icon: "bar_chart_3", description: "Distribution of numeric columns" },
  { name: "box_plot", label: "Box Plot (Whisker)", icon: "box_select", description: "Statistical distribution of numeric columns" },
  { name: "density_plot", label: "Density Plot", icon: "activity", description: "Probability density of numeric columns" },
  { name: "kpi_indicator", label: "KPI Indicator", icon: "trending_up", description: "Big number summary for numeric columns" },
  { name: "gauge_chart", label: "Gauge Chart", icon: "gauge", description: "Gauge dial for numeric columns" },
  { name: "bullet_graph", label: "Bullet Graph", icon: "align_left", description: "Bullet performance chart for numeric columns" },
  { name: "violin_plot", label: "Violin Plot", icon: "align_center", description: "Distribution shape of numeric columns" },
  { name: "sparkline", label: "Sparkline", icon: "trending_up", description: "Compact trend line for numeric columns" },
  { name: "scatter_plot", label: "Scatter Plot", icon: "scatter_chart", description: "Correlation of two numeric columns" },
  { name: "correlation_heatmap", label: "Heatmap", icon: "grid_3x3", description: "Correlation between numeric columns" },
  { name: "bubble_chart", label: "Bubble Chart", icon: "circle_dot", description: "Three-dimensional scatter plot variation" },
  { name: "density_heatmap", label: "Density Heatmap", icon: "flame", description: "Density of two numeric columns" },
  { name: "waterfall_chart", label: "Waterfall Chart", icon: "bar_chart_2", description: "Cumulative change of a numeric column" },
  { name: "pareto_chart", label: "Pareto Chart", icon: "layers", description: "80/20 analysis of a column" },
  { name: "bar_chart", label: "Bar Chart", icon: "bar_chart_2", description: "Average values by categorical keys" },
  { name: "horizontal_bar_chart", label: "Horizontal Bar Chart", icon: "bar_chart_2", description: "Horizontal bar category layout" },
  { name: "treemap", label: "Treemap", icon: "layout_grid", description: "Proportional view of categories" },
  { name: "funnel_chart", label: "Funnel Chart", icon: "filter", description: "Stage funnel representation of data" },
  { name: "radar_chart", label: "Radar Chart", icon: "radar", description: "Spider chart across categories" },
  { name: "stacked_bar_chart", label: "Stacked Bar Chart", icon: "bar_chart_3", description: "Stacked values across categories" },
  { name: "grouped_bar_chart", label: "Grouped Bar Chart", icon: "bar_chart_3", description: "Grouped comparative category values" },
  { name: "sunburst_chart", label: "Sunburst Chart", icon: "circle", description: "Hierarchical circle of categories" },
  { name: "pie_chart", label: "Pie Chart", icon: "pie_chart", description: "Proportion of categorical values" },
  { name: "donut_chart", label: "Donut Chart", icon: "circle", description: "Donut view of categorical values" },
  { name: "word_cloud", label: "Word Cloud", icon: "type", description: "Frequency of categorical values" },
  { name: "line_chart", label: "Line Chart", icon: "trending_up", description: "Trend visualization over time/indices" },
  { name: "area_chart", label: "Area Chart", icon: "mountain", description: "Cumulative area trend over time" },
  { name: "stacked_area_chart", label: "Stacked Area Chart", icon: "mountain", description: "Stacked area trend over time" },
  { name: "candlestick_chart", label: "Candlestick Chart", icon: "candlestick_chart", description: "OHLC stock chart" },
  { name: "ohlc_chart", label: "OHLC Chart", icon: "candlestick_chart", description: "Open-High-Low-Close stock chart" },
  { name: "data_table", label: "Data Table", icon: "table", description: "Full tabular preview of the dataset" }
];

const ChartSelector = ({ charts, selectedCharts, onSelectChart }) => {
  const [activeTab, setActiveTab] = useState('suggested'); // 'suggested' or 'all'

  // Filter backend suggested charts
  const suggestedCharts = charts || [];

  const displayCharts = activeTab === 'suggested' ? suggestedCharts : ALL_SUPPORTED_CHARTS;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        padding: '0.25rem',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-md)',
        width: 'fit-content',
      }}>
        <button
          onClick={() => setActiveTab('suggested')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: activeTab === 'suggested' ? 'var(--accent-cyan-dim)' : 'transparent',
            color: activeTab === 'suggested' ? 'var(--text-primary)' : 'var(--text-muted)',
            transition: 'all 0.15s ease',
          }}
        >
          <Sparkles size={14} color={activeTab === 'suggested' ? 'var(--accent-cyan)' : 'currentColor'} />
          Suggested Charts ({suggestedCharts.length})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: activeTab === 'all' ? 'var(--accent-cyan-dim)' : 'transparent',
            color: activeTab === 'all' ? 'var(--text-primary)' : 'var(--text-muted)',
            transition: 'all 0.15s ease',
          }}
        >
          <PlusCircle size={14} color={activeTab === 'all' ? 'var(--accent-cyan)' : 'currentColor'} />
          All Supported Charts ({ALL_SUPPORTED_CHARTS.length})
        </button>
      </div>

      {/* Grid */}
      {displayCharts.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '2.5rem',
          color: 'var(--text-secondary)',
          background: 'rgba(255,255,255,0.01)',
          border: '1px dashed var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
        }}>
          No chart suggestions available for this dataset. Click "All Supported Charts" tab above to manually add any chart.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
          gap: '0.9rem',
        }}>
          {displayCharts.map((chart) => {
            const name = typeof chart === 'string' ? chart : chart.name;
            const label = typeof chart === 'string' ? name.replace(/_/g, ' ') : chart.label;
            const description = typeof chart === 'object' ? chart.description : '';
            const icon = typeof chart === 'object' ? chart.icon : 'activity';
            const isSelected = selectedCharts.includes(name);

            return (
              <button
                key={name}
                onClick={() => onSelectChart(name)}
                style={{
                  all: 'unset',
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.8rem',
                  padding: '1rem',
                  cursor: 'pointer',
                  borderRadius: '10px',
                  border: isSelected
                    ? '1.5px solid var(--accent-cyan)'
                    : '1px solid rgba(255,255,255,0.07)',
                  background: isSelected
                    ? 'rgba(6,214,160,0.06)'
                    : 'rgba(255,255,255,0.02)',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  }
                }}
              >
                {/* Icon */}
                <div style={{
                  width: 36, height: 36, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '8px',
                  background: isSelected ? 'rgba(6,214,160,0.12)' : 'rgba(255,255,255,0.05)',
                  color: iconColor(icon, isSelected),
                  transition: 'all 0.15s',
                }}>
                  {iconMap[icon] || <Activity size={20} />}
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: isSelected ? '#fff' : '#cbd5e1',
                    marginBottom: '0.2rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {label}
                  </div>
                  <div style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {description}
                  </div>
                </div>

                {/* Check badge */}
                {isSelected && (
                  <CheckCircle2
                    size={16}
                    color="var(--accent-cyan)"
                    style={{ position: 'absolute', top: '0.6rem', right: '0.6rem', flexShrink: 0 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChartSelector;
