import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../utils/apiConfig';
import html2pdf from "html2pdf.js";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const WaterQualityReport = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state || {};
  const [tablesData, setTablesData] = useState([]);
  const [minMaxData, setMinMaxData] = useState({ minValues: {}, maxValues: {} });
  const [energyData, setEnergyData] = useState([]);
  const [quantityData, setQuantityData] = useState([]);
  const [stackOptions, setStackOptions] = useState([]);
  const [userDetails, setUserDetails] = useState({
    companyName: "N/A",
    address: "N/A",
  });

  useEffect(() => {
    if (!formData.userName || !formData.stackName || !formData.startDate || !formData.endDate) {
      toast.error("Invalid form data. Redirecting to the form.");
      navigate("/custom-report");
      return;
    }
    fetchData();
  }, [formData]);

  const fetchData = async () => {
    try {
      const [avgResponse, minMaxResponse, energyResponse] = await Promise.all([
        axios.get(`${API_URL}/api/last-entry/user/${formData.userName}/stack/${formData.stackName}/interval/hour`, {
          params: { startTime: formData.startDate, endTime: formData.endDate }
        }),
        axios.get(`${API_URL}/api/minMax/${formData.userName}/stack/${formData.stackName}`),
        axios.get(`${API_URL}/api/lastDataByDateRange/${formData.userName}/daily/${formData.startDate}/${formData.endDate}`)
      ]);

      if (avgResponse.data.success) {
        setTablesData(avgResponse.data.data);
      }

      if (minMaxResponse.data.success) {
        setMinMaxData(minMaxResponse.data.data);
      }

      if (energyResponse.data.success) {
        const filteredStackOptions = energyResponse.data.data.filter(
          (entry) =>
            entry.stationType === "energy" ||
            entry.stationType === "effluent_flow"
        );
        setStackOptions(filteredStackOptions || []);
        setEnergyData(
          energyResponse.data.data.filter((entry) => entry.stationType === "energy")
        );
        setQuantityData(
          energyResponse.data.data.filter((entry) => entry.stationType === "effluent_flow")
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch report data.");
    }
  };

  const downloadPDF = () => {
    const element = document.getElementById("table-to-download");
    html2pdf()
      .from(element)
      .set({
        margin: 0.5,
        filename: "water_quality_report.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 3 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      })
      .save();
  };

  return (
    <div id="table-to-download">
      <h4 className="text-center mt-4" style={{ color: '#236a80' }}>
        Report for {userDetails.companyName} from{" "}
        {new Date(formData.startDate).toLocaleDateString("en-GB")} to{" "}
        {new Date(formData.endDate).toLocaleDateString("en-GB")}
      </h4>

      {tablesData.map((table, index) => (
        <div key={index} className="mt-5">
          <h4 className="text-center">Quality Report for {table.date}</h4>
          <table className="report-table">
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Average Value</th>
                <th>Min Value</th>
                <th>Max Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(table.parameters).map(([key, value], idx) => (
                <tr key={idx}>
                  <td>{key}</td>
                  <td>{value}</td>
                  <td>{minMaxData.minValues[key] || "N/A"}</td>
                  <td>{minMaxData.maxValues[key] || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h4 className="text-center">Energy Report for {table.date}</h4>
          {stackOptions.length > 0 ? (
            <table className="report-table">
              <thead>
                <tr>
                  <th>Stack Name</th>
                  <th>Initial Energy</th>
                  <th>Last Energy</th>
                  <th>Energy Difference</th>
                </tr>
              </thead>
              <tbody>
                {stackOptions
                  .filter((stack) => stack.stationType === "energy")
                  .map((stack, idx) => {
                    const energy = energyData.find(
                      (energyd) =>
                        energyd.date === table.date &&
                        energyd.stackName === stack.stackName
                    );
                    return (
                      <tr key={idx}>
                        <td>{stack.stackName}</td>
                        <td>{energy?.initialEnergy || 0}</td>
                        <td>{energy?.lastEnergy || 0}</td>
                        <td>{energy?.energyDifference || 0}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          ) : (
            <p className="text-center">No energy report available.</p>
          )}

          <h4 className="text-center">Quantity Report for {table.date}</h4>
          {stackOptions.length > 0 ? (
            <table className="report-table">
              <thead>
                <tr>
                  <th>Stack Name</th>
                  <th>Initial Flow</th>
                  <th>Last Flow</th>
                  <th>Flow Difference</th>
                </tr>
              </thead>
              <tbody>
                {stackOptions
                  .filter((stack) => stack.stationType === "effluent_flow")
                  .map((stack, idx) => {
                    const quantity = quantityData.find(
                      (quantd) =>
                        quantd.date === table.date &&
                        quantd.stackName === stack.stackName
                    );
                    return (
                      <tr key={idx}>
                        <td>{stack.stackName}</td>
                        <td>{quantity?.initialCumulatingFlow || 0}</td>
                        <td>{quantity?.lastCumulatingFlow || 0}</td>
                        <td>{quantity?.cumulatingFlowDifference || 0}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          ) : (
            <p className="text-center">No quantity report available.</p>
          )}
        </div>
      ))}
      <button onClick={downloadPDF} className="btn btn-primary mt-3">
        Download PDF
      </button>
      <ToastContainer />
    </div>
  );
};

export default WaterQualityReport;
