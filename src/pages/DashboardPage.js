import { useState } from 'react';
import { tokens } from '../styles/tokens';
import { mockStats, mockCameras } from '../data/mockData';

const mockRecentEvents = [
  { camera_id: 'C001', vehicle_number: 'GJ01XX0001', vehicle_type: 'SUV', event_type: 'ANPR', confidence: 0.97, timestamp: '2026-09-26T03:02:15Z' },
  { camera_id: 'C003', vehicle_number: 'GJ05AB1234', vehicle_type: 'Car', event_type: 'ANPR', confidence: 0.91, timestamp: '2026-09-26T02:58:44Z' },
  { camera_id: 'C001', vehicle_number: 'GJ01CD5678', vehicle_type: 'Truck', event_type: 'Vehicle', confidence: 0.85, timestamp: '2026-09-26T02:55:10Z' },
  { camera_id: 'C002', vehicle_number: null, vehicle_type: 'Bike', event_type: 'Vehicle', confidence: 0.78, timestamp: '2026-09-26T02:51:33Z' },
];

const mockAlerts = [
  { alert_id: 1, matched_entity: 'GJ01XX0001', alert_type: 'Stolen', camera_id: 'C001', confidence: 0.97, alert_status: 'ACTIVE', timestamp: '2026-09-26T03:02:15Z' },
  { alert_id: 2, matched_entity: 'GJ05AB1234', alert_type: 'Wanted', camera_id: 'C003', confidence: 0.91, alert_status: 'ACKNOWLEDGED', timestamp: '2026-09-26T02:58:44Z' },
];

function StatCard({ label, value, color, sub }) {
  return (
    <div style={{
      backgroundColor: '#0b101b',
      border: '1px solid rgba(148, 163, 184, 0.12)',
      borderRadius: '4px',
      padding: '20px',
      flex: 1,
    }}>
      <div style={{ fontSize: '10px', fontFamily: tokens.fonts.mono, color: '#64748b', letterSpacing: '0.08em', marginBottom: '8px' }}>
        {label}
      </div>
      <div style={{ fontSize: '30px', fontWeight: 700, fontFamily: tokens.fonts.mono, color: color || tokens.colors.text, lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '11px', color: '#64748b', fontFamily: tokens.fonts.primary, marginTop: '6px' }}>{sub}</div>}
    </div>
  );
}

function AlertBadge({ status }) {
  const config = {
    ACTIVE: { bg: 'rgba(239,68,68,0.12)', color: '#f87171', border: 'rgba(239,68,68,0.3)' },
    ACKNOWLEDGED: { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
    RESOLVED: { bg: 'rgba(16,185,129,0.12)', color: '#34d399', border: 'rgba(16,185,129,0.3)' },
  };
  const c = config[status];
  return (
    <span style={{
      backgroundColor: c.bg, color: c.color, border: `1px solid ${c.border}`,
      fontSize: '10px', fontFamily: tokens.fonts.mono, fontWeight: 700,
      padding: '2px 6px', borderRadius: '2px', letterSpacing: '0.04em',
    }}>
      {status}
    </span>
  );
}

export function DashboardPage() {
  const [stats] = useState(mockStats);
  const cameras = mockCameras;

  return (
    <div style={{ padding: '24px', fontFamily: tokens.fonts.primary, color: tokens.colors.text }}>

      {/* System Status Bar */}
      <div style={{
        backgroundColor: '#0b101b',
        border: '1px solid rgba(148, 163, 184, 0.12)',
        borderRadius: '4px',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        marginBottom: '24px',
        fontSize: '12px',
        fontFamily: tokens.fonts.mono,
      }}>
        <span style={{ color: tokens.colors.emerald, fontWeight: 700 }}>● SYSTEM NOMINAL</span>
        <span style={{ color: '#64748b' }}>SHIFT 01 · {new Date().toUTCString().slice(17, 25)} UTC</span>
        <span style={{ color: '#64748b' }}>
          <span style={{ color: tokens.colors.emerald }}>● {stats.online_cameras} Online</span>
          {' · '}
          <span style={{ color: tokens.colors.crimson }}>● {stats.offline_cameras} Offline</span>
          {' · '}
          <span style={{ color: tokens.colors.amber }}>● {stats.active_alerts} Active Alerts</span>
        </span>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <StatCard label="TOTAL CAMERAS" value={stats.total_cameras} />
        <StatCard label="ONLINE" value={stats.online_cameras} color={tokens.colors.emerald} />
        <StatCard label="OFFLINE" value={stats.offline_cameras} color={tokens.colors.crimson} />
        <StatCard label="ACTIVE ALERTS" value={stats.active_alerts} color={tokens.colors.amber} />
        <StatCard label="TOTAL EVENTS" value={stats.total_events} />
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Camera Status */}
        <div style={{ backgroundColor: '#0b101b', border: '1px solid rgba(148,163,184,0.12)', borderRadius: '4px' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(148,163,184,0.12)', fontSize: '12px', fontFamily: tokens.fonts.mono, color: '#64748b', letterSpacing: '0.06em' }}>
            CAMERA STATUS
          </div>
          {cameras.map((cam, i) => {
            const statusColor = { Online: tokens.colors.emerald, Offline: tokens.colors.crimson, Degraded: tokens.colors.amber };
            return (
              <div key={cam.camera_id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 16px',
                borderBottom: i < cameras.length - 1 ? '1px solid rgba(148,163,184,0.08)' : 'none',
                backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500 }}>{cam.name}</div>
                  <div style={{ fontSize: '11px', fontFamily: tokens.fonts.mono, color: '#64748b', marginTop: '2px' }}>
                    {cam.camera_id} · {cam.zone}
                  </div>
                </div>
                <span style={{ color: statusColor[cam.status], fontSize: '11px', fontFamily: tokens.fonts.mono, fontWeight: 700 }}>
                  ● {cam.status.toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>

        {/* Active Alerts */}
        <div style={{ backgroundColor: '#0b101b', border: '1px solid rgba(148,163,184,0.12)', borderRadius: '4px' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(148,163,184,0.12)', fontSize: '12px', fontFamily: tokens.fonts.mono, color: '#64748b', letterSpacing: '0.06em' }}>
            ACTIVE ALERTS
          </div>
          {mockAlerts.map((alert, i) => (
            <div key={alert.alert_id} style={{
              padding: '10px 16px',
              borderBottom: i < mockAlerts.length - 1 ? '1px solid rgba(148,163,184,0.08)' : 'none',
              backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: tokens.fonts.mono }}>{alert.matched_entity}</span>
                <AlertBadge status={alert.alert_status} />
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', fontFamily: tokens.fonts.mono }}>
                {alert.alert_type} · CAM-{alert.camera_id} · {(alert.confidence * 100).toFixed(1)}% CONF
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                {new Date(alert.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Events */}
        <div style={{ backgroundColor: '#0b101b', border: '1px solid rgba(148,163,184,0.12)', borderRadius: '4px', gridColumn: '1 / -1' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(148,163,184,0.12)', fontSize: '12px', fontFamily: tokens.fonts.mono, color: '#64748b', letterSpacing: '0.06em' }}>
            RECENT DETECTIONS
          </div>
          {/* Table Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1fr 1fr', padding: '8px 16px', fontSize: '10px', fontFamily: tokens.fonts.mono, color: '#64748b', letterSpacing: '0.06em', borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
            <span>TIMESTAMP</span><span>VEHICLE</span><span>TYPE</span><span>EVENT</span><span>CAMERA</span><span>CONFIDENCE</span>
          </div>
          {mockRecentEvents.map((event, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1fr 1fr',
              padding: '9px 16px',
              borderBottom: i < mockRecentEvents.length - 1 ? '1px solid rgba(148,163,184,0.08)' : 'none',
              backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
              fontSize: '12px', fontFamily: tokens.fonts.mono, color: tokens.colors.textSecondary,
              alignItems: 'center',
            }}>
              <span style={{ color: '#64748b' }}>{new Date(event.timestamp).toLocaleTimeString()}</span>
              <span style={{ color: tokens.colors.text, fontWeight: 600 }}>{event.vehicle_number || '—'}</span>
              <span>{event.vehicle_type}</span>
              <span>{event.event_type}</span>
              <span>CAM-{event.camera_id}</span>
              <span style={{ color: tokens.colors.emerald }}>{(event.confidence * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}