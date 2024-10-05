import axios from "axios";
import Step from "../SubComponents/NewIdea/Step";
import Footer from "../SubComponents/General/Footer";
import SideNav from "../SubComponents/General/SideNav";
import Category from "../SubComponents/NewIdea/Category";
import MultiMedia from "../SubComponents/Main/MultiMedia";
import Uploading from "../SubComponents/General/Uploading";
import { toast } from "sonner";
import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { useUser } from "../../context/user";
import { useNavigate } from "react-router-dom";

const NewIdea = () => {
	const { username } = useUser();
	const [categories,setCategories] = useState([]);
	const [title,setTitle] = useState("");
	const [currCategory,setCurrCategory] = useState("");
	const [description,setDescription] = useState("");
	const [publishing,setPublishing] = useState(false);
	const [uploading, setUploading] = useState(false);

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

	const addCategory = (e) => {
		if (e.key == "Enter") {
			e.preventDefault();
			if (!categories.includes(currCategory)) setCategories(prev => [currCategory, ...prev]);
			setCurrCategory("");
		}
	}

	const upload = async (formData) => {
		try {
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
		} catch (error) {
			toast.error(error.response.data.message || "An error occurred. Please try again later.");
		}
	}

	const fileChange = async (e) => {
		let formData = new FormData();
		formData.append("file",e.target.files[0]);
		setUploading(true);
		await upload(formData);
		setUploading(false);
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
		if (!title) {
			toast.error("Title is Required");
			return;
		}
		if (!description) {
			toast.error("Description is Required");
			return;
		}
		if (categories.length == 0) {
			toast.error("Atleast One Category is Required");
			return;
		}
		let validMedia = false;
		for (let i=1; i < media.length ; i++) {
			if (media[i].type == "image") {
				validMedia = true;
				break;
			}
		}
		if (!validMedia) {
			toast.error("Atleast One Image is Required");
			return;
		}
		setPublishing(true);
		const toastId = toast.loading("Publishing Idea...");
		try {
			const { data : { data : { success } } } = await axios.post("http://localhost:3000/api/v1/ideas/publishIdea",{
				username,
				title,
				categories,
				media: media.slice(1),
				description,
				steps : steps.map(step => step.value),
				progress : steps.reduce((acc,step) => step.checked ? acc+1 : acc,0)
			})
			if (success) {
				navigate(`/profile/${username}`);
				toast.success("Idea Published Successfully", { id: toastId });
			}
		} catch (error) {
			toast.error(error.response.data.message || "An error occurred. Please try again later.", { id: toastId });
		}
		setPublishing(false);
	}

	return (
		<div className="w-lvh flex justify-center">
			<SideNav/>
			<div className="w-lvw left-1 lg:w-[calc(100vw*5.4/6.5)] relative lg:left-32 flex flex-col items-center p-3 gap-5">
				<p className="text-center text-4xl text-white">Publish New Idea</p>
				<form
					onSubmit={publish}
					className="w-full sm:w-1/2 p-3 rounded-2xl bg-[#797270] flex flex-col items-center gap-5"
				>
					<input
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						className="py-1 px-3 w-full bg-[#C1EDCC] bg-opacity-80 rounded-full placeholder:text-black placeholder:opacity-80 text-center"
						type="text"
						placeholder="Title"
					/>
					<div className="w-full h-[768px] sm:h-96 flex flex-col gap-2 sm:gap-0 sm:flex-row justify-around relative">
						<div className="w-full h-1/2 sm:h-full sm:w-2/5 rounded-2xl relative">
							<MultiMedia
								key={media.length}
								medias={media.length > 1 ? media.slice(1) : media}
								id={"newIdea"}
								start={media.length > 1 ? media.length-2 : 0}
								navigationSize={16}
								soundSize={30}
								wrapperClassName="w-full h-full rounded-2xl"
								containerClassName="rounded-2xl"
								uploading={uploading}
							/>
							<div
								onClick={imageUpload}
								className="bg-[#C1EDCC] absolute top-4 right-4 cursor-pointer p-2 rounded-full flex justify-center items-center"
							>
								<ImagePlus/>
							</div>
						</div>
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							className="w-full sm:w-2/5 h-1/2 sm:h-full bg-[#C1EDCC] bg-opacity-80 rounded-2xl p-2 resize-none placeholder:text-black placeholder:opacity-80"
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
								<div className="h-48 bg-[#A7A7A9] rounded-2xl flex flex-wrap flex-start gap-3 p-2 overflow-y-scroll">
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
										value={currCategory}
										onChange={(e) => setCurrCategory(e.target.value)}
									></textarea>
								</div>
							</div>
					</div>
					<button
						className="rounded-full p-2 px-3 bg-[#C1EDCC] bg-opacity-80"
						type="submit"
						disabled={publishing}
					>
						<div className="flex justify-center items-center gap-2">
								<Uploading loading={publishing}/>
								<p>Publish{publishing ? "ing..." : ""}</p>
						</div>
					</button>
				</form>
					<Footer styling={"rounded-2xl pr-5 backdrop-blur-sm"}/>
			</div>
		</div>
	)
}

export default NewIdea