import axios from "axios"
import peer from "../../services/peer.js";
import ChatList from "../Components/Chats/ChatList.jsx";
import Messages from "../Components/Chats/Messages.jsx";
import VideoCalling from "../Components/Chats/VideoCalling.jsx";
import { getData } from "../dataLoaders.js";
import { useSocket } from "../../context/socket.js";
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

const StructuredChats = () => {
  let chats = [];
  const { authenticated, chatsAndGroups } = useLoaderData();
  if (authenticated) chats = chatsAndGroups;

  const socket = useSocket();

  for (let chat of chats) socket.emit("joinRoom",chat._id);

  const [unreadNotifications, setUnreadNotifications] = useState([]);
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
  const [localStream, setLocalStream] = useState();
  const [gotVideoCall, setGotVideoCall] = useState(null);
  const [video, setVideo] = useState(false);
  const [audio, setAudio] = useState(false);
  const [videoCallRequested, setVideoCallRequested] = useState([]);
  const [videoCallStatus, setVideoCallStatus] = useState(null);
  const [sent, setSent] = useState(false);
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

  useEffect(() => {
		setUnreadNotifications([]);
		setVideoCallRequested([]);
		for (let chat of chats) {
			setUnreadNotifications(prev => [...prev,chat.members[chat.members.findIndex(member => member.userId.toString() == userId.toString())]?.unread])
			setVideoCallRequested(prev => [...prev,false]);
		}
  },[chats, userId])

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

  useEffect(() => {
		let messageEle = document.querySelector("#message");
		messageEle.scrollTo({
			top: messageEle.scrollHeight,
			behavior: "smooth",
		});
  },[messages])

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
		} else setUnreadNotifications(prev => {
			let temp = prev.map((unread, ind) => chats[ind]._id == room ? ++unread : unread);
			return temp;
		});
		const ind = chats.findIndex(chat => chat._id == room);
		moveToTop(chats,ind);
		moveToTop(temp, ind);
		setVideoCallRequested(prev => {
			moveToTop(prev, ind);
			return prev;
		});
		if (message.messageType == "text") chats[ind].lastMessage = message.message;
		else if (message.messageType == "idea") chats[ind].lastMessage = "Shared an Idea";
		else if (message.messageType == "image") chats[ind].lastMessage = "Sent an Image";
		else if (message.messageType == "video") chats[ind].lastMessage = "Sent a Video";
		else if (message.messageType == "audio") chats[ind].lastMessage = "Sent an Audio";
		else if (message.messageType == "document") chats[ind].lastMessage = "Shared a Document";
		else if (message.messageType == "voice") chats[ind].lastMessage = "Sent a Voice Message";
  },[currChat])

  const reciveTyping = useCallback(({ room, message }) => {
		if (room == currChat._id) {
			if (message.length > 0) setUsername(message);
			else setUsername(originalUsername);
		}
  },[currChat])

  useEffect(() => {
		socket.on("reciveMessage", reciveMessage)
		socket.on("reciveTyping", reciveTyping)
		return () => {
			socket.off("reciveMessage", reciveMessage)
			socket.off("reciveTyping", reciveTyping)
		}
  },[
		socket,
		currChat,
		reciveMessage,
		reciveTyping
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

  const requestVideoCall = useCallback(() => {
		setOnVideoCall(true);
		setVideoCallStatus("Calling");
		socket.emit("requestCall",{reciver: currChat._id});
  },[currChat]);

  const acceptVideoCall = useCallback((id) => {
		setOnVideoCall(true);
		setVideoCallStatus("Ringing")
		setVideoCallRequested(prev => prev.map(_val => false));
		socket.emit("acceptVideoCall",{reciver: id });
  },[]);

  const makeVideoCall = useCallback(async () => {
		setVideoCallStatus("Ringing")
		const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
		const offer = await peer.createOffer();
		socket.emit("makeCall",{reciver: currChat._id, offer});
		setLocalStream(stream);
		setOnVideoCall(true);
  }, [currChat])

  const sendStreams = useCallback(async () => {
		const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
		for (const track of stream.getTracks()) peer.peer.addTrack(track, stream);
  }, []);

  useEffect(() => {
		peer.peer.addEventListener("track", ({streams}) => {
			setVideoCallStatus("connected");
			document.querySelector("#remoteStream").srcObject = streams[0];
		});
	}, []);

  const answerVideoCall = useCallback(async ({offer, reciver}) => {
		setGotVideoCall(reciver);
		const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
		setLocalStream(stream);
		const answer = await peer.createAnswer(offer);
		socket.emit("answerCall",{reciver: currChat._id, answer});
  },[currChat]);

  const answerResponseEvent = useCallback(async ({answer}) => {
		await peer.setAnswer(answer);
		sendStreams();
  },[]);

  const handleNegoNeeded = useCallback(async () => {
		const offer = await peer.createOffer();
		socket.emit("negotiationNeeded", { reciver: currChat._id, offer});
  }, [currChat, socket]);

  useEffect(() => {
		peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
		return () => peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(async ({ offer }) => {
		const answer = await peer.createAnswer(offer);
		socket.emit("negotiationDone", { reciver: currChat._id, answer});
  },[
		socket,
		currChat
	]);

  const handleNegoNeedFinal = useCallback(async ({ answer }) => {
		await peer.setAnswer(answer);
		socket.emit("requestStream", { reciver: currChat._id });
  }, [currChat, socket]);

  const leaveCall = useCallback(() => {
		if (localStream) localStream.getTracks().forEach(track => track.stop());
		setLocalStream(null);
		setOnVideoCall(false);
		setGotVideoCall(null);
		setVideoCallStatus(null);
  },[localStream]);

  const videoCallRequestEvent = useCallback(({ reciver }) => {
		setVideoCallRequested(prev => {
			let temp = prev.map((val, ind) => chats[ind]._id == reciver ? true : val)
			const ind = chats.findIndex(chat => chat._id == reciver);
			moveToTop(chats,ind);
			moveToTop(temp, ind);
			setUnreadNotifications(prev => {
				moveToTop(prev, ind);
				return prev;
			})
			return temp;
		});
  },[]);

  const handleCallRejected = useCallback(({ chatId }) => {
    setVideoCallRequested(prev => prev.map((val,ind) => chats[ind]._id == chatId ? false : val));
  },[]);

  useEffect(() => {
		socket.on("callRequested", videoCallRequestEvent);
		socket.on("videoCallAccepted", makeVideoCall)
		socket.on("callRejected", handleCallRejected);
		socket.on("reciveCall", answerVideoCall)
		socket.on("reciveAnswer", answerResponseEvent)
		socket.on("negotiationNeeded", handleNegoNeedIncomming);
		socket.on("negotiationFinal",handleNegoNeedFinal);
		socket.on("leaveCall", leaveCall);
		return () => {
			socket.off("callRequested", videoCallRequestEvent);
			socket.off("videoCallAccepted", makeVideoCall)
			socket.off("callRejected", handleCallRejected);
			socket.off("reciveCall", answerVideoCall)
			socket.off("reciveAnswer", answerResponseEvent)
			socket.off("negotiationNeeded", handleNegoNeedIncomming);
			socket.off("negotiationFinal", handleNegoNeedFinal);
			socket.off("leaveCall", leaveCall);
		}
  },[
		socket,
		videoCallRequestEvent,
		makeVideoCall,
		handleCallRejected,
		answerVideoCall,
		answerResponseEvent,
		handleNegoNeedIncomming,
		handleNegoNeedFinal,
		leaveCall
	])

  useEffect(() => {
		document.querySelector("#localStream").srcObject = localStream;
		if (!localStream) return;
		const videoTrack = localStream.getTracks().find(track => track.kind == "video");
		if (videoTrack) setVideo(videoTrack.enabled);
		const audioTrack = localStream.getTracks().find(track => track.kind == "audio");
		if (audioTrack) setAudio(audioTrack.enabled);
  },[localStream]);

  const toggleVideo = () => {
		const videoTrack = localStream.getTracks().find(track => track.kind == "video");
		videoTrack.enabled = !videoTrack.enabled;
		setVideo(videoTrack.enabled);
		peer.peer.getSenders().find(sender => sender.track.kind == "video").replaceTrack(videoTrack);
  }

  const toggleAudio = () => {
		const audioTrack = localStream.getTracks().find(track => track.kind == "audio");
		audioTrack.enabled = !audioTrack.enabled;
		setAudio(audioTrack.enabled);
		peer.peer.getSenders().find(sender => sender.track.kind == "audio").replaceTrack(audioTrack);
  }

  useEffect(() => {
		document.addEventListener("beforunload", leaveCall);
		return () => document.removeEventListener("beforunload", leaveCall);
  },[])

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
			<ChatList
				chats={chats}
				setShow={setShow}
				setFirstName={setFirstName}
				setLastName={setLastName}
				setOriginalUsername={setOriginalUsername}
				setProfileImage={setProfileImage}
				setUsername={setUsername}
				setCurrChat={setCurrChat}
				setIdeaMessages={setIdeaMessages}
				unreadNotifications={unreadNotifications}
				setUnreadNotifications={setUnreadNotifications}
				setMessages={setMessages}
				send={send}
				sendIdea={sendIdea}
				sent={sent}
				setSent={setSent}
				acceptVideoCall={acceptVideoCall}
				videoCallRequested={videoCallRequested}
				userId={userId}
				className=""
			/>
			<div
				id="messages"
				style={{backgroundImage: "url(../../../../images/chatbg1.jpg)"}}
				className="h-full border-2 border-black border-solid rounded-2xl flex-grow backdrop-blur-sm bg-cover"
			>
				<div className={`${show ? "flex" : "hidden"} flex-col h-full`}>
					<Messages
						currChatName={currChat.name}
						username={username}
						profileImage={profileImage}
						firstName={firstName}
						lastName={lastName}
						gotVideoCall={gotVideoCall}
						currChatId={currChat._id}
						onVideoCall={onVideoCall}
						messages={messages}
						activeUsername={activeUsername}
						ideaMessages={ideaMessages}
						userId={userId}
						sendStreams={sendStreams}
						requestVideoCall={requestVideoCall}
					/>
					<VideoCalling
						onVideoCall={onVideoCall}
						videoCallStatus={videoCallStatus}
						profileImage={profileImage}
						toggleVideo={toggleVideo}
						toggleAudio={toggleAudio}
						video={video}
						audio={audio}
						localStream={localStream}
						currChatId={currChat._id}
						peer={peer}
						leaveCall={leaveCall}
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
		</div>
  )
}

export default StructuredChats