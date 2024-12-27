import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaPaperPlane, FaPaperclip, FaTrash } from 'react-icons/fa'; // Icons for send and share
import { API_URL } from '../../utils/apiConfig'; // Ensure this path is correct

const ChatWindow = ({ currentChat, socket }) => {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]); // Holds selected files
  const messagesEndRef = useRef(null); // Ref for auto-scrolling
  const fileInputRef = useRef(null); // Ref for the file input

  useEffect(() => {
    if (currentChat) {
      socket.emit('joinRoom', { userId: currentChat.userId }); // Join the room based on the selected chat

      const fetchMessages = async () => {
        try {
          const response = await axios.get(`${API_URL}/api/messages`, {
            params: { from: currentChat.userId, to: currentChat.id },
          });
          setMessages(response.data);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };

      fetchMessages();
    }
  }, [currentChat, socket]);

  useEffect(() => {
    const handleNewMessage = (message) => {
      if (
        currentChat &&
        (message.from === currentChat.userId || message.to === currentChat.userId)
      ) {
        setMessages((prev) => {
          if (prev.find((msg) => msg._id === message._id)) {
            console.log('Duplicate message ignored:', message);
            return prev; // Skip adding if the message already exists
          }
          return [...prev, message];
        });
      }
    };
  
    // Register the listener
    socket.on('newChatMessage', handleNewMessage);
  
    // Clean up the listener on unmount or dependency change
    return () => {
      socket.off('newChatMessage', handleNewMessage);
    };
  }, [currentChat, socket]);
  
  

  const sendMessage = async () => {
    if (newMessage.trim() || selectedFiles.length > 0) {
      const formData = new FormData();
      formData.append('from', currentChat.userId);
      formData.append('to', currentChat.id);
      formData.append('message', newMessage.trim());
  
      selectedFiles.forEach((file) => {
        formData.append('files', file); // Append each file to the formData
      });
  
      try {
        console.log('Sending message:', newMessage.trim()); // Log the message being sent
        const response = await axios.post(`${API_URL}/api/send`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
  
        // Emit the message to the socket for real-time updates
        socket.emit('chatMessage', response.data);
  
        // No need to directly update `messages` state here.
        // Wait for the `newChatMessage` event to handle this.
      } catch (error) {
        console.error('Error sending message:', error);
      }
  
      // Clear input and file states
      setNewMessage("");
      setSelectedFiles([]);
    }
  };
  
  

  const handleFileShare = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
    e.target.value = null; // Reset the file input
  };

  const handleDeleteFile = (fileName) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  const renderMessageContent = (msg) => {
    if (msg.files && msg.files.length > 0) {
      return (
        <div className="file-previews">
          {msg.files.map((fileUrl, idx) => {
            const isImage = /\.(jpeg|jpg|png|gif)$/i.test(fileUrl); // Check if the file is an image
            return isImage ? (
              <img
                key={idx}
                src={fileUrl}
                alt="chat-file"
                className="chat-image"
                style={{ maxWidth: "200px", maxHeight: "200px", margin: "5px", borderRadius: "8px" }}
              />
            ) : (
              <a
                key={idx}
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="chat-file-link"
              >
                {fileUrl.split("/").pop()}
              </a>
            );
          })}
        </div>
      );
    }
    return <span>{msg.message}</span>;
  };

  return (
    <div className="chat-main">
      <div className="chat-header">
        {currentChat ? (
          <h2>{currentChat.name}</h2>
        ) : (
          <div className="select-chat-message">Select a user to chat</div>
        )}
      </div>
      <div className="chat-messages">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.from === currentChat.userId ? "you" : "them"}`}
            >
              <div className="content">
                <strong>{msg.from === currentChat.userId ? "You" : currentChat.name}:</strong>
                {renderMessageContent(msg)}
              </div>
            </div>
          ))
        ) : (
          <div className="no-messages">No messages yet</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="file-preview-section">
        {selectedFiles.length > 0 && (
          <div className="file-preview">
            {selectedFiles.map((file, index) => (
              <div key={index} className="file-preview-item">
                <FaTrash onClick={() => handleDeleteFile(file.name)} />
                {file.name}
              </div>
            ))}
            <button onClick={sendMessage} className="send-files-button">
              <FaPaperPlane /> Send Message
            </button>
          </div>
        )}
      </div>

      {currentChat && (
        <div className="chat-input-box">
          <input
            type="text"
            placeholder="Type here..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="chat-input"
          />
          <FaPaperclip className="share-icon" onClick={handleFileShare} title="Share a file" />
          <FaPaperPlane className="send-icon" onClick={sendMessage} title="Send message" />
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            multiple
            onChange={handleFileChange}
          />
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
