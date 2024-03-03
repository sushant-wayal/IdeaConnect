import { io } from "../app.js";
import{ Message } from "../models/message.model.js";
import { Chat } from "../models/chat.model.js";

const messanging = () => {
    io.on("connection", (socket) => {
        console.log(`user id :${socket.id}`);
        socket.on('sendMessage', async (data) => {
            const newMessage = await Message.create(data);
            const chat = await Chat.findById(data.reciver);
            chat.messages.push(newMessage._id);
            chat.lastMessage = data.message;
            await chat.save({ validateBeforeSave: false});
            const room = data.reciver;
            socket.to(room).emit("reciveMessage",{room, message: newMessage});
            console.log("Message is",data.message);
            console.log("Room is",data.room);
        });
    
        socket.on("joinRoom",(room) => {
            socket.join(room);
            console.log("Room",room)
        })
    
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
}

export {
    messanging,
}