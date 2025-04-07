import React, { useState, useEffect } from "react";
import moment from "moment";

function WaterBalancing() {
  const currentUserName = "HH014";
  const [monthlyflows, setmonthlyflows] = useState({}); // For monthly first-day flows
  const [yesterday, setyesterday] = useState({});   // For yesterday’s flows (monthly balancing)
  const [dailyConsumptionData, setDailyConsumptionData] = useState({}); // For daily balancing
  const [loading, setLoading] = useState(true);

  // Fetch data for monthly balancing
  useEffect(() => {
    async function fetchMonthlyAndYesterdayData() {
      try {
        // Fetch first-day-of-month monthly difference data
        const monthlyRes = await fetch(
          "http://localhost:5555/api/first-day-monthly-difference?userName=HH014&year=2025"
        );
        const monthlyJson = await monthlyRes.json();
        let monthlyFlows = {};
        monthlyJson.data.forEach((item) => {
          if (!monthlyFlows[item.stackName]) {
            monthlyFlows[item.stackName] = item.cumulatingFlowDifference || 0;
          }
        });
        setmonthlyflows(monthlyFlows);

        // Fetch yesterday's difference data for monthly balancing
        const yesterdayRes = await fetch(
          "http://localhost:5555/api/differenceData/yesterday/HH014"
        );
        const yesterdayJson = await yesterdayRes.json();
        let yesterdayFlows = {};
        yesterdayJson.data.forEach((item) => {
          if (!yesterdayFlows[item.stackName]) {
            yesterdayFlows[item.stackName] = item.cumulatingFlowDifference || 0;
          }
        });
        setyesterday(yesterdayFlows);
      } catch (error) {
        console.error("Error fetching monthly data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMonthlyAndYesterdayData();
  }, []);

  // Fetch daily difference data for daily balancing
  useEffect(() => {
    async function fetchDailyData() {
      try {
        const response = await fetch("http://localhost:5555/api/difference/HH014?interval=daily");
        const dailyJson = await response.json();
        let dailyData = {};
        const today = moment().format("DD/MM/YYYY");
        dailyJson.data.forEach(item => {
          // Only consider data for today and for effluent_flow stations
          if (item.stationType === "effluent_flow" && item.date === today) {
            // Use the API provided daily cumulatingFlowDifference as the daily consumption value
            dailyData[item.stackName] = item.cumulatingFlowDifference || 0;
          }
        });
        setDailyConsumptionData(dailyData);
      } catch (error) {
        console.error("Error fetching daily difference data:", error);
      }
    }
    fetchDailyData();
  }, []);

  // Calculate monthly balancing for each stack
  const monthlyBalancingData = {};
  Object.keys(monthlyflows).forEach((stackName) => {
    const monthlyCumDiff = monthlyflows[stackName] || 0;
    const yesterdayCumDiff = yesterday[stackName] || 0;
    // Monthly balancing is the difference between the first-day and yesterday’s reading
    monthlyBalancingData[stackName] = Math.max(0, monthlyCumDiff - yesterdayCumDiff);
  });

  // Group monthly values by type:
  // Consumption: STP inlet  
  // Reuse: ETP outlet, STP garden outlet 1, STP garden outlet 2  
  // Process: STP softener outlet, STP uf outlet, STP acf outlet

  const monthlyConsumptionValue =
    currentUserName === "HH014" ? monthlyBalancingData["STP inlet"] || 0 : 0;

  const monthlyReuseValue =
    currentUserName === "HH014"
      ? (monthlyBalancingData["ETP outlet"] || 0) +
        (monthlyBalancingData["STP garden outlet 1"] || 0) +
        (monthlyBalancingData["STP garden outlet 2"] || 0)
      : 0;

  const monthlyProcessValue =
    currentUserName === "HH014"
      ? (monthlyBalancingData["STP softener outlet"] || 0) +
        (monthlyBalancingData["STP uf outlet"] || 0) +
        (monthlyBalancingData["STP acf outlet"] || 0)
      : 0;

  // Calculate daily balancing using dailyConsumptionData (obtained from daily difference API)
  

  return (
    <div>
      <div>
        <h3 className="text-center">Water Balancing</h3>
      </div>
      <div className="row mb-4 mt-4 gap-4 d-flex align-items-center justify-content-center">
        {/* Consumption Card */}
        <div
          className="col-md-3 p-4 text-center shadow"
          style={{
            borderRadius: "10px",
            backgroundImage:
              "url('https://images.unsplash.com/photo-1616763880410-744958efc093?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8dGVhbCUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            color: "#fff",
          }}
        >
          <h5>Consumption</h5>
          <div className="d-flex justify-content-around">
           
            <div>
              <small>Monthly</small>
              <p>{currentUserName === "HH014" ? monthlyConsumptionValue.toFixed(2) : "N/A"} m³</p>
            </div>
          </div>
        </div>
        {/* Reuse Card */}
        <div
          className="col-md-3 p-4 text-center shadow"
          style={{
            borderRadius: "10px",
            backgroundImage:
              "url('https://images.unsplash.com/photo-1616763880410-744958efc093?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8dGVhbCUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            color: "#fff",
          }}
        >
          <h5>Reuse</h5>
          <div className="d-flex justify-content-around">
           
            <div>
              <small>Monthly</small>
              <p>{currentUserName === "HH014" ? monthlyReuseValue.toFixed(2) : "N/A"} m³</p>
            </div>
          </div>
        </div>
        {/* Process Card */}
        <div
          className="col-md-3 p-4 text-center shadow"
          style={{
            borderRadius: "10px",
            backgroundImage:
              "url('https://images.unsplash.com/photo-1616763880410-744958efc093?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8dGVhbCUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            color: "#fff",
          }}
        >
          <h5>Process</h5>
          <div className="d-flex justify-content-around">
           
            <div>
              <small>Monthly</small>
              <p>{currentUserName === "HH014" ? monthlyProcessValue.toFixed(2) : "N/A"} m³</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WaterBalancing;
