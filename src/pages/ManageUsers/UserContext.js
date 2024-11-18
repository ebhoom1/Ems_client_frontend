import React, { useState, useEffect, createContext } from "react";

// Create the User Context
export const UserContext = createContext();

// Create the UserProvider component
export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);

  // Load users from local storage when the component mounts
  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem("users"));
    if (savedUsers) {
      setUsers(savedUsers);
    }
  }, []);

  const addUser = (user) => {
    const updatedUsers = [...users, user];
    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers)); // Save to local storage
  };

  const deleteUser = (userId) => {
    const updatedUsers = users.filter((user) => user.userId !== userId);
    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers)); // Update local storage
  };

  const editUser = (updatedUser) => {
    const updatedUsers = users.map((user) =>
      user.userId === updatedUser.userId ? updatedUser : user
    );
    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers)); // Update local storage
  };

  return (
    <UserContext.Provider value={{ users, addUser, deleteUser, editUser }}>
      {children}
    </UserContext.Provider>
  );
};
