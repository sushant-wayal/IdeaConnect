import { io } from '../app.js';

const notification = () => {
  io.on('connection', (socket) => {
    socket.on('joinNotificationRoom', (room) => {
      socket.join(room);
      console.log('joined room');
    });
  });
}

export { notification };