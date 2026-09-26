import { useState } from 'react';
import { tokens } from '../styles/tokens';

const mockEvents = [
  { camera_id: 'C001', vehicle_number: 'GJ01XX0001', vehicle_type: 'SUV',   event_type: 'ANPR',    confidence: 0.97, timestamp: '2026-09-26T10:02:15Z' },
  { camera_id: 'C003', vehicle_number: 'GJ05AB1234', vehicle_type: 'Car',   event_type: 'ANPR',    confidence: 0.91, timestamp: '2026-09-26T09:58:44Z' },
  { camera_id: 'C001', vehicle_number: 'GJ01CD5678', vehicle_type: 'Truck', event_type: 'Vehicle', confidence: 0.85, timestamp: '2026-09-26T09:55:10Z' },
  { camera_id: 'C002', vehicle_number: null,         vehicle_type: 'Bike',  event_type: 'Vehicle', confidence: 0.78, timestamp: '2026-09-26T09:51:33Z' },
  { camera_id: 'C003', vehicle_number: 'GJ01ZZ0042', vehicle_type: 'SUV',   event_type: 'ANPR',    confidence: 0.95, timestamp: '2026-09-26T09:44:00Z' },
  { camera_id: 'C001', vehicle_number: 'GJ07MN9900', vehicle_type: 'Car',   event_type: 'ANPR',    confidence: 0.88, timestamp: '2026-09-26T09:40:22Z' },
  { camera_id: 'C002', vehicle_number: null,         vehicle_type: 'Bus',   event_type: 'Vehicle', confidence: 0.72, timestamp: '2026-09-26T09:35:10Z' },
  { camera_id: 'C003', vehicle_number: 'GJ05AB1234', vehicle_type: 'Car',   event_type: 'ANPR',    confidence: 0.93, timestamp: '2026-09-26T09:10:05Z' },
];

const summaryStats = [
  { label: 'TOTAL EVENTS TODAY', value: 128 },
  { label: 'ANPR DETECTIONS',    value: 94  },
  { label: 'VEHICLE DETECTIONS', value: 34  },
  { label: 'AVG CONFIDENCE',     value: '91.2%' },
];

const cameraBreakdown = [
  { camera_id: 'C001', name: 'Nehru Bridge',    events: 54, anpr: 41 },
  { camera_id: 'C002', name: 'RTO Checkpoint',  events: 31, anpr: 18 },
  { camera_id: 'C003', name: 'Railway Station', events: 43, anpr: 35 },
];

export function AnalyticsPage() {
  const [filterCamera, setFilterCamera] = useState('');
  const [filterVehicle, setFilterVehicle] = useState('');

  const filtered = mockEvents.filter(e => {
    const camMatch = filterCamera ? e.camera_id === filterCamera : true;
    const vehMatch = filterVehicle ? (e.vehicle_number || '').includes(filterVehicle.toUpperCase()) : true;
    return camMatch && vehMatch;
  });

  const inputStyle = {
    backgroundColor: '#070b12',
    border: '1px solid rgba(148,163,184,0.2)',
    borderRadius: '4px',
    color: tokens.colors.text,
    fontFamily: tokens.fonts.mono,
    fontSize: '12px',
    padding: '7px 10px',
    outline: 'none',
  };

  return (
    <div style={{ padding: '24px', fontFamily: tokens.fonts.primary, color: tokens.colors.text }}>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {summaryStats.map(s => (
          <div key={s.label} style={{ backgroundColor: '#0b101b', border: '1px solid rgba(148,163,184,0.12)', borderRadius: '4px', padding: '16px' }}>
            <div style={{ fontSize: '10px', fontFamily: tokens.fonts.mono, color: '#64748b', letterSpacing: '0.08em', marginBottom: '8px' }}>{s.label}</div>
            <div style={{ fontSize: '26px', fontWeight: 700, fontFamily: tokens.fonts.mono, color: tokens.colors.text }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px' }}>

        {/* Event Log */}
        <div style={{ backgroundColor: '#0b101b', border: '1px solid rgba(148,163,184,0.12)', borderRadius: '4px' }}>

          {/* Filter Bar */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(148,163,184,0.12)', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontFamily: tokens.fonts.mono, color: '#64748b', letterSpacing: '0.06em', marginRight: '4px' }}>EVENT LOG</span>
            <select
              value={filterCamera}
              onChange={e => setFilterCamera(e.target.value)}
              style={{ ...inputStyle, width: '160px' }}
            >
              <option value=''>ALL CAMERAS</option>
              <option value='C001'>CAM-C001</option>
              <option value='C002'>CAM-C002</option>
              <option value='C003'>CAM-C003</option>
            </select>
            <input
              placeholder="Filter by vehicle..."
              value={filterVehicle}
              onChange={e => setFilterVehicle(e.target.value)}
              style={{ ...inputStyle, width: '180px' }}
            />
            {(filterCamera || filterVehicle) && (
              <button
                onClick={() => { setFilterCamera(''); setFilterVehicle(''); }}
                style={{ backgroundColor: 'transparent', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '4px', color: '#64748b', padding: '6px 10px', fontSize: '11px', fontFamily: tokens.fonts.mono, cursor: 'pointer' }}
              >
                CLEAR
              </button>
            )}
            <span style={{ marginLeft: 'auto', fontSize: '11px', fontFamily: tokens.fonts.mono, color: '#64748b' }}>
              {filtered.length} RESULTS
            </span>
          </div>

          {/* Table Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1fr 1fr 1fr 1fr', padding: '8px 16px', fontSize: '10px', fontFamily: tokens.fonts.mono, color: '#64748b', letterSpacing: '0.06em', borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
            <span>TIMESTAMP</span><span>VEHICLE</span><span>TYPE</span><span>EVENT</span><span>CAMERA</span><span>CONF</span>
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>No events match filters</div>
          ) : filtered.map((e, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1fr 1fr 1fr 1fr',
              padding: '9px 16px', alignItems: 'center',
              borderBottom: i < filtered.length - 1 ? '1px solid rgba(148,163,184,0.06)' : 'none',
              backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
              fontSize: '12px', fontFamily: tokens.fonts.mono,
            }}>
              <span style={{ color: '#64748b' }}>{new Date(e.timestamp).toLocaleTimeString()}</span>
              <span style={{ color: tokens.colors.text, fontWeight: 600 }}>{e.vehicle_number || '—'}</span>
              <span style={{ color: tokens.colors.textSecondary }}>{e.vehicle_type}</span>
              <span style={{ color: tokens.colors.textSecondary }}>{e.event_type}</span>
              <span style={{ color: '#64748b' }}>CAM-{e.camera_id}</span>
              <span style={{ color: e.confidence >= 0.9 ? tokens.colors.emerald : tokens.colors.amber }}>
                {(e.confidence * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>

        {/* Camera Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ backgroundColor: '#0b101b', border: '1px solid rgba(148,163,184,0.12)', borderRadius: '4px' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(148,163,184,0.12)', fontSize: '12px', fontFamily: tokens.fonts.mono, color: '#64748b', letterSpacing: '0.06em' }}>
              CAMERA BREAKDOWN
            </div>
            {cameraBreakdown.map((cam, i) => {
              const pct = Math.round((cam.events / 128) * 100);
              return (
                <div key={cam.camera_id} style={{ padding: '14px 16px', borderBottom: i < cameraBreakdown.length - 1 ? '1px solid rgba(148,163,184,0.08)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>{cam.name}</div>
                      <div style={{ fontSize: '11px', fontFamily: tokens.fonts.mono, color: '#64748b' }}>CAM-{cam.camera_id}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: tokens.fonts.mono }}>{cam.events}</div>
                      <div style={{ fontSize: '10px', color: '#64748b', fontFamily: tokens.fonts.mono }}>EVENTS</div>
                    </div>
                  </div>
                  {/* Bar */}
                  <div style={{ backgroundColor: 'rgba(148,163,184,0.1)', borderRadius: '2px', height: '4px' }}>
                    <div style={{ width: `${pct}%`, height: '100%', backgroundColor: tokens.colors.primary, borderRadius: '2px' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '10px', fontFamily: tokens.fonts.mono, color: '#64748b' }}>
                    <span>ANPR: {cam.anpr}</span>
                    <span>{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}