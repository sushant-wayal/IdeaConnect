import axios from "axios";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const Idea = ({ thisIdea }) => {
    const { idea, profileImage, ideaOf, included } = thisIdea;
    const [intrested, setIntrested] = useState(thisIdea.intrested);
    const [username,setUsername] = useState("");
    const categoryRef = useRef(null);
    const intrestRef = useRef(null);
    const descriptionRef = useRef(null);
    const progressRef = useRef(null);
    const [ideaProgress, setIdeaProgress] = useState(idea.progress);
    const [noOfLikes, setNoOfLikes] = useState(idea.likes);
    const [isLiked,setIsLiked] = useState(false);
    const likeRef = useRef(null);
    useEffect(() =>{
        const checkLike = async () => {
            const { data : { data } } = await axios.get(`http://localhost:3000/api/v1/ideas/checkLike/${idea._id}/${username}`);
            setIsLiked(data.liked);
        }
        checkLike();
    },[username])
    useEffect(() => {
        const getUsername = async () => {
            const { data : { data } } = await axios.get("http://localhost:3000/api/v1/users/activeUser", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });
            if (data.authenticated) {
                setUsername(data.user.username);
            }
        };
        getUsername();
    },[])
    useEffect(() => {
        const categoryEle = categoryRef.current;
        if (!categoryEle) return;
        let seeing = false;
        const handleClick = () => {
            if (!seeing) {
                gsap.to(categoryEle,{
                    width: 267,
                    height: 260,
                    zIndex: 1,
                    duration: 0.3,
                })
                categoryEle.removeChild(categoryEle.firstChild);
                for (let i of idea.categories) {
                    let thisCategory = document.createElement("p");
                    thisCategory.classList.add("bg-black","text-white","inline-block","mr-2","mb-2","p-2","rounded-3xl");
                    thisCategory.innerText = i;
                    categoryEle.append(thisCategory);
                }
                seeing = true;
            }
            else {
                while (categoryEle.firstChild) {
                    categoryEle.removeChild(categoryEle.firstChild);
                }
                let categoryText = document.createElement("p");
                categoryText.innerText = "Category";
                categoryEle.append(categoryText);
                gsap.to(categoryEle,{
                    width: 80,
                    height: 35,
                    zIndex: 0,
                    duration: 0.3,
                })
                seeing = false;
            }
        }
        categoryEle.addEventListener("click",handleClick);
        return () => categoryEle.removeEventListener("click",handleClick);
    },[idea.categories]);
    useEffect(() => {
        if (ideaOf != username) return;
        const intrestEle = intrestRef.current;
        if (!intrestRef) return;
        let seeing = false;
        const handleClick = async () => {
            if (!seeing) {
                gsap.to(intrestEle,{
                    height: 260,
                    width: 267,
                    duration: 0.3,
                })
                intrestEle.removeChild(intrestEle.firstChild);
                for (let intrestedUser of idea.intrestedUser) {
                    const { data : { data } } = await axios.get(`http://localhost:3000/api/v1/users/userInfo/${intrestedUser}`);
                    const { profileImage, username } = data;
                    let thisUser = document.createElement("div");
                    const include = async (e) => {
                        e.stopPropagation();
                        await axios.get(`http://localhost:3000/api/v1/ideas/include/${idea._id}/${intrestedUser}`, {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                            },
                        });
                        thisUser.remove();
                        idea.intrested--;
                    }
                    thisUser.innerHTML = `
                        <div class="flex px-2 py-1 gap-3 items-center">
                            <img class="h-7 w-7 rounded-full" src="${profileImage}" alt="profile"/>
                            <p class="text-lg font-medium">${username}</p>
                        </div>
                        ${localStorage.getItem("accessToken") ? `<button id="includeButton${intrestedUser}"  class="bg-black text-white rounded-xl px-2 py-1">Include</button>` : ``}
                    `;
                    thisUser.classList.add("flex","px-2","py-1","gap-3","items-center","justify-between","border-b-2","border-b-black","border-b-solid");
                    thisUser.querySelector(`#includeButton${intrestedUser}`).addEventListener("click",include);
                    intrestEle.append(thisUser);
                }
                seeing = true;
            }
            else {
                while (intrestEle.firstChild) {
                    intrestEle.removeChild(intrestEle.firstChild);
                }
                let p = document.createElement("p");
                p.innerText = username == ideaOf ? `${idea.intrested} Intrested` : intrested ? "Intrested" : included ? "Included" : "Intrested ?";
                intrestEle.append(p);
                gsap.to(intrestEle,{
                    height: 35,
                    width: 110,
                    duration: 0.3,
                })
                seeing = false;
            }
        }
        intrestEle.addEventListener("click",handleClick);
        return () => intrestEle.removeEventListener("click",handleClick);
    },[ideaOf,username,idea.intrestedUser]);
    let seeingDescription = false;
    useEffect(() => {
        const descriptionEle = descriptionRef.current;
        if (!descriptionEle) return;
        const handleClick = () => {
            if (!seeingDescription) {
                gsap.to(descriptionEle,{
                    height: 280,
                    backgroundColor: "black",
                    color: "white",
                    duration: 0.3,
                })
                seeingDescription = true;
            }
            else {
                gsap.to(descriptionEle,{
                    backgroundColor: "transparent",
                    color: "black",
                    height: 50,
                    duration: 0.3,
                })
                seeingDescription = false;
            }
        }
        descriptionEle.addEventListener("click",handleClick);
        return () => descriptionEle.removeEventListener("click",handleClick);
    },[idea.description]);
    useEffect(() => {
        if (ideaOf == username && !included) return;
        const handleClick = async () => {
            const { data : { data } } = await axios.get(`http://localhost:3000/api/v1/ideas/intrested/${idea._id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });
            setIntrested(!data.alreadyIntrested);
        }
        intrestRef.current.addEventListener("click",handleClick);
        return () => intrestRef.current?.removeEventListener("click",handleClick);
    },[]);
    useEffect(() => {
        const progressEle = progressRef.current;
        if (!progressEle) return;
        const check = (id) => {
            let steps = progressEle;
            for (let i = 0; i < steps.children.length; i += 2) {
                steps.children[i].firstChild.checked = true;
                if (steps.children[i].id == id) {
                    break;
                }
            }
        }
        const uncheck = (id) => {
            let steps = progressEle;
            let set = true;
            for (let i = 0; i < steps.children.length; i += 2) {
                if (steps.children[i].id == id) {
                    set = false;
                }
                steps.children[i].firstChild.checked = set;
            }
        }
        const checkboxClick = (id) => {
            if (document.getElementById(id).firstChild.checked) {
                check(id);
            }
            else {
                uncheck(id);
            }
        }
        let seeing = false;
        const handleClick = async () => {
            if (!seeing) {
                gsap.to(progressEle,{
                    height: 295,
                    zIndex: 1,
                    background: "black",
                    duration: 0.3,
                })
                let progressDone = 0;
                for (let step of idea.steps) {
                    let div = document.createElement("div");
                    let id = `step${idea.steps.indexOf(step)}`;
                    div.id = id;
                    div.classList.add("flex","gap-3");
                    let checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.addEventListener("change", () => checkboxClick(id));
                    checkbox.addEventListener("click", (e) => e.stopPropagation())
                    if (progressDone < ideaProgress) {
                        checkbox.checked = true;
                        progressDone++;
                    }
                    let Username = "";
                    const { data : { data } } = await axios.get("http://localhost:3000/api/v1/users/activeUser", {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                        },
                    });
                    if (data.authenticated) {
                        Username = data.user.username;
                    }
                    if (ideaOf != Username) {
                        checkbox.disabled = true;
                    }
                    div.append(checkbox);
                    let stepText = document.createElement("p");
                    stepText.classList.add("text-white");
                    stepText.innerText = step;
                    div.append(stepText);
                    progressEle.append(div);
                    let nextBar = document.createElement("div");
                    nextBar.classList.add("h-10","w-1","rounded-full","bg-white","relative","left-1");
                    progressEle.append(nextBar);
                }
                progressEle.removeChild(progressEle.lastChild);
                seeing = true;
            }
            else {
                let newProgress = 0;
                for (let i = 0; i < progressEle.children.length; i+=2) {
                    if (progressEle.children[i].children.length == 2) {
                        if (progressEle.children[i].firstChild.checked) {
                            newProgress++;
                        }
                        else {
                            break;
                        }
                    }
                }
                await axios.get(`http://localhost:3000/api/v1/ideas/updateProgress/${idea._id}/${newProgress}`);
                setIdeaProgress(newProgress);
                while (progressEle.firstChild) {
                    progressEle.removeChild(progressEle.firstChild);
                }
                gsap.to(progressEle,{
                    height: 8,
                    zIndex: 0,
                    background: `linear-gradient(to right, black 0%, black ${(newProgress/idea.steps.length)*100}%, transparent ${(newProgress/idea.steps.length)*100}%, transparent 100%`,
                    duration: 0.3,
                })
                seeing = false;
            }
        }
        progressEle.addEventListener("click",handleClick);
        return () => progressEle.removeEventListener("click",handleClick);
    },[ideaProgress])
    const likeIdea = async () => {
        const { data : { data } } = await axios.get(`http://localhost:3000/api/v1/ideas/likeIdea/${idea._id}/${username}`);
        if (data.liked) {
            setNoOfLikes(noOfLikes-1);
            setIsLiked(false);
        }
        else {
            setNoOfLikes(noOfLikes+1);
            setIsLiked(true);
        }
    }
    useEffect(() => {
        const likeEle = likeRef.current;
        if (!likeEle) return;
        const descriptionEle = descriptionRef.current;
        if (!descriptionEle) return;
        let seeing = false;
        const getLikes = async (e) => {
            if (!seeing) {
                while (descriptionEle.firstChild) {
                    descriptionEle.removeChild(descriptionEle.firstChild);
                }
                descriptionEle.innerText = "";
                gsap.to(descriptionEle,{
                    height: 280,
                    backgroundColor: "black",
                    color: "white",
                    duration: 0.3,
                })
                const { data : { data } } = await axios.get(`http://localhost:3000/api/v1/ideas/likedBy/${idea._id}`);
                const { likedBy } = data;
                for (let user of likedBy) {
                    let thisUser = document.createElement("div");
                    thisUser.classList.add("flex","px-2","py-1","gap-3","items-center","text-white");
                    let profileImg = document.createElement("img");
                    profileImg.classList.add("h-7","w-7","rounded-full");
                    profileImg.src = user.profileImage;
                    thisUser.append(profileImg);
                    let userName = document.createElement("p");
                    userName.innerText = user.username;
                    thisUser.append(userName);
                    descriptionEle.append(thisUser);
                }
                seeingDescription = false;
                seeing = true;
            }
            else {
                while (descriptionEle.firstChild) {
                    descriptionEle.removeChild(descriptionEle.firstChild);
                }
                descriptionEle.innerText = idea.description;
                gsap.to(descriptionEle,{
                    backgroundColor: "transparent",
                    color: "black",
                    height: 50,
                    duration: 0.3,
                })
                seeing = false;
            }
        }
        likeEle.addEventListener("click",getLikes);
        return () => likeEle.removeEventListener("click",getLikes);
    },[])
    return (
        <div className="relative w-full sm:w-[302px] h-[500px] sm:h-[450px] border-2 border-black border-solid backdrop-blur-sm rounded-2xl p-2 flex flex-col gap-2">
            <div className="flex justify-center items-center relative border-b-2 border-b-black border-b-solid">
                <img className="absolute left-1 -top-[6px] w-7 h-7 rounded-full border-2" src={profileImage} alt="profile"/>
                <p>
                    {idea.title}
                </p>
            </div>
            <div className="w-full rounded-xl relative h-[330px] sm:h-[280px] flex-shrink">
                <img className="w-full h-full rounded-xl flex-shrink" src={idea.media} alt="media"/>
                <div ref={categoryRef} className="category absolute top-2 left-2 px-2 py-1 bg-gray-600 rounded-xl w-[80px] h-[35px] cursor-pointer">
                    <p>Category</p>
                </div>
                <div ref={intrestRef} id="intrest" className={`absolute top-2 right-2 px-2 py-1 bg-gray-600 rounded-xl ${included ? "text-white" : "cursor-pointer"} flex flex-col gap-2`}>
                    <p>{username == ideaOf ? `${idea.intrested} Intrested` : intrested ? "Intrested" : included ? "Included" : "Intrested ?"}</p>
                </div>
            </div>
            <div className="flex flex-col gap-0 absolute w-[95%] sm:w-[285px] bottom-7">
                <p ref={descriptionRef} className="overflow-y-hidden border-2 border-black border-solid border-b-0 rounded-t-2xl p-[3px] leading-5 h-[50px] cursor-pointer absolute w-full bottom-[40px] flex flex-col gap-2">
                    {idea.description}
                </p>
                <div ref={progressRef} className="w-full h-2 border-2 border-black border-solid flex flex-col px-2 gap-2 cursor-pointer" style={{background: `linear-gradient(to right, black 0%, black ${(ideaProgress/idea.steps.length)*100}%, transparent ${(ideaProgress/idea.steps.length)*100}%, transparent 100%`}}></div>
                <div className="flex justify-around border-2 border-black border-solid border-t-0 rounded-b-2xl p-1">
                    <div className="flex gap-1 justify-center items-center">
                        <img onClick={likeIdea} className="h-4 w-4" src={`../../../../images/like${isLiked ? "d" : ""}.svg`}/>
                        <p ref={likeRef}>{noOfLikes}</p>
                    </div>
                    <div className="flex gap-1 justify-center items-center">
                        <img className="h-4 w-4" src="../../../../images/comment.svg"/>
                        <p>{idea.noOfComments}</p>
                    </div>
                    <div className="flex gap-1 justify-center items-center">
                        <img className="h-4 w-4" src="../../../../images/share.svg"/>
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