import { useState } from "react";
import { NotificationContext } from "./notificationContextValue";

function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([
    {
      id: "NOT-001",
      title: "High-risk decision detected",
      message: "DEC-1002 requires human review.",
      type: "warning",
      read: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "NOT-002",
      title: "Application connected",
      message:
        "Fraud Detection has successfully connected to DesT.",
      type: "success",
      read: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "NOT-003",
      title: "Review completed",
      message: "REV-002 was approved by the reviewer.",
      type: "info",
      read: true,
      createdAt: new Date().toISOString(),
    },
  ]);

  // Add notification
  const addNotification = ({
    title,
    message,
    type = "info",
  }) => {
    const newNotification = {
      id: `NOT-${Date.now()}`,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setNotifications((previous) => [
      newNotification,
      ...previous,
    ]);
  };

  // Mark one notification as read
  const markAsRead = (notificationId) => {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === notificationId
          ? {
              ...notification,
              read: true,
            }
          : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  // Remove notification
  const removeNotification = (notificationId) => {
    setNotifications((previous) =>
      previous.filter(
        (notification) =>
          notification.id !== notificationId
      )
    );
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export default NotificationProvider;