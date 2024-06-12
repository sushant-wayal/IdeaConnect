import { Outlet } from "react-router-dom"
import { IdeasProvider } from "./context/ideas"
import { useState } from "react";

const App = () => {
	const [ideas, setIdeas] = useState([]);
	return (
		<IdeasProvider value={{ideas, setIdeas}}>
			<Outlet/>
		</IdeasProvider>
	)
}

export default App
