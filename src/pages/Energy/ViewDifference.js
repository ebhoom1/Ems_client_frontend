import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../utils/apiConfig";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { useSelector } from "react-redux";
import moment from "moment";

const ViewDifference = () => {
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

  const [energyData, setEnergyData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper function to format numbers safely.
  const formatNumber = (num) =>
    num !== undefined && num !== null ? Number(num).toFixed(2) : "0.00";

  useEffect(() => {
    if (!userName) return; // Wait until userName is available

    // Build the API URL using effective dates with the differenceData endpoint.
    const apiUrl = `${API_URL}/api/differenceData/${userName}/${interval}/${effectiveFromDate}/${effectiveToDate}`;
    console.log("Fetching API:", apiUrl);

    const fetchData = async () => {
      try {
        const response = await axios.get(apiUrl);
        console.log("API response:", response);

        if (response.data.success) {
          // Filter to include only records with stationType === "energy"
          const filteredData = response.data.data.filter(
            (item) => item.stationType === "energy"
          );
          setEnergyData(filteredData);
        } else {
          console.error("API returned unsuccessful response:", response.data);
        }
      } catch (error) {
        console.error("Error fetching energy data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userName, effectiveFromDate, effectiveToDate, interval]);

  // Convert Data to CSV and Download
  const handleDownloadCSV = () => {
    if (energyData.length === 0) return;

    let csvContent =
      "Date,Time,Stack Name,Initial Energy,Final Energy,Energy Difference\n";
    energyData.forEach((item) => {
      csvContent += `${item.date},${item.time},${item.stackName},${formatNumber(
        item.initialEnergy
      )},${formatNumber(item.lastEnergy)},${formatNumber(
        item.energyDifference
      )}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Energy_Data_${userName}_${effectiveFromDate}_to_${effectiveToDate}.csv`;
    link.click();
  };

  // Generate PDF and Download
  const handleDownloadPDF = () => {
    if (energyData.length === 0) return;

    const doc = new jsPDF();
    doc.text(`Energy Data (${effectiveFromDate} to ${effectiveToDate})`, 14, 10);

    const tableColumn = [
      "Date",
      "Time",
      "Stack Name",
      "Initial Energy",
      "Final Energy",
      "Energy Difference",
    ];
    const tableRows = [];

    energyData.forEach((item) => {
      const rowData = [
        item.date,
        item.time,
        item.stackName,
        formatNumber(item.initialEnergy),
        formatNumber(item.lastEnergy),
        formatNumber(item.energyDifference),
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

    doc.save(`Energy_Data_${userName}_${effectiveFromDate}_to_${effectiveToDate}.pdf`);
  };

  // Determine if user data is still loading (for non-admin users)
  const isUserLoading = userType === "user" && !userName;

  return (
    <div className="container">
      <h2 className="text-center mt-3">Energy Data</h2>
      {isUserLoading ? (
        <p>Loading user data...</p>
      ) : loading ? (
        <p className="text-center">Loading...</p>
      ) : energyData.length > 0 ? (
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
                  <th>Initial Energy</th>
                  <th>Final Energy</th>
                  <th>Energy Difference</th>
                </tr>
              </thead>
              <tbody>
                {energyData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.date}</td>
                    <td>{item.time}</td>
                    <td>{item.stackName}</td>
                    <td>{formatNumber(item.initialEnergy)}</td>
                    <td>{formatNumber(item.lastEnergy)}</td>
                    <td>{formatNumber(item.energyDifference)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="text-center">No data found for the selected dates.</p>
      )}
    </div>
  );
};

export default ViewDifference;
