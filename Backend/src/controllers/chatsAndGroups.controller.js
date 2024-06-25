import { asyncHandler } from '../utils/AsyncHandler.js';
import { User } from '../models/user.model.js';
import { Chat } from '../models/chat.model.js';
import { Group } from '../models/group.model.js';
import { Message } from '../models/message.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const totalUnreadMessages = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const user = await User.findById(id);
  let unreadMessages = 0;
  let senders = 0;
  for (let chatId of user.chats) {
    const chat = await Chat.findById(chatId);
    const { unread } = chat.members.find(member => member.userId.toString() == id.toString());
    unreadMessages += unread;
    if (unread > 0) senders++;
  }
  for (let groupId of user.groups) {
    const group = await Group.findById(groupId);
    const { unread } = group.members.find(member => member.userId.toString() == id.toString());
    unreadMessages += unread;
    if (unread > 0) senders++;
  }
  res.status(200).json(new ApiResponse(200, {
    authenticated: true,
    unreadMessages,
    senders
  }));
});

export const sortGroupsAndChats = asyncHandler(async (req, res) => {
  const { id } = req.user;
	const user = await User.findById(id);
	let chats = [];
	for (let chatId of user.chats) {
		chats.push(await Chat.findById(chatId));
	}
  let groups = [];
	for (let groupId of user.groups) {
		groups.push(await Group.findById(groupId));
	}
  let chatsAndGroups = [...chats, ...groups];
  for (let i = 0; i < chatsAndGroups.length; i++) {
    let chatOrGroup = chatsAndGroups[i];
    const lastMsg = await Message.findById(chatOrGroup.messages[chatOrGroup.messages.length - 1]).select("createdAt");
    chatsAndGroups[i] = {
      chat: chatOrGroup,
      lastMsg: lastMsg ? lastMsg.createdAt : null
    };
  }
  chatsAndGroups.sort((a, b) => {
    let lastAMsg = a.lastMsg;
    let lastBMsg = b.lastMsg;
    if (!lastAMsg && !lastBMsg) return 0;
    if (!lastAMsg) return 1;
    if (!lastBMsg) return -1;
    return lastBMsg - lastAMsg;
  });
  for (let i = 0; i < chatsAndGroups.length; i++) {
    let chatOrGroup = chatsAndGroups[i];
    chatsAndGroups[i] = chatOrGroup.chat;
  }
  res.status(200).json(new ApiResponse(200, {
    authenticated: true,
    chatsAndGroups
  }));
});

export const getGroupId = asyncHandler(async (req, res) => {
  const { ideaId } = req.params;
  const group = await Group.findOne({ ideaId });
  res.status(200).json(new ApiResponse(200, {
    authenticated: true,
    groupId: group._id
  }));
});