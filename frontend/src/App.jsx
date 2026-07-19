import React, { useState } from 'react';
import Layout from './components/Layout';
import UploadView from './views/UploadView';
import DashboardView from './views/DashboardView';

function App() {
  const [activeView, setActiveView] = useState('upload');
  const [selectedCharts, setSelectedCharts] = useState([]);
  const [uploadReport, setUploadReport] = useState(null);

  const handleSelectChart = (chartName) => {
    setSelectedCharts(prev =>
      prev.includes(chartName)
        ? prev.filter(c => c !== chartName)
        : [...prev, chartName]
    );
  };

  const handleRemoveChart = (chartName) => {
    setSelectedCharts(prev => prev.filter(c => c !== chartName));
  };

  const handleUploadSuccess = (report) => {
    setUploadReport(report);
    setSelectedCharts([]);
    // Auto-navigate to dashboard after upload
    setActiveView('dashboard');
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <DashboardView
            uploadReport={uploadReport}
            selectedCharts={selectedCharts}
            onSelectChart={handleSelectChart}
            onRemoveChart={handleRemoveChart}
            onGoUpload={() => setActiveView('upload')}
          />
        );
      case 'upload':
      default:
        return (
          <UploadView
            onUploadSuccess={handleUploadSuccess}
            uploadReport={uploadReport}
          />
        );
    }
  };

  return (
    <Layout activeView={activeView} setActiveView={setActiveView}>
      {renderView()}
    </Layout>
  );
}

export default App;
