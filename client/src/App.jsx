import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import FarmMap from './pages/FarmMap';
import GeminiAdvisor from './pages/GeminiAdvisor';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="map" element={<FarmMap />} />
          <Route path="advisor" element={<GeminiAdvisor />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
