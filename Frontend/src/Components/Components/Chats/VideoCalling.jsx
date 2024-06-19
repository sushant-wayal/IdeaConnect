import { useSocket } from "../../../context/socket";
import {
  RiMicFill,
  RiMicOffFill,
  RiPhoneFill,
  RiVideoOffFill,
  RiVideoOnLine
} from "@remixicon/react";

const VideoCalling = ({
  onVideoCall,
  videoCallStatus,
  profileImage,
  toggleVideo,
  toggleAudio,
  video,
  audio,
  localStream,
  currChatId,
  peer,
  leaveCall 
}) => {
  const socket = useSocket();
  return (
    <div className={`${onVideoCall ? "" : "hidden"} flex-grow w-full overflow-hidden p-2 relative`}>
      <div className={`h-full w-full ${(videoCallStatus && (videoCallStatus != "connected")) ? "flex" : "hidden"} flex-col gap-2 justify-center items-center`}>
        <div className="h-1/4 aspect-square flex justify-center items-center relative">
          <img
            src={profileImage}
            className="aspect-square rounded-full h-full animate-connecting-lg"
          />
          <p className="text-lg font-semibold absolute -bottom-12">{videoCallStatus}...</p>
        </div>
      </div>
      <video
        id="remoteStream"
        autoPlay
        playsInline
        className={`${videoCallStatus == "connected" ? "" : "hidden" } top-0 left-0 h-full w-full object-cover`}
      />
      <video
        id="localStream"
        autoPlay
        playsInline
        className="h-1/5 w-1/5 absolute bottom-[1%] right-[-3%]"
      />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-10 pb-5">
        <div className="cursor-pointer p-2 rounded-full border-2 border-black bg-white/50 hover:bg-white">
          <RiVideoOnLine
            size={36}
            onClick={toggleVideo}
            className={`${video ? "" : "hidden"}`}
          />
          <RiVideoOffFill
            size={36}
            onClick={toggleVideo}
            className={`${video ? "hidden" : ""}`}
          />
        </div>
        <div className="cursor-pointer p-2 rounded-full border-2 border-black bg-white/50 hover:bg-white">
          <RiMicFill
            size={36}
            onClick={toggleAudio}
            className={`${audio ? "" : "hidden"}`}
          />
          <RiMicOffFill
            size={36}
            onClick={toggleAudio}
            className={`${audio ? "hidden" : ""}`}
          />
        </div>
        <div className="cursor-pointer p-2 rounded-full border-2 border-black bg-white/50 hover:bg-white">
          <RiPhoneFill
            size={36}
            color="red"
            onClick={() => {
              if (!localStream) socket.emit("rejectCall", {reciver: currChatId});
              else {
                peer.disconnect();
                socket.emit("leaveCall", {reciver: currChatId});
              }
              leaveCall();
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default VideoCalling;