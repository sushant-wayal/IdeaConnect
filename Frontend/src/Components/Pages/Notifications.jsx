import { useEffect } from "react";
import { useNotification } from "../../context/notifications"
import { getData } from "../dataLoaders";
import SideNav from "../Components/General/SideNav";
import TopNav from "../Components/General/TopNav";
import Footer from "../Components/General/Footer";
import { useSocket } from "../../context/socket";

const Notification = ({}) => {
  const socket = useSocket();

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
  },[notifications, setNotifications, socket])
  return (
    <div>
      <SideNav/>
      <TopNav/>
      {notifications.length > 0 ? 
        <div key={"1"} className="fixed lg:right-2 h-[calc(90vh-22px)] top-[calc(10vh+2vw)] lg:top-[calc(10vh+16px)] lg:w-[calc(100vw*(5.4/6.5))] w-full flex flex-col justify-start gap-4 p-2 pb-0 overflow-y-scroll">
          {notifications.map(({_id, type, profileImage, username, title}) => (
            <div key={_id} className="w-full flex justify-start items-center gap-4 border-2 border-black backdrop-blur-sm rounded-xl px-2 py-1 text-md">
              <img src={profileImage} alt="profile" className="w-10 h-10 rounded-full"/>
              <div>
                {type == "follow" &&
                  <div className="flex-grow flex justify-between items-center gap-4">
                    <p><b>{username}</b> followed you</p>
                    <button className="bg-blue-500 text-white rounded-lg p-1">Follow Back</button>
                  </div>}
                {type == "intrested" && 
                  <div className="flex-grow flex justify-between items-center gap-4">
                    <p><b>{username}</b> is intrested in your idea <b>{title}</b></p>
                    <button className="bg-black text-white rounded-lg p-1">Include</button>
                  </div>}
                {type == "included" &&
                  <div className="flex-grow flex justify-between items-center gap-4">
                    <p><b>{username}</b> included you in their idea <b>{title}</b></p>
                    <button className="bg-black text-white rounded-lg p-1">See Group</button>
                  </div>}
                {type == "liked" && <p><b>{username}</b> liked your idea <b>{title}</b></p>}
                {type == "commented" && <p><b>{username}</b> commented on your idea <b>{title}</b></p>}
              </div>
            </div>
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