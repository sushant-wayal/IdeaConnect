import { asyncHandler } from '../utils/AsyncHandler.js';
import { User } from '../models/user.model.js';
import { Idea } from '../models/idea.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const publishIdea = asyncHandler(async (req, res) => {
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

const updateProgress = asyncHandler(async (req, res) => {
    const { ideaId, newProgress } = req.params;
	const idea = await Idea.findById(ideaId);
	idea.progress = newProgress;
	await idea.save({ validateBeforeSave: false});
	res.status(201).json(new ApiResponse(201, {
        success: true,
    } ,'Progress updated successfully'));
});

const checkLike = asyncHandler(async (req, res) => {
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

const likeIdea = asyncHandler(async (req, res) => {
    const { ideaId, username } = req.params;
    const idea = await Idea.findById(ideaId);
    const user = await User.findOne({
        username,
    });
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

const likedBy = asyncHandler(async (req, res) => {
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

const intrested = asyncHandler(async (req, res) => {
	const { ideaId } = req.params;
	const idea = await Idea.findById(ideaId);
	const { id } = req.user;
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
	}
	else {
		idea.intrested++;
		idea.intrestedUser.unshift(id);
	}
	await idea.save({ validateBeforeSave: false});
	res.status(201).json(new ApiResponse(201, {
		alreadyIntrested,
		success: true,
	} ,'Idea intrested successfully'));
});

export {
    publishIdea,
    updateProgress,
    checkLike,
    likeIdea,
    likedBy,
	intrested
};