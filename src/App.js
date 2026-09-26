import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { CamerasPage } from './pages/CamerasPage';
import { tokens } from './styles/tokens';
import { DashboardPage } from './pages/DashboardPage';
import { AlertsPage } from './pages/AlertsPage';
import { SearchPage } from './pages/SearchPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

// Placeholder pages
const PlaceholderPage = ({ title }) => (
  <div style={{ padding: '32px', color: tokens.colors.text, fontFamily: tokens.fonts.primary }}>
    <h1 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '8px' }}>{title}</h1>
    <p style={{ color: tokens.colors.textSecondary, fontSize: '13px' }}>Coming soon...</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: tokens.colors.surface }}>
        <Sidebar />
        {/* Main content offset by sidebar width */}
        <main style={{ marginLeft: '240px', flex: 1, minHeight: '100vh' }}>
          <Routes>
            <Route path="/cameras" element={<CamerasPage />} />
            <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
            <Route path="/" element={<DashboardPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/search" element={< SearchPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;