import { asyncHandler } from '../utils/AsyncHandler.js';
import { User } from '../models/user.model.js';
import { Chat } from '../models/chat.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';


export const getChats = asyncHandler(async (req, res) => {
  const { id } = req.user;
	const user = await User.findById(id);
	let chats = [];
	for (let chatId of user.chats) {
		chats.push(await Chat.findById(chatId));
	}
	res.status(201).json(new ApiResponse(201, {
  	authenticated: true,
    chats,
  } ,'Chats fetched successfully'));
});