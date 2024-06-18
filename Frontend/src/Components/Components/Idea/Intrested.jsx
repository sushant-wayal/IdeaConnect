import gsap from "gsap";
import { getData } from "../../dataLoaders";
import {
  useEffect,
  useRef,
  useState
} from "react";

// Yet to fix : "Version Error" in backend when there is new intrested user

const Intrested = ({ ideaId, intrestedUser, intrested, isIntrestedInitial, isIncluded, ideaOf, username, className }) => {
  const [seeing, setSeeing] = useState(false);
  const intrestedEleRef = useRef(null);
  const [intrestedUserInfo, setIntrestedUserInfo] = useState([]);
  const [noOfIntrested, setNoOfIntrested] = useState(intrested);
  const [isIntrested, setIsIntrested] = useState(isIntrestedInitial);
  const include = async (e, id, ind) => {
    e.stopPropagation();
    await getData(`/ideas/include/${ideaId}/${id}`, "get", true);
    setIntrestedUserInfo(intrestedUserInfo.filter((_, index) => index != ind));
    setNoOfIntrested(prev => prev - 1);
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
      for (let thisUser of intrestedUser) {
        const data = await getData(`/users/userInfo/${thisUser}`, "get", false);
        const { profileImage } = data;
        if (data.username == username) {
          setNoOfIntrested(prev => prev - 1);
          continue;
        }
        setIntrestedUserInfo(prev => [...prev, { id: thisUser, profileImage, username: data.username }]);
      }
      setSeeing(true);
    }
    else {
      gsap.to(intrestEle,{
        height: 35,
        width: 110,
        duration: 0.3,
      })
      setSeeing(false);
    }
  }
  const setIntrestedStatus = async () => {
    const { alreadyIntrested } = await getData(`/ideas/intrested/${ideaId}`, "get", true);
    setIsIntrested(!alreadyIntrested);
  }
  useEffect(() => {
    if (ideaOf == username && !isIncluded) return;
    intrestedEleRef.current.addEventListener("click", setIntrestedStatus);
  }, [])
  return (
    <div
      onClick={handleClick}
      ref={intrestedEleRef}
      className={`px-2 py-1 bg-gray-600 rounded-xl ${isIncluded ? "text-white" : "cursor-pointer"} flex flex-col gap-2 hover:scale-105 overflow-y-scroll ${className}`}
    >
      {seeing ?
        intrestedUserInfo.map(({ id, profileImage, username }, ind) => (
          <div onClick={(e) => include(e, id, ind)} className="flex px-2 py-1 gap-3 items-center justify-between border-b-2 border-b-black border-b-solid">
            <div className="flex px-2 py-1 gap-3 items-center">
              <img className="h-7 w-7 rounded-full" src={profileImage} alt="profile"/>
              <p className="text-lg font-medium">{username}</p>
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
              "Included"
            :
            "Intrested ?"
          }
        </p>
      }
  </div>
  )
}

export default Intrested;