import React from 'react';
import chatavatar from '../../assests/images/admin.png'
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
      
        <div key={chat.id} className="chat-contact" onClick={() => selectChat(chat)}>
  <img src={chatavatar} alt="Avatar" className="chat-avatar" />          <div className="chat-info">
            <h5 className="chat-name">{chat.name}{chat.companyName}</h5>
            <p className="chat-last-message">{chat.lastMessage}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatSidebar;

//  import chatavatar from '../../assests/images/admin.png'

//          <img src={chatavatar} alt="Avatar" className="chat-avatar" />
