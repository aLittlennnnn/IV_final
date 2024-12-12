import React, { useEffect, useState } from 'react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis,ResponsiveContainer,Tooltip,Legend } from 'recharts';
import Papa from 'papaparse';


// average traveling time 

const BarPlot = ({ selectedId }) => {
    const [csvData, setCsvData] = useState([]);
    const [barData, setbarData] = useState([]);
    // const selectedId = "B00156YLA3"; // Hardcoded ID for testing
    // const regressionLine = {
    //   slope: -4693.351,
    //   intercept: 25742.77,
    // };

    // Calculate the averages for all data
    const calculateAverages = (data) => {
        const totals = {
        walking_duration: 0,
        driving__duration: 0,
        Public_transport_duration: 0,
        };
        data.forEach((row) => {
        totals.walking_duration += parseFloat(row.walking_duration || 0);
        totals.driving__duration += parseFloat(row.driving__duration || 0);
        totals.Public_transport_duration += parseFloat(row.Public_transport_duration || 0);
        });

        const average = {
        walking_duration: totals.walking_duration / data.length,
        driving__duration: totals.driving__duration / data.length,
        Public_transport_duration: totals.Public_transport_duration / data.length,
        };

        return average;
    };
  
    // Load CSV data
    useEffect(() => {
      Papa.parse('/housing_poi_complete.csv', {
        download: true,
        header: true,
        complete: (result) => {
          console.log("CSV loaded successfully:", result.data);
          setCsvData(result.data);
        },
        error: (error) => console.error("Error loading CSV:", error),
      });
    }, []);

    // // Process data for bar chart
    // useEffect(() => {
    //     if (selectedId && csvData.length > 0) {
    //     // Find the row with the selected ID
    //     const selectedRow = csvData.find((row) => row.id === selectedId);
    //     if (selectedRow) {
    //         const averages = calculateAverages(csvData);
    
    //         // Prepare data for the chart
    //         //console.log(averages.driving__duration)
    //         //console.log(averages.Public_transport_duration)
    //         const barData = [
    //           {
    //             name: 'Walking',
    //             selected: parseFloat(selectedRow.walking_duration || 0),
    //             average: averages.walking_duration,
    //           },
    //           {
    //             name: 'Driving',
    //             selected: parseFloat(selectedRow.driving__duration || 0),
    //             average: averages.driving__duration,
    //           },
    //           {
    //             name: 'Public Transport',
    //             selected: parseFloat(selectedRow.Public_transport_duration || 0),
    //             average: averages.Public_transport_duration,
    //           },
    //         ];
    
    //         setbarData(barData);
    //       }
    //     }
    //   }, [selectedId, csvData]);
    // Process data for bar chart
  useEffect(() => {
    if (csvData.length > 0) {
      const averages = calculateAverages(csvData);

      let barData = [
        {
          name: 'Walking',
          selected: 0,
          average: averages.walking_duration,
        },
        {
          name: 'Driving',
          selected: 0,
          average: averages.driving__duration,
        },
        {
          name: 'Public Transport',
          selected: 0,
          average: averages.Public_transport_duration,
        },
      ];

      // If selectedId exists, find the corresponding row and update the selected data
      if (selectedId) {
        const selectedRow = csvData.find((row) => row.id === selectedId);
        if (selectedRow) {
          // Update the 'selected' data for each transport method separately
          barData = barData.map((item) => {
            if (item.name === 'Walking') {
              item.selected = parseFloat(selectedRow.walking_duration || 0);
            } else if (item.name === 'Driving') {
              item.selected = parseFloat(selectedRow.driving__duration || 0);
            } else if (item.name === 'Public Transport') {
              item.selected = parseFloat(selectedRow.Public_transport_duration || 0);
            }
            return item;
          });
        }
      }

      // Update the barData state
      setbarData(barData);
    }
  }, [selectedId, csvData]);
      //Prepare data for the chart, separating averages and selected data
      
    return (
        <ResponsiveContainer width={450} height={400}>
          <BarChart
            data={barData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 30,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" interval={0} angle={0} textAnchor="middle"  />
            <YAxis/>
            <Tooltip />
            <Legend/>
            <Bar dataKey="selected" fill="#8884d8" name="Selected house travel duration" />
            <Bar dataKey="average" fill="#82ca9d" name="Average travel duration" />
          </BarChart>
        </ResponsiveContainer>
      );
}

export default BarPlot