import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, setFilteredUsers } from "../../redux/features/userLog/userLogSlice";
import { useNavigate } from "react-router-dom";
import DashboardSam from "../Dashboard/DashboardSam";
import Maindashboard from "../Maindashboard/Maindashboard";

const Dashboard = () => {

  const industryType = [
      { category: "Sugar" },
      { category: "Cement" },
      { category: "Distillery" },
      { category: "Petrochemical" },
      { category: "Pulp & Paper" },
      { category: "Fertilizer" },
      { category: "Tannery" },
      { category: "Pesticides" },
      { category: "Thermal Power Station" },
      { category: "Caustic Soda" },
      { category: "Pharmaceuticals" },
      { category: "Chemical" },
      { category: "Dye and Dye Stuff" },
      { category: "Refinery" },
      { category: "Copper Smelter" },
      { category: "Iron and Steel" },
      { category: "Zinc Smelter" },
      { category: "Aluminium" },
      { category: "STP/ETP" },
      { category: "NWMS/SWMS" },
      { category: "Noise" },
      { category: "Chemical" },
      { category: "Other" },
  ];
  const handleEdit=()=>{
      navigate('/edit')
  }
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users, filteredUsers, loading, error } = useSelector((state) => state.userLog);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = users.filter(user => user.userName.toLowerCase().includes(query));
    dispatch(setFilteredUsers(filtered));
  };

  const handleUserClick = (userName) => {
    navigate('/ambient-air', { state: { userName } });
  };
  

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar (hidden on mobile) */}
        <div className="col-lg-3 d-none d-lg-block">
          <DashboardSam />
        </div>
        {/* Main content */}
        <div className="col-lg-9 col-12">
          <div className="row">
            <div className="col-12">
              <Maindashboard />
            </div>
          </div>
         
         
         
          <div className="row"/*  style={{overflowX:'hidden'}} */>
        
           
        </div>

        <div className="row" /* style={{overflowX:'hidden'}} */>
         

           
        </div>

        
        </div>
      </div>
      
    </div>
  );
};

export default Dashboard;
