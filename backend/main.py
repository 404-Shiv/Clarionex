"""
Clarionex – FastAPI Backend
Main application with upload, chart suggestion, and chart generation endpoints.
"""

import io
import json
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

from cleaning import clean_dataframe
from metadata import detect_metadata
from chart_engine import suggest_charts, generate_chart

app = FastAPI(
    title="Clarionex API",
    description="Infrastructure for Insight – Automated Data Visualization",
    version="1.0.0",
)

# CORS for frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5176", "http://127.0.0.1:5176"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage
_state = {
    "df": None,
    "metadata": None,
    "cleaning_report": None,
}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload a CSV file, clean it, and return metadata."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")

    try:
        contents = await file.read()
        df = None
        for enc in ("utf-8", "latin-1", "cp1252", "utf-8-sig"):
            try:
                df = pd.read_csv(io.BytesIO(contents), encoding=enc)
                break
            except (UnicodeDecodeError, Exception):
                continue
        if df is None:
            raise ValueError("Could not decode CSV with any supported encoding.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

    if df.empty:
        raise HTTPException(status_code=400, detail="The uploaded CSV file is empty.")

    # Clean
    cleaned_df, cleaning_report = clean_dataframe(df)

    # Detect metadata
    meta = detect_metadata(cleaned_df)

    # Store in memory
    _state["df"] = cleaned_df
    _state["metadata"] = meta
    _state["cleaning_report"] = cleaning_report

    return {
        "status": "success",
        "filename": file.filename,
        "cleaning_report": cleaning_report,
        "metadata": meta,
    }


@app.get("/charts")
def get_charts():
    """Return available chart options based on the uploaded dataset."""
    if _state["metadata"] is None:
        raise HTTPException(status_code=400, detail="No dataset uploaded yet. Please upload a CSV first.")

    charts = suggest_charts(_state["metadata"])
    return {
        "status": "success",
        "charts": charts,
        "dataset_info": {
            "rows": _state["metadata"]["row_count"],
            "columns": _state["metadata"]["column_count"],
            "numeric": len(_state["metadata"]["numeric_columns"]),
            "categorical": len(_state["metadata"]["categorical_columns"]),
            "date": len(_state["metadata"]["date_columns"]),
        },
    }


@app.get("/generate/{chart_name}")
def generate(chart_name: str):
    """Generate a specific chart and return Plotly JSON."""
    if _state["df"] is None or _state["metadata"] is None:
        raise HTTPException(status_code=400, detail="No dataset uploaded yet.")

    try:
        chart_json = generate_chart(chart_name, _state["df"], _state["metadata"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chart generation failed: {str(e)}")

    return {
        "status": "success",
        "chart_name": chart_name,
        "chart": chart_json,
    }


@app.get("/")
def root():
    return {
        "app": "Clarionex",
        "tagline": "Infrastructure for Insight",
        "version": "1.0.0",
        "endpoints": ["/upload", "/charts", "/generate/{chart_name}"],
    }
