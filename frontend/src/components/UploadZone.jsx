import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';
import { uploadFile, getCharts } from '../api';

const UploadZone = ({ onUploadSuccess }) => {
  const [isDragHover, setIsDragHover] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadDone, setUploadDone] = useState(false);
  const fileInputRef = useRef(null);

  const processUpload = async (file) => {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file.');
      return;
    }
    setError(null);
    setIsUploading(true);

    try {
      // 1. Upload & clean
      const uploadData = await uploadFile(file);

      // 2. Fetch suggested charts for this dataset
      const chartData = await getCharts();

      setUploadDone(true);

      // 3. Pass everything up to parent so analytics render immediately
      onUploadSuccess({
        cleaning_report: uploadData.cleaning_report,
        metadata: uploadData.metadata,
        charts: chartData.charts,
        dataset_info: chartData.dataset_info,
        filename: uploadData.filename,
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Check the backend is running.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) await processUpload(file);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragHover(false);
    const file = e.dataTransfer.files[0];
    if (file) await processUpload(file);
  };

  return (
    <div style={{ width: '100%', textAlign: 'center' }}>
      <div
        className="glass-panel"
        onDragOver={(e) => { e.preventDefault(); setIsDragHover(true); }}
        onDragLeave={() => setIsDragHover(false)}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current.click()}
        style={{
          padding: '2.5rem 2rem',
          border: `2px dashed ${isDragHover ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.1)'}`,
          cursor: isUploading ? 'not-allowed' : 'pointer',
          transition: 'all 0.25s ease',
          backgroundColor: isDragHover ? 'rgba(6,214,160,0.05)' : 'transparent',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: '10px',
        }}
      >
        {isUploading ? (
          <>
            <div style={{
              width: '56px', height: '56px', marginBottom: '1.2rem',
              border: '3px solid rgba(6,214,160,0.2)',
              borderTop: '3px solid var(--accent-cyan)',
              borderRadius: '50%',
              animation: 'spin 0.9s linear infinite',
            }} />
            <p style={{ color: 'var(--accent-cyan)', fontWeight: 500 }}>
              Cleaning &amp; processing data…
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.4rem' }}>
              Generating chart suggestions
            </p>
          </>
        ) : uploadDone ? (
          <>
            <CheckCircle size={52} color="var(--accent-cyan)" style={{ marginBottom: '1rem' }} />
            <p style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>Dataset processed successfully</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.3rem' }}>Analytics are rendering below</p>
          </>
        ) : (
          <>
            <UploadCloud
              size={52}
              color={isDragHover ? 'var(--accent-cyan)' : 'var(--text-secondary)'}
              style={{ marginBottom: '1.2rem', transition: 'color 0.25s' }}
            />
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>Drag &amp; Drop your CSV</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              or click to browse — data will be cleaned automatically
            </p>
          </>
        )}

        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            marginTop: '1rem', color: '#ef4444',
            background: 'rgba(239,68,68,0.08)', padding: '0.5rem 1rem',
            borderRadius: '6px', fontSize: '0.85rem',
          }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}
      </div>

      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { 100% { transform: rotate(360deg); } }` }} />
    </div>
  );
};

export default UploadZone;
