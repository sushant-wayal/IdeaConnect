import axios from "axios";
import { useLoaderData } from "react-router-dom";
import { useIdeas } from "../../context/ideas";
import Feed from "../Components/Feed";

const MyIdeas = () => {
  const { ideas, authenticated } = useLoaderData();
  const { setIdeas } = useIdeas();
  if (authenticated) setIdeas(ideas);
  else setIdeas([]);
  return (
    <Feed authenticated={authenticated}/>
  )
}

export default MyIdeas;

export const getMyIdeas = async () => {
  const { data : { data } } = await axios.get(`http://localhost:3000/api/v1/ideas/myIdeas`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    }
  );
  return data;
}