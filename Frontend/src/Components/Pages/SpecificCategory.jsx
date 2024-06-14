import Feed from "../Components/Feed";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useIdeas } from "../../context/ideas";
import { headers } from "../dataLoaders";
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
      const { data : { data : { ideas, authenticated } } } = await axios.get(`http://localhost:3000/api/v1/ideas/category/${category}`,{ headers });
      setCategoryIdeas(ideas);
      setAuthenticated(authenticated);
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
  }, [authenticated, categoryIdeas, setIdeas, setOriginalIdeas]);
  return (
    <Feed authenticated={authenticated}/>
  )
}

export default SpecificCategoryIdeas;