import { useLoaderData } from "react-router-dom";
import { useIdeas } from "../../context/ideas";
import Feed from "../Components/Feed";
import { useEffect } from "react";

const Ideas = () => {
    const { ideas, authenticated } = useLoaderData();
    const { setIdeas, setOriginalIdeas } = useIdeas();
    useEffect(() => {
        if (authenticated) {
        setIdeas(ideas);
        setOriginalIdeas(ideas);
        } else {
        setIdeas([]);
        setOriginalIdeas([])
        }
    }, [authenticated, ideas, setIdeas, setOriginalIdeas]);
    return (
        <Feed
            authenticated={authenticated}
            noIdea={"No ideas in your feed."}
        />
    )
}

export default Ideas;