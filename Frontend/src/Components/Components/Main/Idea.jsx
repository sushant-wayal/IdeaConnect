import MultiMedia from "./MultiMedia";
import Category from "../Idea/Category";
import Intrested from "../Idea/Intrested";
import Description from "../Idea/Description";
import Progress from "../Idea/Progress";
import Likes from "../Idea/Likes";
import { Link } from "react-router-dom";
import { getData } from "../../dataLoaders";
import {
	useEffect,
	useState
} from "react";
import { SeeComments } from "../Idea/Comment";

const Idea = ({ thisIdea }) => {
	const { idea, profileImage, ideaOf, included, intrested } = thisIdea;
	const [username,setUsername] = useState("");
	const [isLiked,setIsLiked] = useState(false);
	const [likedBy, setLikedBy] = useState([]);
	const [seeingLikedBy, setSeeingLikedBy] = useState(false);
	const [comments, setComments] = useState([]);
	const [seeingComments, setSeeingComments] = useState(false);
	const [userId, setUserId] = useState("");
	const [userProfileImage, setUserProfileImage] = useState("");
	const [loadingLikes, setLoadingLikes] = useState(false);
	const [loadingComments, setLoadingComments] = useState(false);
	useEffect(() =>{
		const checkLike = async () => {
			const { liked } = await getData(`/ideas/checkLike/${idea._id}/${username}`, "get", false);
			setIsLiked(liked);
		}
		checkLike();
	},[username])
	useEffect(() => {
		const getUsername = async () => {
			const { authenticated, user } = await getData("/users/activeUser", "get", true);
			if (authenticated) {
				setUsername(user.username);
				setUserId(user._id);
				setUserProfileImage(user.profileImage);
			}
		};
		getUsername();
	},[]);
    return (
			<div className="relative w-full sm:w-[302px] h-[500px] sm:h-[450px] backdrop-blur-sm rounded-2xl p-2 flex flex-col gap-2 bg-[#797270]">
				<div className="flex justify-center items-center relative border-b-2 border-b-black border-b-solid">
					<img
						className="absolute left-1 -top-[6px] w-7 h-7 rounded-full"
						src={profileImage}
						alt="profile"
					/>
					<p>
						{idea.title}
					</p>
				</div>
				<div className="w-full rounded-xl relative h-[330px] sm:h-[280px] flex-shrink">
					<MultiMedia
						medias={idea.media}
						start={0}
						id={idea._id}
						navigationSize={16}
						soundSize={30}
						wrapperClassName="w-full h-full flex-shrink"
						containerClassName="rounded-xl"
					/>
					<Category
						categories={idea.categories}
						className="absolute top-2 left-2"
					/>
					<Intrested
						ideaId={idea._id}
						intrestedUser={idea.intrestedUser}
						intrested={idea.intrested}
						isIntrestedInitial={intrested}
						isIncluded={included}
						ideaOf={ideaOf}
						username={username}
						idea={idea}
						userId={userId}
						userProfileImage={userProfileImage}
						className="absolute top-2 right-2"
					/>
			</div>
			<div className="flex flex-col gap-0 absolute w-[95%] sm:w-[285px] bottom-7">
					<Description
						ideaId={idea._id}
						description={idea.description}
						seeingLikedBy={seeingLikedBy}
						likedBy={likedBy}
						comments={comments}
						seeingComments={seeingComments}
						setComments={setComments}
						ideaOf={idea.ideaOf}
						username={username}
						userProfileImage={userProfileImage}
						title={idea.title}
						userId={userId}
						loading={loadingLikes || loadingComments}
						className="absolute bottom-[40px] bg-[#6C757D]"
					/>
					<Progress
						ideaId={idea._id}
						steps={idea.steps}
						progress={idea.progress}
						username={username}
						ideaOf={ideaOf}
						className=""
					/>
					<div className="flex justify-around rounded-b-2xl p-1 bg-[#C1EDCC]">
							<Likes
								ideaId={idea._id}
								noOfLikesInitial={idea.likes}
								isLikedInitial={isLiked}
								setLikedBy={setLikedBy}
								seeingLikedBy={seeingLikedBy}
								setSeeingLikedBy={setSeeingLikedBy}
								username={username}
								userId={userId}
								title={idea.title}
								ideaOf={idea.ideaOf}
								userProfileImage={userProfileImage}
								setLoading={setLoadingLikes}
								className=""
							/>
							<SeeComments
								ideaId={idea._id}
								setComments={setComments}
								noOfComments={comments.length == 0 ? idea.noOfComments : comments.length}
								seeingComments={seeingComments}
								setSeeingComments={setSeeingComments}
								setLoading={setLoadingComments}
								className=""
							/>
							<div className="flex gap-1 justify-center items-center">
								<Link to={`/chats?shareIdea=${idea._id}`}>
									<img
										className="h-4 w-4"
										src="../../../../images/share.svg"
									/>
								</Link>
								<p>{idea.noOfShare}</p>
							</div>
					</div>
				</div>
				<p className="-mt-2 ml-3 absolute bottom-1">
					{ideaOf}
				</p>
		</div>
	)
}

export default Idea;