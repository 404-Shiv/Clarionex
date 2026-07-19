import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children, activeView, setActiveView }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      {/* Fixed Sidebar */}
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      {/* Main content area */}
      <div style={{
        flex: 1,
        marginLeft: 'var(--sidebar-width)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}>
        {/* Top Navbar */}
        <Navbar />

        {/* Scrollable content */}
        <main style={{
          flex: 1,
          padding: '2rem 2.5rem 3rem',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}>
          <div style={{ maxWidth: '1400px', width: '100%' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
