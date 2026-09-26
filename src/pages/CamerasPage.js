import { useState } from 'react';
import { CameraList } from '../components/CameraList';
import { mockCameras } from '../data/mockData';

export function CamerasPage() {
  const [cameras] = useState(mockCameras);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Cameras</h1>
      <CameraList cameras={cameras} />
    </div>
  );
}