import { asyncHandler } from '../utils/AsyncHandler.js';
import { User } from '../models/user.model.js';
import { Idea } from '../models/idea.model.js';
import { Chat } from '../models/chat.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const cookieOptions = {
  httpOnly: true,
  secure: true,
};

export const createAccessAndRefreshToken = async (userId) => {
  const user = await User.findById(userId);
	const accessToken = user.getAccessToken();
	const refreshToken = user.getRefreshToken();
	user.refreshToken = refreshToken;
	await user.save({ validateBeforeSave: false});
	return { accessToken, refreshToken };
}

export const registerUser = asyncHandler(async (req, res) => {
	const {
		username,
		firstName,
		lastName,
		country,
		countryCode,
		phoneNumber,
		email,
		DOB,
		gender,
		bio,
		profileImage,
		password,
	} = req.body;
	const user = await User.create({
		username,
		firstName,
		lastName,
		country,
		countryCode,
		phoneNumber,
		email,
		DOB,
		gender,
		bio,
		profileImage,
		password,
	});
	const createdUser = await User.findById(user._id).select('-password -__v -refreshToken');
	const { accessToken, refreshToken } = await createAccessAndRefreshToken(user._id);
	res
	.status(201)
	.json(new ApiResponse(201,{
		authenticated: true,
		createdUser,
		accessToken,
		refreshToken,
	}, 'User created successfully'));
});

export const login = asyncHandler(async (req, res) => {
	const { username, password } = req.body;
	const user = await User.findOne({ username });
	const isPasswordValid = await user.isPasswordValid(password);
	if (!isPasswordValid) {
		return res.status(400).json(new ApiResponse(400, null, 'Invalid username or password'));
	}
	const { accessToken, refreshToken } = await createAccessAndRefreshToken(user._id);
	return res
	.status(200)
	.json(new ApiResponse(200, {
		authenticated: true,
		user,
		accessToken,
		refreshToken,
	}, 'Login successful'));
});

export const logout = asyncHandler(async (req, res) => {
	res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
  return res.
		status(200).
		json(new ApiResponse(200, null, 'Logout successful'));
});

export const activeUser = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user.id).select('-password -__v -refreshToken');
	return res.
		status(200).
		json(new ApiResponse(200, {
			authenticated: true,
			user,
		}, 'User is active'));
});

export const feed = asyncHandler(async (req, res) => {
	const currUser = await User.findById(req.user.id).select('-password -__v -refreshToken');
	let ideas = [];
	for (let following of currUser.followingList) {
		const followedUser = await User.findById(following);
		for (let idea of followedUser.ideas) {
			const currIdea = await Idea.findById(idea);
			const ideaOf = await User.findById(currIdea.ideaOf);
			let intrested = false;
			for (let intrestedUser of currIdea.intrestedUser) {
				if (intrestedUser.toString() == currUser._id.toString()) {
					intrested = true;
					break;
				}
			}
			ideas.push({
				idea: currIdea,
				profileImage: ideaOf.profileImage,
				intrested: intrested,
				ideaOf: ideaOf.username,
				ideaId: idea,
			});
		}
	}
	ideas.sort((a,b) => b.idea.createdAt-a.idea.createdAt);
	res.status(200).json(new ApiResponse(200, {
		authenticated: true,
		ideas,
	}, 'User feed retrieved successfully'));
});

export const Profile = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    username: req.params.username
  }).select('-password -__v -refreshToken');
  return res.status(200).json(new ApiResponse(200, user, 'User is active'));
});

export const userInfo = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).select('-password -__v -refreshToken');
  return res.status(200).json(new ApiResponse(200, user, 'User is active'));
});

export const follow = asyncHandler(async (req, res) => {
  const { followingUsername } = req.params;
	const { id } = req.user;
	const followingUser = await User.findOne({username: followingUsername});
	const user = await User.findById(id);
	let index = user.followingList.indexOf(followingUser._id);
	if (index == -1) {
		user.followingList.unshift(followingUser._id);
		user.following++;
		followingUser.followersList.unshift(user._id);
		followingUser.followers++;
		let add = true;
		for (let chatId of user.chats) {
			const chat = await Chat.findById(chatId);
			const { members } = chat;
			if (members.length == 2) {
				if ((members[0].userId.toString() == id.toString() && members[1].userId.toString() == followingUser._id.toString()) || (members[1].userId.toString() == id.toString() && members[0].userId.toString() == followingUser._id.toString())) {
					add = false;
					break;
				}
			}
		}
		if (add) {
			const newChat = await Chat.create({
				members: [
					{
						userId: id,
						profileImage: user.profileImage,
						firstName: user.firstName,
						lastName: user.lastName,
						username: user.username,
					},
					{
						userId: followingUser._id,
						profileImage: followingUser.profileImage,
						firstName: followingUser.firstName,
						lastName: followingUser.lastName,
						username: followingUser.username,
					}
				]
			})
			user.chats.unshift(newChat._id);
			followingUser.chats.unshift(newChat._id);
		}
	}
	else {
		user.followingList.splice(index,1);
		user.following--;
		followingUser.followersList.splice(followingUser.followersList.indexOf(id),1);
		followingUser.followers--;
	}
	await user.save({ validateBeforeSave: false });
	await followingUser.save({ validateBeforeSave: false})
	return res.status(200).json(new ApiResponse(200, {
    authenticated: true,
    newFollowing: user.following,
  }, 'User is active'));
});

export const isFollowing = asyncHandler(async (req, res) => {
	const { followingList } = await User.findOne({
		username: req.params.activeUsername,
	})
	for (let following of followingList) {
		const { username } = await User.findById(following);
		if (username == req.params.username) {
			return res.status(200).json(new ApiResponse(200, {
				follow: true,
			}, 'User is active'));
		}
	}
	return res.status(200).json(new ApiResponse(200, {
		follow: false,
	}, 'User is active'));
})

export const getIdeas = asyncHandler(async (req, res) => {
  const currUser = await User.findOne({
		username: req.params.username,
	});
	const activeUser = await User.findOne({
		username: req.params.activeUsername,
	})
	let ideas = [];
	for (let idea of currUser.ideas) {
		const currIdea = await Idea.findById(idea);
		const ideaOf = await User.findById(currIdea.ideaOf);
		let intrested = false;
		for (let intrestedUser of currIdea.intrestedUser) {
			if (intrestedUser.toString() == activeUser._id.toString()) {
				intrested = true;
				break;
			}
		}
		ideas.push({
			idea: currIdea,
			profileImage: ideaOf.profileImage,
			intrested: intrested,
			ideaOf: ideaOf.username,
			ideaId: idea,
		});
	}
	ideas.sort((a,b) => b.idea.createdAt-a.idea.createdAt);
	return res.status(200).json(new ApiResponse(200, {
    ideas,
  }, 'User is active'));
});