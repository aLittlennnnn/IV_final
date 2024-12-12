import React, { useEffect, useState } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import Papa from "papaparse";

const RadarPlot = ({ selectedId }) => {
  const [csvData, setCsvData] = useState([]); // Store CSV data
  // const selectedId = "B00156YLA3"; // Hardcoded ID for testing
  const [radarData, setRadarData] = useState([]);

  const translations = {
    "交通设施": "Transportation",
    "休闲娱乐": "Entertainment",
    "公司企业": "Enterprises",
    "医疗保健": "Healthcare",
    "商务住宅": "Business",
    "旅游景点": "Attractions",
    "汽车相关":"Automotive",
    "生活服务": "Services",
    "科教文化": "Education",
    "购物消费": "Shopping",
    "运动健身": "Fitness",
    "酒店住宿": "Hotels",
    "金融机构": "Banks",
    "餐饮美食": "Dining",
  };

  // Load CSV file
  useEffect(() => {
    Papa.parse("/housing_poi_complete.csv", {
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
          poi: translations[key] || key,
          count: poiCounts[key],
        }));
        setRadarData(formattedData);
      }
    }
  }, [selectedId, csvData]);

  return (
    <RadarChart outerRadius={150} width={450} height={400} data={radarData}>
      <PolarGrid />
      <PolarAngleAxis dataKey="poi" />
      <PolarRadiusAxis angle={30} domain={[0, Math.max(...radarData.map((d) => d.count), 10)]} />
      <Radar name="POI Count" dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
    </RadarChart>
  );
};

export default RadarPlot;