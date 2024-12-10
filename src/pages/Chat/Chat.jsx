import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import { useSelector } from 'react-redux';
import './chat.css'; // Ensure this path is correct
import { API_URL } from '../../utils/apiConfig'; // Ensure API_URL is correct
import DashboardSam from '../Dashboard/DashboardSam';
import Header from '../Header/Hedaer';

const socket = io(`${API_URL}`);

const ChatApp = () => {
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch current user data from Redux
  const { userData } = useSelector((state) => state.user);
  const currentUser = userData?.validUserOne;

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await axios.get(`${API_URL}/api/getallusers`);
        if (response.data && response.data.users && currentUser) {
          const ebhoomUser = response.data.users.find(user => user.userName === 'EBHOOM'); // Find the EBHOOM admin

          // Filter chats based on userType, adminType, and exclude logged-in user
          const filteredChats = response.data.users.filter((user) => {
            if (user._id === currentUser._id) {
              return false; // Exclude the logged-in user
            }

            // EBHOOM Admin: Can see everyone
            if (currentUser.userType === 'admin' && currentUser.adminType === 'EBHOOM') {
              return true; // EBHOOM sees all
            }

            // Other Admins: See users with same adminType and EBHOOM admin
            if (currentUser.userType === 'admin') {
              return (
                user.adminType === currentUser.adminType || // Users with same adminType
                user.adminType === 'EBHOOM' // Include EBHOOM admin
              );
            }

            // Users: See admins with same adminType and EBHOOM admin
            if (currentUser.userType === 'user') {
              return (
                user.userType === 'admin' && // Must be admin
                (user.adminType === currentUser.adminType || user.adminType === 'EBHOOM')
              );
            }

            return false;
          });

          // Ensure EBHOOM is added explicitly if it's not already in the list
          if (ebhoomUser && !filteredChats.some(user => user._id === ebhoomUser._id)) {
            filteredChats.push(ebhoomUser);
          }

          setChats(filteredChats.map(user => ({
            id: user._id,
            name: user.fname || 'No Name', // Provide a fallback value
            avatar: user.avatar || 'assets/images/admin.png', // Provide a default avatar if not available
            lastMessage: user.lastMessage || 'No messages yet', // Provide a default message
            userType: user.userType, // Include userType for reference
            adminType: user.adminType, // Include adminType for reference
            userId: currentUser._id, // Use the actual current user ID from Redux state
          })));
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    }

    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid">
      <div className="row" style={{ backgroundColor: 'white' }}>
        {/* Sidebar (hidden on mobile) */}
        <div className="col-lg-3 d-none d-lg-block">
          <DashboardSam />
        </div>
        {/* Main content */}
        <div className="col-lg-9 col-12">
          <div className="row">
            <div className="col-12">
              <Header />
            </div>
          </div>
          <div>
            <div className="row" style={{ overflowX: 'hidden' }}>
              <div className="col-12 col-md-12 grid-margin">
                <div className="col-12 d-flex justify-content-center align-items-center m-2 text-center">
                  <h1 className="text-center mt-3" style={{ justifyContent: 'center' }}>Chat Application</h1>
                </div>
                <div className="card m-">
                  <div className="card-body">
                    <div className="row mt-2">
                      <div className="col-md-4">
                        <ChatSidebar 
                          chats={filteredChats} 
                          selectChat={setCurrentChat} 
                          searchTerm={searchTerm} 
                          setSearchTerm={setSearchTerm} 
                        />
                      </div>
                      <div className="col-md-8">
                        <ChatWindow currentChat={currentChat} socket={socket} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="footer">
        <div className="container-fluid clearfix">
          <span className="text-muted d-block text-center text-sm-left d-sm-inline-block">
            
          </span>
          <span className="float-none float-sm-right d-block mt-1 mt-sm-0 text-center">
            AquaBox Control and Monitor System <br />
            © <a href="https://envirobotics.com" target="_blank">Ebhoom</a> 2022
          </span>
        </div>
      </footer>
    </div>
  );
};

export default ChatApp;






