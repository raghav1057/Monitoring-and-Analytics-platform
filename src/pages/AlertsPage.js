import { useState } from 'react';
import { tokens } from '../styles/tokens';

const mockAlerts = [
  { alert_id: 1, matched_entity: 'GJ01XX0001', alert_type: 'Stolen', camera_id: 'C001', confidence: 0.97, alert_status: 'ACTIVE', location_lat: 23.0225, location_lng: 72.5714, timestamp: '2026-09-26T03:02:15Z' },
  { alert_id: 2, matched_entity: 'GJ05AB1234', alert_type: 'Wanted', camera_id: 'C003', confidence: 0.91, alert_status: 'ACKNOWLEDGED', location_lat: 23.0300, location_lng: 72.5800, timestamp: '2026-09-26T02:58:44Z' },
  { alert_id: 3, matched_entity: 'GJ07MN9900', alert_type: 'Missing', camera_id: 'C002', confidence: 0.88, alert_status: 'RESOLVED', location_lat: 23.0250, location_lng: 72.5700, timestamp: '2026-09-26T02:40:10Z' },
  { alert_id: 4, matched_entity: 'GJ01ZZ0042', alert_type: 'Stolen', camera_id: 'C001', confidence: 0.95, alert_status: 'ACTIVE', location_lat: 23.0225, location_lng: 72.5714, timestamp: '2026-09-26T03:10:00Z' },
];

const mockWatchlist = [
  { id: 1, entity_identifier: 'GJ01XX0001', entity_type: 'Vehicle', category: 'Stolen', status: 'Active', notes: 'Reported stolen 2026-09-25' },
  { id: 2, entity_identifier: 'GJ05AB1234', entity_type: 'Vehicle', category: 'Wanted', status: 'Active', notes: 'Linked to robbery case' },
  { id: 3, entity_identifier: 'GJ07MN9900', entity_type: 'Vehicle', category: 'Missing', status: 'Inactive', notes: 'Owner reported missing' },
];

const alertStatusStyle = {
  ACTIVE:       { bg: 'rgba(239,68,68,0.12)',   color: '#f87171', border: 'rgba(239,68,68,0.3)' },
  ACKNOWLEDGED: { bg: 'rgba(245,158,11,0.12)',  color: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
  RESOLVED:     { bg: 'rgba(16,185,129,0.12)',  color: '#34d399', border: 'rgba(16,185,129,0.3)' },
};

function Badge({ label, style }) {
  return (
    <span style={{
      fontSize: '10px', fontFamily: tokens.fonts.mono, fontWeight: 700,
      padding: '2px 6px', borderRadius: '2px', letterSpacing: '0.04em',
      ...style,
    }}>
      {label}
    </span>
  );
}

function SectionHeader({ title }) {
  return (
    <div style={{
      padding: '12px 16px',
      borderBottom: '1px solid rgba(148,163,184,0.12)',
      fontSize: '12px', fontFamily: tokens.fonts.mono,
      color: '#64748b', letterSpacing: '0.06em',
    }}>
      {title}
    </div>
  );
}

export function AlertsPage() {
  const [activeTab, setActiveTab] = useState('ACTIVE');
  const [alerts, setAlerts] = useState(mockAlerts);
  const [watchlist] = useState(mockWatchlist);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState({
    entity_identifier: '', entity_type: 'Vehicle', category: 'Stolen', status: 'Active', notes: ''
  });

  const tabs = ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'];
  const filtered = alerts.filter(a => a.alert_status === activeTab);

  const handleAction = (alert_id, action) => {
    setAlerts(prev => prev.map(a =>
      a.alert_id === alert_id
        ? { ...a, alert_status: action === 'acknowledge' ? 'ACKNOWLEDGED' : 'RESOLVED' }
        : a
    ));
  };

  const inputStyle = {
    backgroundColor: '#0b101b',
    border: '1px solid rgba(148,163,184,0.2)',
    borderRadius: '4px',
    color: tokens.colors.text,
    fontFamily: tokens.fonts.primary,
    fontSize: '13px',
    padding: '8px 10px',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
  };

  const selectStyle = { ...inputStyle };

  return (
    <div style={{ padding: '24px', fontFamily: tokens.fonts.primary, color: tokens.colors.text }}>

      {/* ALERTS SECTION */}
      <div style={{ backgroundColor: '#0b101b', border: '1px solid rgba(148,163,184,0.12)', borderRadius: '4px', marginBottom: '20px' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(148,163,184,0.12)' }}>
          {tabs.map(tab => {
            const count = alerts.filter(a => a.alert_status === tab).length;
            const isActive = activeTab === tab;
            const s = alertStatusStyle[tab];
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '12px 20px',
                  fontSize: '11px', fontFamily: tokens.fonts.mono, fontWeight: 700,
                  letterSpacing: '0.06em', cursor: 'pointer', border: 'none',
                  borderBottom: isActive ? `2px solid ${s.color}` : '2px solid transparent',
                  backgroundColor: 'transparent',
                  color: isActive ? s.color : '#64748b',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
              >
                {tab}
                <span style={{
                  backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}`,
                  fontSize: '10px', padding: '1px 5px', borderRadius: '2px',
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Alert Rows */}
        {filtered.length === 0 ? (
          <div style={{ padding: '24px', color: '#64748b', fontSize: '13px', textAlign: 'center' }}>
            No {activeTab.toLowerCase()} alerts
          </div>
        ) : filtered.map((alert, i) => {
          const s = alertStatusStyle[alert.alert_status];
          return (
            <div key={alert.alert_id} style={{
              display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr auto',
              padding: '12px 16px', alignItems: 'center',
              borderBottom: i < filtered.length - 1 ? '1px solid rgba(148,163,184,0.08)' : 'none',
              backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
              gap: '12px',
            }}>
              <div>
                <div style={{ fontFamily: tokens.fonts.mono, fontWeight: 600, fontSize: '13px' }}>{alert.matched_entity}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{new Date(alert.timestamp).toLocaleTimeString()}</div>
              </div>
              <div style={{ fontSize: '12px', color: tokens.colors.textSecondary }}>{alert.alert_type}</div>
              <div style={{ fontSize: '12px', fontFamily: tokens.fonts.mono, color: '#64748b' }}>CAM-{alert.camera_id}</div>
              <div style={{ fontSize: '12px', color: tokens.colors.emerald, fontFamily: tokens.fonts.mono }}>{(alert.confidence * 100).toFixed(1)}%</div>
              <Badge label={alert.alert_status} style={{ backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }} />
              <div style={{ display: 'flex', gap: '6px' }}>
                {alert.alert_status === 'ACTIVE' && (
                  <button onClick={() => handleAction(alert.alert_id, 'acknowledge')} style={{
                    backgroundColor: 'rgba(245,158,11,0.12)', color: '#fbbf24',
                    border: '1px solid rgba(245,158,11,0.3)', borderRadius: '4px',
                    padding: '4px 10px', fontSize: '11px', fontFamily: tokens.fonts.mono,
                    cursor: 'pointer', fontWeight: 600,
                  }}>ACK</button>
                )}
                {alert.alert_status !== 'RESOLVED' && (
                  <button onClick={() => handleAction(alert.alert_id, 'resolve')} style={{
                    backgroundColor: 'rgba(16,185,129,0.12)', color: '#34d399',
                    border: '1px solid rgba(16,185,129,0.3)', borderRadius: '4px',
                    padding: '4px 10px', fontSize: '11px', fontFamily: tokens.fonts.mono,
                    cursor: 'pointer', fontWeight: 600,
                  }}>RESOLVE</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* WATCHLIST SECTION */}
      <div style={{ backgroundColor: '#0b101b', border: '1px solid rgba(148,163,184,0.12)', borderRadius: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid rgba(148,163,184,0.12)' }}>
          <span style={{ fontSize: '12px', fontFamily: tokens.fonts.mono, color: '#64748b', letterSpacing: '0.06em' }}>WATCHLIST</span>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              backgroundColor: 'rgba(173,198,255,0.1)', color: tokens.colors.primary,
              border: '1px solid rgba(173,198,255,0.2)', borderRadius: '4px',
              padding: '5px 12px', fontSize: '11px', fontFamily: tokens.fonts.mono,
              cursor: 'pointer', fontWeight: 600,
            }}
          >
            {showAddForm ? '✕ CANCEL' : '+ ADD ENTRY'}
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div style={{ padding: '16px', borderBottom: '1px solid rgba(148,163,184,0.12)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
            <input
              placeholder="Entity ID (e.g. GJ01XX0001)"
              value={newEntry.entity_identifier}
              onChange={e => setNewEntry({ ...newEntry, entity_identifier: e.target.value })}
              style={inputStyle}
            />
            <select value={newEntry.entity_type} onChange={e => setNewEntry({ ...newEntry, entity_type: e.target.value })} style={selectStyle}>
              <option>Vehicle</option>
              <option>Person</option>
            </select>
            <select value={newEntry.category} onChange={e => setNewEntry({ ...newEntry, category: e.target.value })} style={selectStyle}>
              <option>Stolen</option>
              <option>Wanted</option>
              <option>Missing</option>
            </select>
            <input
              placeholder="Notes"
              value={newEntry.notes}
              onChange={e => setNewEntry({ ...newEntry, notes: e.target.value })}
              style={inputStyle}
            />
            <button
              onClick={() => {
                if (!newEntry.entity_identifier) return;
                setShowAddForm(false);
                setNewEntry({ entity_identifier: '', entity_type: 'Vehicle', category: 'Stolen', status: 'Active', notes: '' });
              }}
              style={{
                backgroundColor: tokens.colors.primary, color: '#002e6a',
                border: 'none', borderRadius: '4px', padding: '8px 16px',
                fontSize: '12px', fontFamily: tokens.fonts.mono, fontWeight: 700,
                cursor: 'pointer', gridColumn: '4',
              }}
            >
              ADD TO WATCHLIST
            </button>
          </div>
        )}

        {/* Watchlist Table Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 2fr', padding: '8px 16px', fontSize: '10px', fontFamily: tokens.fonts.mono, color: '#64748b', letterSpacing: '0.06em', borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
          <span>ENTITY ID</span><span>TYPE</span><span>CATEGORY</span><span>STATUS</span><span>NOTES</span>
        </div>

        {watchlist.map((entry, i) => (
          <div key={entry.id} style={{
            display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 2fr',
            padding: '10px 16px', alignItems: 'center',
            borderBottom: i < watchlist.length - 1 ? '1px solid rgba(148,163,184,0.08)' : 'none',
            backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
            fontSize: '12px', fontFamily: tokens.fonts.mono,
          }}>
            <span style={{ color: tokens.colors.text, fontWeight: 600 }}>{entry.entity_identifier}</span>
            <span style={{ color: tokens.colors.textSecondary }}>{entry.entity_type}</span>
            <span style={{ color: tokens.colors.textSecondary }}>{entry.category}</span>
            <Badge
              label={entry.status.toUpperCase()}
              style={entry.status === 'Active'
                ? { backgroundColor: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }
                : { backgroundColor: 'rgba(148,163,184,0.08)', color: '#64748b', border: '1px solid rgba(148,163,184,0.2)' }
              }
            />
            <span style={{ color: '#64748a', fontFamily: tokens.fonts.primary }}>{entry.notes}</span>
          </div>
        ))}
      </div>

    </div>
  );
}