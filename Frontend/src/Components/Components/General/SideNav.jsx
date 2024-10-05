import { getData } from "../../../dataLoaders";
import { useUser } from "../../../context/user";
import { useSocket } from "../../../context/socket";
import { useNotification } from "../../../context/notifications";
import {
	NavLink,
	useNavigate
} from "react-router-dom";
import {
	useCallback,
	useEffect,
	useState
} from "react";
import {
	Newspaper,
	TelescopeIcon,
	Users,
	Lightbulb,
	MessageCircleHeart,
	MessageSquare,
	Bell,
	LogOut,
	Menu,
	X
} from "lucide-react"

const Icons = ({condition, props}) => condition ? <props.icon {...props}/> : null;

const SideNav = () => {
	const {
		noOfMessages,
		setNoOfMessages,
		noOfSenders,
		setNoOfSenders,
		unreadNotifications,
		setUnreadNotifications,
		gotNotification
	} = useNotification();

	const socket = useSocket();

	const {
		id,
		username,
		profileImage
	} = useUser();

	useEffect(() => {
		if (!id) return;
		socket.emit("joinNotificationRoom", id)
	}, [id])

	useEffect(() => {
		const getNoOfUnreadNotifications = async () => {
			const { noOfNotifications } = await getData("/notifications/unread", "get", true);
			setUnreadNotifications(noOfNotifications);
		}
		getNoOfUnreadNotifications();
	},[])

	useEffect(() => {
		const fetchUnreadMessages = async () => {
			const { unreadMessages, senders } = await getData("/chats/unread", "get", true);
			setNoOfMessages(unreadMessages);
			setNoOfSenders(senders);
		}
		fetchUnreadMessages();
	},[
		setNoOfMessages,
		setNoOfSenders,
		socket
	])

	const [gotChat, setGotChat] = useState(false);

	const reciveUnreadMessages = useCallback(({ preUnread }) => {
		setNoOfMessages(prev => prev + 1);
		if (preUnread > 0) setNoOfSenders(prev => prev + 1);
		setGotChat(true);
		setTimeout(() => setGotChat(false), 750);
	},[
		setNoOfMessages,
		setNoOfSenders
	]);

	useEffect(() => {
		socket.on("unreadMessages", reciveUnreadMessages);
		return () => socket.off("unreadMessages", reciveUnreadMessages)
	},[reciveUnreadMessages]);

	const openNotifications = () => {
		socket.emit("seenAllNotification", { userId: id });
		setUnreadNotifications(0);
	}

	const navigate = useNavigate();
	const active = (isActive, bottom) => {
		let style = `relative p-[6px] rounded-full text-center w-full hover:bg-[#B0C0BC] flex items-center ${bottom ? "justify-center" : "justify-start"} gap-2`;
		if (isActive) style += " bg-[#A7A7A9]";
		else style +=  " bg-[#C1EDCC]"
		return style;
	}
	const logout = async () => {
		localStorage.removeItem("accessToken");
		localStorage.removeItem("refreshToken");
		localStorage.removeItem("rememberMe");
		navigate("/");
	}
	const [seeing, setSeeing] = useState(false);
	const TopContent = [
		{to: "/ideas", icon: Newspaper, primaryText: "Feed"},
		{to: "/myIdeas", icon: Lightbulb, primaryText: "My", responsiveText: "Ideas"},
		{to: "/exploreIdeas", icon : TelescopeIcon, primaryText: "Explore", responsiveText: "Ideas"},
		{to: "/collaboratedIdeas", icon: Users, primaryText: "Collaborated"},
		{to: "/intrestedIdeas", icon: MessageCircleHeart, primaryText: "Intrested", responsiveText: "Ideas"},
		{to: "/chats", icon: MessageSquare, primaryText: "Chats"},
		{to: "/notifications", icon: Bell, primaryText: "Notifications"}
	]

	const BottomContent = [
		{to: `/profile/${username}`, primaryText: "Profile"},
	]
	return (
		<>
			<Menu
				onClick={() => setSeeing(!seeing)}
				className="lg:hidden fixed left-[4vw] top-4 z-50 cursor-pointer"
			/>
			<div className={`bg-[#797270] lg:h-[calc(98vh)] fixed left-0 top-0 p-3 lg:flex flex-col justify-between lg:w-[calc(100vw/6.5)] m-2 rounded-2xl backdrop-blur-sm ${!seeing ? "hidden" : "flex z-50 w-48 h-[90.5vh] overflow-y-scroll -left-2 rounded-e-0"}`}>
				<div className="flex flex-col justify-center gap-5 w-full">
					<button
						onClick={() => setSeeing(false)}
						className="text-left lg:hidden"
					>
						<X/>
					</button>
					{TopContent.map(({ to, icon, primaryText, responsiveText }, index) => (
						<NavLink
							key={to == "/notifications" ? `${unreadNotifications}notify` : index}
							className={({isActive}) => active(isActive)}
							to={to == "/notifications" ? `/notifications?unread=${unreadNotifications}` : to}
							onClick={to == "/notifications" ? openNotifications : null}
						>
							<div className={((to == "/chats" && gotChat) || (to == "/notifications" && gotNotification)) ? "animate-shake" : ""}>
								{Icons({ condition: true, props: { icon } })}
							</div>
							<p>{primaryText}</p>
							{responsiveText ? <p className="hidden xl:inline-block">{responsiveText}</p>	:	null}
							{(to == "/chats" && noOfMessages > 0) ?
								<div className="rounded-full bg-black text-white text-sm px-2 py-1 flex justify-center items-center">
									<p>{noOfMessages >= 100 ? "99+" : noOfMessages}/{noOfSenders >= 10 ? "9+" : noOfSenders}</p>
								</div>
								:
								null
							}
							{(to == "/notifications" && unreadNotifications > 0) ?
								<div className="rounded-full bg-black text-white text-sm px-2 py-1 flex justify-center items-center">
									<p>{unreadNotifications >= 100 ? "99+" : unreadNotifications}</p>
								</div>
								:
								null
							}
						</NavLink>
					))}
				</div>
				<div className="flex flex-col justify-center gap-5 w-full">
					{BottomContent.map(({ to, primaryText, responsiveText }, index) => (
						<NavLink
							key={index}
							className={({isActive}) => active(isActive, true)}
							to={to}
						>
							{to == `/profile/${username}` ?
								<img
									src={profileImage}
									className="w-8 h-8 rounded-full"
									alt="Profile"
								/>
								:
								null
							}
							{primaryText}	{responsiveText ? <p className="hidden xl:inline-block"> {responsiveText} </p> : null}
						</NavLink>
					))}
					<button
						onClick={logout}
						className="p-[6px] bg-[#66667d] rounded-full text-center w-full hover:bg-[#908580] flex items-center justify-center gap-2 text-white"
					>
						<LogOut/>
						<p>Logout</p>
					</button>
				</div>
			</div>
		</>
	)
}

export default SideNav