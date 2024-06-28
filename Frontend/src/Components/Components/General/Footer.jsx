import { Link } from "react-router-dom";

const Footer = ({ styling }) => {
	return (
		<div className={`bg-[#797270] w-full flex flex-col sm:flex-row  gap-2 sm:justify-between py-3 px-2 sm:items-center backdrop-blur-sm sm:backdrop-blur-none text-white ${styling}`}>
			<div>
				© IdeaConnect | 2024
			</div>
			<div className="flex justify-between sm:justify-center sm:gap-10">
				<Link className="hover:underline" to="/contactUs"> Contact Us </Link>
				<Link className="hover:underline" to="/privacy"> Privacy </Link>
				<Link className="hover:underline" to="/about"> About </Link>
			</div>
		</div>
	)
}

export default Footer;