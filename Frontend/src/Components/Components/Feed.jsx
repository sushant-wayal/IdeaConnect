import Idea from "./Idea";
import SideNav from "./SideNav";
import TopNav from "./TopNav";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useIdeas } from "../../context/ideas";

const Feed = ({ authenticated }) => {
  const { ideas } = useIdeas();
  const navigate = useNavigate();
  useEffect(() => {
    if (!authenticated) navigate("/");
  })
  return (
    <div>
      <SideNav/>
      <TopNav/>
      {ideas.length > 0 ? 
        <div key={"1"} id="ideas" className="fixed lg:right-2 h-[calc(90vh-22px)] top-[calc(10vh+2vw)] lg:top-[calc(10vh+16px)] lg:w-[calc(100vw*(5.4/6.5))] w-full flex justify-start gap-4 p-2 pb-0 flex-wrap overflow-scroll">
          {ideas.map(val => (
            <Idea
              key={val.ideaId}
              thisIdea={val}/>
          ))}
          <Footer styling={"border-2 border-black border-solid rounded-2xl pr-5 relative bottom-0 sm:backdrop-blur-sm"}/>
          <div className="h-7"></div>
        </div>
        :
        <div key={"2"} id="ideas" className="fixed lg:right-2 h-[calc(90vh-22px)] top-[calc(10vh+2vw)] lg:top-[calc(10vh+16px)] lg:w-[calc(100vw*(5.4/6.5))] w-100vw flex justify-center items-center gap-4 p-2 pb-0 flex-wrap overflow-scroll">
          <p className="w-72 text-center backdrop-blur-sm rounded-2xl text-5xl p-4 border-2 border-black border-solid">No Ideas in Your Feed</p>
          <Footer styling={"border-2 border-black border-solid rounded-2xl pr-5 absolute bottom-0 right-0 sm:backdrop-blur-sm"}/>
        </div>
      }
    </div>
  )
}

export default Feed;