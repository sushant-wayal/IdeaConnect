import { useEffect, useState } from "react";
import { useNotification } from "../../context/notifications"
import { getData } from "../dataLoaders";
import SideNav from "../Components/General/SideNav";
import TopNav from "../Components/General/TopNav";
import Footer from "../Components/General/Footer";
import { useSocket } from "../../context/socket";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const Notification = ({}) => {
  const socket = useSocket();

  const navigate = useNavigate();

  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const unread = query.get("unread") || 0;

  const { notifications, setNotifications, setUnreadNotifications } = useNotification();
  useEffect(() => {
    const getNotifications = async () => {
      const { notifications } = await getData("/notifications", "get", true);
      setNotifications(notifications);
    }
    getNotifications();
  },[]);
  useEffect(() => {
    setUnreadNotifications(0);
    socket.emit("seenNotification", { notificationId: notifications[0]?._id });
  },[notifications, socket])

  const [activeUsername, setActiveUsername] = useState("");
  const [activeUserId, setActiveUserId] = useState("");
  const [userProfileImage, setUserProfileImage] = useState("");

  useEffect(() => {
    const getUsername = async () => {
      const { authenticated, user } = await getData("/users/activeUser", "get", true);
      if (authenticated) {
        setActiveUsername(user.username);
        setActiveUserId(user._id);
        setUserProfileImage(user.profileImage);
      }
    };
    getUsername();
  },[])

  const [notificationLength, setNotificationLength] = useState(0);

  useEffect(() => {
    setNotificationLength(notifications.length);
  },[notifications])

  useEffect(() => {
    const checkFollowAndIncludedAll = async () => {
      const newNotifications = [...notifications];
      for (let i = 0; i < newNotifications.length; i++) {
        console.log("notification",i,newNotifications[i]);
        if (newNotifications[i].type == "follow") {
          const { follow } = await getData(`/users/checkFollow/${activeUsername}/${username}`, "get", false);
          newNotifications[i].isFollowing = follow;
        }
        else if (newNotifications[i].type == "intrested") {
          if (!newNotifications[i].ideaId) continue;
          const { include } = await getData(`/ideas/checkInclude/${newNotifications[i].ideaId}/${activeUserId}`, "get", true);
          newNotifications[i].isIncluded = include;
        }
      }
      setNotifications(newNotifications);
    }
    checkFollowAndIncludedAll();
  },[notificationLength])

  const follow = async (ind) => {
    const { username, isFollowing, notifiedBy } = notifications[ind];
    const { data : { data } } = await axios.post(`http://localhost:3000/api/v1/users/follow/${username}`,{},{
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    if (data.authenticated) {
      if (isFollowing) setNotifications(prev => prev.map((notification, index) => index == ind ? {...notification, isFollowing: false} : notification));
      else setNotifications(prev => prev.map((notification, index) => index == ind ? {...notification, isFollowing: true} : notification));
    }
    socket.emit("followNotification", { follower: activeUserId, followed: notifiedBy});
  };

  const include = async (ind) => {
    const { ideaId, notifiedBy, title } = notifications[ind];
    await getData(`/ideas/include/${ideaId}/${notifiedBy}`, "get", true);
    setNotifications(prev => prev.map((notification, index) => index == ind ? {...notification, isIncluded: true} : notification));
    socket.emit("includedNotification", {
      userId: activeUserId,
      idea: {
        _id: ideaId,
        title: title
      },
      profileImage: userProfileImage,
      username: activeUsername,
      includedUser: notifiedBy,
    });
  }

  const openGroup = async (ind) => {
    const { ideaId } = notifications[ind];
    const { groupId } = await getData(`/ideas/groupId/${ideaId}`, "get", true);
    navigate(`/chats?chat=${groupId}`)
  }
  return (
    <div>
      <SideNav/>
      <TopNav/>
      {notifications.length > 0 ? 
        <div key={"1"} className="fixed lg:right-2 h-[calc(90vh-22px)] top-[calc(10vh+2vw)] lg:top-[calc(10vh+16px)] lg:w-[calc(100vw*(5.4/6.5))] w-full flex flex-col justify-start gap-4 p-2 pb-0 overflow-y-scroll">
          {notifications.map(({_id, type, profileImage, username, title, isFollowing, isIncluded}, ind) => (
            <>
              {ind == unread && unread > 0 &&
                <div className="flex justify-center items-center gap-2">
                  <div className="h-0 flex-grow border-2 border-black"></div>
                  <p className="text-lg backdrop-blur-sm p-1 rounded-xl border-2 border-black">
                    All caught up!
                  </p>
                  <div className="h-0 flex-grow border-2 border-black"></div>
                </div>
              }
              <div key={_id} className="w-full flex justify-start items-center gap-4 border-2 border-black backdrop-blur-sm rounded-xl px-2 py-1 text-md">
                <img src={profileImage} alt="profile" className="w-10 h-10 rounded-full"/>
                <div>
                  {type == "follow" &&
                    <div className="flex-grow flex justify-between items-center gap-4">
                      <p><b>{username}</b> followed you</p>
                      <button onClick={() => follow(ind)} className={`${isFollowing ? "bg-white text-black border-2 border-black" : "bg-black text-white border-2 border-white"} rounded-lg p-1`}>{
                        isFollowing ? "Following" : "Follow"
                      }</button>
                    </div>}
                  {type == "intrested" && 
                    <div className="flex-grow flex justify-between items-center gap-4">
                      <p><b>{username}</b> is intrested in your idea <b>{title}</b></p>
                      <button
                        onClick={() => isIncluded ? null : include(ind)}
                        className="bg-black text-white rounded-lg p-1"
                      >
                        {isIncluded ? "Included" : "Include"}
                      </button>
                    </div>}
                  {type == "included" &&
                    <div className="flex-grow flex justify-between items-center gap-4">
                      <p><b>{username}</b> included you in their idea <b>{title}</b></p>
                      <button onClick={() => openGroup(ind)} className="bg-black text-white rounded-lg p-1">See Group</button>
                    </div>}
                  {type == "liked" && <p><b>{username}</b> liked your idea <b>{title}</b></p>}
                  {type == "commented" && <p><b>{username}</b> commented on your idea <b>{title}</b></p>}
                </div>
              </div>
            </>
          ))}
          <Footer styling={"border-2 border-black border-solid rounded-2xl pr-5 relative bottom-0 sm:backdrop-blur-sm"}/>
          <div className="h-7"></div>
        </div>
        :
        <div key={"2"} id="ideas" className="fixed lg:right-2 h-[calc(90vh-22px)] top-[calc(10vh+2vw)] lg:top-[calc(10vh+16px)] lg:w-[calc(100vw*(5.4/6.5))] w-100vw flex justify-center items-center gap-4 p-2 pb-0 flex-wrap overflow-scroll">
          <p className="w-72 text-center backdrop-blur-sm rounded-2xl text-5xl p-4 border-2 border-black border-solid">No Notification Yet.</p>
          <Footer styling={"border-2 border-black border-solid rounded-2xl pr-5 absolute bottom-0 right-0 sm:backdrop-blur-sm"}/>
        </div>
      }
    </div>
  )
}

export default Notification