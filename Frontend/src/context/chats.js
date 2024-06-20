import { createContext, useContext } from "react";

const ChatContext = createContext({
  unreadNotifications: [],
  setUnreadNotifications: () => {},
  profileImage: "",
  setProfileImage: () => {},
  username: "",
  setUsername: () => {},
  currChat: {},
  setCurrChat: () => {}
});

export const ChatProvider = ChatContext.Provider;

export const useChat = () => useContext(ChatContext)