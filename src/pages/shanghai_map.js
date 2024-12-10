import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import RadarPlot from '../components/radar'; // Import RadarPlot component

const MapShanghai = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const L = require('leaflet');
      const map = L.map(mapRef.current).setView([31.150661, 121.47701], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        minZoom: 15,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      L.circle([31.150854, 121.47708], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 60,
      }).addTo(map);

      L.popup()
        .setLatLng([31.150854, 121.47708])
        .setContent('NYU Shanghai')
        .openOn(map);

      const onMapClick = (e) => {
        alert(`You clicked the map at ${e.latlng}`);
      };

      map.on('click', onMapClick);

      return () => {
        map.off('click', onMapClick);
        map.remove();
      };
    }
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Map Section */}
      <div style={{ flex: '2', marginRight: '10px' }}>
        <h1>NYU Shanghai Housing Selection Helper</h1>
        <div ref={mapRef} style={{ height: '750px', width: '100%' }} />
      </div>

      {/* Radar Plot Section */}
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2>Radar Plot</h2>
        <RadarPlot />
      </div>
    </div>
  );
};

export default MapShanghai;