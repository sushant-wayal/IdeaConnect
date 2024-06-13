import { Outlet } from "react-router-dom"
import { IdeasProvider } from "./context/ideas"
import { useState } from "react";

const App = () => {
	const [ideas, setIdeas] = useState([]);
	const [originalIdeas, setOriginalIdeas] = useState([]);
	return (
		<IdeasProvider value={{ ideas, setIdeas, originalIdeas, setOriginalIdeas }}>
			<Outlet/>
		</IdeasProvider>
	)
}

export default App
