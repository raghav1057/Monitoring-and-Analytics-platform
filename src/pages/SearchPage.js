import { useState, useEffect, useRef } from 'react';
import { tokens } from '../styles/tokens';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const mockHistory = {
  'GJ01XX0001': [
    { camera_id: 'C008', name: 'Dwarka Sector 21', timestamp: '2026-09-26T09:44:30Z', confidence: 0.94, vehicle_type: 'SUV', latitude: 28.5523, longitude: 77.0588 },
    { camera_id: 'C003', name: 'Kashmere Gate', timestamp: '2026-09-26T09:55:10Z', confidence: 0.91, vehicle_type: 'SUV', latitude: 28.6678, longitude: 77.2285 },
    { camera_id: 'C001', name: 'Connaught Place', timestamp: '2026-09-26T10:02:15Z', confidence: 0.97, vehicle_type: 'SUV', latitude: 28.6315, longitude: 77.2167 },
  ],
  'GJ05AB1234': [
    { camera_id: 'C002', name: 'India Gate', timestamp: '2026-09-26T08:10:00Z', confidence: 0.88, vehicle_type: 'Car', latitude: 28.6129, longitude: 77.2295 },
    { camera_id: 'C001', name: 'Connaught Place', timestamp: '2026-09-26T08:28:44Z', confidence: 0.91, vehicle_type: 'Car', latitude: 28.6315, longitude: 77.2167 },
  ],
};

function timeDiff(a, b) {
  const diff = Math.abs(new Date(b) - new Date(a));
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return `${mins}m ${secs}s`;
}

function RouteMap({ detections }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!detections || detections.length === 0) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapRef.current, {
      center: [detections[0].latitude, detections[0].longitude],
      zoom: 12,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Add numbered pins
    detections.forEach((det, i) => {
      const isLast = i === detections.length - 1;
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:24px;height:24px;background:${isLast ? '#ef4444' : '#adc6ff'};border:2px solid rgba(255,255,255,0.8);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:${isLast ? '#fff' : '#002e6a'};font-family:monospace;">${i + 1}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      L.marker([det.latitude, det.longitude], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:monospace;font-size:12px;">
            <div style="font-weight:700;">${det.name}</div>
            <div style="color:#666;">CAM-${det.camera_id}</div>
            <div style="color:#666;">${new Date(det.timestamp).toLocaleTimeString()}</div>
            <div style="color:#10b981;font-weight:600;">${(det.confidence * 100).toFixed(1)}% CONF</div>
          </div>
        `);
    });

    // Fetch real road route from OSRM for each consecutive pair
    const drawRoutes = async () => {
      for (let i = 0; i < detections.length - 1; i++) {
        const from = detections[i];
        const to = detections[i + 1];
        const url = `https://router.project-osrm.org/route/v1/driving/${from.longitude},${from.latitude};${to.longitude},${to.latitude}?overview=full&geometries=geojson`;

        try {
          const res = await fetch(url);
          const data = await res.json();
          if (data.routes && data.routes[0]) {
            const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
            if (coords.length > 0 && mapInstanceRef.current) {
              L.polyline(coords, {
                color: '#adc6ff',
                weight: 3,
                opacity: 0.8,
              }).addTo(mapInstanceRef.current);
            }
          }
        } catch (e) {
          // Fallback to straight line if OSRM fails
          L.polyline([[from.latitude, from.longitude], [to.latitude, to.longitude]], {
            color: '#adc6ff',
            weight: 2,
            dashArray: '6, 4',
          }).addTo(map);
        }
      }
    };

    drawRoutes();

    const coords = detections.map(d => [d.latitude, d.longitude]);
    map.fitBounds(coords, { padding: [40, 40] });
    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [detections]);

  return (
    <div style={{ borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(148,163,184,0.12)', marginBottom: '16px' }}>
      <div style={{ padding: '10px 16px', backgroundColor: '#0b101b', borderBottom: '1px solid rgba(148,163,184,0.12)', fontSize: '11px', fontFamily: tokens.fonts.mono, color: '#64748b', letterSpacing: '0.06em' }}>
        ROUTE RECONSTRUCTION
      </div>
      <div ref={mapRef} style={{ height: '340px', width: '100%' }} />
    </div>
  );
}

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [searched, setSearched] = useState('');
  const [error, setError] = useState('');

  const handleSearch = () => {
    const plate = query.trim().toUpperCase().replace(/\s+/g, '');
    if (!plate) return;
    const data = mockHistory[plate];
    if (data) {
      setResults(data);
      setError('');
    } else {
      setResults([]);
      setError(`No history found for ${plate}`);
    }
    setSearched(plate);
  };

  return (
    <div style={{ padding: '24px', fontFamily: tokens.fonts.primary, color: tokens.colors.text }}>

      {/* Search Bar */}
      <div style={{
        backgroundColor: '#0b101b',
        border: '1px solid rgba(148,163,184,0.12)',
        borderRadius: '4px',
        padding: '20px',
        marginBottom: '20px',
      }}>
        <div style={{ fontSize: '10px', fontFamily: tokens.fonts.mono, color: '#64748b', letterSpacing: '0.08em', marginBottom: '12px' }}>
          VEHICLE TRACE // ENTER LICENSE PLATE
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="e.g. GJ01XX0001"
            style={{
              flex: 1,
              backgroundColor: '#070b12',
              border: '1px solid rgba(148,163,184,0.2)',
              borderRadius: '4px',
              color: tokens.colors.text,
              fontFamily: tokens.fonts.mono,
              fontSize: '16px',
              padding: '10px 14px',
              outline: 'none',
              letterSpacing: '0.04em',
            }}
          />
          <button
            onClick={handleSearch}
            style={{
              backgroundColor: tokens.colors.primary,
              color: '#002e6a',
              border: 'none', borderRadius: '4px',
              padding: '10px 28px',
              fontSize: '13px', fontFamily: tokens.fonts.mono, fontWeight: 700,
              cursor: 'pointer', letterSpacing: '0.04em',
            }}
          >
            TRACE ROUTE
          </button>
        </div>
        <div style={{ marginTop: '8px', fontSize: '11px', color: '#64748b', fontFamily: tokens.fonts.mono }}>
          TRY: GJ01XX0001 · GJ05AB1234
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          backgroundColor: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '4px', padding: '12px 16px',
          color: '#f87171', fontSize: '13px', fontFamily: tokens.fonts.mono,
          marginBottom: '20px',
        }}>
          ✕ {error}
        </div>
      )}

      {/* Results */}
      {results && results.length > 0 && (
        <div>
          {/* Route Map */}
          <RouteMap detections={results} />

          {/* Timeline + Dossier */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '16px' }}>

            {/* Timeline */}
            <div style={{ backgroundColor: '#0b101b', border: '1px solid rgba(148,163,184,0.12)', borderRadius: '4px' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(148,163,184,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontFamily: tokens.fonts.mono, color: '#64748b', letterSpacing: '0.06em' }}>
                  KINEMATIC RECONSTRUCTION · {results.length} SIGHTINGS
                </span>
                <span style={{ fontSize: '12px', fontFamily: tokens.fonts.mono, color: tokens.colors.emerald }}>
                  {searched}
                </span>
              </div>

              {results.map((det, i) => (
                <div key={i}>
                  <div style={{
                    padding: '16px',
                    borderBottom: i < results.length - 1 ? '1px solid rgba(148,163,184,0.08)' : 'none',
                    display: 'grid', gridTemplateColumns: '32px 1fr auto', gap: '12px', alignItems: 'start',
                  }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      backgroundColor: i === results.length - 1 ? tokens.colors.crimson : tokens.colors.primary,
                      color: i === results.length - 1 ? '#fff' : '#002e6a',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: 700, fontFamily: tokens.fonts.mono, flexShrink: 0,
                    }}>
                      {i + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>{det.name}</div>
                      <div style={{ fontSize: '11px', fontFamily: tokens.fonts.mono, color: '#64748b' }}>
                        CAM-{det.camera_id} · {new Date(det.timestamp).toLocaleTimeString()} · {det.vehicle_type}
                      </div>
                      <div style={{ fontSize: '11px', fontFamily: tokens.fonts.mono, color: '#64748b', marginTop: '2px' }}>
                        {det.latitude.toFixed(4)}, {det.longitude.toFixed(4)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: tokens.fonts.mono, color: tokens.colors.emerald }}>
                        {(det.confidence * 100).toFixed(1)}%
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748b', fontFamily: tokens.fonts.mono }}>CONF</div>
                    </div>
                  </div>

                  {i < results.length - 1 && (
                    <div style={{
                      padding: '6px 16px 6px 60px',
                      fontSize: '11px', fontFamily: tokens.fonts.mono, color: '#64748b',
                      borderBottom: '1px solid rgba(148,163,184,0.06)',
                      backgroundColor: 'rgba(255,255,255,0.01)',
                    }}>
                      ↓ transit: {timeDiff(det.timestamp, results[i + 1].timestamp)}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Summary Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ backgroundColor: '#0b101b', border: '1px solid rgba(148,163,184,0.12)', borderRadius: '4px' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(148,163,184,0.12)', fontSize: '12px', fontFamily: tokens.fonts.mono, color: '#64748b', letterSpacing: '0.06em' }}>
                  FORENSIC DOSSIER
                </div>
                <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {[
                    { label: 'PLATE', value: searched },
                    { label: 'TYPE', value: results[0].vehicle_type },
                    { label: 'SIGHTINGS', value: results.length },
                    { label: 'TOTAL TIME', value: timeDiff(results[0].timestamp, results[results.length - 1].timestamp) },
                    { label: 'FIRST SEEN', value: new Date(results[0].timestamp).toLocaleTimeString() },
                    { label: 'LAST SEEN', value: new Date(results[results.length - 1].timestamp).toLocaleTimeString() },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div style={{ fontSize: '10px', fontFamily: tokens.fonts.mono, color: '#64748b', letterSpacing: '0.06em', marginBottom: '4px' }}>{label}</div>
                      <div style={{ fontSize: '14px', fontFamily: tokens.fonts.mono, fontWeight: 600, color: tokens.colors.text }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ backgroundColor: '#0b101b', border: '1px solid rgba(148,163,184,0.12)', borderRadius: '4px' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(148,163,184,0.12)', fontSize: '12px', fontFamily: tokens.fonts.mono, color: '#64748b', letterSpacing: '0.06em' }}>
                  LATEST SIGHTING
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>{results[results.length - 1].name}</div>
                  <div style={{ fontSize: '11px', fontFamily: tokens.fonts.mono, color: '#64748b', marginBottom: '4px' }}>
                    CAM-{results[results.length - 1].camera_id}
                  </div>
                  <div style={{ fontSize: '11px', fontFamily: tokens.fonts.mono, color: '#64748b', marginBottom: '4px' }}>
                    {new Date(results[results.length - 1].timestamp).toLocaleTimeString()}
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: tokens.fonts.mono, color: tokens.colors.emerald, marginTop: '8px' }}>
                    {(results[results.length - 1].confidence * 100).toFixed(1)}% CONF
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}