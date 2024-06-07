import { io } from "../app.js";

const signalling = () => {
  io.on("connection", (socket) => {
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
    socket.on("makeCall", ({reciver, offer}) => {
      socket.to(reciver).emit("reciveCall", {offer, reciver});
    })
    socket.on("answerCall", ({reciver, answer}) => {
      socket.to(reciver).emit("reciveAnswer", {answer});
    })
    socket.on("negotiationNeeded", ({ reciver, offer }) => {
      socket.to(reciver).emit("negotiationNeeded", { offer });
    });
    socket.on("negotiationDone", ({ reciver, answer }) => {
      socket.to(reciver).emit("negotiationFinal", { answer });
    });
    socket.on("leaveCall", ({ reciver }) => {
      socket.to(reciver).emit("leaveCall");
    });
  });
}

export {
  signalling,
}