import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../utils/apiConfig';
import { useDispatch, useSelector } from 'react-redux';
import { useOutletContext } from 'react-router-dom';

const CalibrationExceeded = () => {
  // Get userId from Redux (selectedUser)
  const { userId } = useSelector((state) => state.selectedUser); 
  const { searchTerm } = useOutletContext() || {};

  const [userType, setUserType] = useState('');
  const [entries, setEntries] = useState([]);
  const [currentEntryId, setCurrentEntryId] = useState(null);
  const [currentComment, setCurrentComment] = useState('');
  const [isEditingAdminComment, setIsEditingAdminComment] = useState(false);
  const [currentUserName, setCurrentUserName] = useState("KSPCB001");
  const selectedUserIdFromRedux = useSelector((state) => state.selectedUser.userId);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Function to fetch data based on userId
  const fetchData = async (userName) => {
    try {
      const token = localStorage.getItem("userdatatoken");
      const userResponse = await axios.get(`${API_URL}/api/validuser`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        }
      });
      const userData = userResponse.data;

      if (userData.status === 401 || !userData.validUserOne) {
        navigate('/');
      } else {
        setUserType(userData.validUserOne.userType);

        // Construct the API URL based on whether the user is admin or not
        const apiUrl = userData.validUserOne.userType === 'admin'
          ? `${API_URL}/api/get-user-exceed-data/${userName}`
          : `${API_URL}/api/get-user-exceed-data/${userData.validUserOne.userName}`;

        // Log the constructed apiUrl and check it
        console.log("API URL:", apiUrl);

        // Fetch the data from the API
        const commentsResponse = await axios.get(apiUrl);

        // Log the full API response to inspect the data
        console.log("API Response:", commentsResponse.data);

        // If the response contains data, set it to entries state
        if (commentsResponse.data && commentsResponse.data.userExceedData) {
          setEntries(commentsResponse.data.userExceedData);
        } else {
          setEntries([]); // If no data is returned, set entries to an empty array
        }
      }
    } catch (error) {
      console.error("Error Validating user or fetching comments:", error);
      navigate('/');
    }
  };
  useEffect(() => {
    // Check sessionStorage for stored selectedUserId
    const storedUserId = sessionStorage.getItem('selectedUserId');

    // Fetch data if storedUserId is present, otherwise use current state or searchTerm
    const userName = searchTerm || storedUserId || selectedUserIdFromRedux || currentUserName;
    
    // Trigger data fetch with the correct userName
    fetchData(userName);

    if (storedUserId) {
      setCurrentUserName(storedUserId);  // Set to the retrieved userId
    }
  }, [selectedUserIdFromRedux, searchTerm, currentUserName, dispatch]);
  // Fetch data when the component mounts and when userId or currentUserName changes
  useEffect(() => {
    if (userId) {
      fetchData(userId);  // Fetch data using Redux-selected userId
    } else {
      fetchData(currentUserName);  // Use default currentUserName if no userId is selected
    }
  }, [userId, currentUserName]);

  // Log the entries data to ensure they are being updated correctly
  useEffect(() => {
    console.log("Entries data:", entries);  // Log the entries data
  }, [entries]);

  const handleEditComment = async (id, commentField) => {
    try {
      await axios.put(`${API_URL}/api/edit-comments/${id}`, {
        [commentField]: currentComment
      });
      setEntries(entries.map(entry => entry._id === id ? { ...entry, [commentField]: currentComment } : entry));
      toast.success(`${commentField} updated successfully`);
      setCurrentEntryId(null);
      setCurrentComment('');
      setIsEditingAdminComment(false);
    } catch (error) {
      toast.error(`Failed to update ${commentField}`);
    }
  };

  return (
    <>
      <ToastContainer />

      <div className="card">
        <div className="card-body">
          <div className="row mt-5">
            <div className="col-md-12">
              <h2>Parameter Threshold Exceedance</h2>
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>SI.No</th>
                      <th>User ID</th>
                      <th>Station Name</th>
                      <th>Exceeded Parameter</th>
                      <th>Value</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>User Remark Comment</th>
                      <th>Admin Remark Comment</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry, index) => (
                      <tr key={entry._id}>
                        <td>{index + 1}</td>
                        <td>{entry.userName}</td>
                        <td>{entry.stackName}</td>
                        <td>{entry.parameter}</td>
                        <td>{entry.value}</td>
                        <td>{entry.formattedDate}</td>
                        <td>{entry.formattedTime}</td>
                        <td>{entry.commentByUser}</td>
                        <td>{entry.commentByAdmin}</td>
                        <td>
                          {userType === 'admin' && (
                            <button
                              type="button"
                              className="btn btn-primary m-2"
                              onClick={() => {
                                setCurrentEntryId(entry._id);
                                setCurrentComment(entry.commentByAdmin || '');
                                setIsEditingAdminComment(true);
                              }}
                            >
                              {entry.commentByAdmin ? 'Edit Admin Comment' : 'Add Admin Comment'}
                            </button>
                          )}
                          {userType === 'user' && (
                            <button
                              type="button"
                              className="btn btn-primary m-2"
                              onClick={() => {
                                setCurrentEntryId(entry._id);
                                setCurrentComment(entry.commentByUser || '');
                                setIsEditingAdminComment(false);
                              }}
                            >
                              {entry.commentByUser ? 'Edit User Comment' : 'Add User Comment'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {currentEntryId !== null && (
                <>
                  <div className="overlay" onClick={() => setCurrentEntryId(null)}></div>
                  <div className="popup">
                    <textarea
                      value={currentComment}
                      onChange={(e) => setCurrentComment(e.target.value)}
                      placeholder={isEditingAdminComment ? "Edit admin comment" : "Enter comment"}
                    ></textarea>
                    <div className="popup-buttons">
                      <button
                        className="btn btn-success"
                        onClick={() => {
                          if (isEditingAdminComment) {
                            handleEditComment(currentEntryId, 'commentByAdmin');
                          } else {
                            handleEditComment(currentEntryId, 'commentByUser');
                          }
                        }}
                      >
                        {isEditingAdminComment ? 'Save' : 'Add'}
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => {
                          setCurrentEntryId(null);
                          setCurrentComment('');
                          setIsEditingAdminComment(false);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CalibrationExceeded;
