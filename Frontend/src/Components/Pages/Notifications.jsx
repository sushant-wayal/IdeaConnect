import { useEffect, useState } from "react";
import { useNotification } from "../../context/notifications"
import { getData } from "../dataLoaders";
import SideNav from "../Components/General/SideNav";
import TopNav from "../Components/General/TopNav";
import Footer from "../Components/General/Footer";
import { useSocket } from "../../context/socket";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { RiLoader2Line } from "@remixicon/react";
import { useUser } from "../../context/user";

const Notification = ({}) => {
  const socket = useSocket();

  const navigate = useNavigate();

  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const unread = query.get("unread") || 0;

  const [loading, setLoading] = useState(true);

  const { notifications, setNotifications, setUnreadNotifications } = useNotification();
  useEffect(() => {
    const getNotifications = async () => {
      const { notifications } = await getData("/notifications", "get", true);
      setNotifications(notifications);
      setLoading(false);
    }
    getNotifications();
  },[]);
  useEffect(() => {
    setUnreadNotifications(0);
    socket.emit("seenNotification", { notificationId: notifications[0]?._id });
  },[notifications, socket])

  const { id: activeUserId, username : activeUsername, profileImage: userProfileImage } = useUser();

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
      <TopNav noSearchText={"Notifications"}/>
      {loading ?
        <div key={"2"} id="ideas" className="fixed lg:right-2 h-[calc(90vh-22px)] top-[calc(10vh+2vw)] lg:top-[calc(10vh+16px)] lg:w-[calc(100vw*(5.4/6.5))] w-100vw flex justify-center items-center gap-4 p-2 pb-0 flex-wrap overflow-scroll">
          <RiLoader2Line className="w-20 h-20 animate-spin"/>
          <Footer styling={"border-2 border-black border-solid rounded-2xl pr-5 absolute bottom-0 right-0 sm:backdrop-blur-sm"}/>
        </div>
        :
        notifications.length > 0 ? 
          <div key={"1"} className="fixed lg:right-2 h-[calc(90vh-22px)] top-[calc(10vh+2vw)] lg:top-[calc(10vh+16px)] lg:w-[calc(100vw*(5.4/6.5))] w-full flex flex-col justify-start gap-4 p-2 pb-0 overflow-y-scroll overflow-x-hidden min-h-[calc(90vh)]">
            <div className="flex-grow flex flex-col justify-start gap-4">
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
                  <div key={_id} className="bg-[#797270] w-full flex justify-start items-center gap-4 rounded-xl px-2 py-1 text-md">
                    <img src={profileImage} alt="profile" className="w-10 h-10 rounded-full"/>
                    <div>
                      {type == "follow" &&
                        <div className="flex-grow flex justify-between items-center gap-4">
                          <p><b>{username}</b> followed you</p>
                          <button onClick={() => follow(ind)} className={`${isFollowing ? "bg-[#A7A7A9]" : "bg-[#C1EDCC]"} text-black rounded-lg p-1 hover:bg-[#B0C0BC]`}>{
                            isFollowing ? "Following" : "Follow"
                          }</button>
                        </div>}
                      {type == "intrested" && 
                        <div className="flex-grow flex justify-between items-center gap-4">
                          <p><b>{username}</b> is intrested in your idea <b>{title}</b></p>
                          <button
                            onClick={() => isIncluded ? null : include(ind)}
                            className={`${isIncluded ? "bg-[#A7A7A9]" : "bg-[#C1EDCC]"} text-black rounded-lg p-1 hover:bg-[#B0C0BC]`}
                          >
                            {isIncluded ? "Included" : "Include"}
                          </button>
                        </div>}
                      {type == "included" &&
                        <div className="flex-grow flex justify-between items-center gap-4">
                          <p><b>{username}</b> included you in their idea <b>{title}</b></p>
                          <button onClick={() => openGroup(ind)} className="bg-[#C1EDCC] text-black rounded-lg p-1">See Group</button>
                        </div>}
                      {type == "liked" && <p><b>{username}</b> liked your idea <b>{title}</b></p>}
                      {type == "commented" && <p><b>{username}</b> commented on your idea <b>{title}</b></p>}
                    </div>
                  </div>
                </>
              ))}
            </div>
            <Footer styling={"rounded-2xl pr-5 relative bottom-0 sm:backdrop-blur-sm w-[99%] mb-6"}/>
          </div>
        :
        <div key={"2"} id="ideas" className="fixed lg:right-2 h-[calc(90vh-22px)] top-[calc(10vh+2vw)] lg:top-[calc(10vh+16px)] lg:w-[calc(100vw*(5.4/6.5))] w-100vw flex justify-center items-center gap-4 p-2 pb-0 flex-wrap overflow-scroll">
          <p className="text-center text-5xl p-4 text-white">No Notifications Yet.</p>
        </div>
      }
    </div>
  )
}

export default Notification