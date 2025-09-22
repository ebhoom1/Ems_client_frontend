import React, { useEffect, useState } from "react";
import { Table, Card, Spinner } from "react-bootstrap";
import axios from "axios";
import { API_URL } from "../../utils/apiConfig";
function TabularReport() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch daily consumption from backend (or presigned S3 URL)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Example: your backend route that fetches dailyconsumption/consumptionData.json
        const res = await axios.get(`${API_URL}/api/daily-consumption`);
        const data = res.data;

        // Map & format data for table
        const formatted = data.map((d) => {
          const efficiency = d.dailyFuel > 0 ? d.dailyEnergy / d.dailyFuel : 0;
          const co2 = d.dailyFuel * 2.68; // Approx conversion factor (kg CO₂ per litre diesel)

          return {
            date: d.date,
            energy: d.dailyEnergy.toFixed(2),
            diesel: d.dailyFuel.toFixed(2),
            efficiency: efficiency.toFixed(2),
            co2: co2.toFixed(2),
          };
        });

        setReportData(formatted);
      } catch (err) {
        console.error("Error fetching daily consumption:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="mt-4">
      <div className="shadow-sm border-0 rounded-3">
        <Card.Header className="bg-light text-dark fw-bold">
          Diesel Consumption & Energy Report
        </Card.Header>
        <div>
          {loading ? (
            <div className="text-center p-4">
              <Spinner animation="border" />
            </div>
          ) : (
            <Table responsive bordered hover className="align-middle">
              <thead>
                <tr style={{ backgroundColor: "#236a80", color: "#fff" }}>
                  <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Date</th>
                  <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Energy (kWh)</th>
                  <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Diesel (L)</th>
                  <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Efficiency (kWh/L)</th>
             
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.date}</td>
                    <td>{row.energy}</td>
                    <td
                      style={{
                        color: row.diesel > 130 ? "red" : "inherit",
                        fontWeight: row.diesel > 130 ? "bold" : "normal",
                      }}
                    >
                      {row.diesel}
                    </td>
                    <td
                      style={{
                        color: row.efficiency < 3.5 ? "orange" : "green",
                      }}
                    >
                      {row.efficiency}
                    </td>
                    <td>{row.co2}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}

export default TabularReport;
