import React from 'react';
import chatavatar from '../../assests/images/admin.png';

const ChatSidebar = ({ chats, selectChat, searchTerm, setSearchTerm }) => {
  return (
    <div className="chat-sidebar">
      <div className="search-box">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {chats.map(chat => (
        <div
          key={chat.id}
          className="chat-contact"
          onClick={() => selectChat(chat)}
        >
          <img src={chatavatar} alt="Avatar" className="chat-avatar" />
          <div className="chat-info">
            <h5 className="chat-name">
              {chat.name} {chat.companyName}
              {chat.unreadCount > 0 && (
                <span
                  className="badge"
                  style={{
                    backgroundColor: 'red',
                    color: 'white',
                    borderRadius: '50%',
                    padding: '2px 8px',
                    marginLeft: '10px',
                    fontSize: '0.8em'
                  }}
                >
                  {chat.unreadCount}
                </span>
              )}
            </h5>

            <p className="chat-last-message">
              {chat.lastMessage}
              {/* Display last message time if we have it */}
              {chat.timestamp && (
                <span
                  style={{
                    fontSize: '0.8em',
                    color: '#999',
                    marginLeft: '8px'
                  }}
                >
                  {new Date(chat.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              )}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatSidebar;
