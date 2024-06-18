import gsap from "gsap";
import { Link } from "react-router-dom";
import {
  useRef,
  useState
} from "react";

const Category = ({ categories, className }) => {
  const [seeing, setSeeing] = useState(false);
  const categoryEleRef = useRef(null);
  const handleClick = () => {
    const categoryEle = categoryEleRef.current;
		if (!seeing) {
			gsap.to(categoryEle,{
				width: 267,
				height: 260,
				zIndex: 1,
				duration: 0.3,
			})
			setSeeing(true);
		}
		else {
			gsap.to(categoryEle,{
				width: 80,
				height: 35,
				zIndex: 0,
				duration: 0.3,
			})
			setSeeing(false);
		}
	}
  return (
    <div
      onClick={handleClick}
      className={`px-2 py-1 bg-gray-600 rounded-xl w-[80px] h-[35px] cursor-pointer overflow-y-scroll hover:scale-105 ${className}`}
      ref={categoryEleRef}
    >
      {seeing ?
        categories.map(category => {
          return (
            <Link
              key={category}
              to={`/ideas/category/${category}`}
              className="bg-black text-white inline-block mr-2 mb-2 p-2 rounded-3xl"
            >
              {category}
            </Link>
          )
        })
        :
        <p>Category</p>
      }
    </div>
  )
}

export default Category;