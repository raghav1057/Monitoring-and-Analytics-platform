import { tokens } from '../styles/tokens';

const statusConfig = {
  Online: { color: tokens.colors.emerald, icon: '🟢' },
  Offline: { color: tokens.colors.crimson, icon: '🔴' },
  Degraded: { color: tokens.colors.amber, icon: '🟡' },
};

export function CameraList({ cameras }) {
  return (
    <div style={{ display: 'grid', gap: tokens.spacing.md }}>
      {cameras.map(camera => (
        <div
          key={camera.camera_id}
          style={{
            backgroundColor: tokens.colors.surfaceHigh,
            border: `1px solid rgba(148, 163, 184, 0.12)`,
            borderRadius: tokens.radius.sm,
            padding: tokens.spacing.lg,
            color: tokens.colors.text,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: tokens.spacing.lg }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, fontFamily: tokens.fonts.primary, marginBottom: tokens.spacing.sm }}>
                {camera.name}
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: tokens.colors.textSecondary, marginBottom: tokens.spacing.xs, fontFamily: tokens.fonts.primary }}>
                {camera.department} • {camera.zone}
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontFamily: tokens.fonts.mono, marginBottom: tokens.spacing.xs }}>
                CAM-{camera.camera_id}
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontFamily: tokens.fonts.mono }}>
                TYPE: {camera.camera_type}
              </p>
            </div>
            <div
              style={{
                backgroundColor: `rgba(78, 222, 163, 0.12)`,
                border: `1px solid rgba(78, 222, 163, 0.3)`,
                color: statusConfig[camera.status].color,
                padding: '6px 12px',
                borderRadius: tokens.radius.sm,
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: tokens.fonts.mono,
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}
            >
              {statusConfig[camera.status].icon} {camera.status}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}