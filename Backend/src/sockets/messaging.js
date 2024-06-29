import { io } from "../app.js";
import{ Message } from "../models/message.model.js";
import { Chat } from "../models/chat.model.js";
import { Group } from "../models/group.model.js";

const getChatOrGroup = async (id, group) => {
  if (group) return await Group.findById(id);
  else return await Chat.findById(id);
}
const messanging = () => {
  io.on("connection", (socket) => {
    socket.on("joinRoom",(room) => {
      socket.join(room);
    })
    socket.on('sendMessage', async ({ sender, reciver, messageType, message, senderUsername, group }) => {
      let chatId = !group ? reciver : null;
      let groupId = group ? reciver : null;
      const newMessage = await Message.create({
        sender,
        senderUsername,
        chat: chatId,
        group: groupId,
        messageType,
        message
      });
      const chatOrGroup = await getChatOrGroup(reciver, group);
      chatOrGroup.messages.push(newMessage._id);
      if (messageType == "text") chatOrGroup.lastMessage = senderUsername+": "+message;
      else if (messageType == "image") chatOrGroup.lastMessage = senderUsername+": Sent an Image";
      else if (messageType == "video") chatOrGroup.lastMessage = senderUsername+": Sent a Video";
      else if (messageType == "audio") chatOrGroup.lastMessage = senderUsername+": Sent an Audio";
      else if (messageType == "document") chatOrGroup.lastMessage = senderUsername+": Sent a Document";
      else if (messageType == "idea") chatOrGroup.lastMessage = senderUsername+": Sent an Idea";
      else if (messageType == "voice") chatOrGroup.lastMessage = senderUsername+": Sent a Voice Message";
      for (let member of chatOrGroup.members) {
        if (member.userId.toString() !== sender.toString()) {
          io.to(member.userId.toString()).emit("unreadMessages",{ preUnread : member.unread });
          member.unread += 1;
        }
      }
      await chatOrGroup.save({ validateBeforeSave: false});
      const room = reciver;
      socket.to(room).emit("reciveMessage",{room, message: newMessage});
    });
    socket.on('typing', ({ reciver, message }) => {
      const room = reciver;
      socket.to(room).emit("reciveTyping",{
        room,
        message
      });
    });
    socket.on("allRead", async ({ reciver, id, group }) => {
      const userId = id;
      const room = reciver;
      const chatOrGroup = await getChatOrGroup(room, group);
      chatOrGroup.members[chatOrGroup.members.findIndex(member => member.userId.toString() === userId.toString())].unread = 0;
      await chatOrGroup.save({ validateBeforeSave: false });
    });
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
}

export { messanging }