import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
  origin:  process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));
app.use(cookieParser());

// import routes

import userRoutes from './routes/user.route.js';
import imageUpload from './routes/image.route.js';
import ideaRoutes from './routes/idea.route.js';
import chatRoutes from './routes/chatAndGroup.route.js';
import messageRoutes from './routes/message.route.js';
import commentRoutes from './routes/comment.route.js';
import notificationRoutes from './routes/notification.route.js';

// use routes

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/images', imageUpload);
app.use('/api/v1/ideas', ideaRoutes);
app.use('/api/v1/chats', chatRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// websocket stepup

import http from 'http';
import { Server } from 'socket.io';

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  }
});

// import socket namespaces

import "./sockets/messaging.js";
import { messanging } from './sockets/messaging.js';
import "./sockets/signalling.js";
import { signalling } from './sockets/signalling.js';
import "./sockets/notification.js";
import { notification } from './sockets/notification.js';


const PORT = process.env.WEBSOCKET_PORT || 3001;
server.listen(PORT, () => {
  console.log(`WebSocket Server running on port ${PORT}`);
});

// using socket namespaces

messanging();
signalling();
notification();

export { 
  app,
  io,
};