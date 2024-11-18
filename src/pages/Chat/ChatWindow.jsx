import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/apiConfig';
import {FaPaperPlane, FaPaperclip, FaPlus, FaTrash, FaTimes } from 'react-icons/fa'; // Import icons for send and share

const ChatWindow = ({ currentChat, socket }) => {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]); // For holding the file list
  const [fileDescriptions, setFileDescriptions] = useState({}); // Holds descriptions for each file
  const messagesEndRef = useRef(null); // Create a ref for scrolling
  const fileInputRef = useRef(null); // Create a ref for the file input

  // Join the room when a chat is selected
  useEffect(() => {
    if (currentChat) {
      socket.emit('joinRoom', { userId: currentChat.userId }); // Join the room based on the selected chat

      const fetchMessages = async () => {
        try {
          const response = await axios.get(`${API_URL}/api/messages`, {
            params: { from: currentChat.userId, to: currentChat.id }
          });
          setMessages(response.data);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };
      fetchMessages();
    }
  }, [currentChat, socket]); // Depend on currentChat and socket to re-fetch messages when chat changes

  useEffect(() => {
    const handleNewMessage = (message) => {
      if (currentChat && (message.from === currentChat.userId || message.from === currentChat.id)) {
        setMessages(prev => [...prev, message]); // Add the message only when received from the server
      }
    };

    socket.on('newChatMessage', handleNewMessage); // Listen for real-time messages

    return () => {
      socket.off('newChatMessage', handleNewMessage); // Clean up listener
    };
  }, [currentChat, socket]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      // Emit the message to the server
      socket.emit('chatMessage', {
        from: currentChat.userId,
        to: currentChat.id,
        message: newMessage
      });

      setNewMessage(""); // Clear the input after sending the message
    }

    if (selectedFiles.length > 0) {
      // Upload selected files with descriptions
      selectedFiles.forEach(file => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('description', fileDescriptions[file.name] || '');

        axios.post(`${API_URL}/api/uploadFile`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
          .then(response => {
            // Emit the file message to the server
            socket.emit('chatMessage', {
              from: currentChat.userId,
              to: currentChat.id,
              message: `File: ${response.data.fileUrl}, Description: ${fileDescriptions[file.name] || 'No description'}`
            });
          })
          .catch(error => {
            console.error('File upload error:', error);
          });
      });

      // Clear file selection after sending
      setSelectedFiles([]);
      setFileDescriptions({});
    }
  };
  const sendFiles = () => {
    // Similar implementation to send files as described before.
  };

  const handleFileShare = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prevFiles => [...prevFiles, ...files]);
    e.target.value = null; // Reset file input
  };

  const handleDeleteFile = (fileName) => {
    setSelectedFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
    const newDescriptions = { ...fileDescriptions };
    delete newDescriptions[fileName];
    setFileDescriptions(newDescriptions);
  };

  const cancelSendFiles = () => {
    setSelectedFiles([]);
    setFileDescriptions({});
  };
  return (
    <div className="chat-main">
      <div className="chat-header">
        {currentChat ? <h2>{currentChat.name}</h2> : <div className="select-chat-message">Select a user to chat</div>}
      </div>
      <div className="chat-messages">
        {messages.length > 0 ? messages.map((msg, index) => (
          <div key={index} className={`message ${msg.from === currentChat.userId ? 'you' : 'them'}`}>
            <div className="content">
              <strong>{msg.from === currentChat.userId ? 'You' : currentChat.name}:</strong> {msg.message}
            </div>
          </div>
        )) : <div className="no-messages">No messages yet</div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="file-preview-section">
        {selectedFiles.length > 0 && (
          <div className="file-preview">
            {selectedFiles.map((file, index) => (
              <div key={index} className="file-preview-item">
                <FaTrash onClick={() => handleDeleteFile(file.name)} />
                {file.name}
                <input
                  type="text"
                  placeholder="Add a description"
                  value={fileDescriptions[file.name] || ''}
                  onChange={(e) => setFileDescriptions(prev => ({ ...prev, [file.name]: e.target.value }))}
                />
              </div>
            ))}
            
            <button onClick={() => fileInputRef.current.click()} className="add-file-button"><FaPlus /> Add more files</button>
            <button onClick={sendMessage} className="send-files-button"><FaPaperPlane /> Send Files</button>
            <button onClick={cancelSendFiles}className='cancel-files-button'><FaTimes /> Cancel</button>

          </div>
        )}
        </div>
      {/* File Preview Section
      {selectedFiles.length > 0 && (
        <div className="file-preview">
          {selectedFiles.map((file, index) => (
            <div key={index} className="file-preview-item">
              <FaTrash onClick={() => handleDeleteFile(file.name)} />
              {file.name}
              <input type="text" placeholder="Add a description" value={fileDescriptions[file.name] || ''}
                onChange={(e) => setFileDescriptions(prev => ({ ...prev, [file.name]: e.target.value }))}
              />
            </div>
          ))}
          <button onClick={sendFiles}>Send</button>
          <button onClick={cancelSendFiles}><FaTimes /> Cancel</button>
        </div>
      )} */}

      {currentChat && (
        <div className="chat-input-box">
          <input
            type="text"
            placeholder="Type here..."a
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="chat-input"
          />
          <FaPaperclip className="share-icon" onClick={handleFileShare} title="Share a file" />
          <FaPaperPlane className="send-icon" onClick={sendMessage} title="Send message" />

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            multiple
            onChange={handleFileChange}
          />
        </div>
      )}
    </div>
  );
};

export default ChatWindow;