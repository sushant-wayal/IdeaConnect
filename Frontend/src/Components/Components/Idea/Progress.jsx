import gsap from "gsap";
import { toast } from "sonner";
import { getData } from "../../dataLoaders";
import { useUser } from "../../../context/user";
import {
  useRef,
  useState
} from "react";

const Progress = ({
  ideaId,
  steps,
  progress,
  ideaOf,
  className
}) => {
  const { username } = useUser();
  const [seeing, setSeeing] = useState(false);
  const progressEleRef = useRef();
  const [ideaProgress, setIdeaProgress] = useState(progress);
  const check = (progressEle, id) => {
    let steps = progressEle;
    for (let i = 0; i < steps.children.length; i += 2) {
      steps.children[i].firstChild.checked = true;
      if (steps.children[i].id == id) break;
    }
  }
  const uncheck = (progressEle, id) => {
    let steps = progressEle;
    let set = true;
    for (let i = 0; i < steps.children.length; i += 2) {
      if (steps.children[i].id == id) set = false;
      steps.children[i].firstChild.checked = set;
    }
  }
  const checkboxClick = (progressEle, id) => {
    if (document.getElementById(id).firstChild.checked) check(progressEle, id);
    else uncheck(progressEle, id);
  }
  const handleClick = async () => {
    const progressEle = progressEleRef.current;
    if (!seeing) {
      gsap.to(progressEle,{
        height: 295,
        zIndex: 1,
        background: "#A7A7A9",
        duration: 0.3,
        paddingTop: 10,
        paddingBottom: 10,
      })
      setSeeing(true);
    }
    else {
      let newProgress = 0;
      for (let i = 0; i < progressEle.children.length; i+=2) {
        if (progressEle.children[i].children.length == 2) {
          if (progressEle.children[i].firstChild.checked) newProgress++;
          else break;
        }
      }
      try {
        await getData(`/ideas/updateProgress/${ideaId}/${newProgress}`, "get", false);
        setIdeaProgress(newProgress);
      } catch (error) {
        toast.error(error.response.data.message || "An error occurred. Please try again later.");
      }
      gsap.to(progressEle,{
        height: 8,
        zIndex: 0,
        background: `linear-gradient(to right, #A7A7A9 0%, #A7A7A9 ${(newProgress/steps.length)*100}%, transparent ${(newProgress/steps.length)*100}%, transparent 100%`,
        duration: 0.3,
        paddingTop: 0,
        paddingBottom: 0,
      })
      setSeeing(false);
    }
  }
  return (
    <div
      ref={progressEleRef}
      onClick={handleClick}
      className={`w-full h-2 flex flex-col px-2 gap-2 cursor-pointer overflow-y-scroll ${className}`}
      style={{background: `linear-gradient(to right, #A7A7A9 0%, #A7A7A9 ${(ideaProgress/steps.length)*100}%, transparent ${(ideaProgress/steps.length)*100}%, transparent 100%`}}
    >
      {seeing ?
        steps.map((step, index) => (
          <>
            <div
              key={index}
              id={`step${index}`}
              className="flex gap-3"
            >
              <input
                type="checkbox"
                defaultChecked={index < ideaProgress}
                onChange={() => checkboxClick(progressEleRef.current, `step${index}`)}
                onClick={(e) => e.stopPropagation()}
                disabled={ideaOf != username}
                className="h-4 w-4 cursor-pointer"
              />
              <p className="text-black">{step}</p>
            </div>
            <div className={`${index == steps.length-1 ? "hidden" : ""} min-h-10 w-2 rounded-full bg-[#C1EDCC] relative left-1`}></div>
          </>
        ))
        : null
      }
    </div>
  )
}

export default Progress;