import gsap from "gsap";
import {
  useEffect,
  useRef,
  useState
} from "react";
import Comment from "./Comment";
import { RiLoader2Line } from "@remixicon/react";
import axios from "axios";

const Description = ({ ideaId, description, seeingLikedBy, likedBy, seeingComments, comments, setComments, userId, title, ideaOf, username, userProfileImage, loading, className }) => {
  const [seeing, setSeeing] = useState(false);
  const descriptionEleRef = useRef();
  const handleClick = () => {
    const descriptionEle = descriptionEleRef.current;
    if (seeingLikedBy) return;
    if (!seeing) {
      gsap.to(descriptionEle,{
        height: 280,
        backgroundColor: "#A7A7A9",
        duration: 0.3,
      })
      if (!seeingComments && !seeingLikedBy) setSeeing(true);
    }
    else {
      gsap.to(descriptionEle,{
        backgroundColor: "#C1EDCC",
        height: 50,
        duration: 0.3,
      })
      setSeeing(false);
    }
  }
  useEffect(() => {
    if (seeingLikedBy || seeingComments) {
      setSeeing(false);
      const descriptionEle = descriptionEleRef.current;
      gsap.to(descriptionEle,{
        height: 280,
        backgroundColor: "#A7A7A9",
        duration: 0.3,
      })
    } else {
      const descriptionEle = descriptionEleRef.current;
      gsap.to(descriptionEle,{
        height: 50,
        backgroundColor: "#C1EDCC",
        duration: 0.3,
      })
    }
  }, [seeingLikedBy, seeingComments])
  const follow = async (ind) => {
    const { data : { data : { authenticated } } } = await axios.post(`http://localhost:3000/api/v1/users/follow/${likedBy[ind].username}`,{},{
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    if (authenticated) likedBy[ind].isFollowing = !likedBy[ind].isFollowing;
  }
  return (
    <div
      onClick={handleClick}
      ref={descriptionEleRef}
      className={`bg-[#C1EDCC] overflow-y-hidden rounded-t-2xl p-[3px] leading-5 h-[50px] cursor-pointer w-full flex flex-col gap-2 ${className}`}
    >
      {loading ?
        <div className="h-full w-full flex justify-center items-center">
          <RiLoader2Line className="h-[10%] aspect-square animate-spin"/>
        </div>
        :
        seeingLikedBy ?
          likedBy.length == 0 ?
            <div className="flex justify-center items-center h-full w-full">
              <p className="text-lg">No one has liked this idea</p>
            </div>
          :
          likedBy.map(({ profileImage, username, firstName, lastName, following}, ind) => (
              <div className="flex px-2 py-1 justify-between items-center border-b-2 border-b-black">
                <div className="flex items-center gap-3">
                  <img src={profileImage} className="h-7 w-7 rounded-full"/>
                  <div className="flex flex-col items-start justify-between">
                    <p><b>{username}</b></p>
                    <p>{firstName} {lastName}</p>
                  </div>
                </div>
                <button
                  className={`${profileImage == userProfileImage ? "hidden" : ""} bg-[#C1EDCC] text-black hover:bg-[#B0C0BC] rounded-xl px-2 py-1`}
                  disabled={following}
                  onClick={() => follow(ind)}
                >
                  {following ? "Following" : "Follow"}
                </button>
              </div>
            )
          )
          :
          seeingComments ?
            <Comment
              comments={comments}
              setComments={setComments}
              ideaId={ideaId}
              userId={userId}
              title={title}
              ideaOf={ideaOf}
              userProfileImage={userProfileImage}
              username={username}
            />
            :
            description
      }
    </div>
  )
}

export default Description;