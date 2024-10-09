import Feed from "../SubComponents/Feed/Feed";
import { useEffect } from "react";
import { useIdeas } from "../../context/ideas";
import { useLoaderData } from "react-router-dom";
import { Helmet } from "react-helmet";

const Ideas = () => {
	const {
		ideas,
		authenticated
	} = useLoaderData();
	const {
		setIdeas,
		setOriginalIdeas
	} = useIdeas();
	useEffect(() => {
		if (authenticated) {
			setIdeas(ideas);
			setOriginalIdeas(ideas);
		} else {
			setIdeas([]);
			setOriginalIdeas([])
		}
	}, [
		authenticated,
		ideas,
		setIdeas,
		setOriginalIdeas
	]);
	return (
		<>
			<Helmet>
				<title>Ideaconnet | Ideas</title>
				<meta
					name="description"
					content="View all the ideas you have created."
				/>
			</Helmet>
			<Feed
				authenticated={authenticated}
				noIdea={"No ideas in your feed."}
			/>
		</>
	)
}

export default Ideas;