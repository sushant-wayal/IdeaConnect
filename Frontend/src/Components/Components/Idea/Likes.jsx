import { useEffect, useState } from "react";
import { getData } from "../../dataLoaders";
import { useSocket } from "../../../context/socket";
import { useUser } from "../../../context/user";
import { toast } from "sonner";

const Likes = ({ ideaId, noOfLikesInitial, isLikedInitial, setLikedBy, seeingLikedBy, setSeeingLikedBy, title, ideaOf, setLoading, className }) => {
  const socket = useSocket();

  const { id: userId, username, profileImage : userProfileImage } = useUser();

  const [noOfLikes, setNoOfLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const getLikes = async () => {
    if (!seeingLikedBy) {
      setLoading(true);
      try {
        const { likedBy } = await getData(`/ideas/likedBy/${ideaId}`, "get", true);
        console.log("likedBy", likedBy);
        setLikedBy(likedBy);
        setSeeingLikedBy(true);
      } catch (error) {
        toast.error(error.response.data.message || "An error occurred. Please try again later.");
      }
      setLoading(false);
    }
    else {
      setSeeingLikedBy(false);
      setLoading(false);
    }
  }
  const likeIdea = async () => {
    try {
      const { liked } = await getData(`/ideas/likeIdea/${ideaId}/${username}`, "get", false);
      console.log("like Idea", liked);
      setNoOfLikes(liked ? noOfLikes-1 : noOfLikes+1);
      setIsLiked(!liked);
      if (!liked) {
        console.log("emitting likedNotification");
        socket.emit("likedNotification", { userId, idea: {
          _id: ideaId,
          title,
          ideaOf
        },  username, profileImage: userProfileImage});
      }
    } catch (error) {
      toast.error(error.response.data.message || "An error occurred. Please try again later.");
    }
  }
  useEffect(() => {
    setNoOfLikes(noOfLikesInitial);
    setIsLiked(isLikedInitial);
  },[noOfLikesInitial, isLikedInitial])
  return (
    <div className={`flex gap-1 justify-center items-center cursor-pointer ${className}`}>
      <img key={isLiked} onClick={likeIdea} className="h-4 w-4" src={isLiked ? "../../../../images/liked.svg" : "../../../../images/like.svg"}/>
      <p onClick={getLikes}>{noOfLikes}</p>
    </div>
  )
}

export default Likes;