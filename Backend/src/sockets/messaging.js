import { io } from "../app.js";
import{ Message } from "../models/message.model.js";
import { Chat } from "../models/chat.model.js";

const messanging = () => {
  io.on("connection", (socket) => {
    socket.on("joinRoom",(room) => {
    socket.join(room);
  })
	socket.on('sendMessage', async (data) => {
		const newMessage = await Message.create(data);
		const chat = await Chat.findById(data.reciver);
		chat.messages.push(newMessage._id);
    chat.lastMessage = data.message;
    for (let member of chat.members) {
    	if (member.userId.toString() !== data.sender.toString()) {
        member.unread += 1;
      }
    }
  	await chat.save({ validateBeforeSave: false});
    const room = data.reciver;
      socket.to(room).emit("reciveMessage",{room, message: newMessage});
  	});
  	socket.on('typing', (data) => {
      const room = data.reciver;
      socket.to(room).emit("reciveTyping",{
        room,
        message: data.message,
      });
    });
		socket.on("allRead", async (data) => {
    	const room = data.reciver;
    	const chat = await Chat.findById(room);
    	chat.members[chat.members.findIndex(member => member.userId.toString() === data.userId.toString())].unread = 0;
    	await chat.save({ validateBeforeSave: false});
    });
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
}

export { messanging }