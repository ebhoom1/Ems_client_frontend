import { Row, Button } from 'react-bootstrap';
import './login.css';
import { Link } from 'react-router-dom';
import logo from '../../assests/images/ebhoom.png';
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Modal from "react-modal";
import "react-toastify/dist/ReactToastify.css";
import { loginUser } from "../../redux/features/auth/authSlice";
import loginbanner from '../../assests/images/logimage.png'

function Log() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [passShow, setPassShow] = useState(false);
  const [inpval, setInpval] = useState({
    email: "",
    password: "",
    userType: "select",
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const { loading, error } = useSelector((state) => state.auth);

  Modal.setAppElement('#root');

  const setVal = (e) => {
    const { name, value } = e.target;
    setInpval((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSelectChange = (e) => {
    const { value } = e.target;
    setInpval((prevState) => ({
      ...prevState,
      userType: value,
    }));
  };

  const loginuser = async (e) => {
    e.preventDefault();
    const { email, password, userType } = inpval;

    if (email === "") {
      toast.error("Email is required!");
      return;
    } else if (!email.includes("@")) {
      toast.warning("Please include '@' in your email!");
      return;
    } else if (userType === "select") {
      toast.error("Please select the user type");
      return;
    } else if (password === "") {
      toast.error("Password is required!");
      return;
    } else if (password.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return;
    } else {
      dispatch(loginUser({ email, password, userType }))
        .unwrap()
        .then((result) => {
          const now = new Date();
          const endSubscriptionDate = new Date(result.endSubscriptionDate);

          if (userType !== result.userType) {
            toast.error("User type does not match!");
          } else if (now.toDateString() === endSubscriptionDate.toDateString()) {
            setSelectedUser(result);
            setModalIsOpen(true);
          } else {
            if (userType === 'admin') {
              navigate('/water');
            } else if (userType === 'user') {
              navigate('/account');
            }
            setInpval({ email: '', password: '', userType: 'select' });
          }
        })
        .catch((error) => {
          toast.error('Invalid credentials');
          console.log("Error from catch signIn:", error);
          localStorage.removeItem('userdatatoken');
        });
    }
  }; 

  const handleDownloadClick = () => {
    navigate('/download-data');  // Redirect to the download-data page
  };

  return (
    <div className='login-page d-flex justify-content-center '>
      {/*  <div className='bg-light back rounded  shadow ' style={{ maxWidth: '250px', padding: '20px' }}>
        <img src={loginbanner} alt=""  width={'200px'} height={'100vh'}/>
       </div> */}
      <div className='bg-light  rounded  shadow w-100' style={{ maxWidth: '500px', padding: '20px' }}>
        <div className="d-flex align-items-center justify-content-between w-100 flex-nowrap" style={{ paddingTop: "10px" }}>
          <img className='ms-2' src={logo} alt="Logo" style={{ height: '30px', width: 'auto' }} />
          <div className='me-2'>
            <Button className='btn' onClick={handleDownloadClick} style={{ backgroundColor: '#236a80', border: 'none', whiteSpace: 'nowrap' }}>Download data</Button>
          </div>
        </div>
  
        <div className="row w-100" style={{ paddingTop: "40px" }}>
          <div className="col d-flex justify-content-center align-items-center" style={{ height: "auto" }}>
            <form className='w-100' style={{ maxWidth: '400px' }}>
              <div className='mb-4' style={{ borderRadius: '10px' }}>
                <input
                  type="email"
                  value={inpval.email}
                  onChange={setVal} 
                  name="email"
                  id="email"
                  placeholder="Email"
                  autoComplete="email"
                  className='w-100 border border-solid shadow-lg p-3 input-box'
                />
              </div>
              <div className='mb-4' style={{ borderRadius: '10px' }}>
                <input
                  type={passShow ? "text" : "password"} 
                  onChange={setVal}
                  value={inpval.password} 
                  name="password"
                  id="password"
                  placeholder="Enter Your password"
                  autoComplete="current-password"
                  className='w-100 border border-solid shadow-lg p-3 input-box'
                />
              </div>
              <div className='d-flex justify-content-between mb-2'>
                <div className="showpass" onClick={() => setPassShow(!passShow)}>
                  {passShow ? "Hide" : "Show"}
                </div>
                <Link to={'/reset'} style={{ textDecoration: 'none' }}>Forgot Password</Link>
              </div>
              <select className="input-field mb-4 w-100 border border-solid shadow-lg p-3 input-box"
                value={inpval.userType}
                onChange={handleSelectChange} >
                <option value="select">Select</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
              <div className='mb-4'>
                <Button style={{ borderRadius: '20px', backgroundColor: '#236a80' , border:'none' }} className='btn w-100'
                  onClick={loginuser}
                  disabled={loading} >
                  Login
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
     
      <ToastContainer />
    </div>
  );
}

export default Log;
