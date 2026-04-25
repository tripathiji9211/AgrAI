import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Droplet, ThermometerSun, Leaf, Wind } from 'lucide-react';

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

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/iot/latest');
        const { data } = await res.json();
        if (data && data.length > 0) {
          const latest = data[data.length - 1];
          setTelemetry(prev => ({
            ...prev,
            moisture: latest.moisture,
            temperature: latest.temperature,
            nitrogen: latest.nitrogen
          }));
        }
      } catch (err) {
        console.log("Using fallback telemetry data.");
      }
    };
    
    // Poll every 5 seconds
    const intervalId = setInterval(fetchTelemetry, 5000);
    fetchTelemetry(); // Initial fetch
    
    return () => clearInterval(intervalId);
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
          <h2 className="text-xl font-semibold mb-4 text-white">Yield Prediction Matrix</h2>
          <div className="h-full w-full flex items-center justify-center border-2 border-dashed border-slate-700/50 rounded-xl bg-slate-900/30">
            <p className="text-slate-500">Analytics visualization loading...</p>
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
            {[
              { title: 'Irrigation Needed', time: '10 mins ago', type: 'warning' },
              { title: 'Optimal Harvest Window', time: '2 hours ago', type: 'success' },
              { title: 'Low Potassium Risk', time: '1 day ago', type: 'error' },
            ].map((alert, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 flex flex-col gap-1 hover:border-emerald-500/30 transition-colors">
                <span className="text-sm font-medium text-slate-200">{alert.title}</span>
                <span className="text-xs text-slate-500">{alert.time}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
