import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Message from './models/Message.js';
import Conversation from './models/Conversation.js';

export function configureSocket(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('_id');
      if (!user) return next(new Error('User no longer exists'));
      socket.userId = user._id.toString();
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('join', (userId) => {
      if (userId === socket.userId) socket.join(`user:${socket.userId}`);
    });

    socket.on('sendMessage', async (payload, acknowledge) => {
      try {
        const { receiverId, listingId, content, conversationId } = payload || {};
        if (!receiverId || !content?.trim()) throw new Error('Receiver and message content are required');
        let conversation = conversationId
          ? await Conversation.findOne({ _id: conversationId, participants: { $all: [socket.userId, receiverId], $size: 2 } })
          : null;
        if (!conversation) conversation = await Conversation.findOne({ participants: { $all: [socket.userId, receiverId], $size: 2 } });
        if (!conversation) conversation = await Conversation.create({ participants: [socket.userId, receiverId] });
        const message = await Message.create({ conversationId: conversation._id, senderId: socket.userId, receiverId, listingId: listingId || undefined, content: content.trim() });
        conversation.lastMessage = message.content;
        conversation.updatedAt = new Date();
        await conversation.save();
        const populated = await message.populate('senderId', 'name profilePicture');
        io.to(`user:${receiverId}`).emit('newMessage', populated);
        io.to(`user:${socket.userId}`).emit('newMessage', populated);
        acknowledge?.({ message: populated });
      } catch (error) {
        acknowledge?.({ error: error.message });
      }
    });
  });
}