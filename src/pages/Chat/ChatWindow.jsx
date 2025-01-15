import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaPaperPlane, FaPaperclip, FaTrash } from 'react-icons/fa';
import { API_URL } from '../../utils/apiConfig';

const ChatWindow = ({ currentChat, socket }) => {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state for fetching messages
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (currentChat) {
      setLoading(true); // Start loading when a new chat is selected
      setMessages([]); // Clear messages to avoid showing previous user's messages
      
      socket.emit('joinRoom', { userId: currentChat.userId });

      const fetchMessages = async () => {
        try {
          const response = await axios.get(`${API_URL}/api/messages`, {
            params: { from: currentChat.userId, to: currentChat.id },
          });
          setMessages(response.data);
        } catch (error) {
          console.error('Error fetching messages:', error);
        } finally {
          setLoading(false); // Stop loading after fetching messages
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
            return prev;
          }
          return [...prev, message];
        });
      }
    };

    socket.on('newChatMessage', handleNewMessage);

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
        formData.append('files', file);
      });

      try {
        const response = await axios.post(`${API_URL}/api/send`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        socket.emit('chatMessage', response.data);
      } catch (error) {
        console.error('Error sending message:', error);
      }

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
    e.target.value = null;
  };

  const handleDeleteFile = (fileName) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  const renderMessageContent = (msg) => {
    if (msg.files && msg.files.length > 0) {
      return (
        <div className="file-previews">
          {msg.files.map((fileUrl, idx) => {
            const isImage = /\.(jpeg|jpg|png|gif)$/i.test(fileUrl);
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
        {loading ? (
          <div className="loading">Loading messages...</div>
        ) : messages.length > 0 ? (
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
          <div className="no-messages">No messages yet, start a conversation.</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="file-preview-section" >
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
