import { asyncHandler } from '../utils/AsyncHandler.js';
import { User } from '../models/user.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Idea } from '../models/idea.model.js';
import { Comment } from '../models/comment.model.js';

export const addComment = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const { ideaId, comment } = req.body;
  const { profileImage, username } = await User.findById(id);
  const { _id } = await Comment.create({
    commentOf: id,
    commentOn: ideaId,
    comment,
    profileImage,
    username
  });
  const idea = await Idea.findById(ideaId);
  idea.comments.push(_id);
  idea.noOfComments += 1;
  await idea.save({ validateBeforeSave: false });
  res.status(200).json(new ApiResponse(200, {
    success: true,
    newComment: {
      profileImage,
      username,
      comment,
    },
  }));
});

export const getComments = asyncHandler(async (req, res) => {
  const { ideaId } = req.params;
  const { comments } = await Idea.findById(ideaId).populate("comments", "profileImage username comment createdAt");
  comments.sort((a, b) => b.createdAt - a.createdAt);
  res.status(200).json(new ApiResponse(200, {
    comments: comments.map(({ profileImage, username, comment }) => ({ profileImage, username, comment }))
  }));
});