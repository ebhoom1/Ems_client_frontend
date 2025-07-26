import React, { useEffect, useState } from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Dropdown from "react-bootstrap/Dropdown";
import Button from "react-bootstrap/Button";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import "./maindashboard.css";
import { API_URL } from "../../utils/apiConfig";

function Maindashboard() {
  const navigate = useNavigate();
  const location = useLocation(); // Get the current path
  const [availableStationTypes, setAvailableStationTypes] = useState([]); // Holds station types with values
  const { userType, userData } = useSelector((state) => state.user); // Get userData from Redux
  const storedUserId = sessionStorage.getItem("selectedUserId"); // For admin, use selected user ID
  const userName = userType === "admin" ? storedUserId : userData?.validUserOne?.userName; // Adjusted userName

  // Fetch station types with values
  useEffect(() => {
    // Only fetch if not super_admin, as super_admin doesn't rely on specific station types for visibility
    if (userName && userType !== "super_admin") {
      fetchStationTypes(userName);
    } else if (userType === "super_admin") {
      // If super_admin, we might want to show all links by default or based on a different logic
      // For now, let's assume super_admin sees all links that are not restricted by userName
      setAvailableStationTypes(allLinks.map(link => link.key)); // Populate with all keys to ensure visibility
    } else {
      console.log("userName is not available or userType is super_admin.");
    }
  }, [userName, userType]); // Add userType to dependency array

  const fetchStationTypes = async (userName) => {
    try {
      const response = await fetch(`${API_URL}/api/get-stacknames-by-userName/${userName}`);
      const data = await response.json();

      // Ensure the response contains valid station types
      console.log("Fetched Stack Names:", data);

      if (data.stackNames && data.stackNames.length > 0) {
        const stationTypesWithValues = data.stackNames
          .map((stack) => stack.stationType) // Extract stationType
          .filter((type, index, self) => type && self.indexOf(type) === index); // Remove duplicates

        console.log("Filtered Station Types:", stationTypesWithValues);
        setAvailableStationTypes(stationTypesWithValues);
      } else {
        console.error("No valid station types found for user.");
        setAvailableStationTypes([]); // Default to an empty array if no station types are found
      }
    } catch (error) {
      console.error("Error fetching station types:", error);
      setAvailableStationTypes([]); // Set an empty array on error
    }
  };

  const handleCalibration = () => navigate("/calibration");
  const handleReport = () => navigate("/report");
  const handleDownload = () => navigate("/download");
  const handleParameter = () => navigate("/view-parameter");

  // Define all possible navigation links
  const allLinks = [
    { name: "Quality", path: "/water", key: "effluent" },
    { name: "Stack Emission", path: "/ambient", key: "emission" },
    { name: "Noise", path: "/noise", key: "noise" },
    { name: "Water Quantity", path: "/quantity", key: "effluent_flow" },
    { name: "Energy", path: "/energy", key: "energy" },
    
  ];

  // Filter links based on available station types, but always include "Waste" and "Fuel".
  // Also, exclude "Effluent" for specific userNames.
 const visibleLinks = allLinks.filter(link => {
  // super_admin sees only Quality, Water Quantity, Waste & Fuel
  if (userType === "super_admin") {
    return ["effluent", "effluent_flow", "waste", "fuel"].includes(link.key);
  }

  // existing logic for others:
  if (link.key === "effluent" &&
      (userName === "BANKA_BIO_ADMIN" || userName === "MY_HOME017")) {
    return false;
  }
  return availableStationTypes.includes(link.key)
      || link.key === "waste"
      || link.key === "fuel";
});


  console.log("Visible Links:", visibleLinks);

  return (
    <div className="col-12">
      <div className="maindashboard d-flex">
        <div className="flex-grow-1 content bg-light">
        {visibleLinks.length > 0 && (
  <Navbar
    expand="lg"
    className="navbg shadow"
    style={{ borderRadius: "10px" }}
  >
    <div className="d-flex justify-content-between gap-2 w-100">
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="w-100 justify-content-evenly">
          {visibleLinks.map((link) => (
            <Nav.Link
              href={link.path}
              key={link.key}
              className={location.pathname === link.path ? "active-link" : ""}
            >
              {link.name}
            </Nav.Link>
          ))}
        </Nav>
      </Navbar.Collapse>
    </div>
  </Navbar>
)}


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
                    <Dropdown.Item href="/view-calibration-report">
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
                  className="btn buttonbg shadow m-2 "
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