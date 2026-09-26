import { NavLink } from 'react-router-dom';
import { tokens } from '../styles/tokens';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '⊞' },
  { path: '/cameras', label: 'Cameras', icon: '⊙' },
  { path: '/alerts', label: 'Alerts & Watchlist', icon: '⚠' },
  { path: '/search', label: 'Search & Trace', icon: '⌕' },
  { path: '/analytics', label: 'Analytics & Logs', icon: '≡' },
];

const bottomItems = [
  { path: '/settings', label: 'Settings', icon: '⚙' },
];

export function Sidebar() {
  const linkStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 16px',
    borderRadius: '4px',
    textDecoration: 'none',
    fontSize: '14px',
    fontFamily: tokens.fonts.primary,
    fontWeight: isActive ? 600 : 400,
    color: isActive ? tokens.colors.text : tokens.colors.textSecondary,
    backgroundColor: isActive ? 'rgba(173, 198, 255, 0.08)' : 'transparent',
    borderLeft: isActive ? `2px solid ${tokens.colors.primary}` : '2px solid transparent',
    transition: 'all 0.15s ease',
  });

  return (
    <div style={{
      width: '240px',
      minHeight: '100vh',
      backgroundColor: '#0b101b',
      borderRight: '1px solid rgba(148, 163, 184, 0.12)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 16px',
        borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
        marginBottom: '8px',
      }}>
        <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: tokens.fonts.primary, color: tokens.colors.text, letterSpacing: '-0.02em' }}>
          VisionGuard
        </div>
        <div style={{ fontSize: '10px', fontFamily: tokens.fonts.mono, color: '#64748b', letterSpacing: '0.08em', marginTop: '2px' }}>
          TACTICAL CV V1.0
        </div>
      </div>

      {/* Label */}
      <div style={{ padding: '8px 16px 4px', fontSize: '10px', fontFamily: tokens.fonts.mono, color: '#64748b', letterSpacing: '0.08em' }}>
        NAVIGATION MODULES
      </div>

      {/* Main Nav */}
      <nav style={{ flex: 1, padding: '4px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            style={({ isActive }) => linkStyle(isActive)}
          >
            <span style={{ fontSize: '16px', width: '20px', textAlign: 'center' }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Nav */}
      <div style={{ padding: '8px', borderTop: '1px solid rgba(148, 163, 184, 0.12)' }}>
        {bottomItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => linkStyle(isActive)}
          >
            <span style={{ fontSize: '16px', width: '20px', textAlign: 'center' }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}