import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from "../../utils/apiConfig";
import moment from 'moment';
import { io } from 'socket.io-client';
import ReactD3Speedometer from "react-d3-speedometer";

const EnergyConsumptionCards = ({ userName, primaryStation }) => {
  const [energyData, setEnergyData] = useState({
    energyDailyConsumption: 0,
    energyMonthlyConsumption: 0,
    energyYearlyConsumption: 0,
  });

  // Establish socket connection
  const socket = io(API_URL, {
    transports: ['websocket'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  // Fetch data function
  const fetchData = async (station) => {
    if (!station) return;
    const today = moment().format('DD/MM/YYYY');
    const hour = moment().subtract(1, 'hours').format('HH');
    try {
      console.log("Fetching data for station:", station);  // Log station for debugging
      const response = await axios.get(`${API_URL}/api/consumption-data`, {
        params: {
          userName,
          stackName: station,
          date: today,
          hour,
        },
      });
      console.log("Fetched data:", response.data); // Log the fetched data

      // Filter the data for the selected station (primaryStation)
      const stackData = response.data.stacks.find(stack => stack.stackName === station);
      if (stackData) {
        const { energyDailyConsumption, energyMonthlyConsumption, energyYearlyConsumption } = stackData;
        setEnergyData({
          energyDailyConsumption,
          energyMonthlyConsumption,
          energyYearlyConsumption,
        });
      } else {
        console.log("No data available for selected station:", station);
      }
    } catch (error) {
      console.error('Error fetching energy consumption data:', error);
    }
  };

  // Refetch data when primaryStation changes
  useEffect(() => {
    console.log("Primary Station changed to:", primaryStation);  // Log primaryStation for debugging
    if (primaryStation) {
      fetchData(primaryStation);
    }
  }, [primaryStation]);

  return (
  
  
    <div className='row mt-4'>
    <div className='col-lg-4 col-md-4 d-flex align-items-center justify-content-center  '>
    <ReactD3Speedometer
        value={parseFloat(energyData.energyDailyConsumption.toFixed(2))} // Ensure two decimal places
          maxValue={10000}
          needleColor="red"
          startColor="green"
          segments={10}
          endColor="blue"
          width={250}
          height={200}
          labelFontSize="10px"
          valueTextFontSize="12px"
          currentValueText={`Daily Consumption: ${energyData.energyDailyConsumption.toFixed(2)} kWh`} // Display two decimal places
        />
      </div>
      <div className='col-lg-4 col-md-4 d-flex align-items-center justify-content-center  '>
      <ReactD3Speedometer
          value={parseFloat(energyData.energyMonthlyConsumption.toFixed(2))} // Ensure two decimal places          maxValue={30000}
          needleColor="red"
          startColor="green"
          segments={10}
          endColor="blue"
          width={250}
          height={200}
          labelFontSize="10px"
          valueTextFontSize="12px"
          currentValueText={`Monthly Consumption: ${energyData.energyMonthlyConsumption.toFixed(2)} kWh`} // Display two decimal places
        />
      </div>
      <div className='col-lg-4 col-md-4 d-flex align-items-center justify-content-center  '>
      <ReactD3Speedometer
          value={parseFloat(energyData.energyYearlyConsumption.toFixed(2))} // Ensure two decimal places
          maxValue={30000}
          needleColor="red"
          startColor="green"
          segments={10}
          endColor="blue"
          width={250}
          height={200}
          labelFontSize="10px"
          valueTextFontSize="12px"
          currentValueText={`Yearly Consumption: ${energyData.energyYearlyConsumption.toFixed(2)} kWh`} // Display two decimal places

        />
      </div>
    </div>
  
  );
};

export default EnergyConsumptionCards;
