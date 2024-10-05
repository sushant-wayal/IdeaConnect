import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './global.css'
import { Route, RouterProvider, createBrowserRouter, createRoutesFromChildren } from 'react-router-dom'
// import { 
// 	Chats,
// 	CollaboratedIdeas,
// 	ExploreIdeas,
// 	Ideas,
// 	IntrestedIdeas,
// 	MyIdeas,
// 	NewIdea,
// 	Notification,
// 	Profile,
// 	SignIn, 
// 	SignUp,
// 	SpecificCategoryIdeas,
// } from './components/index.js'
import Chats from './components/Pages/Chats.jsx'
import CollaboratedIdeas from './components/Pages/CollaboratedIdeas.jsx'
import ExploreIdeas from './components/Pages/ExploreIdeas.jsx'
import Ideas from './components/Pages/Ideas.jsx'
import IntrestedIdeas from './components/Pages/IntrestedIdeas.jsx'
import MyIdeas from './components/Pages/MyIdeas.jsx'
import NewIdea from './components/Pages/NewIdea.jsx'
import Notification from './components/Pages/Notifications.jsx'
import Profile from './components/Pages/Profile.jsx'
import SignIn from './components/Pages/SignIn.jsx'
import SignUp from './components/Pages/SignUp.jsx'
import SpecificCategoryIdeas from './components/Pages/SpecificCategory.jsx'
import {
	fecthData,
	getChats,
	getCollaboratedIdeas,
	getExploreIdeas,
	getFeed,
	getIntrestedIdeas,
	getMyIdeas
} from './components/dataLoaders.js'

const router = createBrowserRouter(
	createRoutesFromChildren(
		<Route path="/" element={<App/>}>
			<Route path="" element={<SignIn/>}/>
			<Route loader={fecthData} path="/signUp" element={<SignUp/>}/>
			<Route loader={getFeed} path="/ideas" element={<Ideas/>}/>
			<Route loader={getMyIdeas} path='/myIdeas' element={<MyIdeas/>}/>
			<Route loader={getExploreIdeas} path="/exploreIdeas" element={<ExploreIdeas/>}/>
			<Route loader={getCollaboratedIdeas} path="/collaboratedIdeas" element={<CollaboratedIdeas/>}/>
			<Route loader={getIntrestedIdeas} path="/intrestedIdeas" element={<IntrestedIdeas/>}/>
			<Route path="/ideas/category/:category" element={<SpecificCategoryIdeas/>}/>
			<Route path="/profile/:username" element={<Profile/>}/>
			<Route path="/newIdea" element={<NewIdea/>}/>
			<Route loader={getChats} path="/chats" element={<Chats/>}/>
			<Route path="/notifications" element={<Notification/>}/>
			{/* <Route loader={getChats} path='/structuredChats' element={<StructuredChats/>}/> */}
		</Route>
	)
)

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<RouterProvider router={router}/>
	</React.StrictMode>,
)
