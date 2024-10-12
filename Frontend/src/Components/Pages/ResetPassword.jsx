import { Helmet } from "react-helmet";
import SignInUpNav from "../SubComponents/General/SignInUpNav";
import Footer from "../SubComponents/General/Footer";
import { Eye, EyeOff, Loader } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import { project_mode } from "../../../constants";

const ResetPassword = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const urlSearchParams = new URLSearchParams(location.search);
	const username = urlSearchParams.get("username") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [see, setSee] = useState(false);
  const [loading, setLoading] = useState(false);
  const resetPassword = async (e) => {
    e.preventDefault();
		if (newPassword !== confirmPassword) {
			return toast.error("Passwords do not match. Try Again");
		}
    setLoading(true);
		const toastId = toast.loading("Resetting Password...");
		try {
			const { data : { message } } = await axios.post(`${project_mode == "production" ? "" : "http://localhost:3000"}/api/v1/users/resetPassword`, {
				username,
				password: newPassword
			})
			toast.success(message, { id: toastId });
			navigate("/");
		} catch (error) {
			toast.error(error.response.data.message || "An Error Occurred. Try Again", { id: toastId });
		}
		setLoading(false);
  }
  return (
    <div className="h-lvh w-lvw flex flex-col justify-between items-center">
      <Helmet>
				<title>Ideaconnet | Reset Password</title>
				<meta
					name="description"
					content="Reset your password for Ideaconnet."
				/>
			</Helmet>
      <SignInUpNav/>
      <form
				onSubmit={resetPassword}
				className="bg-[#797270] relative top-1/2 -translate-y-1/2 sm:h-[450px] h-[400px] w-80 flex flex-col justify-between items-center sm:gap-7 gap-0 rounded-3xl p-3 py-5"
			>
				<div className="w-full flex flex-col items-center gap-2">
					<h3 className="sm:text-4xl text-5xl font-semibold sm:mb-5"> Reset Password </h3>
					<p className="text-center text-lg sm:text-xl"> Enter your password below </p>
				</div>
        <div className="relative w-full flex flex-col justify-center gap-2">
					<input
						onChange={(e) => setNewPassword(e.target.value)}
						className="py-1 px-3 w-full bg-[#C1EDCC] placeholder:text-black/90 text-black bg-opacity-80 rounded-full"
						type="text"
						placeholder="New Password"
					/>
					<input
						onChange={(e) => setConfirmPassword(e.target.value)}
						className="py-1 px-3 w-full bg-[#C1EDCC] placeholder:text-black/90 text-black bg-opacity-80 rounded-full"
						type={`${see ? "text" : "password"}`}
						placeholder="Confirm Password"
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
        <button
						className="bg-[#C1EDCC] p-2 rounded-2xl sm:text-sm text-2xl flex items-center justify-center gap-1"
						type="submit"
						disabled={loading}
					>
						{loading ?
							<>
								<Loader className="animate-spin h-7 w-7" />
								<p> Resetting Password... </p>
							</>
							:
							"Reset Password"
						}
					</button>
      </form>
      <Footer styling={"w-[98%] relative bottom-2 rounded-2xl"}/>
    </div>
  );
}

export default ResetPassword;