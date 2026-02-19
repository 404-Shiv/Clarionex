
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from pydantic import BaseModel
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import io
import json
import numpy as np

app = FastAPI(title="Clarionex API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

stored_df = None
sampled_df = None
metadata = {}

TEMPLATE = "plotly_dark"
COLORS = px.colors.qualitative.Set2
SEQUENTIAL = "Viridis"
MAX_ROWS_FOR_CHARTS = 5000


class BatchRequest(BaseModel):
    chart_names: List[str]


def sample_df(df, max_rows=MAX_ROWS_FOR_CHARTS):
    """Return a sampled dataframe if too large, for faster chart rendering."""
    if len(df) <= max_rows:
        return df
    return df.sample(n=max_rows, random_state=42)


def detect_geo_columns(df):
    """Detect latitude/longitude columns."""
    lat_col = None
    lon_col = None
    for col in df.columns:
        cl = col.lower().replace("_", "").replace(" ", "")
        if cl in ("lat", "latitude"):
            lat_col = col
        elif cl in ("lon", "lng", "long", "longitude"):
            lon_col = col
    return lat_col, lon_col


def detect_date_columns(df):
    """Detect date/time columns."""
    date_cols = []
    for col in df.columns:
        if df[col].dtype == "object":
            try:
                pd.to_datetime(df[col], infer_datetime_format=True)
                date_cols.append(col)
            except (ValueError, TypeError):
                pass
        elif pd.api.types.is_datetime64_any_dtype(df[col]):
            date_cols.append(col)
    return date_cols


def style_fig(fig, height=None):
    """Apply consistent dark styling."""
    layout_kwargs = dict(
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(15,23,42,0.6)",
        font=dict(family="Inter, sans-serif", color="#94a3b8"),
        margin=dict(l=50, r=30, t=55, b=50),
    )
    if height:
        layout_kwargs["height"] = height
    fig.update_layout(**layout_kwargs)
    return fig


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    global stored_df, sampled_df, metadata

    contents = await file.read()
    stored_df = pd.read_csv(io.BytesIO(contents))

    # Cleaning
    stored_df.drop_duplicates(inplace=True)
    stored_df.columns = (
        stored_df.columns.str.strip()
        .str.lower()
        .str.replace(" ", "_")
    )
    stored_df.ffill(inplace=True)

    # Pre-create sampled version for fast chart rendering
    sampled_df = sample_df(stored_df)

    numeric = stored_df.select_dtypes(include="number").columns.tolist()
    categorical = stored_df.select_dtypes(include="object").columns.tolist()
    date_cols = detect_date_columns(stored_df)
    lat_col, lon_col = detect_geo_columns(stored_df)

    metadata = {
        "rows": len(stored_df),
        "columns": len(stored_df.columns),
        "numeric": numeric,
        "categorical": categorical,
        "date_columns": date_cols,
        "lat_col": lat_col,
        "lon_col": lon_col,
        "all_columns": stored_df.columns.tolist(),
    }

    return {"message": "Upload successful", "metadata": metadata}


@app.get("/charts")
def get_charts():
    if stored_df is None:
        return {"error": "No dataset uploaded"}

    num = metadata["numeric"]
    cat = metadata["categorical"]
    dates = metadata.get("date_columns", [])
    has_geo = metadata.get("lat_col") and metadata.get("lon_col")

    charts = {}

    # ── Distribution charts ──
    dist = []
    if len(num) > 0:
        dist += ["Histogram", "Box Plot", "Violin Plot", "Density Plot"]
    if dist:
        charts["Distribution"] = dist

    # ── Comparison charts ──
    comp = []
    if len(num) > 0:
        comp.append("Bar Chart")
        comp.append("Column Chart")
    if len(num) > 0 and len(cat) > 0:
        comp.append("Side-by-Side Bar")
        comp.append("Bullet Chart")
    if comp:
        charts["Comparison"] = comp

    # ── Composition charts ──
    composition = []
    if len(num) > 0 and len(cat) > 0:
        composition += ["Pie Chart", "Donut Chart", "Stacked Bar", "Stacked Column",
                        "Treemap", "Sunburst", "Waterfall Chart"]
    if composition:
        charts["Composition"] = composition

    # ── Relationship charts ──
    rel = []
    if len(num) > 1:
        rel += ["Scatter Plot", "Bubble Chart", "Packed Bubbles",
                "Density Heatmap", "Correlation Heatmap"]
    if rel:
        charts["Relationship"] = rel

    # ── Trend charts ──
    trend = []
    if len(num) > 0:
        trend.append("Line Chart")
        trend.append("Area Chart")
        trend.append("Sparklines")
    if len(num) > 0 and len(cat) > 0:
        trend.append("Combo Chart")
    if trend:
        charts["Trend"] = trend

    # ── Tabular ──
    tab = ["Data Table"]
    if len(num) > 0 and len(cat) > 0:
        tab.append("Matrix / Crosstab")
        tab.append("Highlight Table")
    charts["Tabular"] = tab

    # ── Geographic ──
    if has_geo:
        geo = ["Symbol Map", "Density Map"]
        if len(cat) > 0:
            geo.append("Filled Map")
        charts["Geographic"] = geo

    # ── Project ──
    if len(cat) >= 1 and (len(dates) > 0 or len(num) >= 2):
        charts["Project"] = ["Gantt Chart"]

    return {"available_charts": charts}


@app.post("/generate-batch")
def generate_batch(req: BatchRequest):
    """Generate multiple charts in a single request for speed."""
    results = {}
    for name in req.chart_names:
        try:
            results[name] = generate_chart(name)
        except Exception as e:
            results[name] = {"error": str(e)}
    return results


@app.get("/generate/{chart_name}")
def generate_chart(chart_name: str):
    if stored_df is None:
        return {"error": "No dataset uploaded"}

    # Use sampled data for faster rendering
    df = sampled_df if sampled_df is not None else stored_df

    num_cols = metadata["numeric"]
    cat_cols = metadata["categorical"]
    date_cols = metadata.get("date_columns", [])

    # ───────────────────────────────
    #  DISTRIBUTION
    # ───────────────────────────────

    if chart_name == "Histogram":
        col = num_cols[0]
        fig = px.histogram(
            df, x=col, title=f"Distribution of {col}",
            color_discrete_sequence=["#6366f1"],
            template=TEMPLATE, marginal="rug", nbins=30
        )
        return json.loads(style_fig(fig).to_json())

    if chart_name == "Box Plot":
        num = num_cols[0]
        if cat_cols:
            fig = px.box(df, x=cat_cols[0], y=num,
                         title=f"Box Plot: {num} by {cat_cols[0]}",
                         color=cat_cols[0], template=TEMPLATE)
        else:
            fig = px.box(df, y=num, title=f"Box Plot of {num}",
                         color_discrete_sequence=["#6366f1"], template=TEMPLATE)
        return json.loads(style_fig(fig).to_json())

    if chart_name == "Violin Plot":
        num = num_cols[0]
        if cat_cols:
            fig = px.violin(df, x=cat_cols[0], y=num,
                            title=f"Violin Plot: {num} by {cat_cols[0]}",
                            color=cat_cols[0], box=True, points="all",
                            template=TEMPLATE)
        else:
            fig = px.violin(df, y=num, title=f"Violin Plot of {num}",
                            color_discrete_sequence=["#6366f1"],
                            box=True, points="all", template=TEMPLATE)
        return json.loads(style_fig(fig).to_json())

    if chart_name == "Density Plot":
        cols = num_cols[:3]
        fig = go.Figure()
        colors = ["#6366f1", "#06b6d4", "#f59e0b"]
        for i, col in enumerate(cols):
            vals = df[col].dropna()
            fig.add_trace(go.Violin(
                y=vals, name=col, side="positive",
                line_color=colors[i % len(colors)],
                meanline_visible=True, points=False,
            ))
        fig.update_layout(title="Density Plot", template=TEMPLATE, violinmode="overlay")
        return json.loads(style_fig(fig).to_json())

    # ───────────────────────────────
    #  COMPARISON
    # ───────────────────────────────

    if chart_name == "Bar Chart":
        if cat_cols:
            cat, num = cat_cols[0], num_cols[0]
            grouped = df.groupby(cat)[num].mean().reset_index().sort_values(num)
            fig = px.bar(grouped, y=cat, x=num, orientation="h",
                         title=f"Average {num} by {cat}",
                         color=num, color_continuous_scale="Viridis",
                         template=TEMPLATE)
        else:
            fig = px.bar(df.head(30), y=num_cols[0],
                         title=f"Bar Chart of {num_cols[0]}",
                         color_discrete_sequence=["#6366f1"], template=TEMPLATE)
        return json.loads(style_fig(fig).to_json())

    if chart_name == "Column Chart":
        if cat_cols:
            cat, num = cat_cols[0], num_cols[0]
            grouped = df.groupby(cat)[num].mean().reset_index()
            fig = px.bar(grouped, x=cat, y=num,
                         title=f"Column Chart: {num} by {cat}",
                         color=cat, template=TEMPLATE)
        else:
            fig = px.bar(df.head(30), y=num_cols[0],
                         title=f"Column Chart of {num_cols[0]}",
                         color_discrete_sequence=["#6366f1"], template=TEMPLATE)
        return json.loads(style_fig(fig).to_json())

    if chart_name == "Side-by-Side Bar":
        cat = cat_cols[0]
        cols = num_cols[:3]
        melted = df.groupby(cat)[cols].mean().reset_index()
        melted = melted.melt(id_vars=cat, value_vars=cols, var_name="Metric", value_name="Value")
        fig = px.bar(melted, x=cat, y="Value", color="Metric",
                     barmode="group", title=f"Side-by-Side: {', '.join(cols)} by {cat}",
                     template=TEMPLATE)
        return json.loads(style_fig(fig).to_json())

    if chart_name == "Bullet Chart":
        cat = cat_cols[0]
        num = num_cols[0]
        grouped = df.groupby(cat)[num].agg(["mean", "max"]).reset_index()
        grouped.columns = [cat, "actual", "target"]
        fig = go.Figure()
        for _, row in grouped.head(10).iterrows():
            fig.add_trace(go.Bar(
                x=[row["target"]], y=[row[cat]], orientation="h",
                marker=dict(color="rgba(99,102,241,0.2)"), width=0.5,
                name="Target", showlegend=False,
            ))
            fig.add_trace(go.Bar(
                x=[row["actual"]], y=[row[cat]], orientation="h",
                marker=dict(color="#6366f1"), width=0.25,
                name="Actual", showlegend=False,
            ))
        fig.update_layout(barmode="overlay", title=f"Bullet Chart: {num} by {cat}",
                          template=TEMPLATE, yaxis=dict(autorange="reversed"))
        return json.loads(style_fig(fig, height=max(300, len(grouped.head(10)) * 50)).to_json())

    # ───────────────────────────────
    #  COMPOSITION
    # ───────────────────────────────

    if chart_name == "Pie Chart":
        cat, num = cat_cols[0], num_cols[0]
        grouped = df.groupby(cat)[num].sum().reset_index()
        grouped = grouped[grouped[num] > 0]
        fig = px.pie(grouped, names=cat, values=num,
                     title=f"{num} by {cat}", template=TEMPLATE)
        return json.loads(style_fig(fig).to_json())

    if chart_name == "Donut Chart":
        cat, num = cat_cols[0], num_cols[0]
        grouped = df.groupby(cat)[num].sum().reset_index()
        grouped = grouped[grouped[num] > 0]
        fig = px.pie(grouped, names=cat, values=num, hole=0.45,
                     title=f"Donut: {num} by {cat}", template=TEMPLATE)
        return json.loads(style_fig(fig).to_json())

    if chart_name == "Stacked Bar":
        cat = cat_cols[0]
        cols = num_cols[:3]
        grouped = df.groupby(cat)[cols].sum().reset_index()
        melted = grouped.melt(id_vars=cat, value_vars=cols, var_name="Metric", value_name="Value")
        fig = px.bar(melted, y=cat, x="Value", color="Metric", orientation="h",
                     title=f"Stacked Bar: by {cat}",
                     barmode="stack", template=TEMPLATE)
        return json.loads(style_fig(fig).to_json())

    if chart_name == "Stacked Column":
        cat = cat_cols[0]
        cols = num_cols[:3]
        grouped = df.groupby(cat)[cols].sum().reset_index()
        melted = grouped.melt(id_vars=cat, value_vars=cols, var_name="Metric", value_name="Value")
        fig = px.bar(melted, x=cat, y="Value", color="Metric",
                     title=f"Stacked Column: by {cat}",
                     barmode="stack", template=TEMPLATE)
        return json.loads(style_fig(fig).to_json())

    if chart_name == "Treemap":
        cat, num = cat_cols[0], num_cols[0]
        grouped = df.groupby(cat)[num].sum().reset_index()
        grouped = grouped[grouped[num] > 0]
        fig = px.treemap(grouped, path=[cat], values=num,
                         title=f"Treemap: {num} by {cat}",
                         color=num, color_continuous_scale="Blues",
                         template=TEMPLATE)
        return json.loads(style_fig(fig).to_json())

    if chart_name == "Sunburst":
        num = num_cols[0]
        cats = cat_cols[:2]
        if len(cats) >= 2:
            grouped = df.groupby(cats)[num].sum().reset_index()
            grouped = grouped[grouped[num] > 0]
            fig = px.sunburst(grouped, path=cats, values=num,
                              title=f"Sunburst: {num} by {' → '.join(cats)}",
                              color=num, color_continuous_scale="Sunset",
                              template=TEMPLATE)
        else:
            grouped = df.groupby(cats[0])[num].sum().reset_index()
            grouped = grouped[grouped[num] > 0]
            fig = px.sunburst(grouped, path=[cats[0]], values=num,
                              title=f"Sunburst: {num} by {cats[0]}",
                              color=num, color_continuous_scale="Sunset",
                              template=TEMPLATE)
        return json.loads(style_fig(fig).to_json())

    if chart_name == "Waterfall Chart":
        cat, num = cat_cols[0], num_cols[0]
        grouped = df.groupby(cat)[num].sum().reset_index().head(12)
        fig = go.Figure(go.Waterfall(
            x=grouped[cat].tolist(),
            y=grouped[num].tolist(),
            connector=dict(line=dict(color="#64748b")),
            increasing=dict(marker=dict(color="#10b981")),
            decreasing=dict(marker=dict(color="#ef4444")),
            totals=dict(marker=dict(color="#6366f1")),
        ))
        fig.update_layout(title=f"Waterfall: {num} by {cat}", template=TEMPLATE)
        return json.loads(style_fig(fig).to_json())

    # ───────────────────────────────
    #  RELATIONSHIP
    # ───────────────────────────────

    if chart_name == "Scatter Plot":
        x, y = num_cols[0], num_cols[1]
        color = cat_cols[0] if cat_cols else None
        fig = px.scatter(df, x=x, y=y, color=color,
                         title=f"Scatter: {x} vs {y}",
                         template=TEMPLATE, opacity=0.7)
        fig.update_traces(marker=dict(size=7))
        return json.loads(style_fig(fig).to_json())

    if chart_name == "Bubble Chart":
        x, y = num_cols[0], num_cols[1]
        size = df[num_cols[0]].abs()
        color = cat_cols[0] if cat_cols else None
        fig = px.scatter(df, x=x, y=y, size=size, color=color,
                         title=f"Bubble: {x} vs {y}",
                         template=TEMPLATE, opacity=0.7, size_max=45)
        return json.loads(style_fig(fig).to_json())

    if chart_name == "Packed Bubbles":
        if cat_cols:
            cat, num = cat_cols[0], num_cols[0]
            grouped = df.groupby(cat)[num].sum().abs().reset_index()
            grouped = grouped[grouped[num] > 0].head(30)
            # Approximate packed bubble with scatter, no axes
            n = len(grouped)
            np.random.seed(42)
            angles = np.linspace(0, 2 * np.pi, n, endpoint=False)
            radii = np.sqrt(grouped[num].values / grouped[num].max()) * 3
            xs = np.cumsum(np.cos(angles) * radii)
            ys = np.cumsum(np.sin(angles) * radii)
            fig = px.scatter(grouped, x=xs, y=ys,
                             size=grouped[num], text=cat,
                             color=cat, size_max=80,
                             title=f"Packed Bubbles: {num} by {cat}",
                             template=TEMPLATE)
            fig.update_traces(textposition="middle center", mode="markers+text",
                              textfont=dict(size=10, color="white"))
            fig.update_xaxes(visible=False)
            fig.update_yaxes(visible=False)
        else:
            x, y = num_cols[0], num_cols[1]
            fig = px.scatter(df, x=x, y=y, size=df[x].abs(),
                             size_max=60, title="Packed Bubbles",
                             template=TEMPLATE, opacity=0.7)
            fig.update_xaxes(visible=False)
            fig.update_yaxes(visible=False)
        return json.loads(style_fig(fig).to_json())

    if chart_name == "Density Heatmap":
        x, y = num_cols[0], num_cols[1]
        fig = px.density_heatmap(df, x=x, y=y,
                                 title=f"Density Heatmap: {x} vs {y}",
                                 color_continuous_scale="Inferno",
                                 template=TEMPLATE, nbinsx=30, nbinsy=30,
                                 marginal_x="histogram", marginal_y="histogram")
        return json.loads(style_fig(fig).to_json())

    if chart_name == "Correlation Heatmap":
        corr = df[num_cols].corr()
        fig = px.imshow(corr, text_auto=".2f",
                        title="Correlation Heatmap",
                        color_continuous_scale="RdBu_r",
                        template=TEMPLATE)
        return json.loads(style_fig(fig).to_json())

    # ───────────────────────────────
    #  TREND
    # ───────────────────────────────

    if chart_name == "Line Chart":
        if date_cols:
            date_col = date_cols[0]
            df_sorted = df.copy()
            df_sorted[date_col] = pd.to_datetime(df_sorted[date_col])
            df_sorted = df_sorted.sort_values(date_col)
            cols = num_cols[:3]
            fig = px.line(df_sorted, x=date_col, y=cols,
                          title=f"Line Chart: {', '.join(cols)} over {date_col}",
                          template=TEMPLATE, markers=True)
        else:
            cols = num_cols[:3]
            fig = px.line(df.reset_index(), x="index", y=cols,
                          title=f"Line Chart: {', '.join(cols)}",
                          template=TEMPLATE, markers=False)
        return json.loads(style_fig(fig).to_json())

    if chart_name == "Area Chart":
        if date_cols:
            date_col = date_cols[0]
            df_sorted = df.copy()
            df_sorted[date_col] = pd.to_datetime(df_sorted[date_col])
            df_sorted = df_sorted.sort_values(date_col)
            cols = num_cols[:3]
            fig = px.area(df_sorted, x=date_col, y=cols,
                          title=f"Area Chart: {', '.join(cols)} over {date_col}",
                          template=TEMPLATE)
        else:
            cols = num_cols[:3]
            fig = px.area(df.reset_index(), x="index", y=cols,
                          title=f"Area Chart: {', '.join(cols)}",
                          template=TEMPLATE)
        return json.loads(style_fig(fig).to_json())

    if chart_name == "Combo Chart":
        cat = cat_cols[0]
        n1, n2 = num_cols[0], num_cols[1] if len(num_cols) > 1 else num_cols[0]
        grouped = df.groupby(cat)[[n1, n2]].mean().reset_index()
        fig = go.Figure()
        fig.add_trace(go.Bar(x=grouped[cat], y=grouped[n1], name=n1,
                             marker_color="#6366f1"))
        fig.add_trace(go.Scatter(x=grouped[cat], y=grouped[n2], name=n2,
                                 mode="lines+markers",
                                 line=dict(color="#06b6d4", width=3),
                                 marker=dict(size=8)))
        fig.update_layout(title=f"Combo: {n1} (bar) + {n2} (line) by {cat}",
                          template=TEMPLATE, barmode="group",
                          yaxis=dict(title=n1),
                          yaxis2=dict(title=n2, overlaying="y", side="right"))
        fig.data[1].yaxis = "y2"
        return json.loads(style_fig(fig).to_json())

    if chart_name == "Sparklines":
        cols = num_cols[:6]
        fig = go.Figure()
        rows = len(cols)
        from plotly.subplots import make_subplots
        fig = make_subplots(rows=rows, cols=1, shared_xaxes=True,
                            subplot_titles=cols, vertical_spacing=0.06)
        colors = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]
        for i, col in enumerate(cols):
            fig.add_trace(go.Scatter(
                y=df[col].values[:100], mode="lines",
                line=dict(color=colors[i % len(colors)], width=2),
                fill="tozeroy",
                fillcolor=colors[i % len(colors)].replace(")", ",0.1)").replace("rgb", "rgba") if "rgb" in colors[i % len(colors)] else f"rgba(99,102,241,0.08)",
                name=col, showlegend=False,
            ), row=i + 1, col=1)
        fig.update_layout(title="Sparklines", template=TEMPLATE, height=120 * rows + 80)
        fig.update_xaxes(visible=False)
        return json.loads(style_fig(fig).to_json())

    # ───────────────────────────────
    #  TABULAR
    # ───────────────────────────────

    if chart_name == "Data Table":
        sample = df.head(50)
        return {
            "type": "table",
            "title": "Data Table (first 50 rows)",
            "columns": sample.columns.tolist(),
            "rows": sample.values.tolist(),
        }

    if chart_name == "Matrix / Crosstab":
        cat = cat_cols[0]
        cat2 = cat_cols[1] if len(cat_cols) > 1 else None
        num = num_cols[0]
        if cat2:
            pivot = pd.crosstab(df[cat], df[cat2], values=df[num],
                                aggfunc="mean").round(2)
        else:
            pivot = df.groupby(cat)[num_cols[:5]].mean().round(2)
        return {
            "type": "table",
            "title": f"Matrix / Crosstab",
            "columns": [str(c) for c in [pivot.index.name or ""] + pivot.columns.tolist()],
            "rows": [[str(idx)] + [v if pd.notna(v) else "" for v in row]
                     for idx, row in zip(pivot.index, pivot.values.tolist())],
        }

    if chart_name == "Highlight Table":
        cat = cat_cols[0]
        num = num_cols[0]
        if len(cat_cols) > 1:
            cat2 = cat_cols[1]
            pivot = df.pivot_table(index=cat, columns=cat2, values=num, aggfunc="mean")
            fig = px.imshow(pivot.round(2), text_auto=True,
                            title=f"Highlight Table: {num}",
                            color_continuous_scale="YlOrRd",
                            template=TEMPLATE, aspect="auto")
        else:
            grouped = df.groupby(cat)[num_cols[:5]].mean()
            fig = px.imshow(grouped.round(2), text_auto=True,
                            title=f"Highlight Table",
                            color_continuous_scale="YlOrRd",
                            template=TEMPLATE, aspect="auto")
        return json.loads(style_fig(fig).to_json())

    # ───────────────────────────────
    #  GEOGRAPHIC
    # ───────────────────────────────

    if chart_name == "Symbol Map":
        lat, lon = metadata["lat_col"], metadata["lon_col"]
        size_col = num_cols[0] if num_cols else None
        color = cat_cols[0] if cat_cols else None
        fig = px.scatter_mapbox(df, lat=lat, lon=lon,
                                size=df[size_col].abs() if size_col else None,
                                color=color, size_max=20,
                                title="Symbol Map",
                                mapbox_style="carto-darkmatter",
                                template=TEMPLATE, zoom=3)
        return json.loads(style_fig(fig, height=600).to_json())

    if chart_name == "Density Map":
        lat, lon = metadata["lat_col"], metadata["lon_col"]
        z_col = num_cols[0] if num_cols else None
        fig = px.density_mapbox(df, lat=lat, lon=lon,
                                z=df[z_col] if z_col else None,
                                radius=15,
                                title="Density Map",
                                mapbox_style="carto-darkmatter",
                                template=TEMPLATE, zoom=3)
        return json.loads(style_fig(fig, height=600).to_json())

    if chart_name == "Filled Map":
        lat, lon = metadata["lat_col"], metadata["lon_col"]
        color = cat_cols[0] if cat_cols else None
        fig = px.scatter_mapbox(df, lat=lat, lon=lon,
                                color=color, size_max=15,
                                title="Filled Map",
                                mapbox_style="carto-darkmatter",
                                template=TEMPLATE, zoom=3)
        return json.loads(style_fig(fig, height=600).to_json())

    # ───────────────────────────────
    #  PROJECT
    # ───────────────────────────────

    if chart_name == "Gantt Chart":
        cat = cat_cols[0]
        if date_cols and len(date_cols) >= 2:
            start, end = date_cols[0], date_cols[1]
            df_gantt = df[[cat, start, end]].copy().head(30)
            df_gantt[start] = pd.to_datetime(df_gantt[start])
            df_gantt[end] = pd.to_datetime(df_gantt[end])
            fig = px.timeline(df_gantt, x_start=start, x_end=end, y=cat,
                              color=cat, title="Gantt Chart", template=TEMPLATE)
        elif date_cols and len(num_cols) >= 1:
            start_col = date_cols[0]
            dur_col = num_cols[0]
            df_gantt = df[[cat, start_col, dur_col]].copy().head(30)
            df_gantt[start_col] = pd.to_datetime(df_gantt[start_col])
            df_gantt["End"] = df_gantt[start_col] + pd.to_timedelta(df_gantt[dur_col].abs(), unit="D")
            fig = px.timeline(df_gantt, x_start=start_col, x_end="End", y=cat,
                              color=cat, title="Gantt Chart", template=TEMPLATE)
        else:
            # Simulate with numeric values as durations
            n1, n2 = num_cols[0], num_cols[1]
            df_gantt = df[[cat, n1, n2]].head(15).copy()
            base = pd.Timestamp("2024-01-01")
            df_gantt["Start"] = base + pd.to_timedelta(df_gantt[n1].abs().cumsum(), unit="D")
            df_gantt["End"] = df_gantt["Start"] + pd.to_timedelta(df_gantt[n2].abs(), unit="D")
            fig = px.timeline(df_gantt, x_start="Start", x_end="End", y=cat,
                              color=cat, title="Gantt Chart", template=TEMPLATE)
        fig.update_yaxes(autorange="reversed")
        return json.loads(style_fig(fig, height=500).to_json())

    return {"error": f"Unknown chart: {chart_name}"}
