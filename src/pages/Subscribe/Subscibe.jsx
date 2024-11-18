import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import Modal from 'react-modal';
import { fetchUsers, fetchUserByUserName } from '../../redux/features/userLog/userLogSlice';
import axios from 'axios';
import { API_URL } from '../../utils/apiConfig';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import DashboardSam from '../Dashboard/DashboardSam';
import Hedaer from '../Header/Hedaer';
import HeaderSim from '../Header/HeaderSim';

Modal.setAppElement('#root'); // Bind modal to your appElement for accessibility

const Subscibe = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.userLog);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      dispatch(fetchUserByUserName(searchQuery.trim()))
        .then((response) => {
          console.log("Search response:", response);
        })
        .catch((err) => {
          console.error("Error fetching user by username:", err);
        });
    } else {
      dispatch(fetchUsers());
    }
  };

  const calculatePrice = (user) => {
    if (!user) return 0;
    let fee = 0;
    if (user.modelName === 'venus') {
      fee = 15000;
    } else if (user.modelName === 'mars') {
      fee = 25000;
    }
    return fee;
  };

  const openModal = (user) => {
    setSelectedUser(user);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedUser(null);
  };

  const handlePayment = async () => {
    if (!selectedUser) return;

    try {
      const response = await axios.post(`${API_URL}/api/create-order`, {
        userName: selectedUser.userName,
        amount: calculatePrice(selectedUser),
      });

      const { order } = response.data;
      const options = {
        key: "rzp_test_b2b3Y59oVOxWMb",
        amount: order.amount,
        currency: order.currency,
        name: "AquaBox Control and Monitor System",
        description: "Subscription Payment",
        order_id: order.id,
        handler: async (response) => {
          try {
            const verifyResponse = await axios.post(`${API_URL}/api/verify-payment`, {
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userName: selectedUser.userName,
              modelName: selectedUser.modelName,
              amount: order.amount,
            });

            if (verifyResponse.data.success) {
              toast.success("Payment Successful and Subscription Updated!");
              closeModal();
            } else {
              toast.error("Payment Verification Failed!");
            }
          } catch (error) {
            toast.error("Error verifying payment!");
            console.error("Error verifying payment:", error);
          }
        },
        prefill: {
          name: selectedUser.fname,
          email: selectedUser.email,
          contact: selectedUser.mobileNumber,
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error("Error creating order!");
      console.error("Error creating order:", error);
    }
  };

  return (
    <div className="container-fluid mb-5">
      <div className="row">
        {/* Sidebar */}
        <div className="col-lg-3 d-none d-lg-block">
          <DashboardSam />
        </div>
        
        {/* Main content */}
        <div className="col-lg-9 col-12">
          <div className="row">
            <div className="col-12">
              <HeaderSim />
            </div>
          </div>

          <div className='d-flex align-items-between justify-content-between m-3 mt-5' style={{fontSize:'20px'}}>
            <div><b>SUBSCRIPTION DATA</b></div>
            <div><Link to="/transactions"><b>TRANSACTIONS</b></Link></div>
          </div>

          <div className="row">
            <div className="col-12 col-md-12 grid-margin">
              <div className="col-12 d-flex justify-content-between align-items-center m-3">
                <h3 className='text-center mt-3'>Subscription Details of Users</h3>
              </div>

              <div className="card last-trips-card mt-2" style={{ overflowX: 'scroll' }}>
                <div className="card-header p-3 pt-4 d-flex align-items-center search-container m-3">
                  <form className="form-inline my-2 my-lg-0" onSubmit={handleSearch}>
                    <input
                      type="search"
                      placeholder="username"
                      className="p-2 search-input"
                      style={{ borderRadius: '10px' }}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className='btn btn-outline-primary ms-1 search-button'>Search</button>
                  </form>
                </div>

                <div className="card-body">
                  <table className="table table-borderless">
                    <thead className="m-5">
                      <tr>
                        <th>Sl No</th>
                        <th>User ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Mobile Number</th>
                        <th>Model Name</th>
                        <th>Date</th>
                        <th>Subscription End Date</th>
                        <th>Pay</th>
                      </tr>
                    </thead>
                    <tbody className="m-5">
                      {loading ? (
                        <tr><td colSpan="9">Loading...</td></tr>
                      ) : error ? (
                        <tr><td colSpan="9">Error: {error}</td></tr>
                      ) : (
                        users.map((user, index) => (
                          <tr key={user._id}>
                            <td>{index + 1}</td>
                            <td>{user.userName}</td>
                            <td>{user.fname}</td>
                            <td>{user.email}</td>
                            <td>{user.mobileNumber}</td>
                            <td>{user.modelName}</td>
                            <td>{user.subscriptionDate}</td>
                            <td>{user.endSubscriptionDate}</td>
                            <td>
                              <button className="btn btn-info" onClick={() => openModal(user)}>Pay</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Payment Modal"
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          },
        }}
      >
        {selectedUser && (
          <div>
            <h2><i className="bi bi-currency-rupee"></i></h2>
            <h4>User Name: {selectedUser.userName}</h4>
            <h4>Model Name: {selectedUser.modelName}</h4>
            <h5>Price: <i className="bi bi-currency-rupee"></i> {calculatePrice(selectedUser)}</h5>
            <button
              type="button"
              className="btn btn-primary mt-2"
              onClick={handlePayment}
            >
              Pay
            </button>
          </div>
        )}
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default Subscibe;
