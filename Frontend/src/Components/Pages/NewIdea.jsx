import { useRef, useState } from "react";
import Footer from "../Components/General/Footer"
import SideNav from "../Components/General/SideNav"
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import MultiMedia from "../Components/Main/MultiMedia";
import { getData } from "../dataLoaders";
import Step from "../Components/NewIdea/Step";
import Category from "../Components/NewIdea/Category";

const NewIdea = () => {
    const [username,setUsername] = useState("");
    const [categories,setCategories] = useState([]);
    const [title,setTitle] = useState("");
    const [description,setDescription] = useState("");

    const [steps, setSteps] = useState([{
        value: "Start",
        checked: false,
        isNew: false
    },{
        value: "Complete",
        checked: false,
        isNew: false
    }]);

    const [media, setMedia] = useState([{
        src: "../../../images/defaultImageUpload.jpg",
        type: "default",
        alt: "Default Image"
    }]);

    const navigate = useNavigate();

    const newCategoryEleRef = useRef();

    useEffect(() => {
        const getUsername = async () => {
            const { authenticated, user } = await getData('/users/activeUser', "get", true);
            if (authenticated) setUsername(user.username);
        };
        getUsername();
    })

    const addCategory = (e) => {
        if (e.key == "Enter") {
            e.preventDefault();
            if (!categories.includes(newCategoryEleRef.current.value)) setCategories(prev => [newCategoryEleRef.current.value, ...prev]);
            newCategoryEleRef.current.value = "";
        }
    }

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
        else console.log("Check BackEnd");
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
        input.style.display = "none";
        input.click();
    }

    const publish = async (e) => {
        e.preventDefault();
        const { data : { data : { success } } } = await axios.post("http://localhost:3000/api/v1/ideas/publishIdea",{
            username,
            title,
            categories,
            media: media.slice(1),
            description,
            steps : steps.map(step => step.value),
            progress : steps.reduce((acc,step) => step.checked ? acc+1 : acc,0)
        })
        if (success) navigate(`/profile/${username}`)
    }

    return (
        <div className="w-lvh flex justify-center">
            <SideNav/>
            <div className="w-lvw left-1 lg:w-[calc(100vw*5.4/6.5)] relative lg:left-32 flex flex-col items-center p-3 gap-5">
                <p className="text-center text-4xl">Publish New Idea</p>
                <form
                    onSubmit={publish}
                    className="w-full sm:w-1/2 p-3 border-2 border-black border-solid rounded-2xl backdrop-blur-sm flex flex-col items-center gap-5"
                >
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="py-1 px-3 w-full bg-gray-600 bg-opacity-80 border-2 border-black border-solid rounded-full placeholder:text-white placeholder:opacity-80 text-center"
                        type="text"
                        placeholder="Title"
                    />
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
                            <div
                                onClick={imageUpload}
                                className="h-7 w-7 rounded-full bg-gray-900 border-2 border-black border-solid text-white font-semibold flex items-center justify-center text-2xl absolute top-4 right-4 cursor-pointer"
                            >
                                <p>+</p>
                            </div>
                        </div>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full sm:w-2/5 h-1/2 sm:h-full bg-gray-600 bg-opacity-80 rounded-2xl border-2 border-black border-solid p-2 resize-none placeholder:text-white placeholder:opacity-80"
                            placeholder="Describe Your Idea ..."
                        ></textarea>
                    </div>
                    <div className="w-full flex flex-col gap-3 sm:gap-0 sm:flex-row justify-around relative">
                        <div className="w-full sm:w-2/5 flex flex-col gap-5">
                            <p>Steps</p>
                            <div>
                                {steps.map((step, ind) => (
                                    <Step
                                        key={ind}
                                        ind={ind}
                                        step={step}
                                        setSteps={setSteps}
                                        stepsLength={steps.length}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="w-full sm:w-2/5 flex flex-col gap-5">
                            <p>Categeroies</p>
                            <div className="h-48 border-2 border-black border-solid rounded-2xl flex flex-wrap flex-start gap-3 p-2 overflow-y-scroll">
                                {categories.map((category, ind) => (
                                    <Category
                                        key={category}
                                        category={category}
                                        setCategories={setCategories}
                                        ind={ind}
                                    />
                                ))}
                                <textarea
                                    className="w-full h-full bg-transparent resize-none focus:outline-none"
                                    onKeyDown={addCategory}
                                    ref={newCategoryEleRef}
                                ></textarea>
                            </div>
                        </div>
                    </div>
                    <button
                        className="border-2 border-black border-solid rounded-full p-2 w-24 bg-gray-600 bg-opacity-80"
                        type="submit"
                    >
                        Publish
                    </button>
                </form>
                <Footer styling={"border-2 border-black border-solid rounded-2xl pr-5 backdrop-blur-sm"}/>
            </div>
        </div>
    )
}

export default NewIdea