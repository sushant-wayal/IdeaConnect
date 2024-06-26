import io from "socket.io-client";
import { Outlet } from "react-router-dom"
import { IdeasProvider } from "./context/ideas"
import { useCallback, useEffect, useState } from "react";
import { SocketProvider } from "./context/socket";
import { NotificationProvider } from "./context/notifications";
import { getData } from "./components/dataLoaders";

const App = () => {
	const socket = io.connect("http://localhost:3001");

	const [userId, setUserId] = useState("");
	const [username, setUsername] = useState("");
	const [userProfileImage, setUserProfileImage] = useState("");

	useEffect(() => {
		const getUser = async () => {
			const { user } = await getData("/users/activeUser", "get", true);
			socket.emit("joinNotificationRoom", user._id);
			setUserId(user._id);
			setUsername(user.username);
			setUserProfileImage(user.profileImage);
		}
		getUser();
	})

	const [noOfMessages, setNoOfMessages] = useState(0);
	const [noOfSenders, setNoOfSenders] = useState(0);
	const [notifications, setNotifications] = useState([]);
	const [unreadNotifications, setUnreadNotifications] = useState(0);

	const reciveNotification = useCallback(newNotification => {
		setNotifications(prev => [newNotification, ...prev]);
		setUnreadNotifications(prev => {
			console.log("unreadNotifications",prev);
			return prev + 1;
		});
	},[setNotifications, socket]);

	useEffect(() => {
		socket.on("notification", reciveNotification);
		return () => socket.off("notification", reciveNotification);
	},[setNotifications, socket]);

	const [ideas, setIdeas] = useState([]);
	const [originalIdeas, setOriginalIdeas] = useState([]);

	return (
		<SocketProvider value={{ socket }}>
			<NotificationProvider value={{ noOfMessages, setNoOfMessages, noOfSenders, setNoOfSenders, notifications, setNotifications, unreadNotifications, setUnreadNotifications, userId, setUserId, username, setUsername, userProfileImage, setUserProfileImage }}>
				<IdeasProvider value={{ ideas, setIdeas, originalIdeas, setOriginalIdeas }}>
					<Outlet/>
				</IdeasProvider>
			</NotificationProvider>
		</SocketProvider>
	)
}

export default App
