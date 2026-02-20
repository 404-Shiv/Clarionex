
import { useState, useMemo, memo, useCallback, useEffect, useRef } from "react";
import axios from "axios";
import Plot from "react-plotly.js";

/* ─── Toast Notification ─── */
function Toast({ toasts, onDismiss }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span className="toast-icon">{t.type === "success" ? "✓" : "✕"}</span>
          <span className="toast-msg">{t.message}</span>
          <button className="toast-dismiss" onClick={() => onDismiss(t.id)}>×</button>
        </div>
      ))}
    </div>
  );
}

/* ─── Fullscreen Modal ─── */
function FullscreenModal({ chart, onClose }) {
  if (!chart) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{chart.name}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {chart.type === "table" ? (
            <div className="table-scroll modal-table-scroll">
              <table className="dash-table">
                <thead>
                  <tr>
                    {chart.columns.map((col, i) => (
                      <th key={i}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chart.rows.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td key={ci}>
                          {typeof cell === "number"
                            ? Number(cell).toLocaleString(undefined, { maximumFractionDigits: 2 })
                            : String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Plot
              data={chart.data}
              layout={{
                ...chart.layout,
                autosize: true,
                paper_bgcolor: "rgba(0,0,0,0)",
                plot_bgcolor: "rgba(245,243,237,0.3)",
                font: { family: "Inter, sans-serif", color: "#5a5a4a" },
                margin: { l: 60, r: 40, t: 50, b: 60 },
              }}
              config={{ responsive: true, displayModeBar: true, displaylogo: false }}
              useResizeHandler
              style={{ width: "100%", height: "100%" }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

const API = "http://localhost:8000";

const categoryMeta = {
  Distribution: { icon: "D", color: "#b8a88a" },
  Comparison: { icon: "C", color: "#8a9e8a" },
  Composition: { icon: "P", color: "#c4956a" },
  Relationship: { icon: "R", color: "#7a8fa0" },
  Trend: { icon: "T", color: "#a08a7a" },
  Tabular: { icon: "B", color: "#9a9a7a" },
  Geographic: { icon: "G", color: "#7a9a8a" },
  Project: { icon: "J", color: "#8a7a9a" },
};

const chartIcons = {
  "Histogram": "H", "Box Plot": "Bx", "Violin Plot": "V", "Density Plot": "Dn",
  "Bar Chart": "Ba", "Column Chart": "Co", "Side-by-Side Bar": "Sb", "Bullet Chart": "Bu",
  "Pie Chart": "Pi", "Donut Chart": "Do", "Stacked Bar": "Sk", "Stacked Column": "Sc",
  "Treemap": "Tr", "Sunburst": "Su", "Waterfall Chart": "Wf",
  "Scatter Plot": "Sp", "Bubble Chart": "Bb", "Packed Bubbles": "Pb",
  "Density Heatmap": "Dh", "Correlation Heatmap": "Ch",
  "Line Chart": "Li", "Area Chart": "Ar", "Combo Chart": "Cm", "Sparklines": "Sl",
  "Data Table": "Dt", "Matrix / Crosstab": "Mx", "Highlight Table": "Ht",
  "Symbol Map": "Sm", "Density Map": "Dm", "Filled Map": "Fm",
  "Gantt Chart": "Ga",
};

/* Plotly layout overrides, cached once */
const LAYOUT_OVERRIDES = {
  autosize: true,
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(245,243,237,0.3)",
  font: { family: "Inter, sans-serif", color: "#5a5a4a" },
  margin: { l: 50, r: 30, t: 40, b: 50 },
  colorway: ["#3d3d3d", "#8a9e8a", "#c4956a", "#b8a88a", "#7a8fa0", "#a08a7a", "#d4c4a0", "#6a7a6a"],
};
const PLOT_CONFIG = { responsive: true, displayModeBar: true, displaylogo: false };

/* Memoized Plot wrapper — stops re-rendering all charts when state changes */
const MemoPlot = memo(function MemoPlot({ data, layout }) {
  return (
    <Plot
      data={data}
      layout={{ ...layout, ...LAYOUT_OVERRIDES }}
      config={PLOT_CONFIG}
      useResizeHandler
      style={{ width: "100%", height: "100%" }}
    />
  );
});

export default function App() {
  const [charts, setCharts] = useState([]);
  const [available, setAvailable] = useState({});
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [generating, setGenerating] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [fullscreenChart, setFullscreenChart] = useState(null);
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  const addToast = useCallback((message, type = "success") => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);
  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const openFullscreen = useCallback((fig) => setFullscreenChart(fig), []);
  const closeFullscreen = useCallback(() => setFullscreenChart(null), []);

  const categories = useMemo(() => Object.keys(available), [available]);
  const totalCharts = useMemo(() => Object.values(available).flat().length, [available]);

  const uploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setUploading(true);
    setCharts([]);
    setActiveCategory(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadRes = await axios.post(`${API}/upload`, formData);
      setMeta(uploadRes.data.metadata);
      const res = await axios.get(`${API}/charts`);
      setAvailable(res.data.available_charts || {});
      const cats = Object.keys(res.data.available_charts || {});
      if (cats.length > 0) setActiveCategory(cats[0]);
    } catch (err) {
      console.error("Upload failed:", err);
    }
    setUploading(false);
  };

  /* Single chart */
  const generateChart = async (name) => {
    setGenerating(name);
    try {
      const res = await axios.get(`${API}/generate/${name}`);
      setCharts((prev) => [...prev, { name, ...res.data }]);
      addToast(`"${name}" generated successfully!`, "success");
    } catch (err) {
      console.error("Chart generation failed:", err);
      addToast(`Failed to generate "${name}"`, "error");
    }
    setGenerating("");
  };

  /* Batch generation — sends ALL chart names in one POST, gets them all back at once */
  const batchGenerate = async (chartNames) => {
    setLoading(true);
    setGenerating("batch");
    try {
      const res = await axios.post(`${API}/generate-batch`, { chart_names: chartNames });
      const results = res.data;
      const newCharts = chartNames
        .filter((name) => results[name] && !results[name].error)
        .map((name) => ({ name, ...results[name] }));
      setCharts((prev) => [...prev, ...newCharts]);
      addToast(`${newCharts.length} chart${newCharts.length !== 1 ? "s" : ""} generated successfully!`, "success");
    } catch (err) {
      console.error("Batch generation failed:", err);
      addToast("Batch generation failed. Try fewer charts.", "error");
    }
    setGenerating("");
    setLoading(false);
  };

  const generateCategory = (category) => batchGenerate(available[category] || []);

  const generateAll = () => batchGenerate(Object.values(available).flat());

  const clearCharts = () => setCharts([]);

  return (
    <div className="app-layout">
      {/* ─── Sidebar ─── */}
      <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">◈</div>
          {!sidebarCollapsed && <span className="brand-name">Clarionex</span>}
        </div>

        {/* Upload avatar area */}
        <div className="sidebar-profile">
          <label className="avatar-upload" htmlFor="csv-upload-sidebar">
            <div className="avatar-circle">
              {uploading ? (
                <div className="avatar-spinner"></div>
              ) : fileName ? (
                <span className="avatar-check">✓</span>
              ) : (
                <span className="avatar-icon">+</span>
              )}
            </div>
            <input id="csv-upload-sidebar" type="file" accept=".csv" onChange={uploadFile} hidden />
          </label>
          {!sidebarCollapsed && (
            <div className="profile-info">
              <span className="profile-greeting">{fileName ? "Dataset Loaded" : "Upload Dataset"}</span>
              <span className="profile-name">{fileName || "Click the icon above"}</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-label">{!sidebarCollapsed && "Categories"}</div>
          {categories.length > 0 ? (
            categories.map((cat) => (
              <button
                key={cat}
                className={`nav-item ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                <span className="nav-icon">{categoryMeta[cat]?.icon || "--"}</span>
                {!sidebarCollapsed && (
                  <>
                    <span className="nav-text">{cat}</span>
                    <span className="nav-badge">{available[cat].length}</span>
                  </>
                )}
              </button>
            ))
          ) : (
            <>
              <div className="nav-placeholder">
                <span className="nav-icon">D</span>
                {!sidebarCollapsed && <span className="nav-text-muted">Dashboard</span>}
              </div>
              <div className="nav-placeholder">
                <span className="nav-icon">S</span>
                {!sidebarCollapsed && <span className="nav-text-muted">Statistics</span>}
              </div>
              <div className="nav-placeholder">
                <span className="nav-icon">T</span>
                {!sidebarCollapsed && <span className="nav-text-muted">Tables</span>}
              </div>
              <div className="nav-placeholder">
                <span className="nav-icon">G</span>
                {!sidebarCollapsed && <span className="nav-text-muted">Settings</span>}
              </div>
            </>
          )}
        </nav>

        <button
          className="sidebar-toggle"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? "→" : "←"}
        </button>
      </aside>

      {/* ─── Main Content ─── */}
      <div className="main-wrapper">
        {/* Top Bar */}
        <header className="topbar">
          <div className="topbar-left">
            <h2 className="page-title">Dashboard</h2>
            <span className="page-subtitle">
              {fileName ? `Analyzing ${fileName}` : "Payments Updates"}
            </span>
          </div>
          <div className="topbar-right">
            <div className="search-box">
              <span className="search-icon">⌕</span>
              <span className="search-text">Search</span>
            </div>
          </div>
        </header>

        <div className="content-grid">
          {/* ─── Left Main Panel ─── */}
          <div className="content-main">
            {/* Stat Cards */}
            {meta ? (
              <div className="stat-cards">
                <div className="stat-card stat-card-green">
                  <div className="stat-card-top">
                    <span className="stat-icon">R</span>
                    <span className="stat-label">Rows</span>
                    <span className="stat-badge">+{meta.numeric.length}n</span>
                  </div>
                  <div className="stat-value">{meta.rows.toLocaleString()}</div>
                </div>
                <div className="stat-card stat-card-gold">
                  <div className="stat-card-top">
                    <span className="stat-icon">C</span>
                    <span className="stat-label">Columns</span>
                    <span className="stat-badge">+{meta.categorical.length}c</span>
                  </div>
                  <div className="stat-value">{meta.columns}</div>
                </div>
                <div className="stat-card stat-card-dark">
                  <div className="stat-card-top">
                    <span className="stat-icon-light">*</span>
                    <span className="stat-label-light">Charts Available</span>
                  </div>
                  <div className="stat-value-light">{totalCharts}</div>
                  <button
                    className="stat-cta"
                    onClick={generateAll}
                    disabled={loading}
                  >
                    {loading ? "Generating..." : "Generate All"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="stat-cards">
                <label className="upload-card" htmlFor="csv-upload-main">
                  <div className="upload-card-icon">+</div>
                  <div className="upload-card-text">
                    <strong>Upload a CSV to get started</strong>
                    <span>Drop your file or click to browse</span>
                  </div>
                  <input id="csv-upload-main" type="file" accept=".csv" onChange={uploadFile} hidden />
                </label>
              </div>
            )}

            {/* Active Category Chart Buttons */}
            {activeCategory && available[activeCategory] && (
              <div className="chart-selector">
                <div className="chart-selector-header">
                  <h3>{categoryMeta[activeCategory]?.icon} {activeCategory}</h3>
                  <div className="chart-selector-actions">
                    <button
                      className="btn-outline"
                      onClick={() => generateCategory(activeCategory)}
                      disabled={loading}
                    >
                      Generate {activeCategory}
                    </button>
                    {charts.length > 0 && (
                      <button className="btn-text" onClick={clearCharts}>
                        Clear All ({charts.length})
                      </button>
                    )}
                  </div>
                </div>
                <div className="chart-pills">
                  {available[activeCategory].map((chart) => (
                    <button
                      key={chart}
                      className="chart-pill"
                      onClick={() => generateChart(chart)}
                      disabled={!!generating}
                    >
                      <span>{chartIcons[chart] || "--"}</span>
                      <span>{chart}</span>
                      {generating === chart && <div className="pill-spinner"></div>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading bar */}
            {generating && (
              <div className="progress-bar">
                <div className="progress-inner"></div>
                <span className="progress-label">Generating: {generating}</span>
              </div>
            )}

            {/* Charts Grid */}
            {charts.length > 0 && (
              <div className="charts-grid">
                {charts.map((fig, index) => (
                  <div
                    key={index}
                    className={`chart-card chart-card-clickable ${["Scatter Matrix", "Correlation Heatmap", "Gantt Chart", "Sparklines",
                      "Density Heatmap", "Symbol Map", "Density Map", "Filled Map"].includes(fig.name)
                      ? "chart-card-full" : ""
                      }`}
                    onClick={() => openFullscreen(fig)}
                  >
                    <div className="chart-expand-hint">⛶ Click to expand</div>
                    <div className="chart-card-header">
                      <span className="chart-card-icon">{chartIcons[fig.name] || "--"}</span>
                      <span className="chart-card-title">{fig.name}</span>
                    </div>
                    {fig.type === "table" ? (
                      <div className="table-scroll">
                        <table className="dash-table">
                          <thead>
                            <tr>
                              {fig.columns.map((col, i) => (
                                <th key={i}>{col}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {fig.rows.map((row, ri) => (
                              <tr key={ri}>
                                {row.map((cell, ci) => (
                                  <td key={ci}>
                                    {typeof cell === "number"
                                      ? Number(cell).toLocaleString(undefined, { maximumFractionDigits: 2 })
                                      : String(cell)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <MemoPlot
                        data={fig.data}
                        layout={fig.layout}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {categories.length > 0 && charts.length === 0 && !generating && (
              <div className="empty-state">
                <div className="empty-illustration">No charts yet</div>
                <p className="empty-text">Select charts above or generate an entire category</p>
                <p className="empty-sub">Data Updates Every 3 Hours &nbsp;&nbsp;|&nbsp;&nbsp; View All Charts</p>
              </div>
            )}
          </div>

          {/* ─── Right Panel ─── */}
          <div className="content-right">
            {/* Summary donut placeholder */}
            {meta && (
              <div className="right-card">
                <div className="right-card-header">
                  <h4>Data Overview</h4>
                  <span className="right-card-sub">Column breakdown</span>
                </div>
                <div className="donut-container">
                  <svg viewBox="0 0 120 120" className="donut-svg">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#e8e4da" strokeWidth="14" />
                    <circle
                      cx="60" cy="60" r="50" fill="none"
                      stroke="#8a9e8a" strokeWidth="14"
                      strokeDasharray={`${(meta.numeric.length / meta.columns) * 314} 314`}
                      strokeDashoffset="0"
                      transform="rotate(-90 60 60)"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="60" cy="60" r="50" fill="none"
                      stroke="#c4956a" strokeWidth="14"
                      strokeDasharray={`${(meta.categorical.length / meta.columns) * 314} 314`}
                      strokeDashoffset={`-${(meta.numeric.length / meta.columns) * 314}`}
                      transform="rotate(-90 60 60)"
                      strokeLinecap="round"
                    />
                    <text x="60" y="55" textAnchor="middle" className="donut-total-label">Total</text>
                    <text x="60" y="72" textAnchor="middle" className="donut-total-value">{meta.columns}</text>
                  </svg>
                </div>
                <div className="donut-legend">
                  <div className="legend-item">
                    <span className="legend-dot" style={{ background: "#8a9e8a" }}></span>
                    <span className="legend-label">Numeric</span>
                    <span className="legend-value">{Math.round((meta.numeric.length / meta.columns) * 100)}%</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot" style={{ background: "#c4956a" }}></span>
                    <span className="legend-label">Categorical</span>
                    <span className="legend-value">{Math.round((meta.categorical.length / meta.columns) * 100)}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Generated Charts List */}
            {charts.length > 0 && (
              <div className="right-card">
                <div className="right-card-header">
                  <h4>Generated Charts</h4>
                  <button className="see-all-link" onClick={clearCharts}>Clear</button>
                </div>
                <div className="recent-list">
                  {charts.map((fig, i) => (
                    <div key={i} className="recent-item">
                      <div className="recent-avatar" style={{
                        background: Object.values(categoryMeta)[i % Object.values(categoryMeta).length]?.color || "#b8a88a"
                      }}>
                        {chartIcons[fig.name] || "--"}
                      </div>
                      <div className="recent-info">
                        <span className="recent-name">{fig.name}</span>
                        <span className="recent-time">{fig.type === "table" ? "Table" : "Chart"}</span>
                      </div>
                      <span className="recent-status">✓</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Column names list */}
            {meta && (
              <div className="right-card">
                <div className="right-card-header">
                  <h4>Columns</h4>
                  <span className="right-card-sub">See All</span>
                </div>
                <div className="column-list">
                  {meta.numeric.map((col) => (
                    <div key={col} className="column-tag numeric"># {col}</div>
                  ))}
                  {meta.categorical.map((col) => (
                    <div key={col} className="column-tag categorical">◈ {col}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      <FullscreenModal chart={fullscreenChart} onClose={closeFullscreen} />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
