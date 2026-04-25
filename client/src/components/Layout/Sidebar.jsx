import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map as MapIcon, Bot, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const routes = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Farm Map', path: '/map', icon: <MapIcon size={20} /> },
    { name: 'AI Advisor', path: '/advisor', icon: <Bot size={20} /> },
  ];

  return (
    <motion.aside 
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="w-64 glass-panel flex flex-col h-screen sticky top-0 border-r border-slate-700/50"
    >
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 to-sky-400 shadow-[0_0_15px_rgba(16,185,129,0.5)] flex items-center justify-center">
          <span className="font-bold text-slate-900">A</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Agr<span className="text-emerald-400 text-glow">AI</span></h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {routes.map((route) => (
          <NavLink
            key={route.path}
            to={route.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`
            }
          >
            {route.icon}
            <span className="font-medium">{route.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <button className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
