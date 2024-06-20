import { createContext, useContext } from "react";

const videoCallContext = createContext({
  onVideoCall: false,
  setOnVideoCall: () => {},
  videoCallRequested: [],
  setVideoCallRequested: () => {},
  videoCallStatus: null,
  setVideoCallStatus: () => {},
})

export const VideoCallProvider = videoCallContext.Provider;

export const useVideoCall = () => useContext(videoCallContext);