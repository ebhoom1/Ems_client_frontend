import React, { useEffect, useState } from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Dropdown from "react-bootstrap/Dropdown";
import Button from "react-bootstrap/Button";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./maindashboard.css";
import { API_URL } from "../../utils/apiConfig";

function Maindashboard() {
  const navigate = useNavigate();
  const [availableStationTypes, setAvailableStationTypes] = useState([]); // Holds station types with values
  const { userType, userData } = useSelector((state) => state.user); // Get userData from Redux

  const userName = userData?.validUserOne?.userName; // Access userName the same way as in Header

  // Fetch station types with values
  const fetchStationTypes = async (userName) => {
    try {
      const apiUrl = `${API_URL}/api/get-stacknames-by-userName/${userName}`;
      console.log("API URL:", apiUrl);
      console.log("Fetching station types for user:", userName);

      const response = await fetch(apiUrl);
      const data = await response.json();

      console.log("Raw fetched data:", data);

      const stationTypesWithValues = data.stackNames.reduce((acc, stack) => {
        if (!acc.includes(stack.stationType)) acc.push(stack.stationType);
        return acc;
      }, []); // Only unique station types

      console.log("Station types with values:", stationTypesWithValues);

      setAvailableStationTypes(stationTypesWithValues);
    } catch (error) {
      console.error("Error fetching station types:", error);
    }
  };

  useEffect(() => {
    console.log("userName:", userName); // Debugging the userName value
    if (userName) {
      fetchStationTypes(userName);
    } else {
      console.log("userName is not available");
    }
  }, [userName]);

  const handleCalibration = () => navigate("/calibration");
  const handleReport = () => navigate("/report");
  const handleDownload = () => navigate("/download");
  const handleParameter = () => navigate("/view-parameter");

  // Define all possible navigation links
  const allLinks = [
    { name: "Effluent/Sewage", path: "/water", key: "effluent" },
    { name: "Stack Emission", path: "/ambient", key: "emission" },
    { name: "Noise", path: "/noise", key: "noise" },
    { name: "Waste", path: "/waste", key: "waste" },
    { name: "Effluent Flow", path: "/flow", key: "effluent_flow" },
    { name: "Energy", path: "/energy", key: "energy" },
  ];

  // Filter links based on userType and available station types
  const visibleLinks =
    userType === "admin"
      ? allLinks // Show all links for admin
      : allLinks.filter((link) => availableStationTypes.includes(link.key)); // Filter based on stationType for users

  return (
    <div className=" col-12">
      <div className="maindashboard d-flex">
        <div className="flex-grow-1 content bg-light">
          <Navbar
            expand="lg"
            className="navbg p-3 shadow"
            style={{ borderRadius: "10px" }}
          >
            <div className="d-flex justify-content-between gap-2 w-100">
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="w-100 justify-content-evenly">
                  {visibleLinks.map((link) => (
                    <Nav.Link href={link.path} key={link.key}>
                      {link.name}
                    </Nav.Link>
                  ))}
                </Nav>
              </Navbar.Collapse>
            </div>
          </Navbar>

          {userType !== "user" && (
            <div className="flex-md-row mt-3 button-section bg-light">
              <div className="d-flex flex-md-row justify-content-around align-items-center">
                <Dropdown className="m-2 buttonbg rounded">
                  <Dropdown.Toggle
                    className="btn buttonbg shadow"
                    style={{ background: "#236a80", border: "none" }}
                  >
                    Calibration
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item href="/add-calibration">
                      Add Calibration
                    </Dropdown.Item>
                    <Dropdown.Item href="/view-calibration">
                      View Calibration
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                <Dropdown className="m-2">
                  <Dropdown.Toggle
                    className="btn buttonbg shadow"
                    style={{ background: "#236a80", border: "none" }}
                  >
                    Report
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item href="/report">Add Report</Dropdown.Item>
                    <Dropdown.Item href="/view-report">
                      View Report
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>

              <div
                className="d-flex flex-md-row"
                style={{ backgroundColor: "transparent" }}
              >
                <Button
                  className="btn buttonbg shadow m-2 p-0"
                  onClick={handleDownload}
                  style={{ background: "#236a80", border: "none" }}
                >
                  Download
                </Button>
                <Button
                  className="btn buttonbg shadow m-2"
                  onClick={handleParameter}
                  style={{ background: "#236a80", border: "none" }}
                >
                  Parameter Exceedence
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Maindashboard;


/* 
{userType !== "user" && (
            <div className="flex-md-row mt-3 button-section bg-light">
              <div className="d-flex flex-md-row justify-content-around align-items-center">
                <Dropdown className="m-2 buttonbg rounded">
                  <Dropdown.Toggle
                    className="btn buttonbg shadow"
                    style={{ background: "#236a80", border: "none" }}
                  >
                    Calibration
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item href="/add-calibration">
                      Add Calibration
                    </Dropdown.Item>
                    <Dropdown.Item href="/view-calibration">
                      View Calibration
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                <Dropdown className="m-2">
                  <Dropdown.Toggle
                    className="btn buttonbg shadow"
                    style={{ background: "#236a80", border: "none" }}
                  >
                    Report
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item href="/report">Add Report</Dropdown.Item>
                    <Dropdown.Item href="/view-report">
                      View Report
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>

              <div
                className="d-flex flex-md-row"
                style={{ backgroundColor: "transparent" }}
              >
                <Button
                  className="btn buttonbg shadow m-2 p-0"
                  onClick={handleDownload}
                  style={{ background: "#236a80", border: "none" }}
                >
                  Download
                </Button>
                <Button
                  className="btn buttonbg shadow m-2"
                  onClick={handleParameter}
                  style={{ background: "#236a80", border: "none" }}
                >
                  Parameter Exceedence
                </Button>
              </div>
            </div>
          )}
*/