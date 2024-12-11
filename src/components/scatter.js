import React, { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line } from 'recharts';
import Papa from 'papaparse';

const ScatterPlot = () => {
  const [csvData, setCsvData] = useState([]);
  const [scatterData, setScatterData] = useState([]);
  const selectedId = "B00156YLA3"; // Hardcoded ID for testing
  const regressionLine = {
    slope: -4693.351,
    intercept: 25742.77,
  };

  // Load CSV data
  useEffect(() => {
    Papa.parse('/housing_poi_entropy.csv', {
      download: true,
      header: true,
      complete: (result) => {
        console.log("CSV loaded successfully:", result.data);
        setCsvData(result.data);
      },
      error: (error) => console.error("Error loading CSV:", error),
    });
  }, []);

  // Process scatter data
  useEffect(() => {
    if (csvData.length > 0) {
      const formattedData = csvData.map((row) => ({
        x: parseFloat(row.poi_entropy_800m),
        y: parseFloat(row.monthly_rent),
        id: row.id,
      }));
      setScatterData(formattedData);
    }
  }, [csvData]);

  // Generate regression line points
  const regressionPoints = scatterData
    .filter((point) => point.x >= 2.5 && point.x <= 3.6)
    .map((point) => ({
      x: point.x,
      y: regressionLine.slope * point.x + regressionLine.intercept,
    }));

  // Calculate Y-Axis Domain
  const allYValues = [
    ...scatterData.map((d) => d.y),
    ...regressionPoints.map((d) => d.y),
  ];
  const yMin = Math.min(...allYValues);
  const yMax = Math.max(...allYValues);

  return (
    <ResponsiveContainer width={500} height={400}>
      <ScatterChart 
        margin={{
          top: 20,
        }}
      >
        <CartesianGrid />
        <XAxis
          type="number"
          dataKey="x"
          name="POI Entropy"
          domain={[2.5, 3.6]}
        />
        <YAxis
          type="number"
          dataKey="y"
          name="Monthly Rent"
          domain={[yMin, yMax]}
        />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        {/* All housing points */}
        <Scatter name="Housing Data" data={scatterData} fill="#8884d8" />
        {/* Highlight selected housing point */}
        <Scatter
          name="Selected Point"
          data={scatterData.filter((d) => d.id === selectedId)}
          fill="red"
        />
        {/* Regression line */}
        <Line
          type="linear"
          data={regressionPoints}
          dataKey="y"
          stroke="#FF7300"
          dot={false}
        />        
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default ScatterPlot;
