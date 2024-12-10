import React, { useEffect, useState } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import Papa from "papaparse";

function RadarPlot() {
  // Set constant ranges for longitude and latitude
  const longitudeRange = [121, 122];
  const latitudeRange = [30.5, 31.5];

  const [data, setData] = useState([]);

  useEffect(() => {
    // Load and process the CSV file
    Papa.parse("/POI_byLL.csv", {
      download: true,
      header: true,
      complete: (result) => {
        const rawData = result.data;

        // Filter rows based on longitude and latitude ranges
        const filteredData = rawData.filter((row) => {
          const longitude = parseFloat(row["经度"]);
          const latitude = parseFloat(row["纬度"]);
          return (
            longitude >= longitudeRange[0] &&
            longitude <= longitudeRange[1] &&
            latitude >= latitudeRange[0] &&
            latitude <= latitudeRange[1]
          );
        });

        // Aggregate data by "大类"
        const categoryCounts = {};
        filteredData.forEach((row) => {
          const category = row["大类"];
          if (category) {
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
          }
        });

        // Format data for radar chart
        const radarData = Object.keys(categoryCounts).map((category) => ({
          poi: category,
          count: categoryCounts[category],
        }));

        setData(radarData);
      },
      error: (error) => console.error("Error loading CSV:", error),
    });
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <RadarChart outerRadius={150} width={500} height={500} data={data}>
      <PolarGrid />
      <PolarAngleAxis dataKey="poi" />
      <PolarRadiusAxis angle={30} domain={[0, Math.max(...data.map((d) => d.count), 10)]} />
      <Radar
        name="POI Count"
        dataKey="count"
        stroke="#8884d8"
        fill="#8884d8"
        fillOpacity={0.6}
      />
    </RadarChart>
  );
}

export default RadarPlot;