import React from 'react';
import {
  UploadCloud, LayoutDashboard,
  HelpCircle, FileText
} from 'lucide-react';

const Sidebar = ({ activeView, setActiveView }) => {
  const navItems = [
    { id: 'upload',    label: 'UPLOAD',    icon: UploadCloud },
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
  ];

  const bottomLinks = [
    { label: 'SUPPORT', icon: HelpCircle },
    { label: 'DOCUMENTATION', icon: FileText },
  ];

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      backgroundColor: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100,
    }}>

      {/* ── Brand ────────────────────────────────────── */}
      <div style={{ padding: '1.8rem 1.25rem 1.5rem' }}>
        <h1 style={{
          fontSize: '0.95rem',
          fontWeight: 700,
          margin: 0,
          letterSpacing: '0.08em',
          color: 'var(--text-primary)',
        }}>
          Clarionex AI
        </h1>
        <p style={{
          fontSize: '0.68rem',
          color: 'var(--text-muted)',
          margin: '0.15rem 0 0 0',
          letterSpacing: '0.02em',
          fontWeight: 400,
        }}>
          prism observatory
        </p>
      </div>

      {/* ── Navigation ───────────────────────────────── */}
      <nav style={{ flex: 1, padding: '0 0.75rem' }}>
        <ul style={{
          listStyle: 'none', padding: 0, margin: 0,
          display: 'flex', flexDirection: 'column', gap: '0.25rem',
        }}>
          {navItems.map(item => {
            const isActive = activeView === item.id;
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  id={`nav-${item.id}`}
                  onClick={() => setActiveView(item.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.7rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isActive ? 'var(--accent-cyan-dim)' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.78rem',
                    letterSpacing: '0.05em',
                    borderLeft: isActive ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <Icon
                    size={18}
                    style={{
                      color: isActive ? 'var(--accent-cyan)' : 'inherit',
                      transition: 'color 0.15s',
                      flexShrink: 0,
                    }}
                  />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Bottom Links ─────────────────────────────── */}
      <div style={{
        padding: '0.75rem 0.75rem 1.5rem',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.15rem',
      }}>
        {bottomLinks.map(link => {
          const Icon = link.icon;
          return (
            <button
              key={link.label}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.55rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'transparent',
                color: 'var(--text-muted)',
                fontSize: '0.72rem',
                fontWeight: 500,
                letterSpacing: '0.04em',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Icon size={15} style={{ flexShrink: 0 }} />
              {link.label}
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
