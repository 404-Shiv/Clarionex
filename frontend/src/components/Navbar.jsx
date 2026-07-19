import React from 'react';
import { Search, Bell, Settings } from 'lucide-react';

const Navbar = () => {
  return (
    <nav style={{
      height: 'var(--navbar-height)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 2.5rem',
      borderBottom: '1px solid var(--border-subtle)',
      backgroundColor: 'var(--bg-main)',
      flexShrink: 0,
      gap: '0.75rem',
    }}>

      {/* ── Search ────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-md)',
        padding: '0.45rem 0.85rem',
        width: '220px',
        transition: 'border-color 0.2s',
      }}>
        <Search size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
        <input
          id="navbar-search"
          type="text"
          placeholder="Query models..."
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '0.8rem',
            width: '100%',
            padding: 0,
          }}
        />
      </div>

      {/* ── Icons ─────────────────────────────────── */}
      <button
        id="navbar-notifications"
        style={{
          width: 34, height: 34,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 'var(--radius-sm)',
          background: 'transparent',
          color: 'var(--text-secondary)',
          transition: 'all 0.15s',
          position: 'relative',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
          e.currentTarget.style.color = 'var(--text-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }}
      >
        <Bell size={17} />
      </button>

      <button
        id="navbar-settings"
        style={{
          width: 34, height: 34,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 'var(--radius-sm)',
          background: 'transparent',
          color: 'var(--text-secondary)',
          transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
          e.currentTarget.style.color = 'var(--text-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }}
      >
        <Settings size={17} />
      </button>

      {/* ── Avatar ────────────────────────────────── */}
      <div style={{
        width: 30, height: 30,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.7rem',
        fontWeight: 700,
        color: '#fff',
        cursor: 'pointer',
        marginLeft: '0.25rem',
      }}>
        U
      </div>
    </nav>
  );
};

export default Navbar;
