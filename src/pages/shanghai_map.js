import React, { useEffect, useRef, useState } from "react";
import Papa from "papaparse";
import "leaflet/dist/leaflet.css";
import RadarPlot from "../components/radar"; 
import ScatterPlot from "../components/scatter";
import BarPlot from "../components/barchart";

const MapShanghai = () => {
  const mapRef = useRef(null);
  const [selectedId, setSelectedId] = useState(null); // State for selected house ID

  useEffect(() => {
    if (typeof window !== "undefined") {
      const L = require("leaflet");
      const map = L.map(mapRef.current).setView([31.16166, 121.52544], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        minZoom: 13,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      mapRef.current._leaflet_map = map;

      // Load housing data and create circles
      Papa.parse("/housing_poi_complete.csv", {
        download: true,
        header: true,
        complete: (result) => {
          console.log("CSV data loaded successfully:", result.data);
          const housingData = result.data;

          // Add circles for each housing location
          housingData.forEach((row) => {
            const latitude = parseFloat(row.gcj_lat);
            const longitude = parseFloat(row.gcj_lng);
            const name = row.name;
            const rent = row.monthly_rent; 
            const walkingDuration = row.walking_duration;

            if (!isNaN(latitude) && !isNaN(longitude)) {
              const circle = L.circle([latitude, longitude], {
                color: "blue",
                opacity: 0,
                fillColor: "#3388ff",
                fillOpacity: 0.9,
                radius: 50,
              });

              // Create tooltip content
              const tooltipContent = `
                <strong>${name}</strong><br>
                Monthly Rent: ${rent}<br>
                Walking Duration: ${walkingDuration} minutes
              `;

              // Attach tooltip to the circle
              circle.bindTooltip(tooltipContent, {
                permanent: false, // Tooltip is not permanently visible by default
                direction: "top",
              });

              // Handle hover to show tooltip
              circle.on("mouseover", function () {
                this.openTooltip(); // Show tooltip on hover
              });

              // Handle click to keep tooltip visible
              circle.on("click", function () {
                setSelectedId(row.id); // Update selected house ID
                this.unbindTooltip(); // Remove the current tooltip
                this.bindTooltip(tooltipContent, {
                  permanent: true, // Make the tooltip permanent
                  direction: "top",
                }).openTooltip(); // Reopen the tooltip as permanent
              });

              circle.addTo(map);
            }
          });
        },
        error: (error) => console.error("Error loading CSV:", error),
      });

      // Add a static circle for NYU Shanghai
      L.circle([31.150854, 121.47708], {
        color: "red",
        opacity: 0,
        fillColor: "#f03",
        fillOpacity: 1,
        radius: 60,
      }).addTo(map);

      return () => {
        map.remove(); // Cleanup map on component unmount
      };
    }
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Map Section */}
      <div style={{ flexBasis: "75%", marginLeft: "10px", marginBottom: "20px" }}>
        <h1>NYU Shanghai Housing Selection Helper</h1>
        <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
      </div>

      {/* Charts Section */}
      <div
        style={{
          flexBasis: "25%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Radar Plot Section */}
        <div style={{ flex: "1", marginTop: "20px", marginLeft: "10px" }}>
          <h2>POI Categories & Numbers</h2>
          <RadarPlot selectedId={selectedId} />
        </div>

        {/* Scatter Plot Section */}
        <div style={{ flex: "1", marginTop: "20px", marginRight: "10px" }}>
          <h2>POI Entropy & Monthly Rent</h2>
          <ScatterPlot selectedId={selectedId} />
        </div>

        {/* Bar Plot Section */}
        <div style={{ flex: "1", marginTop: "20px" }}>
          <h2>Transport Duration to NYU Shanghai</h2>
          <BarPlot selectedId={selectedId} />
        </div>
      </div>
    </div>
  );
};

export default MapShanghai;
