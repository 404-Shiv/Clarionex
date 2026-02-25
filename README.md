# Clarionex

Clarionex is a data infrastructure platform that turns raw datasets into visual insights automatically.

The user uploads a dataset and the system cleans the data, understands its structure, and provides chart options. The user only needs to click a chart name to display it on the dashboard.

---

## What This Project Does

Clarionex simplifies data analysis.

Instead of manually selecting columns and building charts, the system automatically prepares the data and suggests useful visualizations. Clicking a chart instantly adds it to the dashboard.

---

## Features

* Upload dataset (CSV)
* Automatic data cleaning
* Detect numeric and categorical columns
* Generate chart options automatically
* Click chart name to display visualization
* Dynamic dashboard creation
* Modern UI using React
* Backend powered by FastAPI

---

## Supported Charts

Histogram
Box Plot
Violin Plot
Density Plot

Bar Chart
Column Chart
Side-by-Side Bar
Bullet Chart

Pie Chart
Donut Chart
Stacked Bar
Stacked Column

Treemap
Sunburst
Waterfall Chart

Scatter Plot
Bubble Chart
Packed Bubbles

Density Heatmap
Correlation Heatmap

Line Chart
Area Chart
Combo Chart
Sparklines

Data Table
Matrix / Crosstab
Highlight Table

Symbol Map
Density Map
Filled Map

Gantt Chart

---

## How It Works

1. User uploads a dataset
2. Backend cleans the data
3. System detects column types
4. Available charts are generated
5. User clicks a chart name
6. Chart appears on the dashboard

---

## Tech Stack

Backend:

* Python
* FastAPI
* Pandas
* Plotly

Frontend:

* React
* Vite
* React Plotly
* Axios

---

## How to Run

### Backend

Go to backend folder:

pip install -r requirements.txt
uvicorn main:app --reload

Backend runs on:
http://localhost:8000

---

### Frontend

Go to frontend folder:

npm install
npm run dev

Open the local URL shown in the terminal.


---

## Future Improvements

* Save dashboards
* User login
* Drag and resize dashboard
* Cloud deployment
* Real-time data
* Advanced data quality checks

---

## Summary

Clarionex helps users quickly understand their data by automatically cleaning it and generating visual dashboards with simple clicks.
