import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../utils/apiConfig";
import moment from "moment";
import { io } from "socket.io-client";
import ReactD3Speedometer from "react-d3-speedometer";

const EnergyConsumptionCards = ({ userName, primaryStation }) => {
  const [energyData, setEnergyData] = useState({
    energyDailyConsumption: 0,
    energyMonthlyConsumption: 0,
    energyYearlyConsumption: 0,
  });

  // Establish socket connection
  const socket = io(API_URL, {
    transports: ["websocket"],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  // Function to fetch data, with recursive fallback to previous days
  const fetchData = async (station, date, attempt = 0) => {
    if (!station || !userName) {
      console.warn("❌ Station or userName is missing. Skipping API request.");
      return;
    }

    try {
      console.log(`📡 Fetching energy data for User: ${userName}, Station: ${station}, Date: ${date}`);

      const response = await axios.get(`${API_URL}/api/consumptionData`, {
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
          console.log(`✅ Found energy data for User: ${userName}, Matched Stack: ${stackData.stackName}:`, stackData);

          setEnergyData({
            energyDailyConsumption: stackData.energyDailyConsumption || 0,
            energyMonthlyConsumption: stackData.energyMonthlyConsumption || 0,
            energyYearlyConsumption: stackData.energyYearlyConsumption || 0,
          });
        } else {
          console.warn(`⚠️ No exact match found for Station: ${station}.`);
          setEnergyData({ energyDailyConsumption: 0, energyMonthlyConsumption: 0, energyYearlyConsumption: 0 });
        }
      } else {
        console.warn(`⚠️ No energy data found for User: ${userName} on Date: ${date}`);

        // If no data is found, try fetching from the previous day (recursive approach, up to 7 days)
        if (attempt < 7) {
          const previousDate = moment(date, "DD-MM-YYYY").subtract(1, "days").format("DD-MM-YYYY");
          console.warn(`🔄 Fetching previous date: ${previousDate}`);
          fetchData(station, previousDate, attempt + 1);
        } else {
          console.error(`🚨 No energy data found for the last 7 days.`);
          setEnergyData({ energyDailyConsumption: 0, energyMonthlyConsumption: 0, energyYearlyConsumption: 0 });
        }
      }
    } catch (error) {
      console.error(`❌ Error fetching energy data for User: ${userName}, Station: ${station}, Date: ${date}:`, error);
    }
  };

  // Refetch data when primaryStation changes
  useEffect(() => {
    if (primaryStation) {
      console.log("Fetching energy data for primary station:", primaryStation);
      fetchData(primaryStation, moment().format("DD-MM-YYYY"));
    }
  }, [primaryStation]); // Depend on `primaryStation`

  return (
    <div className="row mt-4">
      {/* Daily Consumption */}
      <div className="col-lg-4 col-md-4 d-flex align-items-center justify-content-center">
        <ReactD3Speedometer
          value={parseFloat(energyData.energyDailyConsumption.toFixed(2))}
          maxValue={10000}
          needleColor="red"
          startColor="green"
          segments={10}
          endColor="blue"
          width={250}
          height={200}
          labelFontSize="10px"
          valueTextFontSize="12px"
          currentValueText={`Daily Consumption: ${energyData.energyDailyConsumption.toFixed(2)} kWh`}
        />
      </div>

      {/* Monthly Consumption */}
      <div className="col-lg-4 col-md-4 d-flex align-items-center justify-content-center">
        <ReactD3Speedometer
          value={parseFloat(energyData.energyMonthlyConsumption.toFixed(2))}
          maxValue={30000}
          needleColor="red"
          startColor="green"
          segments={10}
          endColor="blue"
          width={250}
          height={200}
          labelFontSize="10px"
          valueTextFontSize="12px"
          currentValueText={`Monthly Consumption: ${energyData.energyMonthlyConsumption.toFixed(2)} kWh`}
        />
      </div>

      {/* Yearly Consumption */}
      <div className="col-lg-4 col-md-4 d-flex align-items-center justify-content-center">
        <ReactD3Speedometer
          value={parseFloat(energyData.energyYearlyConsumption.toFixed(2))}
          maxValue={30000}
          needleColor="red"
          startColor="green"
          segments={10}
          endColor="blue"
          width={250}
          height={200}
          labelFontSize="10px"
          valueTextFontSize="12px"
          currentValueText={`Yearly Consumption: ${energyData.energyYearlyConsumption.toFixed(2)} kWh`}
        />
      </div>
    </div>
  );
};

export default EnergyConsumptionCards;
