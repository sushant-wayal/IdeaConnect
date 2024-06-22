import { useEffect, useState } from "react";
import { getData } from "../../dataLoaders";

const Likes = ({ ideaId, noOfLikesInitial, isLikedInitial, setLikedBy, seeingLikedBy, setSeeingLikedBy, username, className }) => {
  const [noOfLikes, setNoOfLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
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
    console.log("like Idea", liked);
    setNoOfLikes(liked ? noOfLikes-1 : noOfLikes+1);
    setIsLiked(!liked);
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