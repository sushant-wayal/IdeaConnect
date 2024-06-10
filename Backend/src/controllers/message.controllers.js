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