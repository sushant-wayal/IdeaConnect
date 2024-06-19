import {
  createContext,
  useContext
} from "react";

const SocketContext = createContext({
  socket: null,
})

export const SocketProvider = SocketContext.Provider;

export const useSocket = () => {
  const { socket } = useContext(SocketContext);
  return socket;
}