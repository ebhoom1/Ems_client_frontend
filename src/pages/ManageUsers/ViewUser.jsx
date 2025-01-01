import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserById } from '../../redux/features/userLog/userLogSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function ViewUser() {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const { selectedUser, loading, error } = useSelector((state) => state.userLog);
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserById(userId));
    }
  }, [dispatch, userId]);

  const fieldMapping = {
    companyName: 'Company Name ',
    fname: 'First Name ',
    lname: 'Last Name ',
    email: 'Email Address ',
    phone: 'Phone Number ',
    stackName: 'Skills/Stacks ',
    userName:' Username ',
    modelName:'Model Name ',
    mobileNumber:'Mobile Number ',
    subscriptionDate:'Created Date ',
    userType:'User Type ',
    industryType:'Industry Type ',
    industryPollutionCategory :'Industry Pollution Category ',
    dataInteval:'Data interval ',
    district:'District ',
    state:'State ',
    address:'Address ',
    latitude:'Latitude ',
    longitude:'Longitude ',
    productID:'Product ID ',
    adminType :'Admin Type ',

  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (selectedUser) {
      const filteredData = Object.entries(selectedUser)
        .filter(([key]) => !['_id', 'cpassword', 'password', 'tokens', '__v','stackName','endSubscriptionDate', 'subscriptionActive','iotLastEnterDate', 'timestamp'].includes(key))
        .map(([key, value]) => [fieldMapping[key] || key, value]);

      const doc = new jsPDF();
      doc.text('User Details', 14, 20);
      doc.autoTable({
        startY: 30,
        head: [['Field', 'Value']],
        body: filteredData.map(([key, value]) => [
          key,
          key === 'Skills/Stacks'
            ? value.map((stack) => stack.name).join(', ')
            : value,
        ]),
      });
      doc.save('User_Details.pdf');
    } else {
      toast.error('No user data available to download!');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!selectedUser) {
    return <div>No user details available.</div>;
  }

  const filteredUser = Object.entries(selectedUser)
    .filter(([key]) => !['_id', 'cpassword', 'password', 'tokens', '__v','stackName','endSubscriptionDate', 'subscriptionActive','iotLastEnterDate', 'timestamp'].includes(key))
    .map(([key, value]) => [fieldMapping[key] || key, value]);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <h1 className="text-center mt-5">View User Details</h1>
        </div>
        <div className="col-12 mt-4">
          <div className="card">
            <div className="card-body">
              <ul className="list-group">
                {filteredUser.map(([key, value]) => (
                  <li
                    key={key}
                    className="list-group-item d-flex justify-content-start align-items-center"
                  >
                    <strong>{key}:</strong>
                    <span>
                      {key === 'Skills/Stacks'
                        ? value.map((stack) => stack.name).join(', ')
                        : typeof value === 'object'
                        ? JSON.stringify(value)
                        : value || 'N/A'}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 d-flex justify-content-end">
                <button className="btn btn-primary me-2" onClick={handlePrint}>
                  Print
                </button>
                <button className="btn btn-success" onClick={handleDownloadPDF}>
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default ViewUser;
