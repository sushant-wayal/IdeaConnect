import io from "socket.io-client";
import { Outlet } from "react-router-dom"
import { IdeasProvider } from "./context/ideas"
import { useState } from "react";
import { SocketProvider } from "./context/socket";
import { NotificationProvider } from "./context/notifications";

const App = () => {
	const socket = io.connect("http://localhost:3001");

	const [noOfMessages, setNoOfMessages] = useState(0);
	const [noOfSenders, setNoOfSenders] = useState(0);

	const [ideas, setIdeas] = useState([]);
	const [originalIdeas, setOriginalIdeas] = useState([]);

	return (
		<SocketProvider value={{ socket }}>
			<NotificationProvider value={{ noOfMessages, setNoOfMessages, noOfSenders, setNoOfSenders }}>
				<IdeasProvider value={{ ideas, setIdeas, originalIdeas, setOriginalIdeas }}>
					<Outlet/>
				</IdeasProvider>
			</NotificationProvider>
		</SocketProvider>
	)
}

export default App
