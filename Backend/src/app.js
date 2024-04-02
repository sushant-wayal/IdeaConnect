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
import chatRoutes from './routes/chat.route.js';
import messageRoutes from './routes/message.route.js';

// use routes

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/images', imageUpload);
app.use('/api/v1/ideas', ideaRoutes);
app.use('/api/v1/chats', chatRoutes);
app.use('/api/v1/messages', messageRoutes);

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

const PORT = process.env.WEBSOCKET_PORT || 3001;
server.listen(PORT, () => {
    console.log(`WebSocket Server running on port ${PORT}`);
});

// using socket namespaces

messanging();

export { 
    app,
    io,
};