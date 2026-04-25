import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const FarmMap = () => {
  const [position] = useState([20.5937, 78.9629]); // Default: India
  
  // Example dummy bounds for a field polygon
  const fieldPolygon = [
    [20.593, 78.962],
    [20.595, 78.962],
    [20.595, 78.965],
    [20.593, 78.965]
  ];

  return (
    <div className="h-full flex flex-col">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-white">Spatial Farm Mapping</h1>
        <p className="text-slate-400 mt-1">Satellite imagery and NDVI distribution zones.</p>
      </header>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 glass-card overflow-hidden border border-slate-700/50 min-h-[600px] relative z-0"
      >
        <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          />
          <Marker position={position}>
            <Popup>
              <strong>Central Farm Hub</strong><br />
              Disease Risk: Low.
            </Popup>
          </Marker>
          <Polygon pathOptions={{ color: '#10b981', weight: 2, fillColor: '#10b981', fillOpacity: 0.2 }} positions={fieldPolygon} />
        </MapContainer>
      </motion.div>
    </div>
  );
};

export default FarmMap;
