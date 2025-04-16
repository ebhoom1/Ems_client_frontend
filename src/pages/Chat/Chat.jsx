import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useSelector } from 'react-redux';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import DashboardSam from '../Dashboard/DashboardSam';
import Header from '../Header/Hedaer';
import './chat.css';
import { API_URL } from '../../utils/apiConfig';

const socket = io(`${API_URL}`);

const ChatApp = () => {
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { userData } = useSelector((state) => state.user);
  const currentUser = userData?.validUserOne;

  // Fetch users and set up initial chats list
  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await axios.get(`${API_URL}/api/getallusers`);
        if (response.data && response.data.users && currentUser) {
          const ebhoomUser = response.data.users.find(user => user.userName === 'EBHOOM');
          const filteredChats = response.data.users.filter((user) => {
            if (user._id === currentUser._id) return false;

            // EBHOOM admin sees everyone
            if (currentUser.userType === 'admin' && currentUser.adminType === 'EBHOOM') return true;

            // Other admins see users with the same adminType and EBHOOM admin
            if (currentUser.userType === 'admin') {
              return user.adminType === currentUser.adminType || user.adminType === 'EBHOOM';
            }

            // Regular users see admins of their own adminType and the EBHOOM admin
            if (currentUser.userType === 'user') {
              return (
                user.userType === 'admin' &&
                (user.adminType === currentUser.adminType || user.adminType === 'EBHOOM')
              );
            }
            return false;
          });

          // Ensure EBHOOM is always included in the list
          if (ebhoomUser && !filteredChats.some(user => user._id === ebhoomUser._id)) {
            filteredChats.push(ebhoomUser);
          }

          setChats(filteredChats.map(user => ({
            id: user._id,
            name: user.fname || 'No Name',
            avatar: user.avatar || 'assets/images/admin.png',
            lastMessage: user.lastMessage || 'No messages yet',
            timestamp: user.timestamp || null,
            unreadCount: 0,
            userType: user.userType,
            adminType: user.adminType,
            userId: currentUser._id,
          })));
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    }

    if (currentUser) fetchUsers();
  }, [currentUser]);

  // Listen for new chat messages (update unread count and chat order)
  useEffect(() => {
    // This event is triggered by the server whenever *any* user sends a message.
    socket.on('newChatMessage', (message) => {
      setChats(prevChats =>
        prevChats
          .map(chat => {
            // If the incoming message is relevant to this chat
            if (
              (chat.id === message.from && message.from !== currentUser._id) ||
              (chat.id === message.to && message.to !== currentUser._id)
            ) {
              // If this chat is not currently open, increment unread
              let unreadCount = chat.unreadCount || 0;
              if (!currentChat || chat.id !== currentChat.id) {
                unreadCount += 1;
              } else {
                unreadCount = 0;
              }
              return {
                ...chat,
                lastMessage: message.message,
                timestamp: message.createdAt,
                unreadCount,
              };
            }
            return chat;
          })
          // Sort by latest timestamp (descending)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      );
    });

    return () => socket.off('newChatMessage');
  }, [currentChat, currentUser]);

  // Clear unread count when a chat is selected
  const handleSelectChat = (chat) => {
    setCurrentChat(chat);
    setChats(prevChats =>
      prevChats.map(c =>
        c.id === chat.id ? { ...c, unreadCount: 0 } : c
      )
    );
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid">
      <div className="row" style={{ backgroundColor: 'white' }}>
        {/* Sidebar on larger screens */}
        <div className="col-lg-3 d-none d-lg-block">
          <DashboardSam />
        </div>

        <div className="col-lg-9 col-12">
          <div className="row">
            <div className="col-12">
              <Header />
            </div>
          </div>
          <div className="row" style={{ overflowX: 'hidden' }}>
            <div className="col-12 col-md-12 grid-margin">
              <div className="col-12 d-flex justify-content-center align-items-center m-2 text-center">
                <h1 className="text-center mt-3">Chat Application</h1>
              </div>
              <div className="card-body">
                <div className="row mt-2">
                  <div className="col-md-4">
                    <ChatSidebar
                      chats={filteredChats}
                      selectChat={handleSelectChat}
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

      <footer className="footer">
        <div className="container-fluid clearfix">
          <span className="text-muted d-block text-center text-sm-left d-sm-inline-block"></span>
          <span className="float-none float-sm-right d-block mt-1 mt-sm-0 text-center">
            AquaBox Control and Monitor System <br />
            © <a href="https://envirobotics.com" target="_blank" rel="noopener noreferrer">Ebhoom</a> 2022
          </span>
        </div>
      </footer>
    </div>
  );
};

export default ChatApp;
