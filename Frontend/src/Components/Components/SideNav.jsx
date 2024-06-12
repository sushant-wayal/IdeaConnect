import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { RiMenu3Line } from "@remixicon/react"

const SideNav = () => {
    const active = (isActive) => {
        let style = "p-1 border-2 border-black border-solid rounded-full text-center w-full";
        if (isActive) {
            style += " bg-black text-white";
        }
        return style;
    }
    const [username,setUsername] = useState("");
    const navigate = useNavigate();
    useEffect(() => {
        const getUsername = async () => {
            const { data : { data } } = await axios.get("http://localhost:3000/api/v1/users/activeUser",{
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });
            if (data.authenticated) {
                setUsername(data.user.username);
            }
        };
        getUsername();
    })
    const logout = async () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/");
    }
    const [seeing, setSeeing] = useState(false);
    return (
        <>
            <RiMenu3Line onClick={() => setSeeing(!seeing)} className="lg:hidden fixed left-[4vw] top-4 z-50 cursor-pointer"/>
            <div className={`lg:h-[calc(98vh)] fixed left-0 top-0 p-3 lg:flex flex-col justify-between lg:w-[calc(100vw/6.5)] m-2 border-2 border-black border-solid rounded-2xl backdrop-blur-sm ${!seeing ? "hidden" : "flex z-50 w-48 h-[90.5vh] overflow-y-scroll -left-2 rounded-e-0"}`}>
                <div className="flex flex-col justify-center gap-5 w-full">
                    <button onClick={() => setSeeing(false)} className="text-left lg:hidden">X</button>
                    <NavLink className={({isActive}) => active(isActive)} to="/ideas"> Feed </NavLink>
                    <NavLink className={({isActive}) => active(isActive)} to="/myIdeas"> My <p className="hidden xl:inline-block">Ideas</p> </NavLink>
                    <NavLink className={({isActive}) => active(isActive)} to="/exploreIdeas"> Explore <p className="hidden xl:inline-block">Ideas</p> </NavLink>
                    <NavLink className={({isActive}) => active(isActive)} to="/collaboratedIdeas"> Collaborated <p className="hidden xl:inline-block">Ideas</p> </NavLink>
                    <NavLink className={({isActive}) => active(isActive)} to="/intrestedIdeas"> Intrested <p className="hidden xl:inline-block">Ideas</p> </NavLink>
                    <NavLink className={({isActive}) => active(isActive)} to="/chats"> Chats </NavLink>
                </div>
                <div className="flex flex-col justify-center gap-5 w-full">
                    <button onClick={logout} className="p-1 border-2 border-black border-solid rounded-full text-center w-full"> Logout </button>
                    <NavLink className={({isActive}) => active(isActive)} to={`/profile/${username}`}> Profile </NavLink>
                    <NavLink className={({isActive}) => active(isActive)} to="/settings"> Settings </NavLink>
                </div>
            </div>
        </>
    )
}

export default SideNav