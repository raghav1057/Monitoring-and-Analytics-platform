export const mockCameras = [
  { camera_id: "C001", name: "Connaught Place", department: "Traffic Police", latitude: 28.6315, longitude: 77.2167, camera_type: "Traffic", stream_url: "rtsp://example.com/stream", zone: "Central Delhi", status: "Online", last_heartbeat: new Date().toISOString() },
  { camera_id: "C002", name: "India Gate", department: "CRPF", latitude: 28.6129, longitude: 77.2295, camera_type: "Fixed", stream_url: "rtsp://example.com/stream", zone: "Central Delhi", status: "Offline", last_heartbeat: new Date().toISOString() },
  { camera_id: "C003", name: "Kashmere Gate", department: "Delhi Police", latitude: 28.6678, longitude: 77.2285, camera_type: "PTZ", stream_url: "rtsp://example.com/stream", zone: "North Delhi", status: "Degraded", last_heartbeat: new Date().toISOString() },
  { camera_id: "C008", name: "Dwarka Sector 21", department: "Traffic Police", latitude: 28.5523, longitude: 77.0588, camera_type: "Traffic", stream_url: "rtsp://example.com/stream", zone: "West Delhi", status: "Online", last_heartbeat: new Date().toISOString() },
];

export const mockStats = {
  total_cameras: 4,
  online_cameras: 2,
  offline_cameras: 1,
  active_alerts: 2,
  total_events: 15
};