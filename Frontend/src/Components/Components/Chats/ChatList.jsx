import { toast } from "sonner"
import { Link } from "react-router-dom";
import { getData } from "../../../dataLoaders";
import { useUser } from "../../../context/user";
import { useChat } from "../../../context/chats";
import { useSocket } from "../../../context/socket";
import { useVideoCall } from "../../../context/videoCall";
import { useNotification } from "../../../context/notifications";
import {
  House,
  Loader,
  Video
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState
} from "react";

const ChatList = ({
  chats,
  setShow,
  setFirstName,
  setLastName,
  setOriginalUsername,
  setIdeaMessages,
  setMessages,
  send,
  sendIdea,
  defaultChat,
  setUnreadMessages,
  loading,
  setLoadingMessages,
  className 
}) => {
  const socket = useSocket();

  const {
    setProfileImage,
    setUsername,
    setCurrChat,
    unreadNotifications,
    setUnreadNotifications
  } = useChat();

  const {
    videoCallRequested,
    setOnVideoCall,
    setVideoCallStatus,
    setVideoCallRequested
  } = useVideoCall();

  const {
    setNoOfMessages,
    setNoOfSenders
  } = useNotification();

  const { id } = useUser();

  const [chatSearch, setChatSearch] = useState("");
  const [displayChats, setDisplayChats] = useState(chats);
  const [sent, setSent] = useState(false);

  useEffect(() => {
		setUnreadNotifications([]);
		setVideoCallRequested([]);
		for (let chat of chats) {
			setUnreadNotifications(prev => [...prev,chat.members[chat.members.findIndex(member => member.userId.toString() == id.toString())]?.unread])
			setVideoCallRequested(prev => [...prev,false]);
		}
  },[chats, id])

  const acceptVideoCall = useCallback((id) => {
		setOnVideoCall(true);
		setVideoCallStatus("Ringing")
		setVideoCallRequested(prev => prev.map(_val => false));
		socket.emit("acceptVideoCall",{reciver: id });
  },[]);

  const openChat = async (chat) => {
    try {
      setLoadingMessages(true);
      document.querySelector("#messages").style.backgroundImage = "none";
      setShow(true);
      const { members } = chat;
      if (!chat.name) {
        let activeUser = 0;
        if (members[0].userId.toString() == id.toString()) activeUser = 1;
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
      if (chat.name) chatType = "group";
      const { messages } = await getData(`/messages/${chat._id}?chatType=${chatType}`, "get", true);
      for (let message of messages) {
        const { messageType } = message
        if (messageType == "idea") {
          const data = await getData(`/ideas/specificIdea/${message.message}`, "get", true);
          setIdeaMessages(prev => {
            prev.set(message.message, data);
            return prev;
          });
        }
      }
      socket.emit("allRead",{
        reciver: chat._id,
        id,
        group: chat.name ? true : false,
      })
      const preUnread = unreadNotifications.find((_,ind) => chats[ind]._id == chat._id);
      if (preUnread > 0) {
        setNoOfMessages(prev => prev - preUnread);
        setNoOfSenders(prev => prev - 1);
      }
      setUnreadMessages(unreadNotifications.find((_,ind) => chats[ind]._id == chat._id));
      setUnreadNotifications(prev => prev.map((unread,ind) => chats[ind]._id == chat._id ? 0 : unread));
      setMessages(messages);
      if (sendIdea && !sent) {
        const toastId = toast.loading("Sending Idea");
        await getData(`/ideas/share/${sendIdea}`, "get", true);
        const data = await getData(`/ideas/specificIdea/${sendIdea}`, "get", true);
        setIdeaMessages(prev => {
          const newMap = new Map(prev);
          newMap.set(sendIdea, data);
          return newMap;
        });
        send(chat, sendIdea, "idea");
        setSent(true);
        toast.success("Idea Shared", { id : toastId });
      }
      setLoadingMessages(false);
    } catch (error) {
      toast.error(error.response.data.message || "Failed to open chat", { position: "top-right" });
    }
  }

  useEffect(() => {
    if (defaultChat && chats.length > 0 && id) {
      const ind = chats.findIndex(chat => !chat.name ? chat.members[0].userId.toString() == defaultChat.toString() || chat.members[1].userId.toString() == defaultChat.toString() : chat._id == defaultChat);
      if (ind != -1) openChat(chats[ind]);
    }
  },[chats, defaultChat, id])

  useEffect(() => {
    const toSearch = chatSearch.trim().replace(/ +/g," ").toLowerCase();
    if (toSearch.length == 0) setDisplayChats(chats);
    else {
      setDisplayChats(chats.filter(chat => {
        if (chat.name) return chat.name.toLowerCase().includes(toSearch);
        else {
          let thisUser = 0;
          if (chat.members[0].userId.toString() == id.toString()) thisUser = 1;
          thisUser = chat.members[thisUser];
          const matchString = thisUser.firstName.toLowerCase()+" "+thisUser.lastName.toLowerCase()+":"+thisUser.username.toLowerCase();
          return matchString.includes(toSearch);
        }
      }));
  };
  },[chatSearch, chats])
  return (
    <div className={`bg-[#797270] h-full w-72 rounded-2xl flex flex-col p-2 ${className}`}>
      <div className="border-b-2 border-black border-solid pb-1 flex justify-between items-center">
        <Link
          to="/ideas"
          className="hover:bg-[#B0C0BC] p-1 rounded-full bg-[#C1EDCC]"
        >
          <House/>
        </Link>
        <p className="text-xl font-semibold">
          Chats
        </p>
        <div className="rounded-full relative">
          <input
            value={chatSearch}
            onChange={(e) => setChatSearch(e.target.value)}
            placeholder="Search Chats"
            className="rounded-full w-40 bg-[#C1EDCC] pl-8 placeholder:text-black/90 text-black"
            type="search"
          />
          <p className="absolute top-1/2 -translate-y-1/2 left-2">🔎</p>
        </div>
      </div>
      {loading ?
        <div className="flex justify-center items-center h-full w-full">
          <Loader className="animate-spin h-10 w-10"/>
        </div>
        :
        <div className="flex flex-col gap-2 py-2">
          {displayChats.map((chat,ind) => {
            const { members } = chat;
            let profileImage;
            let firstName;
            let lastName;
            if (!chat.name) {
              let activeUser = 0;
              if (members[0].userId.toString() == id.toString()) activeUser = 1;
              profileImage = members[activeUser].profileImage;
              firstName = members[activeUser].firstName;
              lastName = members[activeUser].lastName;
            } else {
              profileImage = chat.profileImage;
              firstName = chat.name;
              lastName = "";
            }
            return (
              <div
                onClick={() => openChat(chat)}
                key={chat._id}
                className="bg-[#908D8D] rounded-2xl cursor-pointer flex justify-between items-center relative hover:bg-[#A7A7A9]"
              >
                <div className="py-2 px-1 flex justify-start gap-5 relative">
                  <div className="h-10 aspect-square object-cover rounded-full relative">
                    <img
                      className="h-full w-full rounded-full"
                      src={profileImage}
                    />
                    <div className={`absolute -right-1 -top-1 ${unreadNotifications[ind] == 0 ? "hidden" : "flex"} justify-center items-center h-5 aspect-square rounded-full bg-[#C1EDCC] text-black p-2`}>
                      <p>{unreadNotifications[ind] >= 10 ? "9+" : unreadNotifications[ind]}</p>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between">
                    <p className="font-semibold">{firstName} {lastName}</p>
                    <p className={`text-sm ${unreadNotifications[ind] > 0 ? "font-semibold" : ""}`}>{chat.lastMessage.length > 21 ? chat.lastMessage.slice(0,18)+"..." : chat.lastMessage}</p>
                  </div>
                </div>
                <Video
                  onClick={() => acceptVideoCall(chat._id)}
                  className={`${videoCallRequested[ind] ? "" : "hidden"} absolute left-[90%] -translate-x-1/2 animate-connecting-md bg-[#C1EDCC] rounded-full`}
                />
              </div>
            )
          })}
        </div>
      }
    </div>
  )
}

export default ChatList