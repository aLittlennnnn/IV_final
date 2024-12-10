import React, { useEffect, useState } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import Papa from "papaparse";

const RadarPlot = () => {
  const [csvData, setCsvData] = useState([]); // Store CSV data
  const selectedId = "B00156YLA3"; // Hardcoded ID for testing
  const [radarData, setRadarData] = useState([]);

  // Load CSV file
  useEffect(() => {
    Papa.parse("/housing_poi_entropy.csv", {
      download: true,
      header: true,
      complete: (result) => {
        console.log("CSV loaded successfully:", result.data);
        setCsvData(result.data);
      },
      error: (error) => console.error("Error loading CSV:", error),
    });
  }, []);

  // Process data for radar chart
  useEffect(() => {
    if (selectedId && csvData.length > 0) {
      // Find the row with the selected ID
      const selectedRow = csvData.find((row) => row.id === selectedId);

      if (selectedRow) {
        // Parse POI counts into radar data format
        const poiCounts = JSON.parse(selectedRow["poi_counts_800m"]);
        const formattedData = Object.keys(poiCounts).map((key) => ({
          poi: key,
          count: poiCounts[key],
        }));
        setRadarData(formattedData);
      }
    }
  }, [selectedId, csvData]);

  return (
    <RadarChart outerRadius={150} width={500} height={500} data={radarData}>
      <PolarGrid />
      <PolarAngleAxis dataKey="poi" />
      <PolarRadiusAxis angle={30} domain={[0, Math.max(...radarData.map((d) => d.count), 10)]} />
      <Radar name="POI Count" dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
    </RadarChart>
  );
};

export default RadarPlot;