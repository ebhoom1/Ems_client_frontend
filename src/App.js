import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUser } from "./redux/features/user/userSlice";
import { subscribeUser, saveSubscriptionToBackend } from './utils/pushNotifications';
import "./App.css";
import Log from "./pages/Login/Log";
import Dashboard from "./pages/Dashboard/Dashboard";
import Reset from "./pages/Resetpassword/Reset";
import ResetEmail from "./pages/Resetpassword/ResetEmail";
import Maindashboard from "./pages/Maindashboard/Maindashboard";
import Quality from "./pages/Quality/Quality";
import Airambient from "./pages/AirAmbient/Airambient";
import Water from "./pages/Water/Water";
import Noise from "./pages/Noise/Noise";
import Energy from "./pages/Energy/Energy";
import Download from "./pages/Download/Download";
import Report from "./pages/Report/Report";
import Calibrationpage from "./pages/CalibartionPage/Calibrationpage";
import ViewReport from "./pages/Report/ViewReport";
import ViewCalibration from "./pages/CalibartionPage/ViewCalibration";
import Tank from "./pages/Tank/Tank";
import DownloadData from "./pages/Download/DownloadData";
import ManageUser from "./pages/ManageUsers/ManageUser";
import AddParameter from "./pages/ParameterExceed/AddParameter";
import ViewParameter from "./pages/ParameterExceed/ViewParameter";
import Notification from "./pages/Notification/Notification";
import Subscibe from "./pages/Subscribe/Subscibe";
import LiveEmmission from "./pages/LiveEmmission/LiveEmmission";
import UsersLog from "./pages/ManageUsers/Userlog";
import Account from "./pages/Account/Account";
import SupportAnalyser from "./pages/SupportAnalyser/SupportAnalyser";
import Edit from "./pages/ManageUsers/Edit";
import { CalibrationProvider } from "./pages/CalibartionPage/CalibrationContext";
import EditCalibration from "./pages/CalibartionPage/EditCalibration";
import ReportCheck from "./pages/Report/ReportCheck";
import EditReport from "./pages/Report/EditReport";
import CalibrationExceeded from "./pages/CalibartionPage/CalibrationExceeded";
import { UserProvider } from "./pages/ManageUsers/UserContext";
import Viewnotification from "./pages/Notification/Viewnotification";
import { NotificationProvider } from "./pages/Notification/NotificationContext";
import ViewReportUser from "./pages/Report/ViewReportUser";
import EditParameter from "./pages/ParameterExceed/EditParameter";
import PublicLayout from "./pages/PublicLayout/PublicLayout";
import PrivateLayout from "./pages/PrivateLayout/PrivateLayout";
import Hedaer from "./pages/Header/Hedaer";
import Layout from "./pages/Layout/Layout";
import Transcation from "./pages/Transactions/Transcation";
import LoginNew from "./pages/Login/LoginNew";
import Mainsam from "./pages/Maindashboard/Mainsam";
import Chat from "./pages/Chat/Chat";
import LIveLayout from "./pages/LiveMapping/LIveLayout";
import ViewComponent from "./pages/Water/ViewComponent";
import Waste from "./pages/Waste/Waste";
import EnergyDashboard from "./pages/Energy/EnergyLayout";
import FlowLayout from "./pages/QuantityNew/FlowLayout";
import ViewDifference from "./pages/Energy/ViewDifference";
import WaterQualityTable from "./pages/Table/WaterQualityTable";
import UserManual from "./pages/LiveMapping/UserManual";
import ExceedenceReport from "./pages/Report/ExceedenceReport";
import CustomisableReport from "./pages/Report/CustomisableReport";
import ViewExceedenceList from "./pages/ParameterExceed/ViewExceedenceList";
import LogTest from "./pages/Login/LogTest";
import WaterQualityReport from "./pages/Table/WaterQualityReport";
import WaterQualityForm from "./pages/Table/WaterQualityForm";
import ViewCalibrationReport from "./pages/CalibartionPage/ViewCalibrationReport";
import ViewUser from "./pages/ManageUsers/ViewUser";
import Generator from "./pages/Generator/Generator";
import WasteNew from "./pages/Waste/WasteNew";
import Pump from "./pages/Pump/Pump";
import WasteDashboard from "./pages/Waste/WasteDashboard";
import WasteDash from "./pages/Waste/WasteDash";
import ViewDifferenceFlow from "./pages/QuantityNew/ViewDifferenceFlow";
import MonthlyFlowData from "./pages/QuantityNew/MonthlyFlowData";
import WasteHistory from "./pages/Waste/WasteHistory";
import TotalWaste from "./pages/Waste/TotalWaste";
import FuelMain from "./pages/Fuel/FuelMain";
import VehicleHistory from "./pages/Fuel/VehicleHistory";
import PreviousData from "./pages/LiveMapping/PreviousData";
import Inventory from "./pages/Inventory/Inventory";
import Services from "./pages/Inventory/Services";
import SubscriptionPlans from "./pages/Subscribe/SubscriptionPlans";
import PaymentPage from "./pages/Subscribe/PaymentPage";
import MaintenanceForm from "./pages/Inventory/MaintenanceForm";
import ServiceReportForm from "./pages/Inventory/ServiceReportForm";
import ElectricalMaintenance from "./pages/Inventory/ElectricalMaintenance";
import ElectricalReport from "./pages/Inventory/ElectricalReport";
import MechanicalReport from "./pages/Inventory/MechanicalReport";
import ServiceReport from './pages/Inventory/ServiceReportView';
import SafetyReportForm from "./pages/Inventory/SafetyReportForm";
import EngineerVisitReportForm from "./pages/Inventory/EngineerVisitReportForm";
import EngineerVisitReportView from "./pages/Inventory/EngineerVisitReportView";
import SafetyReportView from "./pages/Inventory/SafetyReportView";
import MergedMechanicalReport from "./pages/Inventory/MergedMechanicalReport";
import MergedElectricalReport from "./pages/Inventory/MergedElectricalReport";
import DailyLog from "./pages/Inventory/DailyLog";
import AdminReport from "./pages/Inventory/AdminDailyLog";
import Geolocation from "./pages/Geolocation/Geolocation";
import Attendence from "./pages/Attendence/Attendence";
import { AttendanceHistory } from "./pages/Attendence/AttendenceHistory";
import MapView from "./pages/Attendence/MapView";
import EditEquipment from "./pages/Inventory/EditEquipment";
import Summary from "./pages/QuantityNew/Summary";
import WaterQualitySummary from "./pages/QuantityNew/WaterQualitySummary";
import RealTimeDashboard from "./pages/QuantityNew/RealTimeDashboard";
import DayReport from "./pages/Report/DayReport";
import PreviousQuantity from "./pages/QuantityNew/PreviousQuantity";
import PreviousQuality from "./pages/QuantityNew/PreviousQuality";
import AssignTechnician from "./pages/AssignReports/AssignTechnician";
import AutonerveLayout from "./Autonerve/AutonerveLayout";
import FaultAlertProvider from "./provider/FaultAlertProvider";
import FaultAlert from "./pages/faultalert/FaultAlert";
import TankAlertProvider from "./provider/TankAlertProvider";
import TankAlertBanner from "./Autonerve/TankAlertBanner";
import DieselDashboard from "./pages/GeneratorNew/DieselDashboard";
import { API_URL } from "./utils/apiConfig";
import PreventiveMaintanence from "./Autonerve/PreventiveMaintanence";
import Daigram from "./pages/PandD/Daigram";
import MonthlyPh from "./pages/MonthlyReport/MonthlyPh";
import InletAndOutlet from "./pages/MonthlyReport/InletAndOutlet";
import MonthlyMaintenanceReport from "./pages/MonthlyReport/MonthlyMaintenanceReport";
import TreatedWaterClarityReport from "./pages/MonthlyReport/TreatedWaterClarityReport";
import EquipmentStatusReport from "./pages/MonthlyReport/EquipmentStatusReport";
import ChemicalDetails from "./pages/MonthlyReport/ChemicalDetails";
import ChemicalConsumption from "./pages/MonthlyReport/ChemicalConsumption";
import CriticalSpareAvailability from "./pages/MonthlyReport/CriticalSpareAvailability";
import PowerConsumption from "./pages/MonthlyReport/PowerConsumption";
import { getSocket } from "./Autonerve/socketService";


function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, loading, userType } = useSelector((state) => state.user);
  const backendUrl = API_URL || "http://localhost:5555";
  const publicRoutes = ["/download-data", "/reset-password", "/reset"];

  const isSpecialUser =
    userType === "operator" ||
    userData?.validUserOne?.isTechnician === true ||
    userData?.validUserOne?.isTerritorialManager === true;

  useEffect(() => {
    // Only perform user validation for routes that are not in the publicRoutes array
    if (!publicRoutes.includes(location.pathname)) {
      dispatch(fetchUser())
        .unwrap()
        .then((responseData) => {
          if (responseData.status === 401 || !responseData.validUserOne) {
            console.log("User not Valid");
            navigate("/");
          } else {
            console.log("User verify");
          }
        })
        .catch((error) => {
          console.error("Error Validating User:", error);
          navigate("/");
        });
    }
  }, [dispatch, navigate, location.pathname]);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const userType = localStorage.getItem("userType");
    console.log(userType);

    // Check if user is logged in and not already on the intended route
    if (isLoggedIn && userType && location.pathname === "/") {
      navigate("/water"); // Navigate to '/water' only when the user is on the home route
    } else if (
      !isLoggedIn &&
      !["/", "/reset-password", "/reset"].includes(location.pathname)
    ) {
      navigate("/"); // Redirect to login if not logged in and on a restricted route
    }
  }, [navigate, location.pathname]);


  // Add this to your existing App.js useEffect hooks

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registered successfully:', registration);
        })
        .catch(error => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }, []);

  // Corrected code
  useEffect(() => {
    // Only proceed if we have valid user data
    console.log("Checking userData in useEffect:", userData);
    if (userData?.validUserOne?.userName) {
      if ('Notification' in window) {
        window.Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            console.log('Notification permission granted.');
            // Now we can safely subscribe the user
            subscribeUserAndSave();
          }
        });
      }
    }
  }, [userData]); // This dependency is correct

  // Add this new function
  // Update your App.js subscribeUserAndSave function:

  const subscribeUserAndSave = async () => {
    try {
      const subscription = await subscribeUser();

      if (subscription && userData?.validUserOne?.userName) {
        await saveSubscriptionToBackend(subscription, userData.validUserOne.userName); // ✅ now sends username too
        console.log("Subscription sent to backend ✅");
      }
    } catch (error) {
      console.error("Error subscribing user:", error);
    }
  };

  useEffect(() => {
    const productId = userData?.validUserOne?.productID;
    if (!productId) return;

    const socket = getSocket(backendUrl); // pass backendUrl so getSocket connects to the correct backend
    console.log("[App] socket initialised", socket);

    // join product room so you receive tankAlert for that product
    socket.emit("joinRoom", { product_id: String(productId) });
    console.log("[App] joinRoom sent for product", productId);
  }, [userData]);

  return (
    <div className="App">
      <CalibrationProvider>
        <UserProvider>
          <NotificationProvider>
            <FaultAlertProvider>
              <TankAlertProvider>
                <TankAlertBanner />
                <Routes>
                  <Route path="/" element={<LoginNew />} />
                  <Route path="/login" element={<LogTest />} />
                  <Route path="/reset-password" element={<Reset />} />
                  <Route path="/reset" element={<ResetEmail />} />
                  <Route path="/download-data" element={<Download />}></Route>
                  <Route path="/log" element={<Log />} />
                  <Route path="/diesel" element={<DieselDashboard />} />

                  <Route path="/" element={<LogTest />} />

                  {/* Admin Routes */}

                  {["admin", "super_admin"].includes(userType) && (
                    <Route path="/" element={<PrivateLayout />}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/layout" element={<Layout />} />
                      <Route path="/dashboard-dash" element={<Maindashboard />} />
                      <Route path="/quality" element={<Quality />} />
                      <Route path="/quantity" element={<FlowLayout />} />
                      <Route path="/ambient" element={<Airambient />} />
                      <Route path="/water" element={<Water />} />
                      <Route path="/noise" element={<Noise />} />
                      <Route path="/energy" element={<EnergyDashboard />} />
                      <Route path="/download-data" element={<Download />} />
                      <Route
                        path="/add-calibration"
                        element={<Calibrationpage />}
                      />
                      <Route
                        path="/view-calibration"
                        element={<ViewCalibration />}
                      />
                      <Route
                        path="/edit-calibration/:userName"
                        element={<EditCalibration />}
                      />
                      <Route path="/report" element={<Report />} />
                      <Route path="/view-report" element={<ViewReport />} />
                      <Route path="/tank" element={<Tank />} />
                      <Route path="/download" element={<DownloadData />} />
                      <Route path="/add-parameter" element={<AddParameter />} />
                      <Route path="/view-parameter" element={<ViewParameter />} />
                      <Route path="/notification" element={<Notification />} />
                      <Route path="/subscribe" element={<Subscibe />} />
                      <Route path="/live-emmision" element={<LiveEmmission />} />
                      <Route path="/account" element={<Account />} />
                      <Route
                        path="/support-analyser"
                        element={<SupportAnalyser />}
                      />
                      <Route path="/check-validate" element={<ReportCheck />} />
                      <Route
                        path="/edit-report/:userName"
                        element={<EditReport />}
                      />
                      <Route
                        path="view-report/:userName"
                        element={<ViewReportUser />}
                      />
                      <Route
                        path="/calibration-exceeded"
                        element={<CalibrationExceeded />}
                      />
                      <Route path="/manage-user" element={<UsersLog />} />
                      <Route path="/edit/:userId" element={<Edit />} />
                      <Route path="/view/:userId" element={<ViewUser />} />
                      <Route path="/monthly" element={<MonthlyFlowData />} />
                      <Route path="/totalwaste" element={<TotalWaste />} />
                      <Route
                        path="/view-notification"
                        element={<Viewnotification />}
                      />
                      <Route
                        path="/edit-parameter/:userName"
                        element={<EditParameter />}
                      />
                      <Route path="/sample" element={<Mainsam />} />
                      <Route path="/live-station" element={<LIveLayout />} />
                      <Route path="/chat" element={<Chat />} />
                      <Route path="/view-data" element={<ViewComponent />} />
                      <Route path="/waste" element={<WasteDash />} />
                      <Route path="/waste-dashboard" element={<WasteDashboard />} />
                      <Route path="/waste-dash" element={<WasteDash />} />
                      <Route path="/viewdifference" element={<ViewDifference />} />
                      <Route
                        path="/view-difference"
                        element={<ViewDifferenceFlow />}
                      />
                      <Route
                        path="/waste-history/:userId"
                        element={<WasteHistory />}
                      />
                      <Route path="/table" element={<WaterQualityTable />} />
                      <Route path="/how-to-use" element={<UserManual />} />
                      <Route
                        path="/customisable-report"
                        element={<CustomisableReport />}
                      />
                      <Route
                        path="/exceedence-report"
                        element={<ExceedenceReport />}
                      />
                      <Route
                        path="/view-exceedence-list"
                        element={<ViewExceedenceList />}
                      />
                      <Route
                        path="/water-quality-report"
                        element={<WaterQualityReport />}
                      />
                      <Route path="/water-form" element={<WaterQualityForm />} />
                      <Route
                        path="/view-calibration-report"
                        element={<ViewCalibrationReport />}
                      />
                      <Route path="/generator" element={<Generator />} />
                      <Route path="/pump" element={<Pump />} />
                      <Route path="/fuel" element={<FuelMain />} />
                      <Route path="/vehicle-history" element={<VehicleHistory />} />
                      <Route path="/view-energy" element={<ViewDifference />} />
                      <Route path="/previous-data" element={<PreviousData />} />
                      <Route path="/inventory" element={<Inventory />} />
                      <Route path="/services" element={<Services />} />
                      <Route path="/attendence" element={<Attendence />} />
                      <Route
                        path="/attendence/history"
                        element={<AttendanceHistory />}
                      />
                      <Route path="/view-map" element={<MapView />} />
                      <Route
                        path="/subscription-plans/:userName"
                        element={<SubscriptionPlans />}
                      />
                      <Route path="/payment/:userName" element={<PaymentPage />} />
                      <Route
                        path="/maintenance/:type/:equipmentId"
                        element={<MaintenanceForm />}
                      />
                      <Route
                        path="/maintenance/electrical/:equipmentId"
                        element={
                          <ElectricalMaintenance onClose={() => navigate(-1)} />
                        }
                      />
                      <Route
                        path="/maintenance/service/:userName"
                        element={<ServiceReportForm />}
                      />
                      <Route
                        path="/maintenance/engineer-visit/:user"
                        element={<EngineerVisitReportForm />}
                      />
                      {/* <Route
                      path="/maintenance/safety/:equipmentId"
                      element={<SafetyReportForm />}
                    /> */}
                      <Route
                        path="/maintenance/safety/:user"
                        element={<SafetyReportForm />}
                      />
                      <Route
                        path="/report/electrical/:equipmentId"
                        element={<ElectricalReport />}
                      />
                      <Route
                        path="/report/mechanical/:equipmentId"
                        element={<MechanicalReport />}
                      />
                      <Route

                        path="/report/service/view/:userName/:year/:month"
                        element={<ServiceReport />}
                      />
                      <Route path="/report/engineer/view/:user/:year/:month" element={<EngineerVisitReportView />} />
                      <Route path="/report/safety/view/:user/:year/:month" element={<SafetyReportView />} />

                      <Route
                        path="/report/electrical/download/:userName/:year/:month"
                        element={<MergedElectricalReport />}
                      />
                      <Route
                        path="/mechanical-report/:userName/:year/:month"
                        element={<MergedMechanicalReport />}
                      />
                      <Route path="/dailylog" element={<DailyLog />} />
                      <Route
                        path="/admin/report/:username"
                        element={<AdminReport />}
                      />
                      <Route
                        path="/edit-equipment/:id"
                        element={<EditEquipment />}
                      />
                      <Route path="/summary" element={<Summary />} />
                      <Route
                        path="/summary/waterquality"
                        element={<WaterQualitySummary />}
                      />
                      <Route
                        path="/realtimedashboard"
                        element={<RealTimeDashboard />}
                      />
                      <Route path="/dayreport" element={<DayReport />} />
                      <Route
                        path="/previous-quantity"
                        element={<PreviousQuantity />}
                      />
                      <Route
                        path="/previous-quality"
                        element={<PreviousQuality />}
                      />
                      <Route
                        path="/assign-technician"
                        element={<AssignTechnician />}
                      />
                      <Route path="/diesel" element={<DieselDashboard />} />

                      <Route path="/autonerve" element={<AutonerveLayout />} />
                      <Route path="/preventive-maintanence" element={<PreventiveMaintanence />} />
                      <Route path="/pandd" element={<Daigram />} />
                      <Route path="/monthly-report" element={<MonthlyPh />} />
                      <Route path="/inlet-outlet" element={<InletAndOutlet />} />
                      <Route path="/monthly-maintenance" element={<MonthlyMaintenanceReport />} />
                      <Route path="/monthly-treatedwaterclarity" element={<TreatedWaterClarityReport />} />
                      <Route path="/monthly-equipmentstatus" element={<EquipmentStatusReport />} />
                      <Route path="/chemical-details" element={<ChemicalDetails />} />
                      <Route path="/critical-spare-availability" element={<CriticalSpareAvailability />} />
                      <Route path="/chemical-consumption" element={<ChemicalConsumption />} />
                      <Route path="/power-consumption" element={<PowerConsumption />} />
                    </Route>
                  )}

                  {/* User Routes */}
                  {userType === "user" && (
                    <Route path="/" element={<PrivateLayout />}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/water" element={<Water />} />
                      <Route path="/ambient" element={<Airambient />} />
                      <Route path="/noise" element={<Noise />} />
                      <Route path="/account" element={<Account />} />
                      <Route path="/chat" element={<Chat />} />
                      <Route path="/download" element={<DownloadData />} />
                      <Route path="/how-to-use" element={<UserManual />} />
                      <Route path="/pump" element={<Pump />} />
                      <Route
                        path="/customisable-report"
                        element={<CustomisableReport />}
                      />
                      <Route
                        path="/maintenance/service/:userName"
                        element={<ServiceReportForm />}
                      />
                      <Route

                        path="/report/service/view/:userName/:year/:month"
                        element={<ServiceReport />}
                      />
                      <Route path="/report/safety/view/:user/:year/:month" element={<SafetyReportView />} />
                      <Route
                        path="/maintenance/safety/:user"
                        element={<SafetyReportForm />}
                      />
                      <Route
                        path="/maintenance/engineer-visit/:user"
                        element={<EngineerVisitReportForm />}
                      />
                      <Route path="/report/engineer/view/:user/:year/:month" element={<EngineerVisitReportView />} />
                      <Route
                        path="/report/electrical/download/:userName/:year/:month"
                        element={<MergedElectricalReport />}
                      />
                      <Route
                        path="/mechanical-report/:userName/:year/:month"
                        element={<MergedMechanicalReport />}
                      />

                      <Route path="/autonerve" element={<AutonerveLayout />} />
                      <Route path="/transactions" element={<Transcation />} />{" "}
                      {/* Assuming transaction-related routes */}
                      <Route path="/view-report" element={<ViewReport />} />
                      <Route
                        path="/edit-report/:userName"
                        element={<EditReport />}
                      />
                      <Route path="/download-IoT-Data" element={<DownloadData />} />
                      <Route path="/quantity" element={<FlowLayout />} />
                      <Route path="/energy" element={<EnergyDashboard />} />
                      <Route
                        path="/support-analyser"
                        element={<SupportAnalyser />}
                      />
                      <Route
                        path="/view-report/:userName"
                        element={<ViewReportUser />}
                      />
                      <Route path="/waste" element={<WasteDash />} />
                      <Route
                        path="/exceedence-report"
                        element={<ExceedenceReport />}
                      />
                      <Route path="/live-station" element={<LIveLayout />} />
                      <Route path="/view-data" element={<ViewComponent />} />
                      <Route path="/table" element={<WaterQualityTable />} />
                      <Route
                        path="/view-calibration-report"
                        element={<ViewCalibrationReport />}
                      />
                      <Route path="/generator" element={<Generator />} />
                      <Route path="/live-emmision" element={<LiveEmmission />} />
                      <Route
                        path="/waste-history/:userId"
                        element={<WasteHistory />}
                      />
                      <Route
                        path="/view-difference"
                        element={<ViewDifferenceFlow />}
                      />
                      <Route path="/view-energy" element={<ViewDifference />} />
                      <Route path="/previous-data" element={<PreviousData />} />
                      <Route path="/inventory" element={<Inventory />} />
                      <Route path="/services" element={<Services />} />
                      <Route
                        path="/subscription-plans/:userName"
                        element={<SubscriptionPlans />}
                      />
                      <Route path="/payment/:userName" element={<PaymentPage />} />
                      <Route
                        path="/maintenance/:type/:equipmentId"
                        element={<MaintenanceForm />}
                      />
                      <Route
                        path="/maintenance/electrical/:equipmentId"
                        element={<ElectricalMaintenance />}
                      />
                      <Route
                        path="/report/electrical/download/:year?/:month?"
                        element={<MergedElectricalReport />}
                      />
                      {/*    <Route
                    path="/report/mechanical/download/:year?/:month?"
                    element={<MergedMechanicalReport />}
                  /> */}
                      <Route path="/dailylogs" element={<DailyLog />} />
                      <Route path="/geolocation" element={<Geolocation />} />
                      <Route path="/summary" element={<Summary />} />
                      <Route
                        path="/summary/waterquality"
                        element={<WaterQualitySummary />}
                      />
                      <Route
                        path="/realtimedashboard"
                        element={<RealTimeDashboard />}
                      />
                      <Route path="/dayreport" element={<DayReport />} />
                      <Route
                        path="/previous-quantity"
                        element={<PreviousQuantity />}
                      />
                      <Route
                        path="/previous-quality"
                        element={<PreviousQuality />}
                      />
                      <Route path="/preventive-maintanence" element={<PreventiveMaintanence />} />
                      <Route path="/pandd" element={<Daigram />} />
                      <Route path="/inlet-outlet" element={<InletAndOutlet />} />

                    </Route>

                  )}

                  {userType === "operator" && (
                    <Route path="/" element={<PrivateLayout />}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/water" element={<Water />} />
                      <Route path="/ambient" element={<Airambient />} />
                      <Route path="/noise" element={<Noise />} />
                      <Route path="/account" element={<Account />} />
                      <Route path="/download" element={<DownloadData />} />
                      <Route path="/how-to-use" element={<UserManual />} />
                      <Route path="/autonerve" element={<AutonerveLayout />} />
                      {/* Assuming transaction-related routes */}
                      <Route
                        path="/edit-report/:userName"
                        element={<EditReport />}
                      />
                      <Route path="/download-IoT-Data" element={<DownloadData />} />
                      <Route path="/quantity" element={<FlowLayout />} />
                      <Route path="/energy" element={<EnergyDashboard />} />
                      <Route
                        path="/view-report/:userName"
                        element={<ViewReportUser />}
                      />
                      <Route path="/waste" element={<WasteDash />} />
                      <Route
                        path="/exceedence-report"
                        element={<ExceedenceReport />}
                      />
                      <Route path="/live-station" element={<LIveLayout />} />
                      <Route path="/view-data" element={<ViewComponent />} />
                      <Route path="/table" element={<WaterQualityTable />} />
                      <Route
                        path="/view-calibration-report"
                        element={<ViewCalibrationReport />}
                      />
                      <Route path="/generator" element={<Generator />} />
                      <Route path="/live-emmision" element={<LiveEmmission />} />
                      <Route
                        path="/waste-history/:userId"
                        element={<WasteHistory />}
                      />
                      <Route
                        path="/view-difference"
                        element={<ViewDifferenceFlow />}
                      />
                      <Route path="/view-energy" element={<ViewDifference />} />
                      <Route path="/previous-data" element={<PreviousData />} />
                      <Route path="/inventory" element={<Inventory />} />
                      <Route path="/services" element={<Services />} />
                      <Route
                        path="/subscription-plans/:userName"
                        element={<SubscriptionPlans />}
                      />
                      <Route path="/payment/:userName" element={<PaymentPage />} />
                      <Route
                        path="/maintenance/:type/:equipmentId"
                        element={<MaintenanceForm />}
                      />
                      <Route
                        path="/maintenance/electrical/:equipmentId"
                        element={<ElectricalMaintenance />}
                      />
                      <Route
                        path="/report/electrical/download/:year?/:month?"
                        element={<MergedElectricalReport />}
                      />
                      {/*                                   <Route path="/report/mechanical/download/:year?/:month?" element={<MergedMechanicalReport />} />
                   */}{" "}
                      <Route path="/dailylogs" element={<DailyLog />} />
                      <Route path="/geolocation" element={<Geolocation />} />
                      <Route path="/summary" element={<Summary />} />
                      <Route path="/preventive-maintanence" element={<PreventiveMaintanence />} />
                      <Route path="/monthly-report" element={<MonthlyPh />} />
                      <Route path="/inlet-outlet" element={<InletAndOutlet />} />

                    </Route>
                  )}

                  {isSpecialUser && (
                    <Route path="/geolocation" element={<Geolocation />} />
                  )}
                </Routes>
                <FaultAlert />
              </TankAlertProvider>
            </FaultAlertProvider>
          </NotificationProvider>
        </UserProvider>
      </CalibrationProvider>
    </div>
  );
}

export default App;
/* okay */