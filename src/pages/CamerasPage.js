import { useState } from 'react';
import { CameraList } from '../components/CameraList';
import { mockCameras } from '../data/mockData';
import { tokens } from '../styles/tokens';

export function CamerasPage() {
  const [cameras] = useState(mockCameras);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 style={{ 
  fontSize: '22px', 
  fontWeight: 600, 
  fontFamily: tokens.fonts.primary,
  color: tokens.colors.text,
  marginBottom: '20px',
  paddingBottom: '12px',
  borderBottom: '1px solid rgba(148,163,184,0.12)',
  letterSpacing: '-0.01em'
}}>
  Cameras
</h1>
      <CameraList cameras={cameras} />
    </div>
  );
}