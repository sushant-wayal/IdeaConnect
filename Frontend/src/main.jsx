import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './global.css'
import { Route, RouterProvider, createBrowserRouter, createRoutesFromChildren } from 'react-router-dom'
import { 
	Chats,
	CollaboratedIdeas,
	ExploreIdeas,
	Ideas,
	IntrestedIdeas,
	MyIdeas,
	NewIdea,
	Notification,
	Profile,
	ResetPassword,
	SignIn, 
	SignUp,
	SpecificCategoryIdeas,
} from './components/index.js'
import {
	fecthData,
	getChats,
	getCollaboratedIdeas,
	getExploreIdeas,
	getFeed,
	getIntrestedIdeas,
	getMyIdeas
} from './dataLoaders.js'

const router = createBrowserRouter(
	createRoutesFromChildren(
		<Route path="/" element={<App/>}>
			<Route path="" element={<SignIn/>}/>
			<Route loader={fecthData} path="/signUp" element={<SignUp/>}/>
			<Route path="/resetPassword" element={<ResetPassword/>}/>
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
