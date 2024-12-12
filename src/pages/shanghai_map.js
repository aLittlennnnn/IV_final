import React, { useEffect, useRef, useState } from "react";
import Papa from "papaparse";
import "leaflet/dist/leaflet.css";
import RadarPlot from "../components/radar";
import ScatterPlot from "../components/scatter";
import BarPlot from "../components/barchart";

const MapShanghai = () => {
  const mapRef = useRef(null); // Reference for the map container
  const [selectedId, setSelectedId] = useState(null); // Selected point ID
  const [selectedPoint, setSelectedPoint] = useState(null); // Selected point details
  const defaultId = "B00123ABCD"; // Default point ID (NYU Shanghai)
  const [housingData, setHousingData] = useState([]); // State to hold housing data
  const [filteredData, setFilteredData] = useState([]); // Filtered housing data
  const nyuShanghaiCircleRef = useRef(null); // Ref to store NYU Shanghai circle
  const [filter, setFilter] = useState('all'); // Filter condition: 'all', 'lessThan15', '15to30', 'greaterThan30'

  // Load CSV data and apply filter
  useEffect(() => {
    Papa.parse("/housing_poi_complete.csv", {
      download: true,
      header: true,
      complete: (result) => {
        console.log("CSV data loaded successfully:", result.data);
        setHousingData(result.data);
        applyFilter(result.data, filter); // Apply filter after loading the data
      },
      error: (error) => console.error("Error loading CSV:", error),
    });
  }, []); // Load data only once

  // Apply filter based on walking duration
  const applyFilter = (data, filter) => {
    let filtered = [...data]; // Copy of the housing data

    if (filter === 'lessThan15') {
      filtered = filtered.filter((row) => parseFloat(row.walking_duration) < 15);
    } else if (filter === '15to30') {
      filtered = filtered.filter((row) => parseFloat(row.walking_duration) >= 15 && parseFloat(row.walking_duration) <= 30);
    } else if (filter === 'greaterThan30') {
      filtered = filtered.filter((row) => parseFloat(row.walking_duration) > 30);
    }

    setFilteredData(filtered); // Update filtered data state
  };
  useEffect(() => {
    // Initialize map only once
    if (typeof window !== "undefined") {
      const L = require("leaflet");
      const map = L.map(mapRef.current, { zoomControl: false }).setView([31.16166, 121.52544], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        minZoom: 13,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      mapRef.current._leaflet_map = map;

      // Add a static circle for NYU Shanghai and set it as the default point
      const nyuShanghaiCircle = L.circle([31.150854, 121.47708], {
        color: "red",
        opacity: 0,
        fillColor: "#f03",
        fillOpacity: 1,
        radius: 60,
      }).addTo(map);

      nyuShanghaiCircle.bindTooltip("NYU Shanghai").openTooltip(); // Tooltip for NYU Shanghai
      nyuShanghaiCircleRef.current = nyuShanghaiCircle; // Save the circle in ref

      // Click on NYU Shanghai to reset to default point
      nyuShanghaiCircle.on("click", () => {
        // Reset to the default ID "B00123ABCD"
        setSelectedId(defaultId);
        setSelectedPoint(null);
      });

      // Fetch housing data and update state
      Papa.parse("/housing_poi_complete.csv", {
        download: true,
        header: true,
        complete: (result) => {
          console.log("CSV data loaded successfully:", result.data);
          setHousingData(result.data);
        },
        error: (error) => console.error("Error loading CSV:", error),
      });

      return () => {
        map.remove(); // Cleanup map on component unmount
      };
    }
  }, []); // Empty dependency array ensures this effect runs only once


  // Apply filter when filter state changes
  useEffect(() => {
    if (housingData.length > 0) {
      applyFilter(housingData, filter);
    }
  }, [filter, housingData]);

  useEffect(() => {
    // Ensure the map is loaded and available
    if (filteredData.length > 0 && mapRef.current && mapRef.current._leaflet_map) {
      const L = require("leaflet");
      const map = mapRef.current._leaflet_map;

      // Clear all previous markers
      if (map) {
        map.eachLayer((layer) => {
          if (layer instanceof L.Circle && layer !== nyuShanghaiCircleRef.current) {
            map.removeLayer(layer);
          }
        });

        // Add circles for each housing location
        filteredData.forEach((row) => {
          const latitude = parseFloat(row.gcj_lat);
          const longitude = parseFloat(row.gcj_lng);
          const name = row.name;
          const rent = row.monthly_rent; 
          const walkingDuration = row.walking_duration;
          const id = row.id;

          // Skip the point if id is B00123ABCD
          if (id === defaultId) return;

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

            // Handle mouseout to hide tooltip
            circle.on("mouseout", function () {
              this.closeTooltip(); // Hide tooltip when mouse leaves
            });

            // Handle click to keep tooltip visible
            circle.on("click", function () {
              if (selectedPoint && selectedPoint.id === row.id) {
                // If clicking the already selected point, reset it to default point
                setSelectedId(defaultId);
                setSelectedPoint(null);
              } else {
                // Otherwise, set the selected point and update charts
                setSelectedId(row.id);
                setSelectedPoint({ id: row.id, circle: this });
                this.unbindTooltip(); // Remove the current tooltip
                this.bindTooltip(tooltipContent, {
                  permanent: true, // Make the tooltip permanent
                  direction: "top",
                }).openTooltip(); // Reopen the tooltip as permanent
              }
            });

            // Add circle to map only if map is ready
            if (map._loaded) {
              circle.addTo(map);
            } else {
              map.once('load', () => circle.addTo(map));
            }
          }
        });
      }
    }
  }, [filteredData, selectedId]); // Re-run when filteredData or selectedId changes

  // Handle filter change
  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", overflowY: "auto" }}>
      {/* Heading Section */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h1>NYU Shanghai Housing Selection Helper</h1>
        <img
          src="/heading.jpg" // Ensure the file is accessible in the public folder
          alt="NYU Shanghai Campus"
          style={{ width: "100%", maxHeight: "300px", objectFit: "cover", marginBottom: "20px" }}
        />
        <p style={{ maxWidth: "800px", margin: "0 auto", fontSize: "16px", lineHeight: "1.5" }}>
          Housing affordability and accessibility to all the facilities and points of interest are
          crucial factors for students seeking off-campus housing near our school. We propose an
          interactive visualization system tailored for NYU Shanghai students, focusing on rental
          housing in the district surrounding the campus. Our system will integrate housing prices,
          nearby POIs, and the distance to NYU Shanghai, providing an intuitive tool to address
          students’ concerns and support their housing search process.
        </p >
      </div>

      {/* Filter Section */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h3>Filter by Walking Duration</h3>
        <select value={filter} onChange={handleFilterChange}>
          <option value="all">All</option>
          <option value="lessThan15">Less than 15 minutes</option>
          <option value="15to30">15 - 30 minutes</option>
          <option value="greaterThan30">Greater than 30 minutes</option>
        </select>
      </div>

      {/* Map Section */}
      <div style={{ flex: "1", marginBottom: "20px" }}>
        <div ref={mapRef} style={{ height: "500px", width: "100%" }} />
      </div>

      {/* Charts Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px",
        }}
      >
        <div style={{ flex: "1", marginRight: "10px" }}>
          <h2 style={{ textAlign: "center" }}>POI Categories & Numbers</h2>
          <RadarPlot selectedId={selectedId} />
        </div>
        <div style={{ flex: "1", marginRight: "10px" }}>
          <h2 style={{ textAlign: "center" }}>POI Entropy & Monthly Rent</h2>
          <ScatterPlot selectedId={selectedId} />
        </div>
        <div style={{ flex: "1" }}>
          <h2 style={{ textAlign: "center" }}>Transport Duration to NYU Shanghai</h2>
          <BarPlot selectedId={selectedId} />
        </div>
      </div>
    </div>
  );
};

export default MapShanghai;
