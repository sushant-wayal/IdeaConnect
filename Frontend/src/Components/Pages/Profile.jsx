import { Link, useParams } from "react-router-dom"
import SideNav from "../Components/General/SideNav";
import Footer from "../Components/General/Footer";
import axios from "axios";
import { useEffect, useState } from "react";
import Idea from "../Components/Main/Idea";
import { getData } from "../dataLoaders";
import { useSocket } from "../../context/socket";
import { RiLoader2Line } from "@remixicon/react";
import { CirclePlus, UserPlus } from "lucide-react";
import { useUser } from "../../context/user";

const Profile = () => {
    const socket = useSocket();
    const { username } = useParams();
    const { id: activeUserId, username: activeUsername } = useUser();
    const [user, setUser] = useState({});
    const [following, setFollowing] = useState(false);
    const [ideas, setIdeas] = useState([]);
    const [userFollowers, setUserFollowers] = useState(user.followers);
    const [loadingUserInfo, setLoadingUserInfo] = useState(0);
    const [loadingUserIdeas, setLoadingUserIdeas] = useState(true);
    const [makingFollow, setMakingFollow] = useState(false);
    useEffect(() => {
        const getUser = async () => {
            const data = await getData(`/users/profile/${username}`, "get", false);
            setUser(data);
            setUserFollowers(data.followers);
            setLoadingUserInfo(prev => prev+1);
        }
        getUser();
        const checkFollow = async () => {
            const { follow } = await getData(`/users/checkFollow/${activeUsername}/${username}`, "get", false);
            setFollowing(follow);
            setLoadingUserInfo(prev => prev+1);
        }
        checkFollow();
        const getIdeas = async () => {
            const { ideas } = await getData(`/users/idea/${username}/${activeUsername}`, "get", false);
            setIdeas(ideas);
            setLoadingUserIdeas(false);
        }
        getIdeas();
    },[activeUsername, username])
    const follow = async () => {
        setMakingFollow(true);
        const { data : { data } } = await axios.post(`http://localhost:3000/api/v1/users/follow/${user.username}`,{},{
            headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
        });
        if (data.authenticated) {
            if (following) {
                setUserFollowers(prev => prev-1);
                setFollowing(false);
            }
            else {
                setUserFollowers(prev => prev+1);
                setFollowing(true);
            }
        }
        setMakingFollow(false);
        socket.emit("followNotification", { follower: activeUserId, followed: user._id});
    };
    return (
        <div className="flex justify-end p-2">
            <SideNav/>
            <div className="relative w-[98vw] left-1 lg:left-0 lg:w-[calc(100vw*5.4/6.5)] flex flex-col justify-center gap-2 min-h-[100vh]">
                <div className="rounded-2xl p-2 h-full">
                    {loadingUserInfo < 2 ?
                        <div className="w-full flex justify-center items-center h-[40%]">
                            <RiLoader2Line className="animate-spin h-10 w-10"/>
                        </div>
                        :
                        <div className="bg-[#797270] flex flex-col gap-1 items-center justify-center p-5 rounded-t-2xl relative">
                            <img
                                className="object-cover h-32 w-32 rounded-full"
                                src={user.profileImage}
                                alt="Profile Image"
                            />
                            <p>{user.username}</p>
                            <div className="flex justify-center gap-5">
                                <div className="w-24 flex flex-col justify-center items-center gap-px p-px rounded-2xl bg-[#A7A7A9]">
                                    <p>Followers</p>
                                    <p>{userFollowers}</p>
                                </div>
                                <div className="w-24 flex flex-col justify-center items-center gap-px p-px rounded-2xl bg-[#A7A7A9]">
                                    <p>Following</p>
                                    <p>{user.following}</p>
                                </div>
                                <div className="w-24 flex flex-col justify-center items-center gap-px p-px rounded-2xl bg-[#A7A7A9]">
                                    <p>Ideas</p>
                                    <p>{user.noOfIdeas}</p>
                                </div>
                            </div>
                            <div className="bg-[#A7A7A9] rounded-2xl p-1 w-80">
                                <p className="border-b-2 border-b-black border-b-solid">{user.firstName} {user.lastName}</p>
                                <p id="bio" className="overflow-y-scroll h-14">{user.bio}</p>
                            </div>
                            {activeUsername == username ?
                            <>
                                <Link
                                    className="absolute top-36 right-1 lg:top-48 lg:right-1/4 bg-[#C1EDCC] py-1 px-2 rounded-2xl flex items-center justify-center gap-1"
                                    to="/newIdea"
                                >
                                    <CirclePlus/> <p>New Idea</p>
                                </Link>
                            </>
                            :
                            <>
                                <button
                                    onClick={follow}
                                    className={`absolute top-36 lg:top-48 right-1 lg:right-[375px] bg-[#C1EDCC] hover:bg-[#B0C0BC] py-1 px-2 rounded-2xl`}
                                    disabled={makingFollow}
                                >
                                    {following
                                        ?
                                            "Following"
                                        :
                                            <div className="flex justify-center items-center gap-1">
                                                <UserPlus/>
                                                <p>Follow</p>
                                            </div>
                                    }
                                </button>
                                <Link
                                    to={user._id ? `/chats?chat=${user._id}` : ""}
                                    className="absolute top-36 lg:top-48 right-[90vw] translate-x-[100%] lg:translate-x-0 lg:right-[275px] bg-[#C1EDCC] hover:bg-[#B0C0BC] py-1 px-2 rounded-2xl"
                                >
                                    Message
                                </Link>
                            </>
                            }
                        </div>
                    }
                    {user.noOfIdeas > 0 ? 
                    <>
                    <p className="bg-[#A7A7A9] text-center backdrop-blur-sm text-lg mb-2">My Ideas</p>
                    <div className="h-[50%] flex flex-start flex-wrap gap-4">
                        {loadingUserIdeas ?
                            <div className="w-full h-full flex justify-center items-center">
                                <RiLoader2Line className="animate-spin h-10 w-10"/>
                            </div>
                            :
                            ideas.map(val => (
                                <Idea
                                    key={val.ideaId}
                                    thisIdea={val}
                                />
                            ))
                        }
                    </div>
                    </>:<></>}
                </div>
                <Footer styling={`rounded-2xl pr-5 backdrop-blur-sm ${user.noOfIdeas == 0 ? "absolute -bottom-[345px]" : ""}`}/>
            </div>
        </div>
    )
}

export default Profile