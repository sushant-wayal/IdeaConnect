import io from "socket.io-client";
import { Outlet } from "react-router-dom"
import { IdeasProvider } from "./context/ideas"
import { useState } from "react";
import { SocketProvider } from "./context/socket";

const App = () => {
	const [ideas, setIdeas] = useState([]);
	const [originalIdeas, setOriginalIdeas] = useState([]);
	const socket = io.connect("http://localhost:3001");
	return (
		<SocketProvider value={{ socket }}>
			<IdeasProvider value={{ ideas, setIdeas, originalIdeas, setOriginalIdeas }}>
				<Outlet/>
			</IdeasProvider>
		</SocketProvider>
	)
}

export default App
