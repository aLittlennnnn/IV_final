import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapShanghai = () => {
  const mapRef = useRef(null);
  
  useEffect(() => {
    const map = L.map(mapRef.current).setView([31.2304, 121.4737], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    return () => {
      map.remove();
    };
  }, []);

  return <div ref={mapRef} style={{ height: '600px', width: '100%' }} />;
};

export default MapShanghai;
