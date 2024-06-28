import { useState } from "react";
import { NavLink } from "react-router-dom"
import { RiMenu3Line } from "@remixicon/react"

const SignInUpNav = () => {
	const active = (isActive) => {
		let style = "sm:p-3 p-1 text-center rounded-full";
		if (!isActive) style += " bg-[#A7A7A9]";
		else style += " bg-[#C1EDCC]"
		return style;
	}
	const [seeing, setSeeing] = useState(false);
	return (
		<div className="bg-[#797270] fixed w-[99%] flex h-12 py-8 px-2 pr-5 justify-between items-center z-50 sm:z-10 rounded-2xl">
			<img className="w-[15vmax]" src="../../../../images/logo.png" alt="IdeaConnect"/>
			<div className="hidden sm:flex justify-center gap-10">
					<NavLink
						className={({isActive}) => active(isActive)}
						to="/"
					>
						Sign In 
					</NavLink>
					<NavLink
						className={({isActive}) => active(isActive)}
						to="/signUp"
					>
						Sign Up
					</NavLink>
			</div>
			<div className="sm:hidden relative"onClick={() => setSeeing(!seeing)}>
				<RiMenu3Line/>
				<div className={`${seeing ? "flex" : "hidden"} flex-col absolute right-0 top-8 w-[400%] backdrop-blur-sm p-1 rounded-xl`}>
					<NavLink
						className={({isActive}) => active(isActive)}
						to="/"
						onClick={() => setSeeing(false)}
					>
						Sign In
					</NavLink>
					<NavLink
						className={({isActive}) => active(isActive)}
						to="/signUp" onClick={() => setSeeing(false)}
					>
						Sign Up
					</NavLink>
				</div>
			</div>
		</div>
	)
}

export default SignInUpNav