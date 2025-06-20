import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom"; //new useLocation
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { logoutUser } from "../../redux/features/user/userSlice";
import { setSelectedUser } from "../../redux/features/selectedUsers/selectedUserSlice";
import { toast } from "react-toastify"; // Make sure toast is imported
import { fetchIotDataByUserName } from "../../redux/features/iotData/iotDataSlice";
import {
  fetchLast10MinDataByUserName,
  fetchUserLatestByUserName,
} from "../../redux/features/userLog/userLogSlice";
import { fetchUserById } from "../../redux/features/userLog/userLogSlice"; // Import Redux action
import WaterGraphPopup from "./WaterGraphPopup";
import CalibrationPopup from "../Calibration/CalibrationPopup";
import CalibrationExceeded from "../Calibration/CalibrationExceeded";
import { useOutletContext } from "react-router-dom";
import { Oval } from "react-loader-spinner";
import DailyHistoryModal from "./DailyHIstoryModal";
import { API_URL } from "../../utils/apiConfig";
import { io } from "socket.io-client";
import Hedaer from "../Header/Hedaer";
import Maindashboard from "../Maindashboard/Maindashboard";
import DashboardSam from "../Dashboard/DashboardSam";
import effluent from "../../assests/images/effluentimage.svg";
import "./water.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import DownloadaverageDataModal from "./DownloadaverageDataModal";
import { fetchUserByUserName } from "../../redux/features/userLog/userLogSlice";
import Modal from "react-modal";
Modal.setAppElement("#root");

// Initialize Socket.IO
const socket = io(API_URL, {
  transports: ["websocket"],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000, // Retry every second
});

socket.on("connect", () => console.log("Connected to Socket.IO server"));
socket.on("connect_error", (error) =>
  console.error("Connection Error:", error)
);
const Water = () => {
  const location = useLocation(); //new get location state

  const navigate = useNavigate();
  // Use useOutletContext if available, otherwise set defaults
  const outletContext = useOutletContext() || {};
  const {
    searchTerm = "",
    searchStatus = "",
    handleSearch = () => {},
    isSearchTriggered = false,
  } = outletContext;
  const { selectedUser } = useSelector((state) => state.userLog);
  const dispatch = useDispatch();
  const { userData, userType } = useSelector((state) => state.user);
  console.log("userdata:", userData);
  const loggedInUser = userData?.validUserOne;
  const operator = useSelector((state) => state.auth.user);

  const selectedUserIdFromRedux = useSelector(
    (state) => state.selectedUser.userId
  );
  const selectedUserState = useSelector((state) => state.selectedUser);
  console.log("Full selectedUser state:", selectedUserState);
  const [userId, setUserId] = useState(null);

  const storedUserId = sessionStorage.getItem("selectedUserId"); // Retrieve userId from session storage
  const { latestData, error } = useSelector((state) => state.iotData);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showCalibrationPopup, setShowCalibrationPopup] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [currentUserName, setCurrentUserName] = useState(
    userType === "admin" ? "KSPCB001" : userData?.validUserOne?.userName
  );
  const [companyName, setCompanyName] = useState("");

  const [loading, setLoading] = useState(true); // general loading
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedStack, setSelectedStack] = useState("all");
  const [effluentStacks, setEffluentStacks] = useState([]); // New state to store effluent stacks
  const [realTimeData, setRealTimeData] = useState({});
  // Remove spinners and set default colors for indicators
  const [exceedanceColor, setExceedanceColor] = useState("green"); // Default to 'gray'
  const [timeIntervalColor, setTimeIntervalColor] = useState("green"); // Default to 'gray'
  const [lastEffluentData, setLastEffluentData] = useState({}); // State to store last effluent data
  // Extract user details
  const [address, setAddress] = useState("No address available");
  const [district, setDistrict] = useState("Unknown District");

  //modal state
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false); //new

  const [checkoutLoading, setCheckoutLoading] = useState(false); //new optional loader

  const [isCheckedIn, setIsCheckedIn] = useState(false); // new
  const [allowClicks, setAllowClicks] = useState(false); //new for overlay control

  useEffect(() => {
    if (!loggedInUser?.userName) return; // only run when ready

    const checkServerStatus = async () => {
      const userRole = loggedInUser?.isTechnician
        ? "technician"
        : loggedInUser?.isTerritorialManager
        ? "territorialManager"
        : loggedInUser?.isOperator
        ? "operator"
        : null;

      if (!userRole) return;

      try {
        const res = await axios.get(
          `${API_URL}/api/attendance/status/${loggedInUser.userName}/${userRole}`
        );
        const isChecked = res.data?.isCheckedIn === true;
        setIsCheckedIn(isChecked);
        setAllowClicks(!isChecked); // allow check-in only if not already checked-in
        console.log("✅ isCheckedIn from DB:", isChecked);
      } catch (err) {
        console.error("Error checking server-side isCheckedIn:", err);
      }
    };

    checkServerStatus();
  }, [loggedInUser?.userName]); // 👈 depends only on userName availability

  const handleCheckOut = () => {
    if (!isCheckedIn) {
      alert("❌ Please Check-In first before trying to Check-Out.");
      return;
    }
    setCheckoutModalOpen(true);
  };

  // Function to reset colors and trigger loading state
  const resetColors = () => {
    setExceedanceColor("loading");
    setTimeIntervalColor("loading");
  };

  /* download average data */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const graphRef = useRef();
  // Water parameters
  const waterParameters = [
    { parameter: "pH", value: "pH", name: "ph" },
    { parameter: "TDS", value: "mg/l", name: "TDS" },
    { parameter: "Turbidity", value: "NTU", name: "TURB" },
    { parameter: "Temperature", value: "℃", name: "Temp" },
    { parameter: "Temperature", value: "℃", name: "TEMP" },

    //ammonicalNitrogen
    {
      parameter: "Ammonical Nitrogen",
      value: "mg/l",
      name: "ammonicalNitrogen",
    },
    { parameter: "TOC", value: "mg/L", name: "TOC" },

    { parameter: "BOD", value: "mg/l", name: "BOD" },
    { parameter: "COD", value: "mg/l", name: "COD" },
    { parameter: "TSS", value: "mg/l", name: "TSS" },
    { parameter: "ORP", value: "mV", name: "ORP" },
    { parameter: "Nitrate", value: "mg/l", name: "nitrate" },
    { parameter: "DO", value: "mg/l", name: "DO" },
    { parameter: "Total Flow", value: "m3/Day", name: "Totalizer_Flow" },
    { parameter: "Chloride", value: "mmol/l", name: "chloride" },
    { parameter: "Colour", value: "color", name: "color" },
    { parameter: "Fluoride", value: "mg/Nm3", name: "Fluoride" },
    { parameter: "Flow", value: "m3/hr", name: "Flow" },
  ];
  // Fetch stack names and filter effluent stationType stacks
  // Fetch stack names and filter effluent stationType stacks
  useEffect(() => {
    console.log("Selected User ID:", userId); // Debugging line

    if (userId) {
      dispatch(fetchUserById(userId));
    }
  }, [userId, dispatch]);

  useEffect(() => {
    console.log("Redux state - selectedUser:", selectedUserState);
    console.log("Redux state - userId:", userId);
  }, [selectedUserState, userId]);

  const fetchEffluentStacks = async (userName) => {
    try {
      const response = await fetch(
        `${API_URL}/api/get-stacknames-by-userName/${userName}`
      );
      const data = await response.json(); // Make sure to parse the JSON
      const effluentStacks = data.stackNames
        .filter((stack) => stack.stationType === "effluent")
        .map((stack) => stack.name); // Use 'name' instead of 'stackName'
      setEffluentStacks(effluentStacks);
    } catch (error) {
      console.error("Error fetching effluent stacks:", error);
    }
  };
  // Fetching data by username
  const fetchData = async (userName) => {
    setLoading(true);
    try {
      // Always fetch the latest data
      const result = await dispatch(
        fetchUserLatestByUserName(userName)
      ).unwrap();

      // Save company info from the first item if exists
      const effluentEntries =
        result.data?.filter((entry) => entry.stationType === "effluent") || [];

      if (effluentEntries.length > 0) {
        setSearchResult(effluentEntries); // Save only effluent entries
        setCompanyName(effluentEntries[0].companyName || "Unknown Company");

        // Collect all stack names from effluent entries
        const allStacks = effluentEntries.flatMap(
          (entry) => entry.stackData || []
        );
        const stackNames = allStacks.map((stack) => stack.stackName);

        setEffluentStacks(stackNames); // Set for dropdown
        setRealTimeData(allStacks); // Set for display
      } else {
        setSearchResult(null);
        setCompanyName("Unknown Company");
        setSearchError("No effluent data found for this user");
      }
    } catch (err) {
      console.error("Error fetching data:", err.message);
      setSearchResult(null);
      setCompanyName("Unknown Company");
      setSearchError(err.message || "No result found for this userID");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoryData = async (fromDate, toDate) => {
    // Logic to fetch history data based on the date range
    console.log("Fetching data from:", fromDate, "to:", toDate);
    // Example API call:
    // const data = await dispatch(fetchHistoryDataByDate({ fromDate, toDate })).unwrap();
  };
  const downloadHistoryData = (fromDate, toDate) => {
    // Logic to download history data based on the date range
    console.log("Downloading data from:", fromDate, "to:", toDate);
    // Example API call:
    // downloadData({ fromDate, toDate });
  };
  useEffect(() => {
    if (userData?.validUserOne?.userType === "user") {
      fetchData(userId); // Fetch data only for the current user if userType is 'user'
    } else if (userId) {
      dispatch(fetchIotDataByUserName(userId)); // For other userTypes, fetch data normally
    }
  }, [userId, dispatch]);
  useEffect(() => {
    if (userId) {
      dispatch(fetchIotDataByUserName(userId));
    }
  }, [userId, dispatch]);
useEffect(() => {
  if (!selectedUserIdFromRedux) return;
  
  setLoading(true);
  const userName = selectedUserIdFromRedux;
  setCurrentUserName(userName);
  sessionStorage.setItem("selectedUserId", userName);
  
  // Reset data while loading
  setRealTimeData({});
  setEffluentStacks([]);
  
  fetchData(userName);
  fetchEffluentStacks(userName);
  dispatch(fetchUserByUserName(userName));
  
}, [selectedUserIdFromRedux, dispatch]);

  // ✅ New useEffect: Fetch address when userId is available
  useEffect(() => {
    if (!userId) {
      console.log("No userId found. Skipping API call.");
      return;
    }

    console.log("Fetching user details for userId:", userId); // Debugging

    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/getauser/${userId}`);
        console.log("API Response:", response.data); // Debug API response
        if (response.data.status === 200) {
          const user = response.data.user;
          setCompanyName(user.companyName || "unknown conpmay");
          setAddress(user.address || "No address available");
          setDistrict(user.district || "Unknown District");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, [userId]); // ✅ Now, it only runs when `userId` is available

  /* useEffect(() => {
    const userName = storedUserId || currentUserName;
    console.log(`username:${userName}`)
    fetchData(userName);
    setCurrentUserName(userName); 
    fetchEffluentStacks(userName);
  }, [searchTerm, currentUserName]);
 */
  /*  useEffect(() => {
    if (searchTerm) {
      fetchData(searchTerm);
      fetchEffluentStacks(searchTerm); 
    } else {
      fetchData(currentUserName);
      fetchEffluentStacks(currentUserName); 
    }
  }, [searchTerm, currentUserName, dispatch]); */
  const fetchFallbackEffluentData = async (userName) => {
    try {
      const res = await axios.get(`${API_URL}/api/latest/${userName}`);
      const allData = res.data?.data || [];

      const effluentOnly = allData
        .filter((entry) => entry.stationType === "effluent")
        .flatMap((entry) => entry.stackData || []);

      const processed = effluentOnly.reduce((acc, item) => {
        if (item.stackName) acc[item.stackName] = item;
        return acc;
      }, {});

      return processed;
    } catch (err) {
      console.error("Error fetching fallback effluent data:", err.message);
      return {};
    }
  };

  const handleStackDataUpdate = async (data) => {
    const userName = selectedUserIdFromRedux || storedUserId || currentUserName;
    console.log(`Real-time data for ${userName}:`, data);

    if (data.userName !== userName) return;

    setExceedanceColor(data.ExceedanceColor || "green");
    setTimeIntervalColor(data.timeIntervalColor || "green");

    if (data?.stackData?.length > 0) {
      const effluentData = data.stackData.filter(
        (item) => item.stationType === "effluent"
      );
      if (effluentData.length > 0) {
        const processedData = effluentData.reduce((acc, item) => {
          if (item.stackName) acc[item.stackName] = item;
          return acc;
        }, {});
        setRealTimeData(processedData);
        return;
      }
    }

    // Fallback to latest API if no real-time data
    console.log("No real-time effluent data. Using fallback...");
    const fallback = await fetchFallbackEffluentData(userName);
    setRealTimeData(fallback);
  };
  useEffect(() => {
    const userName = selectedUserIdFromRedux || storedUserId || currentUserName;
    resetColors();

    fetchData(userName);
    fetchEffluentStacks(userName);

    socket.emit("joinRoom", { userId: userName });
    socket.on("stackDataUpdate", handleStackDataUpdate);

    // ⏳ Fallback to latest API after 5s if no real-time data
    const fallbackTimeout = setTimeout(async () => {
      if (Object.keys(realTimeData).length === 0) {
        console.log("⏳ No real-time update received. Using fallback...");
        const fallback = await fetchFallbackEffluentData(userName);
        setRealTimeData(fallback);
      }
    }, 1000);

    return () => {
      socket.emit("leaveRoom", { userId: userName });
      socket.off("stackDataUpdate", handleStackDataUpdate);
      clearTimeout(fallbackTimeout); // Cleanup fallback timer
    };
  }, [selectedUserIdFromRedux, currentUserName]);

  // Handle card click for displaying graphs
  const handleCardClick = (card, stackName) => {
    const userName = storedUserId || currentUserName; // Ensure the correct username
    setSelectedCard({ ...card, stackName, userName });
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedCard(null);
  };

  const handleOpenCalibrationPopup = () => {
    setShowCalibrationPopup(true);
  };

  const handleCloseCalibrationPopup = () => {
    setShowCalibrationPopup(false);
  };

  // Pagination to handle user navigation
  const handleNextUser = () => {
    const userIdNumber = parseInt(currentUserName.replace(/[^\d]/g, ""), 10);
    if (!isNaN(userIdNumber)) {
      const newUserId = `KSPCB${String(userIdNumber + 1).padStart(3, "0")}`;
      setCurrentUserName(newUserId);
    }
  };

  const handlePrevUser = () => {
    const userIdNumber = parseInt(currentUserName.replace(/[^\d]/g, ""), 10);
    if (!isNaN(userIdNumber) && userIdNumber > 1) {
      const newUserId = `KSPCB${String(userIdNumber - 1).padStart(3, "0")}`;
      setCurrentUserName(newUserId);
    }
  };
  /* graph as pdf  */
  const handleDownloadPdf = () => {
    const input = graphRef.current;

    // Use html2canvas to capture the content of the graph container
    html2canvas(input, {
      backgroundColor: null, // Makes the background transparent
      scale: 2, // Improves resolution (optional)
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("landscape", "mm", "a4");

      // Calculate dimensions based on the graph content
      const imgWidth = 150; // Adjust scaling for better fit
      const imgHeight = (canvas.height / canvas.width) * imgWidth; // Maintain aspect ratio

      // Calculate positions to center the image
      const xOffset = (pdf.internal.pageSize.getWidth() - imgWidth) / 2; // Center horizontally
      const yOffset = (pdf.internal.pageSize.getHeight() - imgHeight) / 2; // Center vertically

      // Add the image to the PDF centered on the page
      pdf.addImage(imgData, "PNG", xOffset, yOffset, imgWidth, imgHeight);
      pdf.save("graph.pdf");
    });
  };

  /* stack */
  const handleStackChange = (event) => {
    setSelectedStack(event.target.value);
  };

  const filteredData =
    selectedStack === "all"
      ? Object.values(realTimeData).length > 0
        ? Object.values(realTimeData)
        : lastEffluentData.stackName
        ? [lastEffluentData]
        : []
      : Object.values(realTimeData).filter(
          (data) => data.stackName === selectedStack
        );

  const confirmCheckOut = async () => {
    try {
      setCheckoutLoading(true);

      // 1) Pick the same "valid user" object you used for check-in:
      //    loggedInUser = userData.validUserOne
      const userRole = loggedInUser?.isTechnician
        ? "technician"
        : loggedInUser?.isTerritorialManager
        ? "territorialManager"
        : loggedInUser?.isOperator
        ? "operator"
        : null;

      if (!userRole || !loggedInUser?.userName) {
        throw new Error("Cannot determine userRole or userName for checkout.");
      }

      // 2) Build payload with loggedInUser.userName (not operator.userName)
      const payload = {
        username: loggedInUser.userName,
        checkOutTime: new Date().toISOString(),
        userRole,
      };

      console.log("🚀 Sending checkout payload:", payload);

      const res = await fetch(`${API_URL}/api/attendance/checkout`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // 3) If non-2xx, print out the server's response text so you can see why it failed
      if (!res.ok) {
        const text = await res.text();
        console.error(
          `❌ Checkout failed (status ${res.status}). Server response:\n`,
          text
        );
        throw new Error(`Server returned ${res.status}`);
      }

      console.log("✅ Checkout succeeded");
      alert("✅ Checked out successfully.");
      setIsCheckedIn(false);
      setAllowClicks(false);
    } catch (err) {
      console.error("🔴 confirmCheckOut Error:", err);
      alert("❌ Checkout failed. See console for details.");
    } finally {
      setCheckoutLoading(false);
      setCheckoutModalOpen(false);
    }
  };

  //browser
  useEffect(() => {
    const preventNavigation = (e) => {
      const isCheckedIn = localStorage.getItem("isCheckedIn") === "true";
      if (!isCheckedIn) {
        alert("❌ You cannot navigate before Check-In!");
        window.history.pushState(null, null, window.location.href); // Force stay at current page
      }
    };

    const handleBeforeUnload = (e) => {
      const isCheckedIn = localStorage.getItem("isCheckedIn") === "true";
      if (!isCheckedIn) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    // When page loads, add pushState so history stack is controlled
    window.history.pushState(null, null, window.location.href);
    window.addEventListener("popstate", preventNavigation); // For back/forward button

    return () => {
      window.removeEventListener("popstate", preventNavigation);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const isSpecialUser = userData?.validUserOne?.isOperator === true;
  /*  userData?.validUserOne?.isTechnician === true ||
    userData?.validUserOne?.isTerritorialManager === true;
 */

  const handleSignOut = async () => {
    console.log("Logout button clicked. Starting signOut process."); // Debugging log

    try {
      // 1. Clear sessionStorage first
      sessionStorage.clear();
      console.log("sessionStorage cleared."); // Debugging log

      // 2. Dispatch Redux logout action
      await dispatch(logoutUser()).unwrap(); // This should handle server-side logout and clear Redux state
      dispatch(setSelectedUser(null)); // Clear the selected user from Redux state

      // 3. Optional: Confirm sessionStorage is empty (for debugging)
      if (sessionStorage.length === 0) {
        console.log("Confirmed: sessionStorage is empty after clearing.");
      } else {
        console.warn("Warning: sessionStorage is NOT empty after clearing.");
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          const value = sessionStorage.getItem(key);
          console.warn(`Remaining sessionStorage item: ${key} = ${value}`);
        }
      }

      // 4. Navigate to the login page
      navigate("/");
      toast.success("Logged out successfully.", { position: "top-center" }); // Add success toast
    } catch (error) {
      console.error("Error during logout process:", error);
      toast.error("Failed to log out. Please try again.", {
        // Add error toast
        position: "top-center",
      });
    }
  };
  const isOperator = userData?.validUserOne?.isOperator === true;
  return (
    <div>
      {/**overlay-block click-new */}
      {isOperator && !isCheckedIn && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.3)",
            zIndex: 10, // Below the buttons but above everything else
            backdropFilter: "blur(2px)",
          }}
        />
      )}
      {/* Show loader while loading */}
      {loading ? (
        <div className="loader-container">
          <div className="dot-spinner">
            <div className="dot-spinner__dot"></div>
            <div className="dot-spinner__dot"></div>
            <div className="dot-spinner__dot"></div>
            <div className="dot-spinner__dot"></div>
            <div className="dot-spinner__dot"></div>
            <div className="dot-spinner__dot"></div>
            <div className="dot-spinner__dot"></div>
            <div className="dot-spinner__dot"></div>
          </div>
        </div>
      ) : (
        <div>
          <div className="container-fluid">
            <div className="row">
              <div className="col-lg-3 d-none d-lg-block ">
                <DashboardSam />
              </div>

              <div className="col-lg-9 col-12 ">
                <div className="row1 ">
                  <div className="col-12  ">
                    <div className="headermain" style={{ zIndex: "10001" }}>
                      <Hedaer />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="container-fluid">
            <div className="row">
              <div className="col-lg-3 d-none d-lg-block"></div>

              <div className="col-lg-9 col-12">
                <div className="row">
                  <div className="col-12"></div>
                </div>
                <div className="maindashboard">
                  <Maindashboard />
                </div>

                <div className="container-fluid water">
                  <div className="row">
                    <div className="col-lg-12 col-12 mt-2">
                      <h5
                        className={`text-center ${
                          userData?.validUserOne?.userType === "user"
                            ? "mt-5"
                            : "mt-3"
                        }`}
                      >
                        <b> EFFLUENT DASHBOARD</b>
                      </h5>
                      {/* operator checkout button */}
                      {isSpecialUser && (
                        <div
                          className="d-flex justify-content-end align-items-center px-3 gap-2"
                          style={{
                            position: "relative",
                            zIndex: 10001 ,// ✅ always above overlay (which is 10)
                            
                          }}
                        >
                          <button
                            onClick={() => {
                              if (!isCheckedIn) {
                                navigate("/geolocation");
                              } else {
                                alert(
                                  "✅ You are already Checked‐In. Please Check‐Out first."
                                );
                              }
                            }}
                            className="btn btn-success mb-3"
                            disabled={isCheckedIn} // Disable once checked in
                          >
                            ✅ Check‐In
                          </button>
                          <button
                            onClick={handleCheckOut}
                            className="btn btn-danger mb-3"
                          >
                            🔁 Check‐Out
                          </button>
                          <button
                            onClick={handleSignOut}
                            className="btn btn-warning mb-3"
                          >
                            ➡️ Logout
                          </button>
                        </div>
                      )}

                      {/* Check if no data is available */}
                      {/* Check if no data is available for stationType == 'effluent' */}
                      {/* Check if effluentStacks are empty */}
                      {effluentStacks.length === 0 && (
                        <div className="text-center mt-3">
                          <h5 className="text-danger">
                            <b>
                              No data available for Effluent/Sewage . Please
                              Check Stack Emission Dashboard .
                            </b>
                          </h5>
                        </div>
                      )}

                      <div className="d-flex justify-content-between">
                        {/* <ul className="quick-links ml-auto ">
                        <button className="btn  mb-2 mt-2 " style={{backgroundColor:'#236a80' , color:'white'}} onClick={() => setShowHistoryModal(true)}>
                          Daily History
                        </button>
                      </ul> */}

                        {/* stac */}
                      </div>
                      <div className="d-flex justify-content-between">
                        {userData?.validUserOne &&
                          userData.validUserOne.userType === "user" && (
                            <ul className="quick-links ml-auto">
                              <button
                                type="submit"
                                onClick={handleOpenCalibrationPopup}
                                className="btn  mb-2 mt-2"
                                style={{
                                  backgroundColor: "#236a80",
                                  color: "white",
                                }}
                              >
                                {" "}
                                Calibration{" "}
                              </button>
                            </ul>
                          )}
                        <ul className="quick-links ml-auto">
                          {userData?.validUserOne &&
                            userData.validUserOne.userType === "user" && (
                              <h5>
                                Data Interval:{" "}
                                <span className="span-class">
                                  {userData.validUserOne.dataInteval}
                                </span>
                              </h5>
                            )}
                        </ul>
                      </div>
                      <div>
                        <div className="row align-items-center">
                          <div className="col-md-4">
                            <ul style={{ listStyleType: "none" }}>
                              <li>
                                {effluentStacks.length > 0 ? (
                                  <div className="stack-dropdown">
                                    <div className="styled-select-wrapper">
                                      <select
                                        id="stackSelect"
                                        className="form-select styled-select"
                                        value={selectedStack}
                                        onChange={handleStackChange}
                                      >
                                        <option value="all">All Stacks</option>
                                        {effluentStacks.map(
                                          (stackName, index) => (
                                            <option
                                              key={index}
                                              value={stackName || "Unknown"}
                                            >
                                              {stackName || "Unknown Station"}
                                            </option>
                                          )
                                        )}
                                      </select>
                                    </div>
                                  </div>
                                ) : (
                                  <h5 className="text-center">
                                    No stations available
                                  </h5>
                                )}
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {loading && (
                        <div className="spinner-container">
                          <Oval
                            height={40}
                            width={40}
                            color="#236A80"
                            ariaLabel="Fetching details"
                            secondaryColor="#e0e0e0"
                            strokeWidth={2}
                            strokeWidthSecondary={2}
                          />
                        </div>
                      )}

                      <div className="col-12  justify-content-center align-items-center">
                        {/* <h3 className="text-center">
  {storedUserId === "HH014" || currentUserName === "HH014"
    ? "Hilton Manyata"
    : ["KSPCB002", "KSPCB005", "KSPCB010", "KSPCB011"].includes(storedUserId) ||
      ["KSPCB002", "KSPCB005", "KSPCB010", "KSPCB011"].includes(currentUserName)
    ? companyName
        .toLowerCase()
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : companyName}
</h3> */}
                        <div className=" justify-content-center">
                          {/* <h6 className="text-center text-secondary">
  <b>Address:</b> {address ? address.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "Not Available"}
</h6>
 */}
                          {/* <h6 className="text-center text-secondary"><b>Location:</b> {district}</h6>
                           */}
                        </div>

                        <div className="color-indicators">
                          <div className="d-flex justify-content-center mt-2">
                            {/* Parameter Exceed Indicator */}
                            {/*  <div className="color-indicator">
      <div
        className="color-circle"
        style={{ backgroundColor: exceedanceColor }}
      ></div>
      <span className="color-label me-2">Parameter Exceed</span>
    </div> */}

                            {/* Data Interval Indicator */}
                            {/*    <div className="color-indicator ml-4">
      <div
        className="color-circle"
        style={{ backgroundColor: timeIntervalColor }}
      ></div>
      <span className="color-label">Data Interval</span>
    </div> */}
                          </div>
                        </div>
                      </div>
                      <div className="row mb-5">
                        <div
                          className="col-md-12 col-lg-12 col-sm-12 border overflow-auto bg-light shadow mb-3"
                          style={{
                            height: "65vh",
                            overflowY: "scroll",
                            borderRadius: "15px",
                          }}
                        >
                          {!loading &&
                          Object.values(realTimeData).length > 0 ? (
                            Object.values(realTimeData).map(
                              (stack, stackIndex) => (
                                <div key={stackIndex} className="col-12 mb-4">
                                  <div className="stack-box">
                                    <h4 className="text-center">
                                      {stack.stackName}{" "}
                                      <img
                                        src={effluent}
                                        alt="energy image"
                                        width="100px"
                                      />
                                    </h4>
                                    <div className="row">
                                      {waterParameters.map((item, index) => {
                                        const value = stack[item.name];
                                        return value && value !== "N/A" ? (
                                          <div
                                            className="col-12 col-md-4 grid-margin"
                                            key={index}
                                          >
                                            <div
                                              className="card mb-3"
                                              style={{
                                                border: "none",
                                                cursor: "pointer",
                                              }} // Added cursor pointer for better UX
                                              onClick={() =>
                                                handleCardClick(
                                                  { title: item.name },
                                                  stack.stackName
                                                )
                                              }
                                              // Trigger handleCardClick on click
                                            >
                                              <div className="card-body">
                                                <h5 className="text-light">
                                                  {item.parameter}
                                                </h5>
                                                <p className="text-light">
                                                  <strong
                                                    className="text-light"
                                                    style={{
                                                      color: "#236A80",
                                                      fontSize: "24px",
                                                    }}
                                                  >
                                                    {parseFloat(value).toFixed(
                                                      2
                                                    )}{" "}
                                                    {/* Changed to limit value to 2 decimal places */}
                                                  </strong>{" "}
                                                  {item.value}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        ) : null;
                                      })}
                                    </div>
                                  </div>
                                </div>
                              )
                            )
                          ) : (
                            <div className="col-12">
                              <h5 className="text-center mt-5">
                                Waiting for real-time data ...
                              </h5>
                            </div>
                          )}
                        </div>

                        <div
                          className="col-md-12 col-lg-12 col-sm-12 mb-2 graphdiv border bg-light shadow"
                          style={{
                            height: "70vh",
                            borderRadius: "15px",
                            position: "relative",
                          }}
                          ref={graphRef}
                        >
                          {selectedCard ? (
                            <WaterGraphPopup
                              parameter={selectedCard.title}
                              userName={selectedCard.userName}
                              stackName={selectedCard.stackName}
                            />
                          ) : (
                            <h5 className="text-center mt-5">
                              Select a parameter to view its graph
                            </h5>
                          )}
                        </div>
                      </div>
                      {showCalibrationPopup && (
                        <CalibrationPopup
                          userName={userData?.validUserOne?.userName}
                          onClose={handleCloseCalibrationPopup}
                        />
                      )}

                      <DailyHistoryModal
                        isOpen={showHistoryModal}
                        onRequestClose={() => setShowHistoryModal(false)}
                      />
                    </div>
                  </div>
                  <div>
                    <CalibrationExceeded />
                  </div>

                  <footer className="footer">
                    <div className="container-fluid clearfix">
                      <span className="text-muted d-block text-center text-sm-left d-sm-inline-block"></span>
                      <span className="float-none float-sm-right d-block mt-1 mt-sm-0 text-center">
                        {" "}
                        Ebhoom Control and Monitor System <br />©{" "}
                        <a href="" target="_blank">
                          Ebhoom Solutions LLP
                        </a>{" "}
                        2023
                      </span>
                    </div>
                  </footer>
                </div>
              </div>
            </div>
            <DailyHistoryModal
              isOpen={showHistoryModal}
              onRequestClose={() => setShowHistoryModal(false)}
              fetchData={fetchHistoryData}
              downloadData={downloadHistoryData}
            />
          </div>
        </div>
      )}
      <Modal
        isOpen={checkoutModalOpen}
        onRequestClose={() => setCheckoutModalOpen(false)}
        className="geo-modal"
        overlayClassName="geo-modal-overlay"
      >
        <h3 className="text-center">
          {userData?.validUserOne?.isOperator === true
            ? "Operator Checkout"
            : /*  : userData?.validUserOne?.isTechnician === true
            ? "Technician Checkout"
            : userData?.validUserOne?.isTerritorialManager === true
            ? "Territorial Manager Checkout" */
              "User Checkout"}
        </h3>

        <p className="text-center mt-3">Are you sure you want to check out?</p>

        <div className="d-flex justify-content-center gap-3 mt-4">
          <button
            onClick={confirmCheckOut}
            className="btn btn-danger"
            disabled={checkoutLoading}
          >
            {checkoutLoading ? "Processing..." : "✅ Yes, Check-Out"}
          </button>
          <button
            onClick={() => setCheckoutModalOpen(false)}
            className="btn btn-secondary"
          >
            ❌ Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Water;
