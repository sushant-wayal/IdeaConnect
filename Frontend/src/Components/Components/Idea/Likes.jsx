import { useState } from "react";
import { getData } from "../../dataLoaders";

const Likes = ({ ideaId, noOfLikesInitial, isLikedInitial, setLikedBy, seeingLikedBy, setSeeingLikedBy, username, className }) => {
  const [noOfLikes, setNoOfLikes] = useState(noOfLikesInitial);
  const [isLiked, setIsLiked] = useState(isLikedInitial);
  const getLikes = async () => {
    if (!seeingLikedBy) {
      const { likedBy } = await getData(`/ideas/likedBy/${ideaId}`, "get", false);
      setLikedBy(likedBy);
      setSeeingLikedBy(true);
    }
    else setSeeingLikedBy(false);
  }
  const likeIdea = async () => {
    const { liked } = await getData(`/ideas/likeIdea/${ideaId}/${username}`, "get", false);
    setNoOfLikes(liked ? noOfLikes-1 : noOfLikes+1);
    setIsLiked(!liked);
  }
  return (
    <div className={`flex gap-1 justify-center items-center cursor-pointer ${className}`}>
      <img onClick={likeIdea} className="h-4 w-4" src={`../../../../../images/like${isLiked ? "d" : ""}.svg`}/>
      <p onClick={getLikes}>{noOfLikes}</p>
    </div>
  )
}

export default Likes;