"""
Clarionex – Chart Engine
Suggests and generates Plotly charts based on dataset metadata.
Supports 35 chart types.
"""

import json
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
import numpy as np


# Custom color palette matching the Clarionex UI
CLARIONEX_COLORS = [
    "#06d6a0", "#7c3aed", "#3b82f6", "#f59e0b", "#ef4444",
    "#ec4899", "#14b8a6", "#8b5cf6", "#06b6d4", "#f97316",
]

DARK_TEMPLATE = "plotly_dark"


def suggest_charts(metadata: dict) -> list[dict]:
    """
    Suggest available chart types based on dataset metadata.
    Returns a list of dicts with name, icon, and description.
    """
    charts = []
    num_cols = metadata["numeric_columns"]
    cat_cols = metadata["categorical_columns"]
    date_cols = metadata["date_columns"]

    # --- Charts requiring at least 1 numeric column ---
    if len(num_cols) >= 1:
        charts.append({"name": "histogram", "label": "Histogram", "icon": "bar_chart_3", "description": f"Distribution of {num_cols[0]}"})
        charts.append({"name": "box_plot", "label": "Box Plot (Whisker)", "icon": "box_select", "description": "Statistical distribution of numeric columns"})
        charts.append({"name": "density_plot", "label": "Density Plot", "icon": "activity", "description": f"Probability density of {num_cols[0]}"})
        charts.append({"name": "kpi_indicator", "label": "KPI Indicator", "icon": "trending_up", "description": f"Big number summary for {num_cols[0]}"})
        charts.append({"name": "gauge_chart", "label": "Gauge Chart", "icon": "gauge", "description": f"Gauge dial for {num_cols[0]}"})
        charts.append({"name": "bullet_graph", "label": "Bullet Graph", "icon": "align_left", "description": f"Bullet performance chart for {num_cols[0]}"})
        charts.append({"name": "violin_plot", "label": "Violin Plot", "icon": "align_center", "description": f"Distribution shape of {num_cols[0]}"})
        charts.append({"name": "sparkline", "label": "Sparkline", "icon": "trending_up", "description": f"Compact trend line for {num_cols[0]}"})

    # --- Charts requiring at least 2 numeric columns ---
    if len(num_cols) >= 2:
        charts.append({"name": "scatter_plot", "label": "Scatter Plot", "icon": "scatter_chart", "description": f"{num_cols[0]} vs {num_cols[1]}"})
        charts.append({"name": "correlation_heatmap", "label": "Heatmap", "icon": "grid_3x3", "description": "Correlation between numeric columns"})
        charts.append({"name": "bubble_chart", "label": "Bubble Chart", "icon": "circle_dot", "description": f"{num_cols[0]} vs {num_cols[1]} sized by {num_cols[min(2, len(num_cols)-1)]}"})
        charts.append({"name": "density_heatmap", "label": "Density Heatmap", "icon": "flame", "description": f"Density of {num_cols[0]} vs {num_cols[1]}"})
        charts.append({"name": "waterfall_chart", "label": "Waterfall Chart", "icon": "bar_chart_2", "description": f"Cumulative change of {num_cols[0]}"})
        charts.append({"name": "pareto_chart", "label": "Pareto Chart", "icon": "layers", "description": f"80/20 analysis of {num_cols[0]}"})

    # --- Charts requiring categorical + numeric ---
    if len(cat_cols) >= 1 and len(num_cols) >= 1:
        charts.append({"name": "bar_chart", "label": "Bar Chart", "icon": "bar_chart_2", "description": f"Average {num_cols[0]} by {cat_cols[0]}"})
        charts.append({"name": "horizontal_bar_chart", "label": "Horizontal Bar Chart", "icon": "bar_chart_2", "description": f"Horizontal average {num_cols[0]} by {cat_cols[0]}"})
        charts.append({"name": "treemap", "label": "Treemap", "icon": "layout_grid", "description": f"Proportional view of {cat_cols[0]}"})
        charts.append({"name": "funnel_chart", "label": "Funnel Chart", "icon": "filter", "description": f"Stage funnel of {cat_cols[0]}"})
        charts.append({"name": "radar_chart", "label": "Radar Chart", "icon": "radar", "description": f"Spider chart across {cat_cols[0]}"})

    # --- Charts requiring 2+ categorical columns or 2+ numeric + categorical ---
    if len(cat_cols) >= 2 and len(num_cols) >= 1:
        charts.append({"name": "stacked_bar_chart", "label": "Stacked Bar Chart", "icon": "bar_chart_3", "description": f"Stacked {num_cols[0]} by {cat_cols[0]} and {cat_cols[1]}"})
        charts.append({"name": "grouped_bar_chart", "label": "Grouped Bar Chart", "icon": "bar_chart_3", "description": f"Grouped {num_cols[0]} by {cat_cols[0]}"})
        charts.append({"name": "sunburst_chart", "label": "Sunburst Chart", "icon": "circle", "description": f"Hierarchical {cat_cols[0]} → {cat_cols[1]}"})

    # --- Charts requiring at least 1 categorical column ---
    if len(cat_cols) >= 1:
        charts.append({"name": "pie_chart", "label": "Pie Chart", "icon": "pie_chart", "description": f"Proportion of {cat_cols[0]}"})
        charts.append({"name": "donut_chart", "label": "Donut Chart", "icon": "circle", "description": f"Donut view of {cat_cols[0]}"})
        charts.append({"name": "word_cloud", "label": "Word Cloud", "icon": "type", "description": f"Frequency of {cat_cols[0]} values"})
        charts.append({"name": "data_table", "label": "Data Table", "icon": "table", "description": "Tabular view of the dataset"})

    # --- Charts requiring time series or 2+ numeric (trend) ---
    if date_cols or len(num_cols) >= 2:
        charts.append({"name": "line_chart", "label": "Line Chart", "icon": "trending_up", "description": "Trend visualization over index/time"})
        charts.append({"name": "area_chart", "label": "Area Chart", "icon": "mountain", "description": "Cumulative area trend"})
        charts.append({"name": "stacked_area_chart", "label": "Stacked Area Chart", "icon": "mountain", "description": "Stacked area trend visualization"})

    # --- OHLC/Candlestick: need at least 4 numeric columns ---
    if len(num_cols) >= 4:
        charts.append({"name": "candlestick_chart", "label": "Candlestick Chart", "icon": "candlestick_chart", "description": f"OHLC from first 4 numeric columns"})
        charts.append({"name": "ohlc_chart", "label": "OHLC Chart", "icon": "candlestick_chart", "description": f"Open-High-Low-Close chart"})

    # --- Always available ---
    charts.append({"name": "data_table", "label": "Data Table", "icon": "table", "description": "Full tabular view of the dataset"})

    # Deduplicate by name
    seen = set()
    deduped = []
    for c in charts:
        if c["name"] not in seen:
            seen.add(c["name"])
            deduped.append(c)

    return deduped


def _apply_dark_layout(fig: go.Figure, title: str) -> go.Figure:
    """Apply consistent dark styling to a Plotly figure."""
    fig.update_layout(
        template=DARK_TEMPLATE,
        title=dict(
            text=title,
            font=dict(size=18, color="#e2e8f0", family="Inter, sans-serif"),
            x=0.05,
        ),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(color="#94a3b8", family="Inter, sans-serif"),
        margin=dict(l=50, r=30, t=60, b=50),
        legend=dict(
            bgcolor="rgba(0,0,0,0)",
            font=dict(color="#94a3b8"),
        ),
        colorway=CLARIONEX_COLORS,
    )
    fig.update_xaxes(gridcolor="rgba(148,163,184,0.1)", zeroline=False)
    fig.update_yaxes(gridcolor="rgba(148,163,184,0.1)", zeroline=False)
    return fig


def generate_chart(chart_name: str, df: pd.DataFrame, metadata: dict) -> dict:
    """
    Generate a Plotly chart and return it as a JSON-serializable dict.
    """
    num_cols = metadata["numeric_columns"]
    cat_cols = metadata["categorical_columns"]
    date_cols = metadata["date_columns"]

    fig = None

    # ── Bar Chart ──────────────────────────────────────────────────────────
    if chart_name == "bar_chart" and cat_cols and num_cols:
        cat_col, num_col = cat_cols[0], num_cols[0]
        top_cats = df[cat_col].value_counts().head(15).index
        agg = df[df[cat_col].isin(top_cats)].groupby(cat_col, as_index=False)[num_col].mean().sort_values(num_col, ascending=False)
        fig = px.bar(agg, x=cat_col, y=num_col, color=num_col, color_continuous_scale=["#7c3aed", "#06d6a0"])
        fig = _apply_dark_layout(fig, f"Bar Chart – Avg {num_col} by {cat_col}")

    # ── Stacked Bar Chart ──────────────────────────────────────────────────
    elif chart_name == "stacked_bar_chart" and len(cat_cols) >= 2 and num_cols:
        cat1, cat2, num_col = cat_cols[0], cat_cols[1], num_cols[0]
        top_cats = df[cat1].value_counts().head(10).index
        agg = df[df[cat1].isin(top_cats)].groupby([cat1, cat2], as_index=False)[num_col].sum()
        fig = px.bar(agg, x=cat1, y=num_col, color=cat2, barmode="stack", color_discrete_sequence=CLARIONEX_COLORS)
        fig = _apply_dark_layout(fig, f"Stacked Bar – {num_col} by {cat1} & {cat2}")

    # ── Grouped Bar Chart ──────────────────────────────────────────────────
    elif chart_name == "grouped_bar_chart" and len(cat_cols) >= 2 and num_cols:
        cat1, cat2, num_col = cat_cols[0], cat_cols[1], num_cols[0]
        top_cats = df[cat1].value_counts().head(8).index
        agg = df[df[cat1].isin(top_cats)].groupby([cat1, cat2], as_index=False)[num_col].mean()
        fig = px.bar(agg, x=cat1, y=num_col, color=cat2, barmode="group", color_discrete_sequence=CLARIONEX_COLORS)
        fig = _apply_dark_layout(fig, f"Grouped Bar – {num_col} by {cat1}")

    # ── Horizontal Bar Chart ───────────────────────────────────────────────
    elif chart_name == "horizontal_bar_chart" and cat_cols and num_cols:
        cat_col, num_col = cat_cols[0], num_cols[0]
        top_cats = df[cat_col].value_counts().head(15).index
        agg = df[df[cat_col].isin(top_cats)].groupby(cat_col, as_index=False)[num_col].mean().sort_values(num_col)
        fig = px.bar(agg, y=cat_col, x=num_col, orientation="h", color=num_col, color_continuous_scale=["#7c3aed", "#06d6a0"])
        fig = _apply_dark_layout(fig, f"Horizontal Bar – {num_col} by {cat_col}")

    # ── Line Chart ─────────────────────────────────────────────────────────
    elif chart_name == "line_chart":
        if date_cols and num_cols:
            fig = px.line(df.sort_values(date_cols[0]), x=date_cols[0], y=num_cols[0], color_discrete_sequence=[CLARIONEX_COLORS[0]])
            fig = _apply_dark_layout(fig, f"Line – {num_cols[0]} Over Time")
        elif len(num_cols) >= 2:
            fig = px.line(df, x=df.index, y=num_cols[:4], color_discrete_sequence=CLARIONEX_COLORS)
            fig = _apply_dark_layout(fig, "Line Chart – Numeric Trends")

    # ── Area Chart ─────────────────────────────────────────────────────────
    elif chart_name == "area_chart":
        if date_cols and num_cols:
            fig = px.area(df.sort_values(date_cols[0]), x=date_cols[0], y=num_cols[0], color_discrete_sequence=[CLARIONEX_COLORS[0]])
            fig = _apply_dark_layout(fig, f"Area – {num_cols[0]} Over Time")
        elif len(num_cols) >= 2:
            fig = px.area(df, x=df.index, y=num_cols[:4], color_discrete_sequence=CLARIONEX_COLORS)
            fig = _apply_dark_layout(fig, "Area Chart – Numeric Trends")

    # ── Stacked Area Chart ─────────────────────────────────────────────────
    elif chart_name == "stacked_area_chart":
        if date_cols and num_cols:
            cols = num_cols[:4]
            fig = px.area(df.sort_values(date_cols[0]), x=date_cols[0], y=cols, color_discrete_sequence=CLARIONEX_COLORS)
            fig = _apply_dark_layout(fig, "Stacked Area Chart")
        elif len(num_cols) >= 2:
            fig = px.area(df, x=df.index, y=num_cols[:4], color_discrete_sequence=CLARIONEX_COLORS)
            fig = _apply_dark_layout(fig, "Stacked Area Chart")

    # ── Pie Chart ──────────────────────────────────────────────────────────
    elif chart_name == "pie_chart" and cat_cols:
        cat_col = cat_cols[0]
        counts = df[cat_col].value_counts().head(10)
        fig = px.pie(names=counts.index, values=counts.values, color_discrete_sequence=CLARIONEX_COLORS)
        fig = _apply_dark_layout(fig, f"Pie – {cat_col}")

    # ── Donut Chart ────────────────────────────────────────────────────────
    elif chart_name == "donut_chart" and cat_cols:
        cat_col = cat_cols[0]
        counts = df[cat_col].value_counts().head(10)
        fig = px.pie(names=counts.index, values=counts.values, hole=0.5, color_discrete_sequence=CLARIONEX_COLORS)
        fig = _apply_dark_layout(fig, f"Donut – {cat_col}")

    # ── Scatter Plot ───────────────────────────────────────────────────────
    elif chart_name == "scatter_plot" and len(num_cols) >= 2:
        color_col = cat_cols[0] if cat_cols else None
        fig = px.scatter(df, x=num_cols[0], y=num_cols[1], color=color_col, color_discrete_sequence=CLARIONEX_COLORS, opacity=0.7)
        fig = _apply_dark_layout(fig, f"Scatter – {num_cols[0]} vs {num_cols[1]}")

    # ── Bubble Chart ───────────────────────────────────────────────────────
    elif chart_name == "bubble_chart" and len(num_cols) >= 2:
        size_col = num_cols[2] if len(num_cols) >= 3 else num_cols[1]
        color_col = cat_cols[0] if cat_cols else None
        fig = px.scatter(df, x=num_cols[0], y=num_cols[1], size=size_col, color=color_col, color_discrete_sequence=CLARIONEX_COLORS, opacity=0.7, size_max=40)
        fig = _apply_dark_layout(fig, f"Bubble – {num_cols[0]} vs {num_cols[1]}")

    # ── Histogram ──────────────────────────────────────────────────────────
    elif chart_name == "histogram" and num_cols:
        fig = px.histogram(df, x=num_cols[0], nbins=30, color_discrete_sequence=[CLARIONEX_COLORS[0]], opacity=0.85)
        fig = _apply_dark_layout(fig, f"Histogram – {num_cols[0]}")

    # ── Box Plot ───────────────────────────────────────────────────────────
    elif chart_name == "box_plot" and num_cols:
        melt_df = df[num_cols[:6]].melt(var_name="column", value_name="value")
        fig = px.box(melt_df, x="column", y="value", color="column", color_discrete_sequence=CLARIONEX_COLORS)
        fig = _apply_dark_layout(fig, "Box Plot – Numeric Columns")

    # ── Correlation Heatmap ────────────────────────────────────────────────
    elif chart_name == "correlation_heatmap" and len(num_cols) >= 2:
        corr = df[num_cols].corr()
        fig = px.imshow(corr, text_auto=".2f", color_continuous_scale=["#0a0e1a", "#7c3aed", "#06d6a0"], aspect="auto")
        fig = _apply_dark_layout(fig, "Correlation Heatmap")

    # ── Treemap ────────────────────────────────────────────────────────────
    elif chart_name == "treemap" and cat_cols and num_cols:
        cat_col, num_col = cat_cols[0], num_cols[0]
        agg = df.groupby(cat_col, as_index=False)[num_col].sum().nlargest(20, num_col)
        fig = px.treemap(agg, path=[cat_col], values=num_col, color=num_col, color_continuous_scale=["#7c3aed", "#3b82f6", "#06d6a0"])
        fig = _apply_dark_layout(fig, f"Treemap – {cat_col}")

    # ── Sunburst Chart ─────────────────────────────────────────────────────
    elif chart_name == "sunburst_chart" and len(cat_cols) >= 2:
        cat1, cat2 = cat_cols[0], cat_cols[1]
        num_col = num_cols[0] if num_cols else None
        if num_col:
            top_cats = df[cat1].value_counts().head(8).index
            agg = df[df[cat1].isin(top_cats)].groupby([cat1, cat2], as_index=False)[num_col].sum()
            fig = px.sunburst(agg, path=[cat1, cat2], values=num_col, color_discrete_sequence=CLARIONEX_COLORS)
        else:
            grp = df.groupby([cat1, cat2]).size().reset_index(name="count")
            fig = px.sunburst(grp, path=[cat1, cat2], values="count", color_discrete_sequence=CLARIONEX_COLORS)
        fig = _apply_dark_layout(fig, f"Sunburst – {cat1} → {cat2}")

    # ── Radar Chart ────────────────────────────────────────────────────────
    elif chart_name == "radar_chart" and num_cols:
        cols = num_cols[:8]
        means = df[cols].mean()
        normalized = (means - means.min()) / (means.max() - means.min() + 1e-9)
        fig = go.Figure(go.Scatterpolar(
            r=list(normalized) + [normalized.iloc[0]],
            theta=list(normalized.index) + [normalized.index[0]],
            fill='toself',
            line_color=CLARIONEX_COLORS[0],
            fillcolor="rgba(6,214,160,0.15)"
        ))
        fig = _apply_dark_layout(fig, "Radar Chart – Numeric Averages")
        fig.update_layout(polar=dict(radialaxis=dict(visible=True, gridcolor="rgba(148,163,184,0.15)")))

    # ── Waterfall Chart ────────────────────────────────────────────────────
    elif chart_name == "waterfall_chart" and num_cols:
        num_col = num_cols[0]
        sample = df[num_col].head(20)
        diffs = sample.diff().fillna(sample.iloc[0])
        fig = go.Figure(go.Waterfall(
            orientation="v",
            measure=["absolute"] + ["relative"] * (len(diffs) - 1),
            x=list(range(len(diffs))),
            y=diffs.tolist(),
            decreasing={"marker": {"color": "#ef4444"}},
            increasing={"marker": {"color": "#06d6a0"}},
            totals={"marker": {"color": "#7c3aed"}},
        ))
        fig = _apply_dark_layout(fig, f"Waterfall – {num_col}")

    # ── Funnel Chart ───────────────────────────────────────────────────────
    elif chart_name == "funnel_chart" and cat_cols and num_cols:
        cat_col, num_col = cat_cols[0], num_cols[0]
        agg = df.groupby(cat_col, as_index=False)[num_col].sum().nlargest(10, num_col).sort_values(num_col, ascending=False)
        fig = px.funnel(agg, x=num_col, y=cat_col, color_discrete_sequence=CLARIONEX_COLORS)
        fig = _apply_dark_layout(fig, f"Funnel – {num_col} by {cat_col}")

    # ── Gauge Chart ────────────────────────────────────────────────────────
    elif chart_name == "gauge_chart" and num_cols:
        num_col = num_cols[0]
        val = float(df[num_col].mean())
        min_val = float(df[num_col].min())
        max_val = float(df[num_col].max())
        fig = go.Figure(go.Indicator(
            mode="gauge+number",
            value=val,
            title={"text": f"Avg {num_col}", "font": {"color": "#e2e8f0"}},
            gauge={
                "axis": {"range": [min_val, max_val], "tickcolor": "#94a3b8"},
                "bar": {"color": "#06d6a0"},
                "bgcolor": "rgba(0,0,0,0)",
                "borderwidth": 0,
                "steps": [
                    {"range": [min_val, (min_val + max_val) / 2], "color": "rgba(124,58,237,0.15)"},
                    {"range": [(min_val + max_val) / 2, max_val], "color": "rgba(6,214,160,0.15)"},
                ],
            }
        ))
        fig = _apply_dark_layout(fig, f"Gauge – {num_col}")

    # ── Bullet Graph ───────────────────────────────────────────────────────
    elif chart_name == "bullet_graph" and num_cols:
        cols = num_cols[:5]
        means = [float(df[c].mean()) for c in cols]
        maxes = [float(df[c].max()) for c in cols]
        fig = go.Figure()
        for i, (col, mean, mx) in enumerate(zip(cols, means, maxes)):
            fig.add_trace(go.Indicator(
                mode="number+gauge",
                value=mean,
                title={"text": col},
                gauge={"axis": {"range": [0, mx]}, "bar": {"color": CLARIONEX_COLORS[i % len(CLARIONEX_COLORS)]}},
                domain={"row": i, "column": 0},
            ))
        fig.update_layout(grid={"rows": len(cols), "columns": 1, "pattern": "independent"})
        fig = _apply_dark_layout(fig, "Bullet Graph")

    # ── Density Plot ───────────────────────────────────────────────────────
    elif chart_name == "density_plot" and num_cols:
        fig = px.histogram(df, x=num_cols[0], nbins=60, histnorm="probability density",
                           color_discrete_sequence=[CLARIONEX_COLORS[1]], opacity=0.7)
        fig = _apply_dark_layout(fig, f"Density Plot – {num_cols[0]}")

    # ── Density Heatmap ────────────────────────────────────────────────────
    elif chart_name == "density_heatmap" and len(num_cols) >= 2:
        fig = px.density_heatmap(df, x=num_cols[0], y=num_cols[1],
                                  color_continuous_scale=["#0a0e1a", "#7c3aed", "#06d6a0"])
        fig = _apply_dark_layout(fig, f"Density Heatmap – {num_cols[0]} vs {num_cols[1]}")

    # ── Violin Plot ────────────────────────────────────────────────────────
    elif chart_name == "violin_plot" and num_cols:
        cols = num_cols[:6]
        melt_df = df[cols].melt(var_name="column", value_name="value")
        fig = px.violin(melt_df, x="column", y="value", color="column",
                        box=True, color_discrete_sequence=CLARIONEX_COLORS)
        fig = _apply_dark_layout(fig, "Violin Plot – Numeric Distribution")

    # ── Word Cloud (rendered as bar chart of top values) ───────────────────
    elif chart_name == "word_cloud" and cat_cols:
        cat_col = cat_cols[0]
        counts = df[cat_col].value_counts().head(30)
        fig = px.bar(x=counts.values, y=counts.index, orientation="h",
                     color=counts.values, color_continuous_scale=["#7c3aed", "#06d6a0"])
        fig = _apply_dark_layout(fig, f"Word Frequency – {cat_col}")

    # ── KPI Indicator ──────────────────────────────────────────────────────
    elif chart_name == "kpi_indicator" and num_cols:
        num_col = num_cols[0]
        val = float(df[num_col].mean())
        delta_val = float(df[num_col].std())
        fig = go.Figure(go.Indicator(
            mode="number+delta",
            value=val,
            delta={"reference": val - delta_val, "relative": True, "increasing": {"color": "#06d6a0"}, "decreasing": {"color": "#ef4444"}},
            title={"text": f"KPI – {num_col}", "font": {"color": "#e2e8f0", "size": 20}},
            number={"font": {"color": "#06d6a0", "size": 60}},
        ))
        fig = _apply_dark_layout(fig, f"KPI Indicator – {num_col}")

    # ── Sparkline ─────────────────────────────────────────────────────────
    elif chart_name == "sparkline" and num_cols:
        num_col = num_cols[0]
        sample = df[num_col].tail(50)
        fig = go.Figure(go.Scatter(
            x=list(range(len(sample))), y=sample.tolist(),
            mode="lines",
            line={"color": "#06d6a0", "width": 2},
            fill="tozeroy",
            fillcolor="rgba(6,214,160,0.08)"
        ))
        fig = _apply_dark_layout(fig, f"Sparkline – {num_col}")
        fig.update_layout(xaxis={"visible": False}, yaxis={"visible": False}, margin={"l": 0, "r": 0, "t": 30, "b": 0})

    # ── Data Table ─────────────────────────────────────────────────────────
    elif chart_name == "data_table":
        cols = list(df.columns[:12])
        fig = go.Figure(go.Table(
            header=dict(values=cols, fill_color="#1e293b", align="left",
                        font=dict(color="#e2e8f0", size=12)),
            cells=dict(values=[df[c].head(30).tolist() for c in cols],
                       fill_color=["#0f172a", "#111827"],
                       align="left", font=dict(color="#94a3b8", size=11)),
        ))
        fig = _apply_dark_layout(fig, "Data Table – Preview")

    # ── Pareto Chart ───────────────────────────────────────────────────────
    elif chart_name == "pareto_chart" and num_cols:
        if cat_cols:
            cat_col, num_col = cat_cols[0], num_cols[0]
            agg = df.groupby(cat_col, as_index=False)[num_col].sum().nlargest(15, num_col)
            agg = agg.sort_values(num_col, ascending=False)
            agg["cumpct"] = agg[num_col].cumsum() / agg[num_col].sum() * 100
            fig = go.Figure()
            fig.add_trace(go.Bar(x=agg[cat_col], y=agg[num_col], name=num_col,
                                 marker_color=CLARIONEX_COLORS[0]))
            fig.add_trace(go.Scatter(x=agg[cat_col], y=agg["cumpct"], name="Cumulative %",
                                     yaxis="y2", line=dict(color=CLARIONEX_COLORS[1], width=2)))
            fig.update_layout(yaxis2=dict(overlaying="y", side="right", range=[0, 100],
                                          ticksuffix="%", showgrid=False))
            fig = _apply_dark_layout(fig, f"Pareto Chart – {num_col}")
        else:
            sorted_vals = df[num_cols[0]].sort_values(ascending=False).head(20)
            cumpct = sorted_vals.cumsum() / sorted_vals.sum() * 100
            fig = go.Figure()
            fig.add_trace(go.Bar(x=list(range(len(sorted_vals))), y=sorted_vals.tolist(), marker_color=CLARIONEX_COLORS[0]))
            fig.add_trace(go.Scatter(x=list(range(len(cumpct))), y=cumpct.tolist(), yaxis="y2",
                                     line=dict(color=CLARIONEX_COLORS[1], width=2)))
            fig.update_layout(yaxis2=dict(overlaying="y", side="right", range=[0, 100]))
            fig = _apply_dark_layout(fig, f"Pareto – {num_cols[0]}")

    # ── Candlestick Chart ──────────────────────────────────────────────────
    elif chart_name == "candlestick_chart" and len(num_cols) >= 4:
        o, h, l, c = num_cols[0], num_cols[1], num_cols[2], num_cols[3]
        x_col = date_cols[0] if date_cols else df.index
        fig = go.Figure(go.Candlestick(x=x_col if date_cols else list(df.index),
                                        open=df[o], high=df[h], low=df[l], close=df[c]))
        fig = _apply_dark_layout(fig, "Candlestick Chart")

    # ── OHLC Chart ─────────────────────────────────────────────────────────
    elif chart_name == "ohlc_chart" and len(num_cols) >= 4:
        o, h, l, c = num_cols[0], num_cols[1], num_cols[2], num_cols[3]
        x_col = date_cols[0] if date_cols else df.index
        fig = go.Figure(go.Ohlc(x=x_col if date_cols else list(df.index),
                                 open=df[o], high=df[h], low=df[l], close=df[c]))
        fig = _apply_dark_layout(fig, "OHLC Chart")

    # ── Fallback: Data Table ───────────────────────────────────────────────
    if fig is None:
        cols = list(df.columns[:10])
        fig = go.Figure(go.Table(
            header=dict(values=cols, fill_color="#1e293b", font=dict(color="#e2e8f0")),
            cells=dict(values=[df[c].head(20).tolist() for c in cols],
                       fill_color="#0f172a", font=dict(color="#94a3b8")),
        ))
        fig = _apply_dark_layout(fig, "Data Preview")

    return json.loads(fig.to_json())
