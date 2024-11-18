import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { validateUser, resetPassword, clearState } from '../../redux/features/auth/resetPassowordSlice';
import 'react-toastify/dist/ReactToastify.css';
import logo from '../../assests/images/ebhoom.png';
import { Button } from 'react-bootstrap';

const Reset = () => {
  const { id, token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.resetPassword);

  const [password, setPassword] = useState("");
  const [cpassword, setConfirmPassword] = useState("");

  useEffect(() => {
    dispatch(validateUser({ id, token }))
      .unwrap()
      .catch(() => {
        navigate('/');
      });
    return () => {
      dispatch(clearState());
    };
  }, [dispatch, id, token, navigate]);

  const setVal = (e) => {
    const { name, value } = e.target;
    if (name === "password") {
      setPassword(value);
    } else if (name === "cpassword") {
      setConfirmPassword(value);
    }
  };

  const sendPassword = async (e) => {
    e.preventDefault();
    if (password === "") {
      toast.error("Password is required");
    } else if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
    } else if (password !== cpassword) {
      toast.error("Password and Confirm Password do not match");
    } else {
      try {
        await dispatch(resetPassword({ id, token, password, cpassword })).unwrap();
        toast.success("Password changed successfully");
        setPassword('');
        setConfirmPassword('');
        navigate('/');
      } catch (error) {
        toast.error(error.message || "Token expired. Generate a new link");
      }
    }
  };

  return (
    <div className='login-page'>
      <div className='bg-light back rounded position-relative shadow w-100' style={{ maxWidth: '500px', padding: '20px' }}>
        <div className="d-flex align-items-center" style={{ height: "100%" }}>
          <img className='mt-2 ms-2' src={logo} alt="Ebhoom Logo" style={{ height: '30px', width: 'auto', position: 'absolute', top: '10px', left: '10px' }} />

          <div className="row w-100" style={{ paddingTop: "60px" }}>
            <h6 style={{ color: '#236a80' }}>RESET YOUR PASSWORD</h6>
            <div className="col-12 d-flex justify-content-center align-items-center" style={{ height: "auto" }}>
              <form className='w-100' style={{ maxWidth: '400px' }} onSubmit={sendPassword}>
                <div className='mb-4' style={{ borderRadius: '10px' }}>
                  <input
                    type='password'
                    name="password"
                    id="password"
                    placeholder="Enter Your password"
                    autoComplete="current-password"
                    className='w-100 border border-solid shadow-lg p-3 input-box'
                    value={password}
                    onChange={setVal}
                  />
                </div>
                <div className='mb-4' style={{ borderRadius: '10px' }}>
                  <input
                    type='password'
                    name="cpassword"
                    id="cpassword"
                    placeholder="Confirm Password"
                    autoComplete="current-password"
                    className='w-100 border border-solid shadow-lg p-3 input-box'
                    value={cpassword}
                    onChange={setVal}
                  />
                </div>
                <div className='mb-4'>
                  <Button style={{ borderRadius: '20px', backgroundColor: '#236a80' }} className='btn  w-100' type="submit" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit'}
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

export default Reset;
