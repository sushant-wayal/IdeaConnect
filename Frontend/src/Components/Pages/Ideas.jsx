import axios from "axios";
import { useLoaderData } from "react-router-dom";
import { useIdeas } from "../../context/ideas";
import Feed from "../Components/Feed";

const Ideas = () => {
    const { ideas, authenticated } = useLoaderData();
    const { setIdeas } = useIdeas();
    if (authenticated) setIdeas(ideas);
    else setIdeas([]);
    return (
        <Feed authenticated={authenticated}/>
    )
}

export default Ideas;

export const getFeed = async () => {
    const { data : { data } } = await axios.get("http://localhost:3000/api/v1/users/feed",{
        headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
    });
    return data;
}