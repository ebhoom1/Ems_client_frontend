import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from "../../utils/apiConfig";
import moment from 'moment';
import { io } from 'socket.io-client';
import ReactD3Speedometer from "react-d3-speedometer";
import './index.css'
const FlowConsuptionCards = ({ userName, primaryStation }) => {
  const [flowData, setFlowData] = useState({
    flowDailyConsumption: 0,
    flowMonthlyConsumption: 0,
    flowYearlyConsumption: 0,
  });

  const socket = io(API_URL, {
    transports: ['websocket'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

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
        const { flowDailyConsumption, flowMonthlyConsumption, flowYearlyConsumption } = response.data.stacks[0];
        setFlowData({
          flowDailyConsumption,
          flowMonthlyConsumption,
          flowYearlyConsumption,
        });
      }
    } catch (error) {
      console.error('Error fetching energy consumption data:', error);
    }
  };

  useEffect(() => {
    fetchData(primaryStation);
  }, [primaryStation]);

  return (
    <div className="energy-flow-container">
      <div className='d-flex  shadow' style={{ marginLeft: '200px', borderRadius: '15px', border: '1px solid #ccc' ,backgroundColor:'white' }}>
        <div className="energy-flow-item">
          <ReactD3Speedometer
            value={flowData.flowDailyConsumption}
            maxValue={10000}
            needleColor="red"
            startColor="green"
            segments={10}
            endColor="blue"
            width={250}
            height={200}
            labelFontSize="10px"
            valueTextFontSize="16px"
            currentValueText={`Daily Consumption: ${flowData.flowDailyConsumption} m³`}
          />
        </div>
        <div className="energy-flow-item">
          <ReactD3Speedometer
            value={flowData.flowMonthlyConsumption}
            maxValue={30000}
            needleColor="red"
            startColor="green"
            segments={10}
            endColor="blue"
            width={250}
            height={200}
            labelFontSize="10px"
            valueTextFontSize="16px"
            currentValueText={`Monthly Consumption: ${flowData.flowMonthlyConsumption} m³`}
          />
        </div>
        <div className="energy-flow-item">
          <ReactD3Speedometer
            value={flowData.flowYearlyConsumption}
            maxValue={30000}
            needleColor="red"
            startColor="green"
            segments={10}
            endColor="blue"
            width={250}
            height={200}
            labelFontSize="10px"
            valueTextFontSize="16px"
            currentValueText={`Yearly Consumption: ${flowData.flowYearlyConsumption} m³`}
          />
        </div>
      </div>
    </div>
  );
  
};

export default FlowConsuptionCards;




/*FlowConsuptionCards  */