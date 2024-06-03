import { RiChatVoiceLine, RiVideoChatLine } from "@remixicon/react";
import axios from "axios"
import { useCallback, useEffect, useRef, useState } from "react";
import { useLoaderData } from "react-router-dom"
import io from "socket.io-client";
import peer from "../../../services/peer.js";
import ReactPlayer from "react-player";

const socket = io.connect("http://localhost:3001");

const Chats = () => {
    const chats = useLoaderData();
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
    const sendRef = useRef(null);
    const msgInput = useRef(null);
    const [onVideoCall, setOnVideoCall] = useState(false);
    const [localStream, setLocalStream] = useState();
    const [gotVideoCall, setGotVideoCall] = useState(false);
    const [gotOffer, setGotOffer] = useState(null);
    useEffect(() => {
        setUnreadNotifications([]);
        for (let chat of chats) {
            setUnreadNotifications(prev => [...prev,chat.members[chat.members.findIndex(member => member.userId.toString() == userId.toString())]?.unread])
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
        if (members.length == 2) {
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
        }
        setCurrChat(chat);
        const { data : { data } } = await axios.get(`http://localhost:3000/api/v1/messages/${chat._id}`,{
            headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
        });
        setMessages(data.messages);
        socket.emit("allRead",{
            reciver: chat._id,
            userId,
        })
        setUnreadNotifications(prev => prev.map((unread,ind) => chats[ind]._id == chat._id ? 0 : unread));
    }
    useEffect(() => {
        let messageEle = document.querySelector("#message");
        messageEle.scrollTop = messageEle.scrollHeight;
    },[messages])
    let id = 0;
    const send = () => {
        if (message.length == 0) {
            return;
        }
        id++;
        setMessages(prev => [...prev,{
            messageType:"text",
            message: message,
            sender: userId,
            _id: id,
        }])
        socket.emit("sendMessage",{
            sender: userId,
            reciver: currChat._id, 
            messageType: "text", 
            message,
        });
        setMessage("");
        typing("");
    }
    useEffect(() => {
        socket.on("reciveMessage", (data) => {
            if (data.room == currChat._id) {
                setMessages(prev => [...prev,data.message]);
                socket.emit("allRead",{
                    reciver: currChat._id,
                    userId,
                })
            } else {
                setUnreadNotifications(prev => prev.map((unread, ind) => chats[ind]._id == data.room ? ++unread : unread));
            }
        })
        socket.on("reciveTyping", (data) => {
            if (data.room == currChat._id) {
                if (data.message.length > 0) {
                    setUsername(data.message);
                } else {
                    // setMessage("");
                    setUsername(originalUsername);
                }
            }
        })
    },[socket, currChat])
    const typing = (msg) => {
        socket.emit("typing",{
            sender: userId,
            reciver: currChat._id,
            messageType: "text",
            // message: msg,
            message: msg.length > 0 ? "Typing..." : "",
        });
    }
    const makeVideoCall = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false});
        const offer = await peer.createOffer();
        socket.emit("makeCall",{reciver: currChat._id, offer});
        setLocalStream(stream);
        setOnVideoCall(true);
    }, [currChat])
    const answerVideoCall = useCallback(async (offer) => {
        const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false});
        setLocalStream(stream);
        const answer = await peer.createAnswer(offer);
        socket.emit("answerCall",{reciver: currChat._id, answer});
    },[currChat, gotOffer]);
    const sendStreams = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false});
        for (const track of stream.getTracks()) {
          peer.peer.addTrack(track, stream);
        }
    }, []);
    useEffect(() => {
        peer.peer.addEventListener("track", async ({streams}) => {
          document.querySelector("#remoteStream").srcObject = streams[0];
        });
      }, []);
    const answerCallEvent = useCallback(async ({offer}) => {
        setGotVideoCall(true);
        setGotOffer(offer);
    },[]);
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
    }, []);
    useEffect(() => {
        socket.on("reciveCall", answerCallEvent)
        socket.on("reciveAnswer", answerResponseEvent)
        socket.on("negotiationNeeded", handleNegoNeedIncomming);
        socket.on("negotiationFinal",handleNegoNeedFinal);
        return () => {
            socket.off("reciveCall", answerCallEvent)
            socket.off("reciveAnswer", answerResponseEvent)
            socket.off("negotiationNeeded", handleNegoNeedIncomming);
            socket.off("negotiationFinal", handleNegoNeedFinal);
        }
    },[socket, answerCallEvent, answerResponseEvent, handleNegoNeedIncomming, handleNegoNeedFinal])
    useEffect(() => {
        document.querySelector("#localStream").srcObject = localStream;
    },[localStream]);
    return (
        <div className="h-lvh w-lvw flex p-2 gap-2">
            <div className="h-full w-60 rounded-2xl border-2 border-black border-solid flex flex-col p-2 backdrop-blur-sm">
                <div className="border-b-2 border-black border-solid pb-1 flex justify-between items-center">
                    <p className="text-xl font-semibold">
                        Chats
                    </p>
                    <div className="rounded-full relative">
                        <input className="rounded-full w-40 bg-transparent border-2 border-black border-solid pl-8" type="search"/>
                        <p className="absolute top-1/2 -translate-y-1/2 left-2">🔎</p>
                    </div>
                </div>
                <div className="flex flex-col">
                    {chats.map((chat,ind) => {
                        const { members } = chat;
                        let profileImage;
                        let firstName;
                        let lastName;
                        if (members.length == 2) {
                            let activeUser = 0;
                            if (members[0].userId.toString() == userId.toString()) {
                                activeUser = 1;
                            }
                            profileImage = members[activeUser].profileImage;
                            firstName = members[activeUser].firstName;
                            lastName = members[activeUser].lastName;
                        }
                        return <div onClick={() => openChat(chat)} key={chat._id} className="py-2 px-1 flex justify-start gap-5 border-b-[1px] border-black border-solid cursor-pointer relative">
                            <div className="h-10 aspect-square object-cover rounded-full relative">
                                <img className="h-full w-full rounded-full" src={profileImage}/>
                                <div className={`absolute -right-1 -top-1 ${unreadNotifications[ind] == 0 ? "hidden" : "flex"} justify-center items-center h-5 aspect-square rounded-full bg-black text-white p-2`}>
                                    <p>{unreadNotifications[ind] >= 10 ? "9+" : unreadNotifications[ind]}</p>
                                </div>
                            </div>
                            <div className="flex flex-col justify-between">
                                <p className="font-semibold">{firstName} {lastName}</p>
                                <p className="text-sm">{chat.lastMessage}</p>
                            </div>
                        </div>
                    })}
                </div>
            </div>
            <div id="messages" style={{backgroundImage: "url(../../../../images/chatbg1.jpg)"}} className="h-full border-2 border-black border-solid rounded-2xl flex-grow backdrop-blur-sm bg-cover">
                <div className={`${show ? "flex" : "hidden"} flex-col h-full`}>
                    <div className="py-2 px-5 flex justify-between items-center border-b-[1px] border-black border-solid">
                        <div className="flex justify-center gap-3">
                            <img className="h-10 aspect-square object-cover rounded-full" src={profileImage}/>
                            <div className="flex flex-col justify-between">
                                <p className="font-semibold">{firstName} {lastName}</p>
                                <p className="text-sm">{username}</p>
                            </div>
                        </div>
                        <div className="flex justify-center gap-5 items-center">
                            {localStream && <button className="cursor-pointer" onClick={sendStreams}>Send Stream</button>}
                            <RiVideoChatLine onClick={() => {
                                if (gotVideoCall) answerVideoCall(gotOffer);
                                else makeVideoCall();
                                setOnVideoCall(prev => !prev);
                            }} color={onVideoCall ? "red" : gotVideoCall ? "green" : "black"} className="scale-x-110 cursor-pointer"/>
                            <RiChatVoiceLine  className="scale-x-110"/>
                        </div>
                    </div>
                    <div id="message" className={`${onVideoCall ? "hidden" : ""} flex-grow w-full overflow-scroll p-2`}>
                        {messages.map(message => {
                            let align = "start";
                            if (userId.toString() == message.sender.toString()) {
                                align = "end";
                            }
                            if (message.messageType == "text") {
                                return <div key={message._id} className={`flex ${align == "start" ? "justify-start" : "justify-end"} mb-1`}>
                                        <p className={`max-w-96 rounded-2xl text-wrap text-white bg-black p-2`}>{message.message}</p>
                                    </div>
                            } else if (message.messageType == "image") {
                                return <div key={message._id} className={`flex ${align == "start" ? "justify-start" : "justify-end"} mb-1`}>
                                        <img src={message.message}/>
                                    </div>
                            } else {
                                return <div key={message._id} className={`flex ${align == "start" ? "justify-start" : "justify-end"} mb-1`}>
                                        <video src={message.message} muted/>
                                    </div>
                            }
                        })}
                    </div>
                    <div className={`${onVideoCall ? "" : "hidden"} flex-grow w-full overflow-scroll p-2 relative`}>
                        <video id="remoteStream" autoPlay playsInline muted className="top-0 left-0 h-[175%] w-[100%] overflow-x-hidden"/>
                        <video id="localStream" autoPlay playsInline muted className="h-1/5 w-1/5 absolute bottom-[1%] right-[-3%]"/>
                    </div>
                    <div className="px-1 py-2 flex justify-between border-t-[1px] border-black border-solid h-14 gap-5">
                        <input value={message} onChange={(e) => {
                            setMessage(e.target.value);
                            typing(e.target.value);
                        }} id="input" className="rounded-full py-2 px-4 flex-grow" type="text" placeholder="Type Something..." ref={msgInput}/>
                        <button onClick={send} className="h-full w-24 rounded-full border-2 border-black border-solid flex justify-center items-center" ref={sendRef}><p>Send</p></button>
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
        chats = data.chats;
    }
    for (let chat of chats) {
        socket.emit("joinRoom",chat._id);
    }
    return chats;
}