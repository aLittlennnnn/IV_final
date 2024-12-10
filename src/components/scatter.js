import React, { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line } from 'recharts';
import Papa from 'papaparse';

const ScatterPlot = ({ set_mouse_selected_id, mouse_selected_id }) => {
  const [data, setData] = useState([]);
  const regressionLine = {
    slope: -4693.351,
    intercept: 25742.77,
  };

  useEffect(() => {
    // Load and parse the CSV data
    Papa.parse('/housing_poi_entropy.csv', {
      download: true,
      header: true,
      complete: (result) => {
        // Transform data
        const formattedData = result.data.map((row) => ({
          x: parseFloat(row.poi_entropy),
          y: parseFloat(row.monthly_rent),
          id: row.id,
        }));
        setData(formattedData);
      },
    });
  }, []);

  const handlePointClick = (point) => {
    if (point && point.id) {
      set_mouse_selected_id(point.id);
    }
  };

  const regressionPoints = data.map((point) => ({
    x: point.x,
    y: regressionLine.slope * point.x + regressionLine.intercept,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart width={500} height={500} data={data}>
        <CartesianGrid />
        <XAxis type="number" dataKey="x" name="POI Entropy" unit="" />
        <YAxis type="number" dataKey="y" name="Monthly Rent" unit="$" />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        {/* Regression line */}
        <Scatter name="Regression Line" data={regressionPoints} line fill="none" stroke="#FF7300" />
        {/* All housing points */}
        <Scatter
          name="Housing Data"
          data={data}
          fill="#8884d8"
          onClick={(e) => handlePointClick(e)}
        />
        {/* Highlight selected housing point */}
        <Scatter
          data={data.filter((d) => d.id === mouse_selected_id)}
          fill="red"
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default ScatterPlot;
