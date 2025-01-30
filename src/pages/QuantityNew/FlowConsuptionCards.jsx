import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { io } from "socket.io-client";
import ReactD3Speedometer from "react-d3-speedometer";
import "./index.css";

const FlowConsuptionCards = ({ userName, primaryStation }) => {
  const [flowData, setFlowData] = useState({
    flowDailyConsumption: 0,
    flowMonthlyConsumption: 0,
    flowYearlyConsumption: 0,
  });

  // Establish socket connection
  const socket = io("https://api.ocems.ebhoom.com", {
    transports: ["websocket"],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  // Function to fetch data recursively for previous dates if needed
  const fetchData = async (station, date, attempt = 0) => {
    if (!station || !userName) {
      console.warn("❌ Station or userName is missing. Skipping API request.");
      return;
    }

    try {
      console.log(`📡 Fetching consumption data for User: ${userName}, Station: ${station}, Date: ${date}`);

      const response = await axios.get(`https://api.ocems.ebhoom.com/api/consumptionData`, {
        params: {
          userName,
          stackName: station,
          date,
        },
      });

      console.log(`📥 API Response for User: ${userName}, Station: ${station}, Date: ${date}:`, response.data);

      if (response.data?.data?.length > 0) {
        const stacks = response.data.data[0].stacks;

        console.log("🔍 Available Stacks in API Response:", stacks.map((s) => s.stackName));

        const stackData = stacks.find(
          (s) => s.stackName.trim().toLowerCase() === station.trim().toLowerCase()
        );

        if (stackData) {
          console.log(`✅ Found data for User: ${userName}, Matched Stack: ${stackData.stackName}:`, stackData);

          setFlowData({
            flowDailyConsumption: stackData.flowDailyConsumption || 0,
            flowMonthlyConsumption: stackData.flowMonthlyConsumption || 0,
            flowYearlyConsumption: stackData.flowYearlyConsumption || 0,
          });
        } else {
          console.warn(`⚠️ No exact match found for Station: ${station}. Fetching previous data...`);
          fetchPreviousData(station, date, attempt);
        }
      } else {
        console.warn(`⚠️ No data found for User: ${userName} on Date: ${date}. Fetching previous day's data...`);
        fetchPreviousData(station, date, attempt);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.warn(`🚨 No data found for ${date}, trying previous day...`);
        fetchPreviousData(station, date, attempt);
      } else {
        console.error(`❌ Unexpected error fetching data for ${date}:`, error);
      }
    }
  };

  // Function to fetch data for the previous date (up to 7 days)
  const fetchPreviousData = async (station, date, attempt) => {
    if (attempt < 7) {
      const previousDate = moment(date, "DD-MM-YYYY").subtract(1, "days").format("DD-MM-YYYY");
      console.warn(`🔄 Fetching previous date: ${previousDate}`);
      fetchData(station, previousDate, attempt + 1);
    } else {
      console.error(`🚨 No data found for the last 7 days.`);
      setFlowData({ flowDailyConsumption: 0, flowMonthlyConsumption: 0, flowYearlyConsumption: 0 });
    }
  };

  // Refetch data when primaryStation changes
  useEffect(() => {
    if (primaryStation) {
      console.log("🚀 Fetching data for primary station:", primaryStation);
      fetchData(primaryStation, moment().format("DD-MM-YYYY"));
    }
  }, [primaryStation]); // Depend on `primaryStation`

  return (
    <div className="row mt-4">
      {/* Daily Consumption */}
      <div className="col-lg-4 col-md-4 d-flex align-items-center justify-content-center">
        <ReactD3Speedometer
          value={parseFloat(flowData.flowDailyConsumption.toFixed(2))}
          maxValue={10000}
          needleColor="red"
          startColor="green"
          segments={10}
          endColor="blue"
          width={250}
          height={200}
          labelFontSize="10px"
          valueTextFontSize="12px"
          currentValueText={`Daily Consumption: ${flowData.flowDailyConsumption.toFixed(2)} m³`}
        />
      </div>

      {/* Monthly Consumption */}
      <div className="col-lg-4 col-md-4 d-flex align-items-center justify-content-center">
        <ReactD3Speedometer
          value={parseFloat(flowData.flowMonthlyConsumption.toFixed(2))}
          maxValue={30000}
          needleColor="red"
          startColor="green"
          segments={10}
          endColor="blue"
          width={250}
          height={200}
          labelFontSize="10px"
          valueTextFontSize="12px"
          currentValueText={`Monthly Consumption: ${flowData.flowMonthlyConsumption.toFixed(2)} m³`}
        />
      </div>

      {/* Yearly Consumption */}
      <div className="col-lg-4 col-md-4 d-flex align-items-center justify-content-center">
        <ReactD3Speedometer
          value={parseFloat(flowData.flowYearlyConsumption.toFixed(2))}
          maxValue={30000}
          needleColor="red"
          startColor="green"
          segments={10}
          endColor="blue"
          width={250}
          height={200}
          labelFontSize="10px"
          valueTextFontSize="12px"
          currentValueText={`Yearly Consumption: ${flowData.flowYearlyConsumption.toFixed(2)} m³`}
        />
      </div>
    </div>
  );
};

export default FlowConsuptionCards;
