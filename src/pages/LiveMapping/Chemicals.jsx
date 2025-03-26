import React, { useState, useEffect } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { API_URL } from '../../utils/apiConfig';
function Chemicals() {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);

  // Determine logged-in user type; default to "user"
  const userType = userData?.validUserOne?.userType || '';
console.log(userType);

  const [users, setUsers] = useState([]);
  const [selectedChemical, setSelectedChemical] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [quantity, setQuantity] = useState('');
  const [addedChemicals, setAddedChemicals] = useState([]);

  // Fetch users based on admin type or fetch all users if adminType is not provided
  const fetchUsers = async () => {
    try {
      if (userData?.validUserOne) {
        let response;
        if (userData.validUserOne.adminType) {
          response = await axios.get(`${API_URL}/api/get-users-by-adminType/${userData.validUserOne.adminType}`);
        } else {
          response = await axios.get(`${API_URL}/api/getallusers`);
        }
        const filteredUsers = response.data.users.filter((user) => user.userType === "user");
        setUsers(filteredUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // For demonstration, if the logged-in user is admin, set sample chemicals data
  useEffect(() => {
    if (userType === 'admin') {
      setAddedChemicals([
        { id: 1, chemical: "Chlorine", user: "user1", quantity: 10 },
        { id: 2, chemical: "Sulfuric Acid", user: "user2", quantity: 5 },
        { id: 3, chemical: "Ammonia", user: "user3", quantity: 8 },
      ]);
    }
  }, [userType]);

  const handleAdd = (e) => {
    e.preventDefault();
    console.log("Selected Chemical:", selectedChemical);
    console.log("Selected User:", selectedUser);
    console.log("Quantity:", quantity);
    // Simulate adding the chemical by updating the addedChemicals state
    const newChemical = {
      id: addedChemicals.length + 1,
      chemical: selectedChemical,
      user: selectedUser,
      quantity: quantity,
    };
    setAddedChemicals(prev => [...prev, newChemical]);
    // Clear the form fields after submission
    setSelectedChemical('');
    setSelectedUser('');
    setQuantity('');
  };

  // If the user is an admin, show the added chemicals list
  if (userType === 'admin') {
    return (
      <div className="col-12">
        <h1 className="text-center mt-3">Added Chemicals List</h1>
        <div className="card">
          <div className="card-body">
            {addedChemicals.length > 0 ? (
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Chemical</th>
                    <th>User</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {addedChemicals.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.chemical}</td>
                      <td>{item.user}</td>
                      <td>{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No chemicals added yet.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, if the user is a regular user, show the add chemicals form
  return (
    <div className="col-12">
      <h1 className="text-center mt-3">Add Chemicals</h1>
      <div className="card">
        <div className="card-body">
          <form className="m-2 p-5" onSubmit={handleAdd}>
            <div className="row">
              {/* Chemical Select Box */}
              <div className="col-lg-6 col-md-6 mb-4">
                <div className="form-group">
                  <label htmlFor="chemicalSelect" className="form-label text-light">
                    Chemical
                  </label>
                  <select
                    id="chemicalSelect"
                    value={selectedChemical}
                    onChange={(e) => setSelectedChemical(e.target.value)}
                    className="form-control"
                    style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
                  >
                    <option value="">--Select a Chemical--</option>
                    <option value="chlorine">Chlorine</option>
                    <option value="sulfuric acid">Sulfuric Acid</option>
                    <option value="ammonia">Ammonia</option>
                    {/* Add additional chemicals as needed */}
                  </select>
                </div>
              </div>
              {/* User Select Box */}
              <div className="col-lg-6 col-md-6 mb-4">
                <div className="form-group">
                  <label htmlFor="userSelect" className="form-label text-light">
                    User
                  </label>
                  <select
                    id="userSelect"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="form-control"
                    style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
                  >
                    <option value="">Select UserName</option>
                    {users.map((user) => (
                      <option key={user._id} value={user.username}>
                        {user.username}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="row">
              {/* Quantity Input */}
              <div className="col-lg-6 col-md-6 mb-4">
                <div className="form-group">
                  <label htmlFor="quantity" className="form-label text-light">
                    Quantity
                  </label>
                  <input
                    id="quantity"
                    type="number"
                    placeholder="Quantity"
                    name="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="form-control"
                    style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
                    min="0"
                  />
                </div>
              </div>
            </div>
            <button type="submit" className="btn" style={{ backgroundColor: "#236a80", color: "white" }}>
              Add <FaArrowRight style={{ marginLeft: '5px' }} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chemicals;
