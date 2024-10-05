import Feed from "../Components/Feed/Feed";
import { toast } from "sonner";
import { getData } from "../../dataLoaders";
import { useParams } from "react-router-dom";
import { useIdeas } from "../../context/ideas";
import {
  useEffect,
  useState
} from "react";

const SpecificCategoryIdeas = () => {
  const { category } = useParams();
  const [categoryIdeas, setCategoryIdeas] = useState([]);
  const [authenticated, setAuthenticated] = useState(true);
  const { setIdeas, setOriginalIdeas } = useIdeas();
  useEffect(() => {
    const getIdeas = async () => {
      try {
        const {
          ideas,
          authenticated
        } = await getData(`/ideas/category/${category}`, "get", true);
        setCategoryIdeas(ideas);
        setAuthenticated(authenticated);
      } catch (error) {
        toast.error(error.response.data.message || "Failed to get ideas.")
      }
    }
    getIdeas();
  },[category]);
  useEffect(() => {
    if (authenticated) {
      setIdeas(categoryIdeas);
      setOriginalIdeas(categoryIdeas);
    } else {
      setIdeas([]);
      setOriginalIdeas([])
    }
  }, [
    authenticated,
    categoryIdeas,
    setIdeas,
    setOriginalIdeas
  ]);
  return (
    <Feed
      authenticated={authenticated}
      noIdea={`No ideas in the ${category} category.`}
    />
  )
}

export default SpecificCategoryIdeas;