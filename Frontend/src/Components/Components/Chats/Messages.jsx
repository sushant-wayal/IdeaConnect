import IdeaMessage from "./Messages/IdeaMessage";
import TextMessage from "./Messages/TextMessage";
import ImageMessage from "./Messages/ImageMessage";
import VideoMessage from "./Messages/VideoMessage";
import AudioMessage from "./Messages/AudioMessage";
import VoiceMessage from "./Messages/VoiceMessage";
import DocumentMessage from "./Messages/DocumentMessage";
import { Link } from "react-router-dom";
import { RiDeleteBin5Fill, RiLoader2Line, RiVideoChatLine } from "@remixicon/react";
import { useSocket } from "../../../context/socket";
import { useChat } from "../../../context/chats";
import { useVideoCall } from "../../../context/videoCall";
import {
	useCallback,
	useEffect,
	useState
} from "react";
import { useUser } from "../../../context/user";

const Messages = ({
	firstName,
	lastName,
	gotVideoCall,
	messages,
	ideaMessages,
	sendStreams,
	originalUsername,
	unreadMessages,
	loading
}) => {
	const socket = useSocket();

	const {
		currChat : {
			_id,
			name
		},
		username,
		profileImage,
		setUsername
	} = useChat();

	const {
		onVideoCall,
		setOnVideoCall,
		setVideoCallStatus
	} = useVideoCall();

	const { id, username: activeUsername } = useUser();

	const [seeDelete, setSeeDelete] = useState([]);
	const [messageDeleted, setMessageDeleted] = useState(false);

	useEffect(() => {
		setSeeDelete(messages.map(() => false));
	},[messages])
	
	const requestVideoCall = useCallback(() => {
		setOnVideoCall(true);
		setVideoCallStatus("Calling");
		socket.emit("requestCall",{reciver: _id});
  },[_id]);

	useEffect(() => {
		if (messageDeleted) {
			setMessageDeleted(false);
			return;
		}
		let messageEle = document.querySelector("#message");
		messageEle.scrollTo({
			top: messageEle.scrollHeight,
			behavior: "smooth",
		});
  },[messages])

	const reciveTyping = useCallback(({ room, message }) => {
		if (room == _id) {
			if (message.length > 0) setUsername(message);
			else setUsername(originalUsername);
		}
  },[_id])

	useEffect(() => {
		socket.on("reciveTyping", reciveTyping)
		return () => socket.off("reciveTyping", reciveTyping)
  },[
		socket,
		_id,
		reciveTyping
	])

  return (
    <>
      <div className="py-2 px-5 flex justify-between items-center border-b-[1px] border-black border-solid">
				<div className="flex justify-center gap-3">
					<Link
						to={name ? "" : `/profile/${username}`}
						className="h-10 rounded-full"
					>
						<img
							className="h-full aspect-square object-cover rounded-full"
							src={profileImage}
						/>
					</Link>
					<div className="flex flex-col justify-between">
						<p className="font-semibold">{firstName} {lastName}</p>
						<p className="text-sm">{username}</p>
					</div>
				</div>
				<div className={`${name ? "hidden" : "flex"} justify-center gap-5 items-center bg-[#C1EDCC] hover:bg-[#B0C0BC] p-2 rounded-full`}>
					<RiVideoChatLine
						id="videoCallIcon"
						size={30}
						onClick={() => {
							if (gotVideoCall) {
								if (_id == gotVideoCall) sendStreams();
							}
							else requestVideoCall();
						}}
						color={onVideoCall ? "red" : gotVideoCall ? "green" : "black"}
						className="scale-x-110 cursor-pointer"
					/>
				</div>
			</div>
			<div
				id="message"
				className={`${onVideoCall ? "hidden" : ""} flex-grow w-full overflow-scroll p-2`}
			>
				{loading ?
					<div className="flex justify-center items-center h-full w-full">
						<RiLoader2Line className="animate-spin h-10 w-10"/>
					</div>
					:
					messages.length == 0 ?
					<div className="flex justify-center items-center h-full w-full">
						<p className="text-2xl text-white font-semibold">No Messages in this Conversation</p>
					</div>
					:
					messages.map(({ _id, sender, senderUsername, messageType, message }, ind) => {
						let align = "start";
						if (id.toString() == sender.toString()) align = "end";
						return (
							<>
								{ind == messages.length-unreadMessages && (
									<div className="w-full flex justify-center items-center gap-2">
										<div className="h-[2px] flex-grow border-1 border-black bg-black"></div>
										<p className="text-lg">
											New Messages
										</p>
										<div className="h-[2px] flex-grow border-1 border-black bg-black"></div>
								</div>
								)}
								<div
									key={_id}
									className={`flex flex-col ${align == "start" ? "items-start" : "items-end"} mb-1 relative`}
								>
									<div
										onClick={() => setSeeDelete(seeDelete.map((val, index) => index == ind ? !val : val))}
										className="flex items-start gap-2"
									>
										{messageType == "text" && (
											<TextMessage
												displayMessage={message}
											/>
										)}
										{messageType == "image" && (
											<ImageMessage
												align={align}
												chatTitle={name ? name : username}
												messageId={_id}
												imageSrc={message}
											/>
										)}
										{messageType == "video" && (
											<VideoMessage
												align={align}
												chatTitle={name ? name : username}
												messageId={_id}
												videoSrc={message}
											/>
										)}
										{messageType == "audio" && (
											<AudioMessage
												align={align}
												chatTitle={name ? name : username}
												messageId={_id}
												audioSrc={message}
											/>
										)}
										{messageType == "voice" && (
											<VoiceMessage
												align={align}
												voiceSrc={message}
											/>
										)}
										{messageType == "idea" && (
											<IdeaMessage thisIdea={ideaMessages.get(message)} />
										)}
										{messageType == "document" && (
											<DocumentMessage
												chatTitle={name ? name : username}
												senderUsername={senderUsername}
												fileSrc={message}
												messageId={_id}
											/>
										)}
										<RiDeleteBin5Fill color="red" size={24} className={senderUsername == activeUsername && seeDelete[ind] ? "" : "hidden"}/>
									</div>
									<p className={`${(ind < messages.length-1 && messages[ind+1]?.sender == sender) ? "hidden" : ""} text-sm font-semibold bg-[#C1EDCC] rounded-full px-2 py-1 mt-1`}>{senderUsername == activeUsername ? "You" : senderUsername}</p>
								</div>
							</>
						)
					})
				}
			</div>
    </>
  )
}

export default Messages