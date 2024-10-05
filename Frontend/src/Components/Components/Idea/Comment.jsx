import axios from "axios";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { useUser } from "../../../context/user";
import { useSocket } from "../../../context/socket"
import {
  getData,
  getHeaders
} from "../../../dataLoaders";
import {
  useEffect,
  useRef,
  useState
} from "react";

const Comment = ({
  comments,
  setComments,
  ideaId,
  title,
  ideaOf,
  loading
}) => {
  const socket = useSocket();

  const {
    id,
    username,
    profileImage
  } = useUser();

  const descriptionDivHeight = 272;
  const [comment, setComment] = useState("");
  const [scrollable, setScrollable] = useState(false);
  const [sending, setSending] = useState(false);
  const [animate, setAnimate] = useState(false);
  const addComment = async (e) => {
    e.stopPropagation();
    setSending(true);
    setAnimate(true);
    setTimeout(() => setAnimate(false), 1500);
    try {
      const { data : { data : {
        success,
        newComment
      } } } = await axios.post(`http://localhost:3000/api/v1/comments/add`,{ ideaId, comment }, getHeaders());
      if (success) {
        setComments(prev => [newComment, ...prev]);
        socket.emit("commentedNotification", { id, idea: {
          _id: ideaId,
          title,
          ideaOf
        }, username, profileImage: profileImage});
      }
    } catch (error) {
      toast.error(error.response.data.message || "An error occurred. Please try again later.");
    }
    setComment("");
    setSending(false);
  }
  const commentsEleRef = useRef();
  const addCommentEleRef = useRef();
  const handleScroll = () => {
    const { scrollTop, clientHeight } = commentsEleRef.current;
    const addCommentEle = addCommentEleRef.current;
    addCommentEle.style.top = `${scrollTop + clientHeight - addCommentEle.clientHeight+2}px`;
  }
  useEffect(() => {
    const addCommentEle = addCommentEleRef.current;
    addCommentEle.style.top = `${descriptionDivHeight - addCommentEle.clientHeight+4}px`;
    const { clientHeight } = commentsEleRef.current;
    if (descriptionDivHeight <= clientHeight) setScrollable(true);
  }, [comments]);
  return (
    <div
      className={`${scrollable ? "relative overflow-y-scroll" : ""}`}
      ref={commentsEleRef}
      onScroll={handleScroll}
    >
      {loading ?
        <div className="flex justify-center items-center h-full w-full">
          <RiLoader2Line size={24}/>
        </div>
        :
        comments.length == 0 ?
          <div className="flex justify-center items-center h-full w-full">
            <p className="text-lg">No Comments Yet</p>
          </div>
        :
        comments.map(({ profileImage, username, comment }) => (
          <div className="flex flex-col justify-center px-2 py-1 gap-1 items-start text-black border-b-2 border-b-black">
            <div className="flex justify-start items-start gap-2">
              <img
                src={profileImage}
                className="h-7 w-7 rounded-full object-cover"
                alt="Profile Image"
              />
              <p>{comment}</p>
            </div>
            <p className="w-full text-right">{username}</p>
          </div>
        )
      )}
      <div
        className="w-full absolute flex px-2 py-1 gap-1 bg-[#A7A7A9]"
        ref={addCommentEleRef}
      >
        <input
          type="text"
          placeholder="Add Comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="flex-grow rounded-full h-1/6 bg-[#C1EDCC] text-black px-2 py-1 w-full placeholder:text-black placeholder-opacity-50"
        />
        <button
          disabled={sending}
          onClick={addComment}
        >
          <Send
            className={animate ? "animate-flying" : ""}
            size={24}
          />
        </button>
      </div>
    </div>
  )
}

export default Comment;

export const SeeComments = ({
  ideaId,
  setComments,
  noOfComments,
  seeingComments,
  setSeeingComments,
  setLoading,
  className
}) => {
  const getComments = async () => {
    if (seeingComments) {
      setSeeingComments(false);
      setLoading(false);
    }
    else {
      setLoading(true);
      try {
        const data = await getData(`/comments/${ideaId}`, "get", false);
        setComments(data.comments);
        setSeeingComments(true);
      } catch (error) {
        toast.error(error.response.data.message || "An error occurred. Please try again later.");
      }
      setLoading(false);
    }
  }
  return (
    <div
      onClick={getComments}
      className={`flex gap-1 justify-center items-center cursor-pointer ${className}`}
    >
      <img
        className="h-4 w-4"
        src="../../../../images/comment.svg"
      />
      <p>{noOfComments}</p>
    </div>
  )
}