import React, { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";
import { ScatterChart, Scatter, ZAxis } from "recharts";
import RadarPlot from "../components/radar"; // Adjust the path if necessary

const MapShanghai = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const L = require("leaflet");
      const map = L.map(mapRef.current).setView([31.150661, 121.47701], 15);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        minZoom: 15,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      L.circle([31.150854, 121.47708], {
        color: "red",
        fillColor: "#f03",
        fillOpacity: 0.5,
        radius: 60,
      }).addTo(map);

      L.popup()
        .setLatLng([31.150854, 121.47708])
        .setContent("NYU Shanghai")
        .openOn(map);

      const onMapClick = (e) => {
        alert(`You clicked the map at ${e.latlng}`);
      };

      map.on("click", onMapClick);

      return () => {
        map.off("click", onMapClick);
        map.remove();
      };
    }
  }, []);

  // Sample data for charts
  const barData = [
    { name: "A", value: 400 },
    { name: "B", value: 300 },
    { name: "C", value: 200 },
    { name: "D", value: 100 },
  ];

  const scatterData1 = [
    { x: 10, y: 20 },
    { x: 20, y: 30 },
    { x: 30, y: 40 },
    { x: 40, y: 50 },
  ];

  const scatterData2 = [
    { x: 15, y: 25 },
    { x: 25, y: 35 },
    { x: 35, y: 45 },
    { x: 45, y: 55 },
  ];

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Map Section */}
      <div style={{ flexBasis: "60%", marginRight: "10px" }}>
        <h1>NYU Shanghai Housing Selection Helper</h1>
        <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
      </div>

      {/* Charts Section */}
      <div
        style={{
          flexBasis: "40%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          paddingLeft: "10px",
        }}
      >
        {/* Radar Plot Section */}
        <div style={{ flexGrow: "1", marginBottom: "20px" }}>
          <h2>Radar Plot</h2>
          <RadarPlot />
        </div>

        {/* Bar Chart Section */}
        <div style={{ flexGrow: "1", marginBottom: "20px" }}>
          <BarChart width={300} height={200} data={barData}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="name" />
            <YAxis />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </div>

        {/* Scatter Plot Section */}
        <div style={{ flexGrow: "1" }}>
          <ScatterChart width={300} height={200}>
            <CartesianGrid />
            <XAxis type="number" dataKey="x" name="X-axis" />
            <YAxis type="number" dataKey="y" name="Y-axis" />
            <ZAxis range={[60]} />
            <Scatter name="Dataset A" data={scatterData1} fill="#82ca9d" />
          </ScatterChart>
          <ScatterChart width={300} height={200}>
            <CartesianGrid />
            <XAxis type="number" dataKey="x" name="X-axis" />
            <YAxis type="number" dataKey="y" name="Y-axis" />
            <ZAxis range={[60]} />
            <Scatter name="Dataset B" data={scatterData2} fill="#ff7300" />
          </ScatterChart>
        </div>
      </div>
    </div>
  );
};

export default MapShanghai;