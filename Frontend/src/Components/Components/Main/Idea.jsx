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

const Idea = ({ thisIdea }) => {
	const { idea, profileImage, ideaOf, included, intrested } = thisIdea;
	const [username,setUsername] = useState("");
	const [isLiked,setIsLiked] = useState(false);
	const [likedBy, setLikedBy] = useState([]);
	const [seeingLikedBy, setSeeingLikedBy] = useState(false);
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
			if (authenticated) setUsername(user.username);
		};
		getUsername();
	},[]);
    return (
			<div className="relative w-full sm:w-[302px] h-[500px] sm:h-[450px] border-2 border-black border-solid backdrop-blur-sm rounded-2xl p-2 flex flex-col gap-2">
				<div className="flex justify-center items-center relative border-b-2 border-b-black border-b-solid">
					<img
						className="absolute left-1 -top-[6px] w-7 h-7 rounded-full border-2"
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
						className="absolute top-2 right-2"
					/>
			</div>
			<div className="flex flex-col gap-0 absolute w-[95%] sm:w-[285px] bottom-7">
					<Description
						description={idea.description}
						seeingLikedBy={seeingLikedBy}
						likedBy={likedBy}
						className="absolute bottom-[40px]"
					/>
					<Progress
						ideaId={idea._id}
						steps={idea.steps}
						progress={idea.progress}
						username={username}
						ideaOf={ideaOf}
						className=""
					/>
					<div className="flex justify-around border-2 border-black border-solid border-t-0 rounded-b-2xl p-1">
							<Likes
								ideaId={idea._id}
								noOfLikesInitial={idea.likes}
								isLikedInitial={isLiked}
								setLikedBy={setLikedBy}
								seeingLikedBy={seeingLikedBy}
								setSeeingLikedBy={setSeeingLikedBy}
								username={username}
								className=""
							/>
							<div className="flex gap-1 justify-center items-center">
								<img
									className="h-4 w-4"
									src="../../../../images/comment.svg"
								/>
								<p>{idea.noOfComments}</p>
							</div>
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