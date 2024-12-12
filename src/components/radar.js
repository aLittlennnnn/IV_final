import React, { useEffect, useState } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import Papa from "papaparse";

const RadarPlot = ({ selectedId }) => {
  const [csvData, setCsvData] = useState([]);
  const [radarData, setRadarData] = useState([]);
  const [poiAvg, setPoiAvg] = useState({});
  const [maxPoiCount, setMaxPoiCount] = useState(0);

  const translations = {
    "交通设施": "Transportation",
    "休闲娱乐": "Entertainment",
    "公司企业": "Enterprises",
    "医疗保健": "Healthcare",
    "商务住宅": "Business",
    "旅游景点": "Attractions",
    "汽车相关": "Automotive",
    "生活服务": "Services",
    "科教文化": "Education",
    "购物消费": "Shopping",
    "运动健身": "Fitness",
    "酒店住宿": "Hotels",
    "金融机构": "Banks",
    "餐饮美食": "Dining",
  };

  // Load CSV file and calculate max POI count
  useEffect(() => {
    Papa.parse("/housing_poi_complete.csv", {
      download: true,
      header: true,
      complete: (result) => {
        console.log("CSV loaded successfully:", result.data);
        const validData = result.data.filter((row) => {
          try {
            if (row["poi_counts_800m"]) {
              JSON.parse(row["poi_counts_800m"]);
              return true;
            }
          } catch (error) {
            console.warn(`Invalid JSON in row: ${row.id}`, error);
            return false;
          }
        });
        setCsvData(validData);

        // Calculate averages and max POI count
        const poiSums = {};
        const poiCounts = {};
        let maxCount = 0;

        validData.forEach((row) => {
          const poiCounts800m = JSON.parse(row["poi_counts_800m"]);
          for (const [key, value] of Object.entries(poiCounts800m)) {
            if (!poiSums[key]) {
              poiSums[key] = 0;
              poiCounts[key] = 0;
            }
            poiSums[key] += value;
            poiCounts[key] += 1;
            maxCount = Math.max(maxCount, value);
            if (value > maxCount) {
              console.log(`New max count for ${key}: ${value}`);
            }
          }
        });

        const poiAvgCalculated = {};
        for (const key in poiSums) {
          poiAvgCalculated[key] = poiSums[key] / poiCounts[key];
        }

        setPoiAvg(poiAvgCalculated);
        setMaxPoiCount(maxCount);
      },
      error: (error) => console.error("Error loading CSV:", error),
    });
  }, []);

  // Process data for radar chart
  useEffect(() => {
    if (selectedId && csvData.length > 0) {
      const selectedRow = csvData.find((row) => row.id === selectedId);
      if (selectedRow) {
        try {
          const poiCounts = JSON.parse(selectedRow["poi_counts_800m"]);
          const formattedData = Object.keys(poiCounts).map((key) => ({
            poi: translations[key] || key,
            count: poiCounts[key],
          }));
          setRadarData(formattedData);
        } catch (error) {
          console.warn(`Failed to parse JSON for selected ID: ${selectedId}`, error);
        }
      }
    }
  }, [selectedId, csvData]);

  // Prepare data for average POI layer
  const avgRadarData = Object.keys(poiAvg).map((key) => ({
    poi: translations[key] || key,
    count: poiAvg[key],
  }));

  return (
    <RadarChart outerRadius={150} width={450} height={400} data={radarData}>
      <PolarGrid />
      <PolarAngleAxis dataKey="poi" />
      <PolarRadiusAxis angle={30} domain={[0, maxPoiCount]} />
      <Radar name="POI Count" dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.9} />
      {avgRadarData.length > 0 && (
        <Radar name="Average POI" dataKey="count" data={avgRadarData} stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.4} />
      )}
    </RadarChart>
  );
};

export default RadarPlot;
