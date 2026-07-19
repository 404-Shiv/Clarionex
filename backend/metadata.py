"""
Clarionex – Metadata Detection Module
Detects column types and dataset structure for chart suggestion.
"""

import pandas as pd


def detect_metadata(df: pd.DataFrame) -> dict:
    """
    Analyze a DataFrame and return structured metadata.
    
    Returns:
        dict with numeric_columns, categorical_columns, date_columns,
        row_count, column_count, sample_data, column_stats
    """
    numeric_columns = []
    categorical_columns = []
    date_columns = []

    for col in df.columns:
        if pd.api.types.is_datetime64_any_dtype(df[col]):
            date_columns.append(col)
        elif pd.api.types.is_numeric_dtype(df[col]):
            numeric_columns.append(col)
        else:
            categorical_columns.append(col)

    # Build column statistics
    column_stats = {}
    for col in numeric_columns:
        column_stats[col] = {
            "type": "numeric",
            "min": float(df[col].min()) if not df[col].empty else 0,
            "max": float(df[col].max()) if not df[col].empty else 0,
            "mean": float(df[col].mean()) if not df[col].empty else 0,
            "nulls": int(df[col].isnull().sum()),
        }
    for col in categorical_columns:
        unique_count = df[col].nunique()
        column_stats[col] = {
            "type": "categorical",
            "unique_values": int(unique_count),
            "top_values": df[col].value_counts().head(5).to_dict(),
            "nulls": int(df[col].isnull().sum()),
        }
    for col in date_columns:
        column_stats[col] = {
            "type": "date",
            "min": str(df[col].min()),
            "max": str(df[col].max()),
            "nulls": int(df[col].isnull().sum()),
        }

    # Sample data (first 5 rows as records)
    sample_df = df.head(5).copy()
    for col in sample_df.columns:
        if pd.api.types.is_datetime64_any_dtype(sample_df[col]):
            sample_df[col] = sample_df[col].astype(str)
    sample_data = sample_df.to_dict(orient="records")

    return {
        "numeric_columns": numeric_columns,
        "categorical_columns": categorical_columns,
        "date_columns": date_columns,
        "row_count": len(df),
        "column_count": len(df.columns),
        "column_stats": column_stats,
        "sample_data": sample_data,
    }
