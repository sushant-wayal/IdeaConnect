import Idea from "../Components/Idea";
import SideNav from "../Components/SideNav";
import TopNav from "../Components/TopNav";
import Footer from "../Components/Footer";
import axios from "axios";
import { useLoaderData, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Ideas = () => {
    const data = useLoaderData();
    const navigate = useNavigate();
    let ideas = [];
    if (data.authenticated) {
        ideas = data.ideas;
    }
    useEffect(() => {
        if (!data.authenticated) {
            navigate("/");
        }
    })
    if (ideas.length > 0) {
        return (
            <div>
                <SideNav/>
                <TopNav/>
                <div id="ideas" className="fixed lg:right-2 h-[calc(90vh-22px)] top-[calc(10vh+2vw)] lg:top-[calc(10vh+16px)] lg:w-[calc(100vw*(5.4/6.5))] w-full flex justify-start gap-4 p-2 pb-0 flex-wrap overflow-scroll">
                    {ideas.map(val => (
                        <Idea key={val.ideaId} thisIdea={{
                            idea: val.idea,
                            profileImage: val.profileImage,
                            intrested: val.intrested,
                            included: val.included,
                            ideaOf: val.ideaOf,
                        }}/>
                    ))}
                    <Footer styling={"border-2 border-black border-solid rounded-2xl pr-5 relative bottom-0 sm:backdrop-blur-sm"}/>
                    <div className="h-7"></div>
                </div>
            </div>
        )
    }
    else {
        return (
            <div>
                <SideNav/>
                <TopNav/>
                <div id="ideas" className="fixed lg:right-2 h-[calc(90vh-22px)] top-[calc(10vh+2vw)] lg:top-[calc(10vh+16px)] lg:w-[calc(100vw*(5.4/6.5))] w-100vw flex justify-center items-center gap-4 p-2 pb-0 flex-wrap overflow-scroll">
                    <p className="w-72 text-center backdrop-blur-sm rounded-2xl text-5xl p-4 border-2 border-black border-solid">No Ideas in Your Feed</p>
                    <Footer styling={"border-2 border-black border-solid rounded-2xl pr-5 absolute bottom-0 right-0 sm:backdrop-blur-sm"}/>
                </div>
            </div>
        )
    }
}

export default Ideas;

export const getFeed = async () => {
    const { data : { data } } = await axios.get("http://localhost:3000/api/v1/users/feed",{
        headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
    });
    return data;
}