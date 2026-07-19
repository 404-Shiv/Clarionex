"""
Clarionex – Data Cleaning Module
Automatically cleans uploaded CSV data with minimal user effort.
"""

import pandas as pd
import re


def normalize_column_name(name: str) -> str:
    """Normalize a column name: lowercase, strip, replace spaces/special chars with underscores."""
    name = str(name).strip().lower()
    name = re.sub(r'[^a-z0-9_]', '_', name)
    name = re.sub(r'_+', '_', name)
    name = name.strip('_')
    return name


def clean_dataframe(df: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    """
    Clean a DataFrame automatically.
    
    Returns:
        tuple: (cleaned_df, cleaning_report)
    """
    report = {
        "original_rows": len(df),
        "original_columns": len(df.columns),
        "duplicates_removed": 0,
        "columns_renamed": [],
        "missing_values_filled": 0,
        "type_conversions": [],
    }

    # 1. Normalize column names
    original_names = list(df.columns)
    new_names = [normalize_column_name(c) for c in df.columns]
    
    # Handle duplicate column names after normalization
    seen = {}
    final_names = []
    for name in new_names:
        if name in seen:
            seen[name] += 1
            final_names.append(f"{name}_{seen[name]}")
        else:
            seen[name] = 0
            final_names.append(name)
    
    renamed = [(orig, new) for orig, new in zip(original_names, final_names) if orig != new]
    if renamed:
        report["columns_renamed"] = [{"from": o, "to": n} for o, n in renamed]
    df.columns = final_names

    # 2. Remove duplicate rows
    dup_count = df.duplicated().sum()
    if dup_count > 0:
        df = df.drop_duplicates().reset_index(drop=True)
        report["duplicates_removed"] = int(dup_count)

    # 3. Try to convert date columns
    for col in df.columns:
        if df[col].dtype == 'object':
            try:
                converted = pd.to_datetime(df[col], infer_datetime_format=True, errors='coerce')
                # If more than 50% parsed successfully, treat as date
                if converted.notna().sum() / len(converted) > 0.5:
                    df[col] = converted
                    report["type_conversions"].append({"column": col, "to": "datetime"})
            except Exception:
                pass

    # 4. Try to convert numeric columns
    for col in df.columns:
        if df[col].dtype == 'object':
            try:
                converted = pd.to_numeric(df[col], errors='coerce')
                # If more than 70% parsed successfully, treat as numeric
                if converted.notna().sum() / max(len(converted), 1) > 0.7:
                    df[col] = converted
                    report["type_conversions"].append({"column": col, "to": "numeric"})
            except Exception:
                pass

    # 5. Handle missing values
    total_missing = int(df.isnull().sum().sum())
    if total_missing > 0:
        # Forward fill first
        df = df.ffill()
        # Then fill remaining
        for col in df.columns:
            if df[col].isnull().any():
                if pd.api.types.is_numeric_dtype(df[col]):
                    df[col] = df[col].fillna(0)
                elif pd.api.types.is_datetime64_any_dtype(df[col]):
                    df[col] = df[col].fillna(method='bfill')
                else:
                    df[col] = df[col].fillna("Unknown")
        report["missing_values_filled"] = total_missing

    report["cleaned_rows"] = len(df)
    report["cleaned_columns"] = len(df.columns)

    return df, report
