import { io } from '../app.js';
import { Notification } from '../models/notification.model.js';

const notification = () => {
  io.on('connection', (socket) => {
    socket.on('joinNotificationRoom', (room) => {
      socket.join(room);
      console.log('joined room');
    });
    socket.on("followNotification", async ({ follower, followed }) => {
      const { _id, username, profileImage, type } = await Notification.create({
        notifiedBy: follower,
        notifiedTo: followed,
        username: follower.username,
        profileImage: follower.profileImage,
        type: "follow",
      })
      io.to(followed).emit("notification", {
        _id,
        username,
        profileImage,
        notifiedBy: follower,
        type
      });
    });
    socket.on("intrestedNotification", async ({ userId, idea : { _id, title, ideaOf }, profileImage, username }) => {
      console.log("recived intrested notification",userId, _id, title, ideaOf, profileImage, username);
      const newNotification = await Notification.create({
        notifiedBy: userId,
        notifiedTo: ideaOf,
        IdeaId: _id,
        username,
        profileImage,
        title,
        type: "intrested"
      })
      io.to(ideaOf).emit("notification", {
        _id: newNotification._id,
        username: newNotification.username,
        profileImage: newNotification.profileImage,
        title: newNotification.title,
        ideaId: newNotification.IdeaId,
        notifiedBy: newNotification.notifiedBy,
        type: newNotification.type
      });
    });
    socket.on("includedNotification", async ({ userId, idea : { _id, title }, profileImage, username, includedUser }) => {
      const newNotification = await Notification.create({
        notifiedBy: userId,
        notifiedTo: includedUser,
        IdeaId: _id,
        username,
        profileImage,
        title,
        type: "included",
      })
      io.to(includedUser).emit("notification", {
        _id: newNotification._id,
        username: newNotification.username,
        profileImage: newNotification.profileImage,
        title: newNotification.title,
        ideaId: newNotification.IdeaId,
        type: newNotification.type
      });
    });
    socket.on("likedNotification", async ({ userId, idea : { _id, title, ideaOf }, profileImage, username }) => {
      const newNotification = await Notification.create({
        notifiedBy: userId,
        notifiedTo: ideaOf,
        IdeaId: _id,
        username,
        profileImage,
        title,
        type: "liked",
      })
      io.to(ideaOf).emit("notification", {
        _id: newNotification._id,
        username: newNotification.username,
        profileImage: newNotification.profileImage,
        title: newNotification.title,
        type: newNotification.type
      });
    });
    socket.on("commentedNotification", async ({ userId, idea : { _id, title, ideaOf }, profileImage, username }) => {
      console.log("recived comment notification",userId, _id, title, ideaOf, profileImage, username);
      const newNotification = await Notification.create({
        notifiedBy: userId,
        notifiedTo: ideaOf,
        IdeaId: _id,
        username,
        profileImage,
        title,
        type: "commented",
      })
      io.to(ideaOf).emit("notification", {
        _id: newNotification._id,
        username: newNotification.username,
        profileImage: newNotification.profileImage,
        title: newNotification.title,
        type: newNotification.type
      });
    });
    socket.on("seenAllNotification", async ({ userId }) => {
      await Notification.updateMany({ notifiedTo: userId }, { seen: true });
    });
    socket.on("seenNotification", async ({ notificationId }) => {
      await Notification.findByIdAndUpdate(notificationId, { seen: true });
    });
  });
}

export { notification };