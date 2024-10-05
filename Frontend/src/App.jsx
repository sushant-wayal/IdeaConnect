import io from "socket.io-client";
import { Outlet } from "react-router-dom"
import { IdeasProvider } from "./context/ideas"
import { useCallback, useEffect, useState } from "react";
import { SocketProvider } from "./context/socket";
import { NotificationProvider } from "./context/notifications";
import { getData } from "./dataLoaders";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { UserProvider } from "./context/user";

const App = () => {
	const socket = io.connect("http://localhost:3001");

	const [id, setId] = useState("");
	const [username, setUsername] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [profileImage, setProfileImage] = useState("");
	const [gotNotification, setGotNotification] = useState(false);

	useEffect(() => {
		const getUser = async () => {
			if (!localStorage.getItem("accessToken")) return;
			const { user } = await getData("/users/activeUser", "get", true);
			socket.emit("joinNotificationRoom", user._id);
			setId(user._id);
			setUsername(user.username);
			setFirstName(user.firstName);
			setLastName(user.lastName);
			setProfileImage(user.profileImage);
		}
		getUser();
	},[])

	const [noOfMessages, setNoOfMessages] = useState(0);
	const [noOfSenders, setNoOfSenders] = useState(0);
	const [notifications, setNotifications] = useState([]);
	const [unreadNotifications, setUnreadNotifications] = useState(0);

	const reciveNotification = useCallback(newNotification => {
		const { type, username, profileImage, title } = newNotification;
		if (type == " follow") {
			toast.success(`${username} started following you`, {
				duration: 5000,
				icon: profileImage,
			});
			toast(
				<div
					className="flex items-center gap-3 justify-start bg-white rounded-lg text-md"
				>
					<img src={profileImage} alt="profile" className="h-10 aspect-square object-cover rounded-full" />
					<p><b>{username}</b> started <b>following</b> you</p>
				</div>
			)
		} else if (type == "intrested") {
			toast(
				<div
					className="flex items-center gap-3 justify-start bg-white rounded-lg text-md"
				>
					<img src={profileImage} alt="profile" className="h-10 aspect-square object-cover rounded-full" />
					<p><b>{username}</b> is <b>intrested</b> in your idea: <b>{title}</b></p>
				</div>
			)
		} else if (type == " included") {
			toast(
				<div
					className="flex items-center gap-3 justify-start bg-white rounded-lg text-md"
				>
					<img src={profileImage} alt="profile" className="h-10 aspect-square object-cover rounded-full" />
					<p><b>{username}</b> <b>included</b> you in their idea: <b>{title}</b></p>
				</div>
			)
		}
		setNotifications(prev => [newNotification, ...prev]);
		setUnreadNotifications(prev => prev + 1);
		setGotNotification(true);
		setTimeout(() => setGotNotification(false), 750);
	},[setNotifications]);

	useEffect(() => {
		socket.on("notification", reciveNotification);
		return () => socket.off("notification", reciveNotification);
	},[setNotifications]);

	const [ideas, setIdeas] = useState([]);
	const [originalIdeas, setOriginalIdeas] = useState([]);

	return (
		<UserProvider value={{ id, setId, firstName, setFirstName, lastName, setLastName, username, setUsername, profileImage, setProfileImage }}>
			<SocketProvider value={{ socket }}>
				<NotificationProvider value={{ noOfMessages, setNoOfMessages, noOfSenders, setNoOfSenders, notifications, setNotifications, unreadNotifications, setUnreadNotifications, gotNotification, setGotNotification }}>
					<IdeasProvider value={{ ideas, setIdeas, originalIdeas, setOriginalIdeas }}>
						<Outlet/>
						<Toaster
							richColors={true}
							theme="light"
							position="top-center"
						/>
					</IdeasProvider>
				</NotificationProvider>
			</SocketProvider>
		</UserProvider>
	)
}

export default App
