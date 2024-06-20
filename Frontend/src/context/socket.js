import {
  createContext,
  useContext
} from "react";

const SocketContext = createContext({
  socket: null,
})

export const SocketProvider = SocketContext.Provider;

export const useSocket = () => useContext(SocketContext).socket;