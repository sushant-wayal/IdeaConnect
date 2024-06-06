import { NavLink } from "react-router-dom"
import { RiMenu3Line } from "@remixicon/react"
import { useState } from "react";


const SignInUpNav = () => {
    const active = (isActive) => {
        let style = "sm:p-3 p-1 text-center";
        if (isActive) {
            style += " border-2 border-black border-solid rounded-3xl";
        }
        return style;
    }
    const [seeing, setSeeing] = useState(false);
    return (
        <div className="fixed top-0 sm:top-2 w-full flex h-12 py-1 px-2 pr-5 justify-between items-center z-50 bg-[#f8f8f8] sm:bg-transparent sm:z-0">
            <img className="w-[15vmax]" src="../../../../images/logo.png" alt="IdeaConnect"/>
            <div className="hidden sm:flex justify-center gap-10">
                <NavLink className={({isActive}) => active(isActive)} to="/" > Sign In </NavLink>
                <NavLink className={({isActive}) => active(isActive)} to="/signUp"> Sign Up </NavLink>
            </div>
            <div className="sm:hidden relative"onClick={() => setSeeing(!seeing)}>
                <RiMenu3Line/>
                <div className={`${seeing ? "flex" : "hidden"} flex-col absolute right-0 top-8 w-[400%] backdrop-blur-sm p-1 rounded-xl`}>
                    <NavLink className={({isActive}) => active(isActive)} to="/" onClick={() => setSeeing(false)}> Sign In </NavLink>
                    <NavLink className={({isActive}) => active(isActive)} to="/signUp" onClick={() => setSeeing(false)}> Sign Up </NavLink>
                </div>
            </div>
	    </div>
    )
}

export default SignInUpNav