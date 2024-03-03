import { asyncHandler } from '../utils/AsyncHandler.js';
import { Chat } from '../models/chat.model.js';
import { Message } from '../models/message.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const getMessages = asyncHandler(async (req, res) => {
    const { chatId } = req.params
	const chat = await Chat.findById(chatId);
	let messages = [];
	for (let messageId of chat.messages) {
		const message = await Message.findById(messageId);
		messages.push(message);
	}
	return res.status(200).json(new ApiResponse(200, { 
        authenticated: true,
        messages,
    }, 'Messages fetched successfully'));
});

export {
    getMessages,
};