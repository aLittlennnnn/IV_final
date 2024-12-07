import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

const MapShanghai = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const L = require('leaflet'); // Dynamically require Leaflet
      const map = L.map(mapRef.current).setView([31.150661, 121.47701], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        minZoom: 15,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      var circle = L.circle([31.150854, 121.47708], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 60
    }).addTo(map);

    var popup = L.popup()
    .setLatLng([31.150854, 121.47708])
    .setContent("NYU Shanghai")
    .openOn(map);
      // Define the onMapClick function
      const onMapClick = (e) => {
        alert(`You clicked the map at ${e.latlng}`);
      };

      // Add click event listener to the map
      map.on('click', onMapClick);

      // Clean up the map and event listeners on component unmount
      return () => {
        map.off('click', onMapClick);
        map.remove();
      };
    }
  }, []);

  return (
    <div>
      <h1>NYU Shanghai Housing Selection Helper</h1>
      <div ref={mapRef} style={{ height: '600px', width: '100%' }} />
    </div>
  );
};

export default MapShanghai;
