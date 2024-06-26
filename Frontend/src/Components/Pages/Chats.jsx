import axios from "axios"
import peer from "../../services/peer.js";
import ChatList from "../Components/Chats/ChatList.jsx";
import Messages from "../Components/Chats/Messages.jsx";
import VideoCalling from "../Components/Chats/VideoCalling.jsx";
import { getData } from "../dataLoaders.js";
import { useSocket } from "../../context/socket.js";
import { ChatProvider } from "../../context/chats.js";
import { VideoCallProvider } from "../../context/videoCall.js";
import {
	useLoaderData,
	useLocation
} from "react-router-dom"
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  RiMicFill,
  RiAttachment2,
  RiLoaderLine,
  RiMicLine
} from "@remixicon/react"
import { useNotification } from "../../context/notifications.js";

const Chats = () => {
  let chats = [];
  const { authenticated, chatsAndGroups } = useLoaderData();
  if (authenticated) chats = chatsAndGroups;

  const socket = useSocket();

  for (let chat of chats) socket.emit("joinRoom",chat._id);

	const { setNoOfMessages, setNoOfSenders } = useNotification();

  const [unreadNotifications, setUnreadNotifications] = useState([]);
	const [unreadMessages, setUnreadMessages] = useState(0);
  const [messages, setMessages] = useState([]);
  const [show, setShow] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [originalUsername, setOriginalUsername] = useState("");
  const [currChat, setCurrChat] = useState({});
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState("");
  const [activeUsername, setActiveUsername] = useState("");
  const sendRef = useRef(null);
  const msgInput = useRef(null);
  const [onVideoCall, setOnVideoCall] = useState(false);
  const [gotVideoCall, setGotVideoCall] = useState(null);
  const [videoCallRequested, setVideoCallRequested] = useState([]);
  const [videoCallStatus, setVideoCallStatus] = useState(null);
  const [ideaMessages, setIdeaMessages] = useState(new Map());
  const [media, setMedia] = useState(null);
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  const mediaConstraints = {
		video : {
			width: { min: 640, ideal: 3040, max: 3040 },
			height: { min: 480, ideal: 1080, max: 1080 },
		},
		audio : true,
  }

  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const sendIdea = query.get("shareIdea");
	const defaultChat = query.get("chat");

  useEffect(() => {
		const getUserId = async () => {
			const { authenticated, user } = await getData("/users/activeUser", "get", true);
			if (authenticated) {
				setUserId(user._id);
				setActiveUsername(user.username);
			}
		};
		getUserId();
		msgInput.current.addEventListener("keyup", (e) => {
			if (e.key == "Enter") sendRef.current.click();
		});
  },[])

  const moveToTop = (array, ind) => {
		const ele = array[ind];
		array.splice(ind,1);
		array.unshift(ele);
  }

  let id = 0;

  const send = (thisChat, thisMessage, messageType) => {
		if (thisMessage.length == 0) return;
		id++;
		socket.emit("sendMessage",{
			sender: userId,
			reciver: thisChat._id,
			senderUsername: activeUsername,
			messageType: messageType, 
			message: thisMessage,
			group: thisChat.name ? true : false,
		});
		setMessages(prev => [...prev,{
			messageType,
			senderUsername: activeUsername,
			message: thisMessage,
			sender: userId,
			_id: id,
		}]);
		setMessage("");
		msgInput.current.disabled = false;
		typing("");
		const ind = chats.findIndex(chat => chat._id == thisChat._id);
		if (messageType == "text") chats[ind].lastMessage = message;
		else if (messageType == "idea") chats[ind].lastMessage = "Shared an Idea";
		else if (messageType == "image") chats[ind].lastMessage = "Sent an Image";
		else if (messageType == "video") chats[ind].lastMessage = "Sent a Video";
		else if (messageType == "audio") chats[ind].lastMessage = "Sent an Audio";
		else if (messageType == "document") chats[ind].lastMessage = "Shared a Document";
		else if (messageType == "voice") chats[ind].lastMessage = "Sent a Voice Message";
		moveToTop(chats,ind);
		setUnreadNotifications(prev => {
			moveToTop(prev, ind);
			return prev;
		})
		setVideoCallRequested(prev => {
			moveToTop(prev, ind);
			return prev;
		})
  }

  const reciveMessage = useCallback(async ({ room, message }) => {
		if (room == currChat._id) {
			if (message.messageType == "idea") {
				const data = await getData(`/ideas/specificIdea/${message.message}`, "get", true);
				setIdeaMessages(prev => {
					const newMap = new Map(prev);
					newMap.set(sendIdea, data);
					return newMap;
				});
			}
			setMessages(prev => [...prev, message]);
			socket.emit("allRead",{
				reciver: currChat._id,
				userId,
				group: currChat.name ? true : false,
			})
		} else {
			const preUnread = unreadNotifications.find((_, ind) => chats[ind]._id == room);
			if (preUnread == 0) setNoOfSenders(prev => prev+1);
			setNoOfMessages(prev => prev+1);
			setUnreadNotifications(prev => {
				let temp = prev.map((unread, ind) => chats[ind]._id == room ? ++unread : unread);
				return temp;
			})
		};
		const ind = chats.findIndex(chat => chat._id == room);
		if (message.messageType == "text") chats[ind].lastMessage = message.message;
		else if (message.messageType == "idea") chats[ind].lastMessage = "Shared an Idea";
		else if (message.messageType == "image") chats[ind].lastMessage = "Sent an Image";
		else if (message.messageType == "video") chats[ind].lastMessage = "Sent a Video";
		else if (message.messageType == "audio") chats[ind].lastMessage = "Sent an Audio";
		else if (message.messageType == "document") chats[ind].lastMessage = "Shared a Document";
		else if (message.messageType == "voice") chats[ind].lastMessage = "Sent a Voice Message";
		moveToTop(chats,ind);
		moveToTop(temp, ind);
		setVideoCallRequested(prev => {
			moveToTop(prev, ind);
			return prev;
		});
  },[currChat])

  useEffect(() => {
		socket.on("reciveMessage", reciveMessage)
		return () => socket.off("reciveMessage", reciveMessage)
  },[
		socket,
		currChat,
		reciveMessage,
	])
	
  const typing = (msg) => {
		socket.emit("typing",{
			sender: userId,
			reciver: currChat._id,
			messageType: "text",
			// message: msg,
			message: msg.length > 0 ? `${currChat.name ? `${activeUsername} is ` : "" }Typing...` : "",
		});
  }

  const sendStreams = useCallback(async () => {
		const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
		for (const track of stream.getTracks()) peer.peer.addTrack(track, stream);
  }, []);

  const upload = async () => {
		let formData = new FormData();
		formData.append("file",media);
		const { data } = await axios.post("http://localhost:3000/api/v1/images/upload",formData,{
			headers: {
				"Content-Type": "multipart/form-data",
			}
		});
		console.log("data",data);
		if (data.success) return {
			url: data.data.url,
			type: data.data.type,
		};
		else console.log("Check BackEnd");
  }

  const fileChange = async (e) => {
		const file = e.target.files[0];
		setMedia(file);
		const extension = file.name.split(".")[file.name.split(".").length-1];
		if (extension == "pdf") {
			setMedia(null);
			alert("PDFs are not supported");
			return;
		}
		setMessage("Selected "+file.name);
		msgInput.current.disabled = true;
  }

  const selectMedia = () => {
		let input = document.createElement("input");
		input.type = "file";
		input.id = "media";
		document.body.append(input);
		input.onchange = fileChange;
		input.style.display = "none";
		input.click();
  }

  const listen = async () => {
		const stream = await navigator.mediaDevices.getUserMedia({audio: true});
		setListening(true);
		const thisMediaRecorder = new MediaRecorder(stream);
		setMediaRecorder(thisMediaRecorder);
		thisMediaRecorder.ondataavailable = (e) => {
			const audioFile = new File([e.data], 'recording.webm', { type: 'audio/webm' });
			setMedia(audioFile);
			setMessage("Recorded Audio");
			stream.getTracks().forEach(track => track.stop());
		};
		thisMediaRecorder.start();
		setMessage("Listening...");
		msgInput.current.disabled = true;
		console.log("Listening...");
  }

  const stopListening = () => {
		mediaRecorder.stop();
		setListening(false);
  }

  return (
    <div className="h-lvh w-lvw flex p-2 gap-2">
			<ChatProvider
				value={{
					unreadNotifications,
					setUnreadNotifications,
					profileImage,
					setProfileImage,
					username,
					setUsername,
					currChat,
					setCurrChat,
					unreadMessages,
					setUnreadMessages,
				}}
			>
				<VideoCallProvider
					value={{
						onVideoCall,
						setOnVideoCall,
						videoCallRequested,
						setVideoCallRequested,
						videoCallStatus,
						setVideoCallStatus
					}}
				>
					<ChatList
						chats={chats}
						setShow={setShow}
						setFirstName={setFirstName}
						setLastName={setLastName}
						setOriginalUsername={setOriginalUsername}
						setIdeaMessages={setIdeaMessages}
						setMessages={setMessages}
						send={send}
						sendIdea={sendIdea}
						userId={userId}
						defaultChat={defaultChat}
						setUnreadMessages={setUnreadMessages}
						className=""
					/>
					<div
						id="messages"
						style={{backgroundImage: "url(../../../../images/chatbg1.jpg)"}}
						className="h-full border-2 border-black border-solid rounded-2xl flex-grow backdrop-blur-sm bg-cover"
					>
						<div className={`${show ? "flex" : "hidden"} flex-col h-full`}>
							<Messages
								firstName={firstName}
								lastName={lastName}
								gotVideoCall={gotVideoCall}
								messages={messages}
								activeUsername={activeUsername}
								ideaMessages={ideaMessages}
								userId={userId}
								sendStreams={sendStreams}
								originalUsername={originalUsername}
								unreadMessages={unreadMessages}
							/>
							<VideoCalling
								peer={peer}
								sendStreams={sendStreams}
								chats={chats}
								moveToTop={moveToTop}
								setGotVideoCall={setGotVideoCall}
							/>
							<div className="px-1 py-2 flex justify-between border-t-[1px] border-black border-solid h-14 gap-5 items-center">
								<input
									value={message}
									onChange={(e) => {
										setMessage(e.target.value);
										typing(e.target.value);
									}}
									id="input"
									className="rounded-full py-2 px-4 flex-grow"
									type="text"
									placeholder="Type Something..."
									ref={msgInput}
								/>
								{!listening ? 
									<RiMicLine
										onClick={listen}
										size={30}
										className="cursor-pointer"
									/>
									:
									<div
										onClick={stopListening}
										className="relative p-1"
									>
										<div className="h-full w-full rounded-full border-2 border-black absolute top-0 left-0 animate-ping"></div>
										<RiMicFill
											size={30}
											className="cursor-pointer"
										/>
									</div>
								}
								<RiAttachment2
									size={30}
									onClick={selectMedia}
									className="cursor-pointer"
								/>
								<button
									onClick={async () => {
										if (sending) return;
										setSending(true);
										if (!media) send(currChat, message, "text");
										else {
											let { url, type } = await upload();
											if (mediaRecorder) type = "voice";
											console.log("type", type);
											send(currChat, url, type);
											msgInput.current.disabled = false;
											setMedia(null);
											setMediaRecorder(null);
										}
										setSending(false);
									}}
									className="h-full w-24 rounded-full border-2 border-black border-solid flex justify-center items-center"
									ref={sendRef}
								>
									<RiLoaderLine className={`${sending ? "" : "hidden"} animate-spin`}/> <p>{sending ? "Sending" : "Send"}</p>
								</button>
							</div>
						</div>
					</div>
				</VideoCallProvider>
			</ChatProvider>
		</div>
  )
}

export default Chats