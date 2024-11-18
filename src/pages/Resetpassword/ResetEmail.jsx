import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendResetLink } from "../../redux/features/auth/resetPasswordEmailSlice";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from '../../assests/images/ebhoom.png';
import { Button } from 'react-bootstrap';

const ResetEmail = () => {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.resetPasswordEmail);

  const [email, setEmail] = useState("");

  const setVal = (e) => {
    setEmail(e.target.value);
  };

  const sendLink = async (e) => {
    e.preventDefault();

    if (email === "") {
      toast.error("Email is required");
    } else if (!email.includes("@")) {
      toast.warning("Include @ in your email");
    } else {
      try {
        await dispatch(sendResetLink(email)).unwrap();
        setEmail("");
        toast.success("Reset Email link sent successfully");
      } catch (error) {
        toast.error("Invalid User");
      }
    }
  };

  return (
    <div className='login-page'>
      <div className='bg-light back rounded position-relative shadow w-100' style={{ maxWidth: '500px', padding: '20px' }}>
        <div className="d-flex align-items-center" style={{ height: "100%" }}>
          <img className='mt-2 ms-2' src={logo} alt="Ebhoom Logo" style={{ height: '30px', width: 'auto', position: 'absolute', top: '10px', left: '10px' }} />

          <div className="row w-100" style={{ paddingTop: "60px" }}>
            <div className="col-12 d-flex justify-content-center align-items-center" style={{ height: "auto" }}>
              <form className='w-100' style={{ maxWidth: '400px' }} onSubmit={sendLink}>
                <p className='me-5'>Enter Email to receive Reset Password link</p>
                <div className='mb-4' style={{ borderRadius: '10px' }}>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Email"
                    autoComplete="email"
                    className='w-100 border border-solid shadow-lg p-3 input-box'
                    value={email}
                    onChange={setVal}
                  />
                </div>
                <div className='mb-4'>
                  <Button style={{ borderRadius: '20px', backgroundColor: '#236a80' }} className='btn w-100' type="submit" disabled={loading}>
                    {loading ? 'Sending...' : 'Submit'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ResetEmail;
