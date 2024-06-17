import {
    RiVideoChatLine,
    RiVideoOnLine,
    RiVideoOffFill,
    RiMicFill,
    RiMicOffFill,
    RiPhoneFill,
    RiHome5Line,
    RiAttachment2,
    RiDownloadLine,
    RiLoaderLine
} from "@remixicon/react";
import axios from "axios"
import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { Link, useLoaderData, useLocation } from "react-router-dom"
import io from "socket.io-client";
import peer from "../../services/peer.js";
import Idea from "../Components/Idea.jsx";

const socket = io.connect("http://localhost:3001");

const Chats = () => {
    const chats = useLoaderData();
    const [displayChats, setDisplayChats] = useState(chats);
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
    const [chatSearch, setChatSearch] = useState("");
    const [onVideoCall, setOnVideoCall] = useState(false);
    const [localStream, setLocalStream] = useState();
    const [gotVideoCall, setGotVideoCall] = useState(null);
    const [video, setVideo] = useState(false);
    const [audio, setAudio] = useState(false);
    const [videoCallRequested, setVideoCallRequested] = useState([]);
    const [videoCallStatus, setVideoCallStatus] = useState(null);
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
    const [sent, setSent] = useState(false);
    const [ideaMessages, setIdeaMessages] = useState(new Map());
    const [media, setMedia] = useState(null);
    const [sending, setSending] = useState(false);
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
            const { data: { data } } = await axios.get("http://localhost:3000/api/v1/users/activeUser", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });
            if (data.authenticated) {
                setUserId(data.user._id);
                setActiveUsername(data.user.username);
            }
        };
        getUserId();
        msgInput.current.addEventListener("keyup", (e) => {
            if (e.key == "Enter") {
                sendRef.current.click();
            }
        });
    })
    const openChat = async (chat) => {
        document.querySelector("#messages").style.backgroundImage = "none";
        setShow(true);
        const { members } = chat;
        if (!chat.name) {
            let activeUser = 0;
            if (members[0].userId.toString() == userId.toString()) {
                activeUser = 1;
            }
            const { profileImage, firstName, lastName, username } = members[activeUser];
            setProfileImage(profileImage);
            setFirstName(firstName);
            setLastName(lastName);
            setUsername(username);
            setOriginalUsername(username);
        } else {
            const { profileImage, name } = chat;
            setProfileImage(profileImage);
            setFirstName(name);
            setLastName("");
            setUsername("");
            setOriginalUsername("");
        }
        setCurrChat(chat);
        let chatType = "chat";
        if (chat.name) {
            chatType = "group";
        }
        const { data : { data } } = await axios.get(`http://localhost:3000/api/v1/messages/${chat._id}?chatType=${chatType}`,{
            headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
        });
        for (let message of data.messages) {
            if (message.messageType == "idea") {
                const { data : { data } } = await axios.get(`http://localhost:3000/api/v1/ideas/specificIdea/${message.message}`,{
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                });
                setIdeaMessages(prev => {
                    prev.set(message.message, data);
                    return prev;
                });
            }
        }
        socket.emit("allRead",{
            reciver: chat._id,
            userId,
            group: chat.name ? true : false,
        })
        setUnreadNotifications(prev => prev.map((unread,ind) => chats[ind]._id == chat._id ? 0 : unread));
        setMessages(data.messages);
        if (sendIdea && !sent) {
            await axios.get(`http://localhost:3000/api/v1/ideas/share/${sendIdea}`,{
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`
                }
            });
            const { data : { data } } = await axios.get(`http://localhost:3000/api/v1/ideas/specificIdea/${sendIdea}`,{
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });
            setIdeaMessages(prev => {
                const newMap = new Map(prev);
                newMap.set(sendIdea, data);
                return newMap;
            });
            send(chat, sendIdea, "idea");
        }
    }
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
        if (thisMessage.length == 0) {
            return;
        }
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
                const { data : { data } } = await axios.get(`http://localhost:3000/api/v1/ideas/specificIdea/${message.message}`,{
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                });
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
            const ind = chats.findIndex(chat => chat._id == room);
            moveToTop(chats,ind);
            moveToTop(temp, ind);
            setVideoCallRequested(prev => {
                moveToTop(prev, ind);
                return prev;
            })
            return temp;
        });
        const ind = chats.findIndex(chat => chat._id == room);
        if (message.messageType == "text") chats[ind].lastMessage = message.message;
        else if (message.messageType == "idea") chats[ind].lastMessage = "Shared an Idea";
        else if (message.messageType == "image") chats[ind].lastMessage = "Sent an Image";
        else if (message.messageType == "video") chats[ind].lastMessage = "Sent a Video";
        else if (message.messageType == "audio") chats[ind].lastMessage = "Sent an Audio";
        else if (message.messageType == "document") chats[ind].lastMessage = "Shared a Document";
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
    },[socket, currChat, reciveMessage, reciveTyping])
    const typing = (msg) => {
        socket.emit("typing",{
            sender: userId,
            reciver: currChat._id,
            messageType: "text",
            // message: msg,
            message: msg.length > 0 ? `${currChat.name ? `${activeUsername} is ` : "" }Typing...` : "",
        });
    }
    useEffect(() => {
        const toSearch = chatSearch.trim().replace(/ +/g," ").toLowerCase();
        if (toSearch.length == 0) setDisplayChats(chats);
        else {
            setDisplayChats(chats.filter(chat => {
                if (chat.name) return chat.name.toLowerCase().includes(toSearch);
                else {
                    let thisUser = 0;
                    if (chat.members[0].userId.toString() == userId.toString()) thisUser = 1;
                    thisUser = chat.members[thisUser];
                    const matchString = thisUser.firstName.toLowerCase()+" "+thisUser.lastName.toLowerCase()+":"+thisUser.username.toLowerCase();
                    return matchString.includes(toSearch);
                }
            }));
        };
    },[chatSearch, chats])
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
        for (const track of stream.getTracks()) {
          peer.peer.addTrack(track, stream);
        }
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
        return () => {
          peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
        };
    }, [handleNegoNeeded]);
    const handleNegoNeedIncomming = useCallback(async ({ offer }) => {
        const answer = await peer.createAnswer(offer);
        socket.emit("negotiationDone", { reciver: currChat._id, answer});
    },[socket, currChat]);
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
    },[socket, videoCallRequestEvent, makeVideoCall, handleCallRejected, answerVideoCall, answerResponseEvent, handleNegoNeedIncomming, handleNegoNeedFinal, leaveCall])
    useEffect(() => {
        document.querySelector("#localStream").srcObject = localStream;
        if (!localStream) return;
        const videoTrack = localStream.getTracks().find(track => track.kind == "video");
        if (videoTrack) {
            setVideo(videoTrack.enabled);
        }
        const audioTrack = localStream.getTracks().find(track => track.kind == "audio");
        if (audioTrack) {
            setAudio(audioTrack.enabled);
        }
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
        return () => {
            document.removeEventListener("beforunload", leaveCall);
        }
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
    return (
        <div className="h-lvh w-lvw flex p-2 gap-2">
            <div className="h-full w-72 rounded-2xl border-2 border-black border-solid flex flex-col p-2 backdrop-blur-sm">
                <div className="border-b-2 border-black border-solid pb-1 flex justify-between items-center">
                    <Link to="/ideas" className="hover:scale-105"><RiHome5Line/></Link>
                    <p className="text-xl font-semibold">
                        Chats
                    </p>
                    <div className="rounded-full relative">
                        <input value={chatSearch} onChange={(e) => setChatSearch(e.target.value)} placeholder="Search Chats" className="rounded-full w-40 bg-transparent border-2 border-black border-solid pl-8" type="search"/>
                        <p className="absolute top-1/2 -translate-y-1/2 left-2">🔎</p>
                    </div>
                </div>
                <div className="flex flex-col">
                    {displayChats.map((chat,ind) => {
                        const { members } = chat;
                        let profileImage;
                        let firstName;
                        let lastName;
                        if (!chat.name) {
                            let activeUser = 0;
                            if (members[0].userId.toString() == userId.toString()) {
                                activeUser = 1;
                            }
                            profileImage = members[activeUser].profileImage;
                            firstName = members[activeUser].firstName;
                            lastName = members[activeUser].lastName;
                        } else {
                            profileImage = chat.profileImage;
                            firstName = chat.name;
                            lastName = "";
                        }
                        return (
                            <div onClick={() => openChat(chat)} key={chat._id} className="border-b-[1px] border-black border-solid cursor-pointer flex justify-between items-center relative hover:scale-105">
                                <div className="py-2 px-1 flex justify-start gap-5 relative">
                                    <div className="h-10 aspect-square object-cover rounded-full relative">
                                        <img className="h-full w-full rounded-full" src={profileImage}/>
                                        <div className={`absolute -right-1 -top-1 ${unreadNotifications[ind] == 0 ? "hidden" : "flex"} justify-center items-center h-5 aspect-square rounded-full bg-black text-white p-2`}>
                                            <p>{unreadNotifications[ind] >= 10 ? "9+" : unreadNotifications[ind]}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-between">
                                        <p className="font-semibold">{firstName} {lastName}</p>
                                        <p className={`text-sm ${unreadNotifications[ind] > 0 ? "font-semibold" : ""}`}>{chat.lastMessage.length > 21 ? chat.lastMessage.slice(0,18)+"..." : chat.lastMessage}</p>
                                    </div>
                                </div>
                                <RiVideoOnLine onClick={() => acceptVideoCall(chat._id)} color="green" className={`${videoCallRequested[ind] ? "" : "hidden"} absolute left-[90%] -translate-x-1/2 animate-connecting-md bg-[rgba(0,255,0,0.7)] rounded-full`}/>
                            </div>
                        )
                    })}
                </div>
            </div>
            <div id="messages" style={{backgroundImage: "url(../../../../images/chatbg1.jpg)"}} className="h-full border-2 border-black border-solid rounded-2xl flex-grow backdrop-blur-sm bg-cover">
                <div className={`${show ? "flex" : "hidden"} flex-col h-full`}>
                    <div className="py-2 px-5 flex justify-between items-center border-b-[1px] border-black border-solid">
                        <div className="flex justify-center gap-3">
                            <Link to={currChat.name ? "" : `/profile/${username}`} className="h-10 rounded-full">
                                <img className="h-full aspect-square object-cover rounded-full" src={profileImage}/>
                            </Link>
                            <div className="flex flex-col justify-between">
                                <p className="font-semibold">{firstName} {lastName}</p>
                                <p className="text-sm">{username}</p>
                            </div>
                        </div>
                        <div className={`${currChat.name ? "hidden" : "flex"} justify-center gap-5 items-center hover:scale-110`}>
                            <RiVideoChatLine id="videoCallIcon" size={30} onClick={() => {
                                if (gotVideoCall) {
                                    if (currChat._id == gotVideoCall) sendStreams();
                                }
                                else requestVideoCall();
                            }} color={onVideoCall ? "red" : gotVideoCall ? "green" : "black"} className="scale-x-110 cursor-pointer"/>
                        </div>
                    </div>
                    <div id="message" className={`${onVideoCall ? "hidden" : ""} flex-grow w-full overflow-scroll p-2`}>
                        {messages.map((message, ind) => {
                            let align = "start";
                            if (userId.toString() == message.sender.toString()) {
                                align = "end";
                            }
                            if (message.messageType == "text") {
                                return <div key={message._id} className={`flex flex-col ${align == "start" ? "items-start" : "items-end"} mb-1`}>
                                        <p className={`max-w-96 rounded-2xl text-wrap text-white bg-black p-2`}>{message.message}</p>
                                        <p className={`${(ind < messages.length-1 && messages[ind+1].sender == message.sender) ? "hidden" : ""} text-sm font-light bg-gray-600 rounded-full px-2 py-1 mt-1`}>{message.senderUsername == activeUsername ? "You" : message.senderUsername}</p>
                                    </div>
                            } else if (message.messageType == "image") {
                                return <div key={message._id} className={`flex flex-col ${align == "start" ? "items-start" : "items-end"} mb-1`}>
                                        <div className="max-w-96 relative">
                                            <RiDownloadLine
                                                size={30}
                                                color="white"
                                                className={`p-1 cursor-pointer bg-gray-600 rounded-lg absolute ${align == "start" ? "left-[101%]" : "hidden"}`}
                                                onClick={async () => {
                                                    try {
                                                        const response = await fetch(message.message);
                                                        const blob = await response.blob();
                                                        const url = URL.createObjectURL(blob);
                                                        let a = document.createElement("a");
                                                        a.href = url;
                                                        a.download = currChat.name ? `${currChat.name}-${message._id}` : `${username}-${message._id}`;
                                                        document.body.appendChild(a);
                                                        a.click();
                                                        document.body.removeChild(a);
                                                        URL.revokeObjectURL(url);
                                                    } catch (error) {
                                                        console.error("Failed to download image", error);
                                                    }
                                                }}
                                            />
                                            <img className="w-full rounded-2xl" src={message.message}/>
                                        </div>
                                        <p className={`${(ind < messages.length-1 && messages[ind+1].sender == message.sender) ? "hidden" : ""} text-sm font-light bg-gray-600 rounded-full px-2 py-1 mt-1`}>{message.senderUsername == activeUsername ? "You" : message.senderUsername}</p>
                                    </div>
                            } else if (message.messageType == "video") {
                                return <div key={message._id} className={`flex flex-col ${align == "start" ? "items-start" : "items-end"} mb-1`}>
                                        <div className="max-w-96 relative">
                                            <RiDownloadLine
                                                size={30}
                                                color="white"
                                                className={`p-1 cursor-pointer bg-gray-600 rounded-lg absolute ${align == "start" ? "left-[101%]" : "hidden"}`}
                                                onClick={async () => {
                                                    try {
                                                        const response = await fetch(message.message);
                                                        const blob = await response.blob();
                                                        const url = URL.createObjectURL(blob);
                                                        let a = document.createElement("a");
                                                        a.href = url;
                                                        a.download = currChat.name ? `${currChat.name}-${message._id}` : `${username}-${message._id}`;
                                                        document.body.appendChild(a);
                                                        a.click();
                                                        document.body.removeChild(a);
                                                        URL.revokeObjectURL(url);
                                                    } catch (error) {
                                                        console.error("Failed to download image", error);
                                                    }
                                                }}
                                            />
                                            <video controls className="w-full rounded-2xl" src={message.message}/>
                                        </div>
                                        <p className={`${(ind < messages.length-1 && messages[ind+1].sender == message.sender) ? "hidden" : ""} text-sm font-light bg-gray-600 rounded-full px-2 py-1 mt-1`}>{message.senderUsername == activeUsername ? "You" : message.senderUsername}</p>
                                    </div>
                            } else if (message.messageType == "audio") {
                                return <div key={message._id} className={`flex flex-col ${align == "start" ? "items-start" : "items-end"} mb-1`}>
                                        <div className="w-72 relative">
                                            <RiDownloadLine
                                                size={30}
                                                color="white"
                                                className={`p-1 cursor-pointer bg-gray-600 rounded-lg absolute ${align == "start" ? "left-[101%]" : "hidden"}`}
                                                onClick={async () => {
                                                    try {
                                                        const response = await fetch(message.message);
                                                        const blob = await response.blob();
                                                        const url = URL.createObjectURL(blob);
                                                        let a = document.createElement("a");
                                                        a.href = url;
                                                        a.download = currChat.name ? `${currChat.name}-${message._id}` : `${username}-${message._id}`;
                                                        document.body.appendChild(a);
                                                        a.click();
                                                        document.body.removeChild(a);
                                                        URL.revokeObjectURL(url);
                                                    } catch (error) {
                                                        console.error("Failed to download image", error);
                                                    }
                                                }}
                                            />
                                            <audio controls className="w-full rounded-2xl" src={message.message}/>
                                        </div>
                                        <p className={`${(ind < messages.length-1 && messages[ind+1].sender == message.sender) ? "hidden" : ""} text-sm font-light bg-gray-600 rounded-full px-2 py-1 mt-1`}>{message.senderUsername == activeUsername ? "You" : message.senderUsername}</p>
                                    </div>
                            } else if (message.messageType == "idea") {
                                return <div key={message._id} className={`flex flex-col ${align == "start" ? "items-start" : "items-end"} mb-1`}>
                                        <Idea thisIdea={ideaMessages.get(message.message)}/>
                                        <p className={`${(ind < messages.length-1 && messages[ind+1].sender == message.sender) ? "hidden" : ""} text-sm font-light bg-gray-600 rounded-full px-2 py-1 mt-1`}>{message.senderUsername == activeUsername ? "You" : message.senderUsername}</p>
                                    </div>
                            } else {
                                const urlSplit = message.message.split("/");
                                const fileName = urlSplit[urlSplit.length-1];
                                return (
                                    <div key={message._id} className={`flex flex-col ${align == "start" ? "items-start" : "items-end"} mb-1`}>
                                        <div className="bg-gray-600 rounded-md flex justify-center items-center p-2 gap-4">
                                            <RiDownloadLine
                                                size={30}
                                                color="white"
                                                className={`${message.senderUsername == activeUsername ? "hidden" : ""} p-1 cursor-pointer bg-black rounded-md`}
                                                onClick={async () => {
                                                    try {
                                                        const response = await fetch(message.message);
                                                        const blob = await response.blob();
                                                        const url = URL.createObjectURL(blob);
                                                        let a = document.createElement("a");
                                                        a.href = url;
                                                        a.download = currChat.name ? `${currChat.name}-${message._id}` : `${username}-${message._id}`;
                                                        document.body.appendChild(a);
                                                        a.click();
                                                        document.body.removeChild(a);
                                                        URL.revokeObjectURL(url);
                                                    } catch (error) {
                                                        console.error("Failed to download image", error);
                                                    }
                                                }}
                                            />
                                            <p className="font-semibold text-md text-wrap">{`${message.senderUsername == activeUsername ? "Shared " : ""}${fileName}`}</p>
                                        </div>
                                        <p className={`${(ind < messages.length-1 && messages[ind+1].sender == message.sender) ? "hidden" : ""} text-sm font-light bg-gray-600 rounded-full px-2 py-1 mt-1`}>{message.senderUsername == activeUsername ? "You" : message.senderUsername}</p>
                                    </div>
                                )
                            }
                        })}
                    </div>
                    <div className={`${onVideoCall ? "" : "hidden"} flex-grow w-full overflow-hidden p-2 relative`}>
                        <div className={`h-full w-full ${(videoCallStatus && (videoCallStatus != "connected")) ? "flex" : "hidden"} flex-col gap-2 justify-center items-center`}>
                            <div className="h-1/4 aspect-square flex justify-center items-center relative">
                                <img src={profileImage} className="aspect-square rounded-full h-full animate-connecting-lg" />
                                <p className="text-lg font-semibold absolute -bottom-12">{videoCallStatus}...</p>
                            </div>
                        </div>
                        <video id="remoteStream" autoPlay playsInline className={`${videoCallStatus == "connected" ? "" : "hidden" } top-0 left-0 h-full w-full scale-[1.81]`}/>
                        <video id="localStream" autoPlay playsInline className="h-1/5 w-1/5 absolute bottom-[1%] right-[-3%]"/>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-10 pb-5">
                            <div className="cursor-pointer p-2 rounded-full border-2 border-black bg-white/50 hover:bg-white">
                                <RiVideoOnLine size={36} onClick={toggleVideo} className={`${video ? "" : "hidden"}`} />
                                <RiVideoOffFill size={36} onClick={toggleVideo} className={`${video ? "hidden" : ""}`}/>
                            </div>
                            <div className="cursor-pointer p-2 rounded-full border-2 border-black bg-white/50 hover:bg-white">
                                <RiMicFill size={36} onClick={toggleAudio} className={`${audio ? "" : "hidden"}`}/>
                                <RiMicOffFill size={36} onClick={toggleAudio} className={`${audio ? "hidden" : ""}`}/>
                            </div>
                            <div className="cursor-pointer p-2 rounded-full border-2 border-black bg-white/50 hover:bg-white">
                                <RiPhoneFill size={36} color="red" onClick={() => {
                                    if (!localStream) socket.emit("rejectCall", {reciver: currChat._id});
                                    else {
                                        peer.disconnect();
                                        socket.emit("leaveCall", {reciver: currChat._id});
                                    }
                                    leaveCall();
                                }}/>
                            </div>
                        </div>
                    </div>
                    <div className="px-1 py-2 flex justify-between border-t-[1px] border-black border-solid h-14 gap-5 items-center">
                        <input value={message} onChange={(e) => {
                            setMessage(e.target.value);
                            typing(e.target.value);
                        }} id="input" className="rounded-full py-2 px-4 flex-grow" type="text" placeholder="Type Something..." ref={msgInput}/>
                        <RiAttachment2 size={30} onClick={selectMedia} className="cursor-pointer"/>
                        <button onClick={async () => {
                            if (sending) return;
                            setSending(true);
                            if (!media) send(currChat, message, "text");
                            else {
                                const { url, type } = await upload();
                                console.log("type", type);
                                send(currChat, url, type);
                                msgInput.current.disabled = false;
                                setMedia(null);
                            }
                            setSending(false);
                        }} className="h-full w-24 rounded-full border-2 border-black border-solid flex justify-center items-center" ref={sendRef}><RiLoaderLine className={`${sending ? "" : "hidden"} animate-spin`}/><p>{sending ? "Sending" : "Send"}</p></button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Chats

export const getChats = async () => {
    const { data : { data } } = await axios.get(`http://localhost:3000/api/v1/chats`,{
        headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
    });
    let chats = [];
    if (data.authenticated) {
        chats = data.chatsAndGroups;
    }
    for (let chat of chats) {
        socket.emit("joinRoom",chat._id);
    }
    return chats;
}