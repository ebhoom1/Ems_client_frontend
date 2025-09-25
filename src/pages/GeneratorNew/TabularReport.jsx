import React, { useEffect, useState } from "react";
import { Table, Card, Spinner, Button, Modal, Form } from "react-bootstrap";
import axios from "axios";
import { API_URL } from "../../utils/apiConfig";
import moment from "moment-timezone";
import jsPDF from "jspdf";
import "jspdf-autotable";

const USER_NAME = "BBUSER";

export default function TabularReport() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalUserName, setModalUserName] = useState(USER_NAME);
  const [modalDate, setModalDate] = useState("");
  const [modalData, setModalData] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  // Reusable function to format API data
  const formatApiData = (data) => {
    if (!Array.isArray(data)) {
      console.error("Data received is not an array:", data);
      return [];
    }
    return data.map((item) => {
      const timestamp = new Date(item.timestamp_hour);
      const dateLabel = timestamp.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      const hourLabel = timestamp.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const energyConsumption = parseFloat(item.energy?.consumption_kWh) || 0;
      const fuelConsumption = parseFloat(item.fuel?.consumption_liters) || 0;
      const efficiency =
        fuelConsumption > 0 ? energyConsumption / fuelConsumption : 0;

      return {
        date: dateLabel,
        hour: hourLabel,
        energy: energyConsumption.toFixed(2),
        diesel: fuelConsumption.toFixed(2),
        efficiency: efficiency.toFixed(2),
      };
    });
  };

  // Fetch and filter today's hourly consumption
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const todayApiFormat = moment().tz("Asia/Kolkata").format("YYYY-MM-DD");
        const res = await axios.get(
          `${API_URL}/api/hourly?userName=${USER_NAME}&date=${todayApiFormat}`
        );

        // **FIX:** Ensure only today's data is shown by filtering client-side
        const todayDisplayFormat = moment().tz("Asia/Kolkata").format("DD/MM/YYYY");
        const formattedData = formatApiData(res.data);
        const filteredData = formattedData.filter(item => item.date === todayDisplayFormat);
        
        setReportData(filteredData);
      } catch (err) {
        console.error("Error fetching hourly consumption:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle modal form submission
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalData([]);
    try {
      const res = await axios.get(
        `${API_URL}/api/hourly?userName=${modalUserName}&date=${modalDate}`
      );
      const selectedDate = moment(modalDate).format("DD/MM/YYYY");
      const formattedData = formatApiData(res.data);
      const filteredData = formattedData.filter(item => item.date === selectedDate);

      setModalData(filteredData);
    } catch (err)
    {
      console.error("Error fetching modal data:", err);
      setModalData([]);
    } finally {
      setModalLoading(false);
    }
  };
  
  // Generic download handler
  const handleDownload = (format) => {
    const headers = [["Date", "Hour", "Energy (kWh)", "Diesel (L)", "Efficiency (kWh/L)"]];
    const rows = modalData.map((row) => [
      row.date,
      row.hour,
      row.energy,
      row.diesel,
      row.efficiency,
    ]);
    const docName = `hourly_report_${modalUserName}_${modalDate}`;

    if (format === 'csv') {
      const csvContent = [
        headers[0].join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${docName}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      doc.text(`Hourly Report for ${modalUserName} on ${modalDate}`, 14, 15);
      doc.autoTable({
        head: headers,
        body: rows,
        startY: 20,
      });
      doc.save(`${docName}.pdf`);
    }
  };

  return (
    <div className="mt-4">
      {/* Style for the custom width modal */}
     

      <div className="shadow-sm border-0 rounded-3">
        <Card.Header className="bg-light text-dark fw-bold d-flex justify-content-between align-items-center mb-3">
         <h4><i><b>Hourly Diesel Consumption & Energy Report</b></i></h4>
          <Button
            size="sm"
            onClick={() => setShowModal(true)}
            style={{ backgroundColor: '#236a80', color: '#fff', border: 'none' }}
          >
            Show Previous Hour Data
          </Button>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center p-4">
              <Spinner animation="border" />
            </div>
          ) : (
            <Table responsive bordered hover className="align-middle">
              <thead>
                <tr style={{ backgroundColor: "#236a80", color: "#fff" }}>
                  <th style={{ backgroundColor: '#236a80', color: '#fff', border: 'none' }}>Date</th>
                  <th style={{ backgroundColor: '#236a80', color: '#fff', border: 'none' }}>Hour</th>
                  <th style={{ backgroundColor: '#236a80', color: '#fff', border: 'none' }}>Energy (kWh)</th>
                  <th style={{ backgroundColor: '#236a80', color: '#fff', border: 'none' }}>Diesel (L)</th>
                  <th style={{ backgroundColor: '#236a80', color: '#fff', border: 'none' }}>Efficiency (kWh/L)</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.date || "N/A"}</td>
                    <td>{row.hour || "N/A"}</td>
                    <td>{row.energy}</td>
                    <td
                      style={{
                        color: parseFloat(row.diesel) > 130 ? "red" : "inherit",
                        fontWeight:
                          parseFloat(row.diesel) > 130 ? "bold" : "normal",
                      }}
                    >
                      {row.diesel}
                    </td>
                    <td
                      style={{
                        color:
                          parseFloat(row.efficiency) < 3.5 ? "orange" : "green",
                      }}
                    >
                      {row.efficiency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </div>

      {/* Modal for previous hour data */}
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        centered 
        dialogClassName="modal-custom-width"
      >
        <Modal.Header closeButton>
          <Modal.Title>Fetch Previous Hourly Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleModalSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>User Name</Form.Label>
              <Form.Control
                type="text"
                value={modalUserName}
                onChange={(e) => setModalUserName(e.target.value)}
                placeholder="Enter user name"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={modalDate}
                onChange={(e) => setModalDate(e.target.value)}
                required
              />
            </Form.Group>
            <Button 
              type="submit" 
              disabled={modalLoading}
              style={{ backgroundColor: "#236a80", color: "white", border: "none" }}
            >
              {modalLoading ? <Spinner animation="border" size="sm" /> : "Fetch Data"}
            </Button>
          </Form>

          {modalData.length > 0 && (
            <div className="mt-4">
              <h5>
                Data for {modalUserName} on {moment(modalDate).format("DD/MM/YYYY")}
              </h5>
              <Table responsive bordered hover className="align-middle">
                <thead>
                  <tr style={{ backgroundColor: "#236a80", color: "#fff" }}>
                    <th>Date</th>
                    <th>Hour</th>
                    <th>Energy (kWh)</th>
                    <th>Diesel (L)</th>
                    <th>Efficiency (kWh/L)</th>
                  </tr>
                </thead>
                <tbody>
                  {modalData.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.date || "N/A"}</td>
                      <td>{row.hour || "N/A"}</td>
                      <td>{row.energy}</td>
                      <td>{row.diesel}</td>
                      <td>{row.efficiency}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {/* CHANGE: Download buttons are now aligned */}
              <div className="d-flex gap-2">
                <Button variant="success" onClick={() => handleDownload('csv')}>
                  Download as CSV
                </Button>
                <Button variant="danger" onClick={() => handleDownload('pdf')}>
                  Download as PDF
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}