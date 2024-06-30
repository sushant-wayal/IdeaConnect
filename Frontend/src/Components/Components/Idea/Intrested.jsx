import gsap from "gsap";
import { toast } from "sonner";
import { Loader } from "lucide-react"
import { getData } from "../../dataLoaders";
import { useUser } from "../../../context/user";
import { useSocket } from "../../../context/socket";
import {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

// Yet to fix : "Version Error" in backend when there is new intrested user

const Intrested = ({
  ideaId,
  intrestedUser,
  intrested,
  isIntrestedInitial,
  isIncluded,
  ideaOf,
  idea,
  className
}) => {
  const socket = useSocket();

  const {
    id: userId,
    username,
    profileImage: userProfileImage
  } = useUser();

  const [seeing, setSeeing] = useState(false);
  const intrestedEleRef = useRef(null);
  const [intrestedUserInfo, setIntrestedUserInfo] = useState([]);
  const [noOfIntrested, setNoOfIntrested] = useState(intrested);
  const [isIntrested, setIsIntrested] = useState(isIntrestedInitial);
  const [loading, setLoading] = useState(false);
  const include = async (e, id, ind) => {
    e.stopPropagation();
    try {
      await getData(`/ideas/include/${ideaId}/${id}`, "get", true);
      socket.emit("includedNotification", {
        userId,
        idea: {
          _id: ideaId,
          title: idea.title
        },
        profileImage: userProfileImage,
        username,
        includedUser: id,
      });
      setIntrestedUserInfo(intrestedUserInfo.filter((_, index) => index != ind));
      setNoOfIntrested(prev => prev - 1);
    } catch (error) {
      toast.error(error.response.data.message || "An error occurred. Please try again later.");
    }
  }
  const handleClick = async () => {
    if (ideaOf != username) return;
    const intrestEle = intrestedEleRef.current;
    if (!seeing) {
      gsap.to(intrestEle,{
        height: 260,
        width: 267,
        duration: 0.3,
      })
      if (intrestedUserInfo.length) return setSeeing(true);
      setLoading(true);
      for (let thisUser of intrestedUser) {
        const data = await getData(`/users/userInfo/${thisUser}`, "get", false);
        const {
          profileImage,
          firstName,
          lastName
        } = data;
        if (data.username == username) {
          setNoOfIntrested(prev => prev - 1);
          continue;
        }
        setIntrestedUserInfo(prev => [...prev, {
          id: thisUser,
          profileImage,
          username: data.username,
          firstName,
          lastName
        }]);
      }
      setLoading(false);
      setSeeing(true);
    }
    else {
      gsap.to(intrestEle,{
        height: 35,
        width: 95,
        duration: 0.3,
      })
      setSeeing(false);
      setLoading(false);
    }
  }
  const setIntrestedStatus = useCallback(async () => {
    try {
      const { alreadyIntrested } = await getData(`/ideas/intrested/${ideaId}`, "get", true);
      if (!alreadyIntrested) {
        socket.emit("intrestedNotification", {
          userId,
          idea: {
            _id: ideaId,
            title: idea.title,
            ideaOf: idea.ideaOf,
          },
          profileImage: userProfileImage,
          username,
        });
      };
      setIsIntrested(!alreadyIntrested);
    } catch (error) {
      toast.error(error.response.data.message || "An error occurred. Please try again later.");
    }
  },[
    username,
    ideaId,
    userId,
    idea,
    userProfileImage
  ]);
  useEffect(() => {
    if (ideaOf == username && !isIncluded) return;
    intrestedEleRef.current.addEventListener("click", setIntrestedStatus);
    return () => intrestedEleRef?.current?.removeEventListener("click", setIntrestedStatus);
  }, [
    username,
    userId,
    userProfileImage,
    ideaId,
    ideaOf,
    setIntrestedStatus,
    isIncluded
  ]);
  return (
    <div
      onClick={handleClick}
      ref={intrestedEleRef}
      className={`px-2 py-1 bg-[#C1EDCC] rounded-xl ${isIncluded ? "text-white" : "cursor-pointer"} flex flex-col gap-2 hover:bg-[#B0C0BC] overflow-y-scroll ${className}`}
    >
      {seeing ?
        loading ?
          <div className="w-full h-full flex justify-center items-center">
            <Loader className="h-[10%] aspect-square animate-spin"/>
          </div>
        :
          intrestedUserInfo.map(({ id, profileImage, username, firstName, lastName }, ind) => (
            <div
              onClick={(e) => include(e, id, ind)}
              className="flex px-2 py-1 gap-3 items-center justify-between border-b-2 border-b-black border-b-solid"
            >
              <div className="flex px-2 py-1 gap-3 items-center">
                <img
                  className="h-7 w-7 rounded-full"
                  src={profileImage}
                  alt="profile"
                />
                <div>
                  <p className="font-medium">{username}</p>
                  <p className="text-sm">{firstName} {lastName}</p>
                </div>
              </div>
              {username ?
                <button className="bg-black text-white rounded-xl px-2 py-1">
                  Include
                </button>
                :
                null
              }
            </div>
          ))
        :
        <p>
          {username == ideaOf ?
            `${noOfIntrested} Intrested`
            :
            isIntrested ?
              "Intrested"
            :
            isIncluded ?
              <b>Included</b>
            :
            "Intrested ?"
          }
        </p>
      }
  </div>
  )
}

export default Intrested;