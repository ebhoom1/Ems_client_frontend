import React, { createContext, useState } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = (notification) => {
        setNotifications([...notifications, notification]);
    };

    const deleteNotification = (index) => {
        const updatedNotifications = notifications.filter((_, i) => i !== index);
        setNotifications(updatedNotifications);
    };

    return (
        <NotificationContext.Provider value={{ notifications, addNotification, deleteNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};

export default NotificationContext;
