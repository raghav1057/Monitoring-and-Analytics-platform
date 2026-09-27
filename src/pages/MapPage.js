import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { tokens } from '../styles/tokens';
import { mockCameras } from '../data/mockData';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const statusColor = {
  Online: '#4edea3',
  Offline: '#ef4444',
  Degraded: '#f59e0b',
};

function createPin(color) {
  return L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;background:${color};border:2px solid rgba(255,255,255,0.8);border-radius:50%;box-shadow:0 0 6px ${color};"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

export function MapPage() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [28.6139, 77.2090],
      zoom: 11,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    mockCameras.forEach(camera => {
      const marker = L.marker([camera.latitude, camera.longitude], {
        icon: createPin(statusColor[camera.status]),
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family:monospace;font-size:12px;min-width:160px;">
          <div style="font-weight:700;margin-bottom:4px;">${camera.name}</div>
          <div style="color:#666;">ID: ${camera.camera_id}</div>
          <div style="color:#666;">${camera.department}</div>
          <div style="color:#666;">${camera.zone}</div>
          <div style="margin-top:6px;font-weight:600;color:${statusColor[camera.status]};">● ${camera.status}</div>
        </div>
      `);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return (
    <div style={{ padding: '24px', fontFamily: tokens.fonts.primary, color: tokens.colors.text }}>
      <h1 style={{
        fontSize: '22px', fontWeight: 600, marginBottom: '20px',
        paddingBottom: '12px', borderBottom: '1px solid rgba(148,163,184,0.12)',
        letterSpacing: '-0.01em',
      }}>
        Camera Map
      </h1>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '16px', fontSize: '11px', fontFamily: tokens.fonts.mono }}>
        {Object.entries(statusColor).map(([status, color]) => (
          <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: color }} />
            <span style={{ color: '#94a3b8' }}>{status.toUpperCase()}</span>
          </div>
        ))}
      </div>

      <div style={{ borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(148,163,184,0.12)' }}>
        <div ref={mapRef} style={{ height: '600px', width: '100%' }} />
      </div>
    </div>
  );
}