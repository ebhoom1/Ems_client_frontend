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
      const response = await axios.get(`${API_URL}/api/consumption-data`, {
        params: {
          userName,
          stackName: station,
          date: today,
          hour,
        },
      });
      if (response.data && response.data.stacks.length > 0) {
        const { energyDailyConsumption, energyMonthlyConsumption, energyYearlyConsumption } = response.data.stacks[0];
        setEnergyData({
          energyDailyConsumption,
          energyMonthlyConsumption,
          energyYearlyConsumption,
        });
      }
    } catch (error) {
      console.error('Error fetching energy consumption data:', error);
    }
  };

  // Refetch data when primaryStation changes
  useEffect(() => {
    fetchData(primaryStation);
  }, [primaryStation]);

    return (
        <div className='energy-flow-container '>
            <div className='' style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <div style={{ width: '100px'}}>
                <ReactD3Speedometer
                    value={energyData.energyDailyConsumption}
                    maxValue={10000}
                    needleColor="red"
                    startColor="green"
                    segments={10}
                    endColor="blue"
                    width={250} // Adjust the width
            height={200} // Adjust the height
                    labelFontSize={"10px"}
                    valueTextFontSize={"16px"}
                    currentValueText={`Daily Consumption: ${energyData.energyDailyConsumption} kWh`}
                />
            </div>
            <div style={{ width: '100px', margin: '240px' }}>
                <ReactD3Speedometer
                    value={energyData.energyMonthlyConsumption}
                    maxValue={30000}
                    needleColor="red"
                    startColor="green"
                    segments={10}
                    endColor="blue"
                    width={250} // Adjust the width
                    height={200} // Adjust the height
                            labelFontSize={"10px"}
                    valueTextFontSize={"16px"}
                    currentValueText={`Monthly Consumption: ${energyData.energyMonthlyConsumption} kWh`}
                />
            </div>
            <div style={{ width: '100px', margin: '10px' }}>
                <ReactD3Speedometer
                    value={energyData.energyYearlyConsumption}
                    maxValue={30000}
                    needleColor="red"
                    startColor="green"
                    segments={10}
                    endColor="blue"
                    width={250} // Adjust the width
            height={200} // Adjust the height
                    labelFontSize={"10px"}
                    valueTextFontSize={"16px"}
                    currentValueText={`Yearly Consumption: ${energyData.energyYearlyConsumption} kWh`}
                />
            </div>
        </div>
        
        </div>
        
    );
};

export default EnergyConsumptionCards;
