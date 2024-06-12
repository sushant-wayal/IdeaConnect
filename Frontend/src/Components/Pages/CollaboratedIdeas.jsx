import axios from "axios";
import { useLoaderData } from "react-router-dom";
import { useIdeas } from "../../context/ideas";
import Feed from "../Components/Feed";

const CollaboratedIdeas = () => {
  const { ideas, authenticated } = useLoaderData();
  const { setIdeas } = useIdeas();
  if (authenticated) setIdeas(ideas);
  else setIdeas([]);
  return (
    <Feed authenticated={authenticated}/>
  )
}

export default CollaboratedIdeas;

export const getCollaboratedIdeas = async () => {
  const { data : { data } } = await axios.get(`http://localhost:3000/api/v1/ideas/collaboratedIdeas`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    }
  );
  return data;
}