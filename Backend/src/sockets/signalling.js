import { io } from "../app.js";

const signalling = () => {
  io.on("connection", (socket) => {
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
    socket.on("requestStream", ({ reciver }) => {
      socket.to(reciver).emit("requestingStream", { reciver });
    });
    socket.on("requestCall", ({reciver}) => {
      socket.to(reciver).emit("callRequested", { reciver });
    })
    socket.on("acceptVideoCall", ({reciver}) => {
      socket.to(reciver).emit("videoCallAccepted");
    })
    socket.on("rejectCall", ({reciver}) => {
      socket.to(reciver).emit("callRejected", { chatId: reciver });
    })
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
    socket.on("toggleVideo", ({ reciver }) => {
      socket.to(reciver).emit("toggleVideo");
    });
    socket.on("toggleAudio", ({ reciver }) => {
      socket.to(reciver).emit("toggleAudio");
    });
  });
}

export {
  signalling,
}