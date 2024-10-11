import axios from "axios";
import Footer from "../SubComponents/General/Footer";
import SignInUpNav from "../SubComponents/General/SignInUpNav"
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useUser } from "../../context/user";
import {
	Link,
	useLocation,
	useNavigate
} from "react-router-dom";
import {
	Eye,
	EyeOff,
	Loader
} from "lucide-react";
import { Helmet } from "react-helmet";
import { project_mode } from "../../../constants";

const SignIn = () => {
	const location = useLocation();

	useEffect(() => {
		if (location.search.includes("accessToken") && location.search.includes("refreshToken") && location.search.includes("user")) {
			setLoading(true);
			const toastId = toast.loading("Logging In...");
			setErrorMsg("");
			const params = new URLSearchParams(location.search);
			const accessToken = params.get("accessToken");
			const refreshToken = params.get("refreshToken");
			const user = JSON.parse(params.get("user"));
			localStorage.setItem("accessToken", accessToken);
			localStorage.setItem("refreshToken", refreshToken);
			localStorage.setItem("rememberMe", rememberMe);
			const { _id, username: finalsUsername, profileImage, firstName, lastName } = user;
			setId(_id);
			setFinalsUsername(finalsUsername);
			setProfileImage(profileImage);
			setFirstName(firstName);
			setLastName(lastName);
			navigate("/ideas");
			toast.success("Logged In Successfully", { id: toastId });
			setLoading(false);
		}
	}, [location])

	const {
		setId,
		setUsername : setFinalsUsername,
		setProfileImage,
		setFirstName,
		setLastName
	} = useUser();

	const [see, setSee] = useState(false);
	const [errorMsg, setErrorMsg] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [rememberMe, setRememberMe] = useState(false);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate()

	useEffect(() => {
		const rememberMe = localStorage.getItem("rememberMe");
		if (rememberMe && localStorage.getItem("accessToken")) navigate("/ideas");
	},[])

	const login = async (e) => {
		e.preventDefault();
		if (!username || !password) {
			if (!username && !password) {
				toast.error("All Fields Are Required");
				setErrorMsg("All Fields Are Required");
			} else if (!password) {
				toast.error("Password is Required");
				setErrorMsg("Password is Required");
			} else {
				toast.error("Username is Required");
				setErrorMsg("Username is Required");
			}
			return;
		}
		setLoading(true);
		const toastId = toast.loading("Logging In...")
		try {
			const { data : { data : {
				authenticated,
				user: {
					_id,
					username: finalsUsername,
					profileImage,
					firstName,
					lastName,
				},
				accessToken,
				refreshToken 
			} } } = await axios.post("http://localhost:3000/api/v1/users/login", {
				username,
				password,
			})
			if (authenticated) {
				setErrorMsg("");
				localStorage.setItem("accessToken", accessToken);
				localStorage.setItem("refreshToken", refreshToken);
				localStorage.setItem("rememberMe", rememberMe);
				setId(_id);
				setFinalsUsername(finalsUsername);
				setProfileImage(profileImage);
				setFirstName(firstName);
				setLastName(lastName);
				navigate("/ideas");
				toast.success("Logged In Successfully", { id: toastId });
			} else {
				toast.error("Invalid Credentials", { id: toastId });
				setErrorMsg("Invalid Credentials");
			}
		} catch (error) {
			toast.error(error.response.data.message || "An Error Occurred. Try Again", { id: toastId });
			setErrorMsg(error.response.data.message || "An Error Occurred. Try Again");
		}
		setLoading(false);
	}
	return (
		<div className="h-lvh w-lvw flex flex-col justify-between items-center">
			<Helmet>
				<title>Ideaconnet | Log In</title>
				<meta
					name="description"
					content="Log in to Ideaconnet."
				/>
			</Helmet>
			<SignInUpNav/>
			<form
				onSubmit={login}
				className="bg-[#797270] relative top-1/2 -translate-y-1/2 sm:h-[450px] h-[400px] w-80 flex flex-col justify-between items-center sm:gap-7 gap-0 rounded-3xl p-3 py-5"
			>
				<h3 className="sm:text-4xl text-5xl font-semibold sm:mb-5"> Log In </h3>
				<div className="relative w-full flex flex-col justify-center gap-2">
					<input
						onChange={(e) => setUsername(e.target.value)}
						className="py-1 px-3 w-full bg-[#C1EDCC] placeholder:text-black/90 text-black bg-opacity-80 rounded-full"
						type="text"
						placeholder="Username"
					/>
					<input
						onChange={(e) => setPassword(e.target.value)}
						className="py-1 px-3 w-full bg-[#C1EDCC] placeholder:text-black/90 text-black bg-opacity-80 rounded-full"
						type={`${see ? "text" : "password"}`}
						placeholder="Password"
					/>
					{see ?
						<EyeOff
							onClick={() => setSee(!see)}
							className="absolute h-7 right-3 top-[44px] cursor-pointer"
						/>
						:
						<Eye
							onClick={() => setSee(!see)}
							className="absolute h-7 right-3 top-[44px] cursor-pointer"
						/>
					}
				</div>
				<p className="absolute left-5 top-48 text-red-600 font-semibold text-sm"> {errorMsg} </p>
				<label
					className="relative -left-20"
					htmlFor="rememberMe"
				>
					<input
						name="rememberMe"
						id="rememberMe"
						type="checkbox"
						checked={rememberMe}
						onChange={() => setRememberMe(prev => !prev)}
					/> Remember Me
				</label>
				<hr className="w-full"/>
				<Link to={`${project_mode == "production" ? "/auth/google" : "http://localhost:3000/auth/google"}`} className="w-full flex justify-start gap-5 px-5 items-center bg-[#C1EDCC] rounded-3xl py-1">
					<img
						src="../../../authLogo/google.webp"
						alt="Google"
						className="h-5 rounded-full aspect-square object-cover"
					/>
					<p className="text-md">Log in with Google</p>
				</Link>
				<button
					className="bg-[#C1EDCC] p-2 rounded-2xl sm:text-sm text-2xl sm:w-20 w-32 flex items-center justify-center gap-1"
					type="submit"
					disabled={loading}
				>
					{loading ?
						<>
							<Loader className="animate-spin h-7 w-7" />
							<p>Logging in...</p>
						</>
						:
						"Log    in"
					}
				</button>
				<Link
					className="underline sm:text-sm text-lg"
					to="/signUp"
				>
					<i> Create New Account </i>
				</Link>
			</form>
			<Footer styling={"w-[98%] relative bottom-2 rounded-2xl"}/>
		</div>
	)
}

export default SignIn;