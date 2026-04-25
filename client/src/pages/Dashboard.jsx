import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Droplet, ThermometerSun, Leaf, Wind } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const StatCard = ({ title, value, unit, icon, trend, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-card p-6"
  >
    <div className="flex justify-between items-start">
      <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 text-emerald-400">
        {icon}
      </div>
      <span className={`text-sm font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
        {trend > 0 ? '+' : ''}{trend}%
      </span>
    </div>
    <div className="mt-4">
      <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-3xl font-bold text-white text-glow">{value}</span>
        <span className="text-slate-400 font-medium">{unit}</span>
      </div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const [telemetry, setTelemetry] = useState({
    moisture: '34',
    temperature: '28',
    nitrogen: '45',
    wind: '12'
  });
  const [recentPredictions, setRecentPredictions] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // 1. Fetch Live IoT Telemetry
    const fetchTelemetry = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/iot/latest');
        const { data } = await res.json();
        if (data && data.length > 0) {
          const latest = data[data.length - 1];
          setTelemetry(prev => ({ ...prev, moisture: latest.moisture, temperature: latest.temperature, nitrogen: latest.nitrogen }));
        }
      } catch (err) {}
    };
    const intervalId = setInterval(fetchTelemetry, 5000);
    fetchTelemetry();

    // 2. Fetch Live Firestore Predictions
    const predQuery = query(collection(db, 'disease_predictions'), orderBy('timestamp', 'desc'), limit(3));
    const unsubscribePred = onSnapshot(predQuery, (snapshot) => {
      setRecentPredictions(snapshot.docs.map(doc => doc.data()));
    }, error => console.log('Firestore prediction read error:', error.message));

    // 3. Fetch Live Firestore Alerts
    const alertQuery = query(collection(db, 'risk_assessments'), orderBy('timestamp', 'desc'), limit(3));
    const unsubscribeAlerts = onSnapshot(alertQuery, (snapshot) => {
      setAlerts(snapshot.docs.map(doc => doc.data()));
    }, error => console.log('Firestore alert read error:', error.message));

    return () => {
      clearInterval(intervalId);
      unsubscribePred();
      unsubscribeAlerts();
    };
  }, []);

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-white"
        >
          Farm Overview
        </motion.h1>
        <p className="text-slate-400 mt-1">Real-time telemetry and crop insights.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Soil Moisture" value={telemetry.moisture} unit="%" icon={<Droplet />} trend={2.5} delay={0.1} />
        <StatCard title="Temperature" value={telemetry.temperature} unit="°C" icon={<ThermometerSun />} trend={-1.2} delay={0.2} />
        <StatCard title="Nitrogen Level" value={telemetry.nitrogen} unit="mg/kg" icon={<Leaf />} trend={5.0} delay={0.3} />
        <StatCard title="Wind Speed" value={telemetry.wind} unit="km/h" icon={<Wind />} trend={0} delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 glass-card p-6 min-h-[400px]"
        >
          <h2 className="text-xl font-semibold mb-4 text-white">Recent ML Classifications</h2>
          <div className="space-y-3">
            {recentPredictions.length === 0 ? (
              <p className="text-slate-500">Analytics visualization loading or no records found...</p>
            ) : (
              recentPredictions.map((pred, i) => (
                <div key={i} className="flex justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-700">
                  <span className="text-slate-300 font-medium">Image Analysis ({pred.filename || 'Camera'})</span>
                  <span className={pred.disease === 'Healthy' ? 'text-emerald-400' : 'text-amber-400'}>
                    {pred.disease} ({Math.round(pred.confidence)}% conf)
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6"
        >
          <h2 className="text-xl font-semibold mb-4 text-white">Smart Alerts</h2>
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <p className="text-slate-500 text-sm">No recent risk alerts.</p>
            ) : (
              alerts.map((alert, i) => (
                <div key={i} className={`p-4 rounded-xl bg-slate-900/50 border flex flex-col gap-1 hover:border-emerald-500/30 transition-colors ${alert.riskLevel === 'HIGH' || alert.riskLevel === 'CRITICAL' ? 'border-red-500/50' : 'border-slate-700/50'}`}>
                  <span className="text-sm font-medium text-slate-200">{alert.action}</span>
                  <span className={`text-xs ${alert.riskLevel === 'CRITICAL' ? 'text-red-400 font-bold' : 'text-slate-500'}`}>Level: {alert.riskLevel}</span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
