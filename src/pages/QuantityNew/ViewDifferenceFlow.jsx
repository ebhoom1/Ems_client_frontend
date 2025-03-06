import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../utils/apiConfig";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { useSelector } from "react-redux";
import moment from "moment";

const ViewDifferenceFlow = () => {
  const location = useLocation();
  const { userType, userData } = useSelector((state) => state.user);
  const { userName: stateUserName, fromDate, toDate, interval } = location.state || {};

  // For non-admin users, fallback to the logged-in user's username if not provided in location state.
  const userName =
    stateUserName ||
    (userType === "user" && userData?.validUserOne?.userName
      ? userData.validUserOne.userName
      : "");

  // If fromDate or toDate are missing, use today's date as default.
  const defaultDate = moment().format("DD-MM-YYYY");
  const effectiveFromDate = fromDate || defaultDate;
  const effectiveToDate = toDate || defaultDate;

  const [flowData, setFlowData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper function to format numbers safely.
  const formatNumber = (num) =>
    num !== undefined && num !== null ? Number(num).toFixed(2) : "0.00";

  useEffect(() => {
    if (!userName) return; // Wait until userName is available

    // Build the API URL using effective dates.
    const apiUrl = `${API_URL}/api/differenceData/${userName}/${interval}/${effectiveFromDate}/${effectiveToDate}`;
    console.log("Fetching API:", apiUrl);

    const fetchData = async () => {
      try {
        const response = await axios.get(apiUrl);
        console.log("API response:", response);

        if (response.data.success) {
          // Filter only effluent_flow stationType
          const filteredData = response.data.data.filter(
            (item) => item.stationType === "effluent_flow"
          );
          setFlowData(filteredData);
        } else {
          console.error("API returned unsuccessful response:", response.data);
        }
      } catch (error) {
        console.error("Error fetching flow data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userName, effectiveFromDate, effectiveToDate, interval]);

  // Convert Data to CSV and Download
  const handleDownloadCSV = () => {
    if (flowData.length === 0) return;

    let csvContent =
      "Date,Time,Stack Name,Initial Flow,Final Flow,Flow Difference\n";
    flowData.forEach((item) => {
      csvContent += `${item.date},${item.time},${item.stackName},${formatNumber(
        item.initialCumulatingFlow
      )},${formatNumber(item.lastCumulatingFlow)},${formatNumber(
        item.cumulatingFlowDifference
      )}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Effluent_Flow_Data_${userName}_${effectiveFromDate}_to_${effectiveToDate}.csv`;
    link.click();
  };

  // Generate PDF and Download
  const handleDownloadPDF = () => {
    if (flowData.length === 0) return;

    const doc = new jsPDF();
    doc.text(
      `Effluent Flow Data (${effectiveFromDate} to ${effectiveToDate})`,
      14,
      10
    );

    const tableColumn = [
      "Date",
      "Time",
      "Stack Name",
      "Initial Flow",
      "Final Flow",
      "Flow Difference",
    ];
    const tableRows = [];

    flowData.forEach((item) => {
      const rowData = [
        item.date,
        item.time,
        item.stackName,
        formatNumber(item.initialCumulatingFlow),
        formatNumber(item.lastCumulatingFlow),
        formatNumber(item.cumulatingFlowDifference),
      ];
      tableRows.push(rowData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: "grid",
      styles: { fontSize: 10 },
    });

    doc.save(
      `Effluent_Flow_Data_${userName}_${effectiveFromDate}_to_${effectiveToDate}.pdf`
    );
  };

  // Determine if user data is still loading (for non-admin users)
  const isUserLoading = userType === "user" && !userName;

  return (
    <div className="container">
      <h2 className="text-center mt-3">Effluent Flow Data</h2>
      {isUserLoading ? (
        <p>Loading user data...</p>
      ) : loading ? (
        <p className="text-center">Loading...</p>
      ) : flowData.length > 0 ? (
        <>
          <div className="d-flex justify-content-end mt-3">
            <button
              className="btn btn-outline-success mx-2"
              onClick={handleDownloadCSV}
            >
              Download CSV
            </button>
            <button className="btn btn-outline-danger" onClick={handleDownloadPDF}>
              Download PDF
            </button>
          </div>
          <div className="table-responsive mt-3">
            <table className="table table-bordered">
              <thead className="thead-dark">
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Stack Name</th>
                  <th>Initial Flow</th>
                  <th>Final Flow</th>
                  <th>Flow Difference</th>
                </tr>
              </thead>
              <tbody>
                {flowData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.date}</td>
                    <td>{item.time}</td>
                    <td>{item.stackName}</td>
                    <td>{formatNumber(item.initialCumulatingFlow)}</td>
                    <td>{formatNumber(item.lastCumulatingFlow)}</td>
                    <td>{formatNumber(item.cumulatingFlowDifference)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="text-center">
          No data found for the selected dates.
        </p>
      )}
    </div>
  );
};

export default ViewDifferenceFlow;
