import Feed from "../SubComponents/Feed/Feed";
import { useEffect } from "react";
import { useIdeas } from "../../context/ideas";
import { useLoaderData } from "react-router-dom";
import { Helmet } from "react-helmet";

const ExploreIdeas = () => {
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
        <title>Ideaconnet | Explore Ideas</title>
        <meta
          name="description"
          content="Explore all the ideas you have not collaborated with."
        />
      </Helmet>
      <Feed
        authenticated={authenticated}
        noIdea={"No ideas for you to explore."}
      />
    </>
  )
}

export default ExploreIdeas;