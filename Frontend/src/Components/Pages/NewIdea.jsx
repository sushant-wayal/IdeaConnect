import { useState } from "react";
import Footer from "../Components/Footer"
import SideNav from "../Components/SideNav"
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import MultiMedia from "../Components/MultiMedia";

const NewIdea = () => {
    const [username,setUsername] = useState("");
    useEffect(() => {
        const getUsername = async () => {
            const { data : { data } } = await axios.get("http://localhost:3000/api/v1/users/activeUser",{
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`
                }
            });
            if (data.authenticated) {
                setUsername(data.user.username);
            }
        };
        getUsername();
    })
    let ids = 2;
    const addStep = (id) => {
        let ele = document.getElementById(id);
        let newStep = document.createElement("div");
        newStep.id = `step${++ids}`;
        let thisId = ids;
        let nextBar = document.createElement("div");
        nextBar.classList.add("w-2","h-24","rounded-full","bg-gray-500","relative","left-10");
        newStep.append(nextBar);
        let step = document.createElement("div");
        step.classList.add("flex","gap-3");
        let add = document.createElement("button");
        add.addEventListener("click", () => addStep(`step${thisId}`));
        add.type = "button";
        add.classList.add("h-7","w-7","rounded-full","bg-gray-600","flex","justify-center","items-center","text-xl");
        let p = document.createElement("p");
        p.innerText = "+";
        add.append(p);
        step.append(add);
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.addEventListener("change", () => checkboxClick(`step${thisId}`));
        step.append(checkbox);
        let stepText = document.createElement("input");
        stepText.type = "text";
        stepText.classList.add("bg-transparent","focus:outline-none","w-32");
        stepText.defaultValue = "New Step";
        step.append(stepText);
        let remove = document.createElement("button");
        remove.addEventListener("click", () => removeStep(`step${thisId}`));
        remove.type = "button";
        remove.classList.add("h-7","w-7","rounded-full","bg-gray-600","flex","justify-center","items-center","text-xl");
        p = document.createElement("p");
        p.innerText = "-";
        remove.append(p);
        step.append(remove);
        newStep.append(step);
        ele.insertAdjacentElement("afterend",newStep);
        stepText.focus();
        stepText.setSelectionRange(0,stepText.defaultValue.length);
    }
    const removeStep = (id) => {
        if (document.getElementById("steps").firstChild.id == id) {
            document.getElementById(id).nextSibling.firstChild.remove();
            document.getElementById(id).remove();
        }
        else {
            document.getElementById(id).remove();
        }
    }
    const check = (id) => {
        let steps = document.getElementById("steps");
        for (let i = 0; i < steps.children.length; i++) {
            steps.children[i].lastChild.children[1].checked = true;
            if (steps.children[i].id == id) {
                break;
            }
        }
    }
    const uncheck = (id) => {
        let steps = document.getElementById("steps");
        let set = true;
        for (let i = 0; i < steps.children.length; i++) {
            if (steps.children[i].id == id) {
                set = false;
            }
            steps.children[i].lastChild.children[1].checked = set;
        }
    }
    const checkboxClick = (id) => {
        if (document.getElementById(id).lastChild.children[1].checked) {
            check(id);
        }
        else {
            uncheck(id);
        }
    }
    let categoriesList = [];
    const addCategory = (e) => {
        if (e.key == "Enter") {
            e.preventDefault();
            if (!categoriesList.includes(document.getElementById("newCategory").value)) {
                let categories = document.getElementById("categories");
                let newCategory = document.createElement("p");
                newCategory.classList.add("bg-gray-600","p-2","rounded-2xl","relative")
                newCategory.innerText = document.getElementById("newCategory").value;
                let cut = document.createElement("div");
                cut.classList.add("h-5","w-5","rounded-full","flex","justify-center","items-center","absolute","top-[-5px]","right-[-5px]","bg-black","text-gray-600","cursor-pointer");
                let p =  document.createElement("p");
                p.innerText = "x";
                cut.append(p);
                cut.addEventListener("click", () => {
                    newCategory.remove();
                    categoriesList.splice(categoriesList.indexOf(newCategory.innerText),1);
                });
                newCategory.append(cut);
                categories.prepend(newCategory);
                categoriesList.push(document.getElementById("newCategory").value);
            }
            document.getElementById("newCategory").value = "";
        }
    }
    const [media, setMedia] = useState([{
        src: "../../../images/defaultImageUpload.jpg",
        type: "default",
        alt: "Default Image"
    }]);
    const upload = async (formData) => {
        const { data } = await axios.post("http://localhost:3000/api/v1/images/upload",formData,{
            headers: {
                "Content-Type": "multipart/form-data",
            }
        })

        if (data.success) {
            setMedia(prev => [...prev, {
                src: data.data.url,
                type: data.data.type,
                alt: username+" "+data.data.type
            }]);
        }
        else {
            console.log("Check BackEnd");
        }
    }
    const fileChange = async (e) => {
        let formData = new FormData();
        formData.append("file",e.target.files[0]);
        await upload(formData);
        document.querySelector("#media").remove();
    }
    const imageUpload = () => {
        let input = document.createElement("input");
        input.type = "file";
        input.id = "media";
        input.accept = "image/*,video/*";
        document.body.append(input);
        input.onchange = fileChange;
        input.click();
    }
    const [title,setTitle] = useState("");
    const [description,setDescription] = useState("");
    const navigate = useNavigate();
    const publish = async (e) => {
        e.preventDefault();
        let steps = [];
        let progress = 0;
        let stepsEle = document.querySelector("#steps");
        for (let i = 0; i < stepsEle.children.length; i++) {
            steps.push(stepsEle.children[i].lastChild.children[2].value);
            if (stepsEle.children[i].lastChild.children[1].checked) {
                progress++;
            }
        }
        const { data : { data } } = await axios.post("http://localhost:3000/api/v1/ideas/publishIdea",{
            username,
            title,
            categories: categoriesList,
            media: media.slice(1),
            description,
            steps,
            progress,
        })
        if (data.success) {
            navigate(`/profile/${username}`)
        }
    }

    return (
        <div className="w-lvh flex justify-center">
            <SideNav/>
            <div className="w-lvw left-1 lg:w-[calc(100vw*5.4/6.5)] relative lg:left-32 flex flex-col items-center p-3 gap-5">
                <p className="text-center text-4xl">Publish New Idea</p>
                <form onSubmit={publish} className="w-full sm:w-1/2 p-3 border-2 border-black border-solid rounded-2xl backdrop-blur-sm flex flex-col items-center gap-5">
                    <input value={title} onChange={(e) => setTitle(e.target.value)} className="py-1 px-3 w-full bg-gray-600 bg-opacity-80 border-2 border-black border-solid rounded-full placeholder:text-white placeholder:opacity-80 text-center" type="text" placeholder="Title"/>
                    <div className="w-full h-[768px] sm:h-96 flex flex-col gap-2 sm:gap-0 sm:flex-row justify-around relative">
                        <div className="w-full h-1/2 sm:h-full sm:w-2/5 bg-gray-600 bg-opacity-80 border-2 border-black border-solid rounded-2xl relative">
                            <MultiMedia
                                key={media.length}
                                medias={media.length > 1 ? media.slice(1) : media}
                                id={"newIdea"}
                                start={media.length > 1 ? media.length-2 : 0}
                                navigationSize={16}
                                soundSize={30}
                                wrapperClassName="w-full h-full rounded-2xl"
                                containerClassName="rounded-2xl"
                            />
                            <div onClick={imageUpload} className="h-7 w-7 rounded-full bg-gray-900 border-2 border-black border-solid text-white font-semibold flex items-center justify-center text-2xl absolute top-4 right-4 cursor-pointer">
                                <p>+</p>
                            </div>
                        </div>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full sm:w-2/5 h-1/2 sm:h-full bg-gray-600 bg-opacity-80 rounded-2xl border-2 border-black border-solid p-2 resize-none placeholder:text-white placeholder:opacity-80" placeholder="Describe Your Idea ..."></textarea>
                    </div>
                    <div className="w-full flex flex-col gap-3 sm:gap-0 sm:flex-row justify-around relative">
                        <div className="w-full sm:w-2/5 flex flex-col gap-5">
                            <p>Steps</p>
                            <div id="steps">
                                <div id="step1">
                                    <div className="flex gap-3">
                                        <button onClick={() => addStep("step1")} type="button" className="h-7 w-7 rounded-full bg-gray-600 flex justify-center items-center text-xl"><p>+</p></button>
                                        <input onChange={() => checkboxClick("step1")} type="checkbox"/>
                                        <input className="bg-transparent focus:outline-none w-32" type="text" defaultValue={"Start"}/>
                                        <button onClick={() => removeStep("step1")} type="button" className="h-7 w-7 rounded-full bg-gray-600 flex justify-center items-center text-xl"><p>-</p></button>
                                    </div>
                                </div>
                                <div id="step2">
                                    <div className="w-2 h-24 rounded-full bg-gray-500 relative left-10"></div>
                                    <div className="flex gap-3">
                                        <button onClick={() => addStep("step2")} type="button" className="h-7 w-7 rounded-full bg-gray-600 flex justify-center items-center text-xl"><p>+</p></button>
                                        <input onChange={() => checkboxClick("step2")} type="checkbox"/>
                                        <input className="bg-transparent focus:outline-none w-32" type="text" defaultValue={"Complete"}/>
                                        <button onClick={() => removeStep("step2")} type="button" className="h-7 w-7 rounded-full bg-gray-600 flex justify-center items-center text-xl"><p>-</p></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full sm:w-2/5 flex flex-col gap-5">
                            <p>Categeroies</p>
                            <div id="categories" className="h-48 border-2 border-black border-solid rounded-2xl flex flex-wrap flex-start gap-3 p-2">
                                <textarea id="newCategory" className="w-full h-full bg-transparent resize-none focus:outline-none" onKeyDown={addCategory}></textarea>
                            </div>
                        </div>
                    </div>
                    <button className="border-2 border-black border-solid rounded-full p-2 w-24 bg-gray-600 bg-opacity-80" type="submit">Publish</button>
                </form>
                <Footer styling={"border-2 border-black border-solid rounded-2xl pr-5 backdrop-blur-sm"}/>
            </div>
        </div>
    )
}

export default NewIdea