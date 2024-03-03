import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './global.css'
import { Route, RouterProvider, createBrowserRouter, createRoutesFromChildren } from 'react-router-dom'
import { 
	Chats,
	Ideas,
	NewIdea,
	Profile,
	SignIn, 
	SignUp,
} from './Components/index.js'
import { fecthData } from './Components/AllComponents/SignUp/SignUp.jsx'
import { getFeed } from './Components/AllComponents/Ideas/Ideas.jsx'
import { getChats } from './Components/AllComponents/Chats/Chats.jsx'

const router = createBrowserRouter(
	createRoutesFromChildren(
		<Route path="/" element={<App/>}>
			<Route path="" element={<SignIn/>}/>
			<Route loader={fecthData} path="/signUp" element={<SignUp/>}/>
			<Route loader={getFeed} path="/ideas" element={<Ideas/>}/>
			<Route path="/profile/:username" element={<Profile/>}/>
			<Route path="/newIdea" element={<NewIdea/>}/>
			<Route loader={getChats} path="/chats" element={<Chats/>}/>
		</Route>
	)
)

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<RouterProvider router={router}/>
	</React.StrictMode>,
)
