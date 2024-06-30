import Idea from "../Main/Idea";
import SideNav from "../General/SideNav";
import TopNav from "../General/TopNav";
import Footer from "../General/Footer";
import { Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIdeas } from "../../../context/ideas";
import {
  useEffect,
  useState
} from "react";

const Feed = ({ authenticated, noIdea }) => {
  const { ideas } = useIdeas();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!authenticated) navigate("/");
  },[])
  useEffect(() => {
    if (authenticated === true || authenticated === false) setLoading(false);
    else setLoading(true);
  },[authenticated])
  return (
    <div>
      <SideNav/>
      <TopNav/>
      {loading ? 
        <div key={"2"} id="ideas" className="fixed lg:right-2 h-[calc(90vh-22px)] top-[calc(10vh+2vw)] lg:top-[calc(10vh+16px)] lg:w-[calc(100vw*(5.4/6.5))] w-100vw flex justify-center items-center gap-4 p-2 pb-0 flex-wrap overflow-scroll">
          <Loader className="w-20 h-20 animate-spin"/>
          <Footer styling={"border-2 border-black border-solid rounded-2xl pr-5 absolute bottom-0 right-0 sm:backdrop-blur-sm"}/>
        </div>
        :
        ideas.length > 0 ? 
          <div key={"1"} id="ideas" className="fixed lg:right-2 h-[calc(90vh-22px)] top-[calc(10vh+2vw)] lg:top-[calc(10vh+16px)] lg:w-[calc(100vw*(5.4/6.5))] w-full flex justify-start gap-4 p-2 pb-0 flex-wrap overflow-scroll">
            {ideas.map(val => (
              <Idea
                key={val.ideaId}
                thisIdea={val}/>
            ))}
            <Footer styling={"rounded-2xl pr-5 relative -bottom-10 sm:backdrop-blur-sm h-12"}/>
          </div>
          :
          <div key={"2"} id="ideas" className="fixed lg:right-2 h-[calc(90vh-22px)] top-[calc(10vh+2vw)] lg:top-[calc(10vh+16px)] lg:w-[calc(100vw*(5.4/6.5))] w-100vw flex justify-center items-center gap-4 p-2 pb-0 flex-wrap overflow-scroll">
            <p className="text-center text-5xl p-4 text-white">{noIdea}</p>
            <Footer styling={"rounded-2xl pr-5 absolute bottom-0 right-0 sm:backdrop-blur-sm"}/>
          </div>
      }
    </div>
  )
}

export default Feed;