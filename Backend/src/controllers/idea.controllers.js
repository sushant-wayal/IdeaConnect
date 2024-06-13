import { asyncHandler } from '../utils/AsyncHandler.js';
import { User } from '../models/user.model.js';
import { Idea } from '../models/idea.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Group } from '../models/group.model.js';

export const publishIdea = asyncHandler(async (req, res) => {
  	const currUser = await User.findOne({
		username: req.body.username,
	})
	const newIdea = await Idea.create({
		ideaOf: currUser._id,
		title: req.body.title,
		categories: req.body.categories,
		media: req.body.media,
		description: req.body.description,
		steps: req.body.steps,
		progress: req.body.progress,
		createdBy: currUser.username,
	})
	currUser.ideas.unshift(newIdea._id);
	currUser.noOfIdeas += 1;
	await currUser.save({ validateBeforeSave: false});
	await newIdea.save({ validateBeforeSave: false});
	res.status(201).json(new ApiResponse(201, {
    success: true,
  } ,'Idea published successfully'));
});

export const updateProgress = asyncHandler(async (req, res) => {
  const { ideaId, newProgress } = req.params;
	const idea = await Idea.findById(ideaId);
	idea.progress = newProgress;
	await idea.save({ validateBeforeSave: false});
	res.status(201).json(new ApiResponse(201, {
  	success: true,
  } ,'Progress updated successfully'));
});

export const checkLike = asyncHandler(async (req, res) => {
  const { ideaId, username } = req.params;
	const idea = await Idea.findById(ideaId);
	for (let user of idea.likedBy) {
		const userData = await User.findById(user);
		if (userData.username == username) {
			return res.status(201).json(new ApiResponse(201, {
      	liked: true,
      } ,'You have already liked this idea'));
		}
	}
	res.status(201).json(new ApiResponse(201, {
    liked: false,
  } ,'You have not liked this idea'));
});

export const likeIdea = asyncHandler(async (req, res) => {
  const { ideaId, username } = req.params;
  const idea = await Idea.findById(ideaId);
  const user = await User.findOne({ username });
  let liked = false;
	for (let user of idea.likedBy) {
		const userData = await User.findById(user);
		if (userData.username == username) {
			liked = true;
			break;
		}
	}
	if (!liked) {
		idea.likes++;
		idea.likedBy.unshift(user._id);
	}
	else {
		idea.likes--;
		idea.likedBy.splice(user._id,1);
	}
	idea.save({ validateBeforeSave: false});
    res.status(201).json(new ApiResponse(201, {
      liked,
      success: true,
    } ,'Idea liked successfully'));
});

export const likedBy = asyncHandler(async (req, res) => {
  const { ideaId } = req.params;
	const idea = await Idea.findById(ideaId);
	let likedBy= [];
	for (let user of idea.likedBy) {
		likedBy.push(await User.findById(user));
	}
	res.status(201).json(new ApiResponse(201, {
    likedBy,
  } ,'List of users who liked this idea'));
});

export const intrested = asyncHandler(async (req, res) => {
	const { ideaId } = req.params;
	const idea = await Idea.findById(ideaId);
	const { id } = req.user;
	const user = await User.findById(id);
	let alreadyIntrested = false;
	for (let intrestedUserId of idea.intrestedUser) {
		if (intrestedUserId.toString() == id.toString()) {
			alreadyIntrested = true;
			break;
		}
	}
	if (alreadyIntrested) {
		idea.intrested--;
		idea.intrestedUser.splice(idea.intrestedUser.indexOf(id),1);
		user.intrestedIdeas.splice(user.intrestedIdeas.indexOf(ideaId),1);
	}
	else {
		idea.intrested++;
		idea.intrestedUser.unshift(id);
		user.intrestedIdeas.unshift(ideaId);
	}
	await idea.save({ validateBeforeSave: false});
	await user.save({ validateBeforeSave: false});
	res.status(201).json(new ApiResponse(201, {
		alreadyIntrested,
		success: true,
	} ,'Idea intrested successfully'));
});

export const include = asyncHandler(async (req, res) => {
	const { ideaId, userId } = req.params;
	const idea = await Idea.findById(ideaId);
	idea.includedUsers.unshift(userId);
	idea.intrestedUser.splice(idea.intrestedUser.indexOf(userId),1);
	idea.intrested--;
	await idea.save({ validateBeforeSave: false});
	const group = await Group.findOne({ ideaId });
	const includedUser = await User.findById(userId);
	if (group) {
		group.members.push({ userId });
		await group.save({ validateBeforeSave: false});
		includedUser.groups.unshift(group._id);
	} else {
		const { id } = req.user;
		const newGroup = await Group.create({
			ideaId,
			name: idea.title,
			profileImage: idea.media,
			members: [{ userId: id }, { userId }],
		});
		const user = await User.findById(id);
		user.groups.unshift(newGroup._id);
		await user.save({ validateBeforeSave: false});
		includedUser.groups.unshift(newGroup._id);
	}
	includedUser.intrestedIdeas.splice(includedUser.intrestedIdeas.indexOf(ideaId),1);
	await includedUser.save({ validateBeforeSave: false});
	res.status(201).json(new ApiResponse(201, {
		success: true,
	} ,'User included successfully'));
});

export const myIdeas = asyncHandler(async (req, res) => {
	const { id } = req.user;
	const user = await User.findById(id);
	const ideas = [];
	for (let ideaId of user.ideas) {
		const idea = await Idea.findById(ideaId);
		ideas.push({
			idea,
			profileImage: user.profileImage,
			intrested: false,
			included: false,
			ideaOf: user.username,
			ideaId
		});
	}
	res.status(201).json(new ApiResponse(201, {
		ideas,
		authenticated: true,
	} ,'List of ideas published by user'));
});

export const exploreIdeas = asyncHandler(async (req, res) => {
	const { id } = req.user;
	const user = await User.findById(id);
	const likedIdeas = await Idea.find({ likedBy: id }).select("categories");
	const categories = new Set();
	for (let idea of likedIdeas) {
		for (let category of idea.categories) {
			categories.add(category);
		}
	}
	const ideaIds = new Set();
	for (let category of categories) {
		const ideas = await Idea.find({ categories: category });
		for (let idea of ideas) {
			if (idea.ideaOf.toString() == id.toString()) continue;
			ideaIds.add(idea._id.toString());
		}
	}
	const ideas = [];
	for (let ideaId of ideaIds) {
		const idea = await Idea.findById(ideaId);
		const ideaOf = await User.findById(idea.ideaOf);
		const intrested = idea.intrestedUser.includes(id);
		const included = false;
		for (let groupId of user.groups) {
			const group = await Group.findById(groupId);
			if (group.ideaId.toString() == ideaId.toString()) {
				included = true;
				break;
			}
		}
		ideas.push({
			idea,
			profileImage: ideaOf.profileImage,
			intrested,
			included,
			ideaOf: ideaOf.username,
			ideaId
		});
	}
	res.status(201).json(new ApiResponse(201, {
		ideas,
		authenticated: true,
	} ,'List of ideas to explore by user'));
});

export const collaboratedIdeas = asyncHandler(async (req, res) => {
	const { id } = req.user;
	const user = await User.findById(id);
	const ideas = [];
	for (let groupId of user.groups) {
		const group = await Group.findById(groupId);
		const idea = await Idea.findById(group.ideaId);
		const ideaOf = await User.findById(idea.ideaOf);
		if (ideaOf._id.toString() == id.toString()) continue;
		ideas.push({
			idea,
			profileImage: ideaOf.profileImage,
			intrested: false,
			included: true,
			ideaOf: ideaOf.username,
			ideaId: idea._id
		});
	}
	res.status(201).json(new ApiResponse(201, {
		ideas,
		authenticated: true,
	} ,'List of ideas collaborated by user'));
});

export const intrestedIdeas = asyncHandler(async (req, res) => {
	const { id } = req.user;
	const user = await User.findById(id);
	const ideas = [];
	for (let ideaId of user.intrestedIdeas) {
		const idea = await Idea.findById(ideaId);
		const ideaOf = await User.findById(idea.ideaOf);
		const intrested = true;
		const included = false;
		ideas.push({
			idea,
			profileImage: ideaOf.profileImage,
			intrested,
			included,
			ideaOf: ideaOf.username,
			ideaId
		});
	}
	res.status(201).json(new ApiResponse(201, {
		ideas,
		authenticated: true,
	} ,'List of ideas intrested by user'));
});

export const searchIdeas = asyncHandler(async (req, res) => {
	const { id } = req.user;
	const user = await User.findById(id);
	const { query } = req.params;
	const ideas = await Idea.find({ title: { $regex: query, $options: 'i' } });
	const result = [];
	for (let idea of ideas) {
		const ideaOf = await User.findById(idea.ideaOf);
		const intrested = idea.intrestedUser.includes(req.user.id);
		let included = false;
		for (let groupId of user.groups) {
			const group = await Group.findById(groupId);
			if (group.ideaId.toString() == idea._id.toString()) {
				included = true;
				break;
			}
		}
		result.push({
			idea,
			profileImage: ideaOf.profileImage,
			intrested,
			included,
			ideaOf: ideaOf.username,
			ideaId: idea._id
		});
	}
	res.status(201).json(new ApiResponse(201, {
		ideas: result,
		authenticated: true,
	} ,'List of ideas matching search query'));
});