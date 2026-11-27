import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Detection from './pages/Detection';
import LiveMonitoring from './pages/LiveMonitoring';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';
import Cameras from './pages/Cameras';

export default function App() {
  const location = useLocation();

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/detection" element={<Detection />} />
          <Route path="/monitoring" element={<LiveMonitoring />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/cameras" element={<Cameras />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
}
