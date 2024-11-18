
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import { useSelector } from 'react-redux';
import './chat.css'; // Ensure this path is correct
import { API_URL } from '../../utils/apiConfig'; // Ensure API_URL is correct
import DashboardSam from '../Dashboard/DashboardSam';
import Hedaer from '../Header/Hedaer';

const socket = io(`${API_URL}`, { withCredentials: true });

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
          setChats(response.data.users.map(user => ({
            id: user._id,
            name: user.fname || 'No Name',
            avatar: user.avatar || 'assets/images/admin.png',
            lastMessage: user.lastMessage || 'No messages yet',
            userId: currentUser._id
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

  // Listen for incoming chat messages via socket
  useEffect(() => {
    socket.on('newChatMessage', (message) => {
      setChats(prevChats => {
        return prevChats.map(chat =>
          chat.id === message.to ? {
            ...chat,
            messages: [...chat.messages || [], message],
            lastMessage: message.message
          } : chat
        );
      });
    });

    return () => socket.off('newChatMessage');
  }, []);

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
              <Hedaer />
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
                      <div className="col-md-4  " >
                        <ChatSidebar 
                          chats={filteredChats} 
                          selectChat={setCurrentChat} 
                          searchTerm={searchTerm} 
                          setSearchTerm={setSearchTerm} 
                          
                        />
                      </div>
                      <div className="col-md-8" style={{borderRadius:'10px'}}>
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
