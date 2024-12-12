import React, { useState } from 'react';

const TextNode = ({ data, selected }) => {
  const [isEditing, setIsEditing] = useState(true); // Enable editing by default
  const [text, setText] = useState(data.text || 'New Text'); // Default text for the box

  const handleBlur = () => {
    setIsEditing(false);
    data.text = text; // Update the node's data with the text
  };

  const handleDoubleClick = () => {
    setIsEditing(true); // Enable editing on double-click
  };

  return (
    <div
      style={{
        position: 'relative',
        padding: '5px',
        border: selected ? '1px solid blue' : '1px solid transparent',
        borderRadius: '4px',
        backgroundColor: '#f9f9f9',
        cursor: 'pointer',
        width: '150px',
        textAlign: 'center',
      }}
      onDoubleClick={handleDoubleClick} // Double-click to edit
    >
      {isEditing ? (
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)} // Update text on input change
          onBlur={handleBlur} // Save text on blur
          autoFocus
          style={{
            width: '100%',
            border: '1px solid gray',
            borderRadius: '4px',
            padding: '5px',
            textAlign: 'center',
          }}
        />
      ) : (
        <span>{text}</span>
      )}
    </div>
  );
};

export default TextNode;
