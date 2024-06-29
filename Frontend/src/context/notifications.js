import { createContext, useContext } from "react";

const NotificationContext = createContext({
  noOfMessages: 0,
  setNoOfMessages: () => {},
  noOfSenders: 0,
  setNoOfSenders: () => {},
  notifications: [],
  setNotifications: () => {},
  unreadNotifications: [],
  setUnreadNotifications: () => {},
})

export const NotificationProvider = NotificationContext.Provider;

export const useNotification = () => useContext(NotificationContext);