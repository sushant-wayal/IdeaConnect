import { asyncHandler } from '../utils/AsyncHandler.js';
import { Chat } from '../models/chat.model.js';
import { Message } from '../models/message.model.js';
import { Group } from '../models/group.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const getMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params
	const { chatType } = req.query;
	let chatOrGroup;
	if (chatType == "chat") chatOrGroup = await Chat.findById(chatId);
	else chatOrGroup = await Group.findById(chatId);
	let messages = [];
	for (let messageId of chatOrGroup.messages) {
		const message = await Message.findById(messageId);
		messages.push(message);
	}
	return res.status(200).json(new ApiResponse(200, { 
    authenticated: true,
    messages,
  }, 'Messages fetched successfully'));
});

export const deleteMessage = asyncHandler(async (req, res) => {
	const { messageId, chatOrGroupId } = req.params;
	const { chatType } = req.query;
	const message = await Message.findByIdAndDelete(messageId);
	if (chatType == "chat") {
		const chat = await Chat.findById(chatOrGroupId);
		chat.messages = chat.messages.filter(messageId => messageId != message._id);
		await chat.save();
	} else {
		const group = await Group.findById(chatOrGroupId);
		group.messages = group.messages.filter(messageId => messageId != message._id);
		await group.save();
	}
	return res.status(200).json(new ApiResponse(200, { 
		authenticated: true,
		message,
	}, 'Message deleted successfully'));
});