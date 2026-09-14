import { Router } from 'express';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Listing from '../models/Listing.js';
import { protect } from '../middleware/protect.js';

const router = Router();

function socketServer(req) { return req.app.get('io'); }

async function findOrCreateConversation(userId, receiverId) {
  const participants = [userId, receiverId];
  let conversation = await Conversation.findOne({ participants: { $all: participants, $size: 2 } });
  if (!conversation) conversation = await Conversation.create({ participants: [userId, receiverId] });
  return conversation;
}

router.post('/conversations', protect, async (req, res) => {
  try {
    const { receiverId, listingId } = req.body;
    if (!receiverId || req.user._id.toString() === receiverId) return res.status(400).json({ message: 'A valid receiver is required' });
    if (!await User.exists({ _id: receiverId })) return res.status(404).json({ message: 'Receiver not found' });
    const conversation = await findOrCreateConversation(req.user._id, receiverId);
    res.json({ conversationId: conversation._id, listingId: listingId || null });
  } catch (error) {
    res.status(500).json({ message: 'Failed to open conversation', error: error.message });
  }
});

router.get('/conversations', protect, async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id }).populate('participants', 'name email profilePicture').sort({ updatedAt: -1 }).lean();
    const unread = await Message.aggregate([
      { $match: { receiverId: req.user._id, read: false } },
      { $group: { _id: '$conversationId', count: { $sum: 1 } } },
    ]);
    const unreadByConversation = Object.fromEntries(unread.map((item) => [item._id.toString(), item.count]));
    res.json(conversations.map((conversation) => ({ ...conversation, unreadCount: unreadByConversation[conversation._id.toString()] || 0 })));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch conversations', error: error.message });
  }
});

router.get('/messages/:conversationId', protect, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({ _id: req.params.conversationId, participants: req.user._id });
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    const messages = await Message.find({ conversationId: conversation._id }).populate('senderId', 'name profilePicture').populate('listingId', 'title').sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
  }
});

router.patch('/messages/:conversationId/read', protect, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({ _id: req.params.conversationId, participants: req.user._id });
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    await Message.updateMany({ conversationId: conversation._id, receiverId: req.user._id, read: false }, { read: true });
    const unreadCount = await Message.countDocuments({ receiverId: req.user._id, read: false });
    req.app.get('io')?.to(`user:${req.user._id}`).emit('unreadCountUpdated', { count: unreadCount });
    res.json({ unreadCount });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark messages as read', error: error.message });
  }
});

router.post('/messages', protect, async (req, res) => {
  try {
    const { receiverId, listingId, content, conversationId } = req.body;
    if (!receiverId || !content?.trim()) return res.status(400).json({ message: 'Receiver and message content are required' });
    if (req.user._id.toString() === receiverId) return res.status(400).json({ message: 'You cannot message yourself' });
    if (!await User.exists({ _id: receiverId })) return res.status(404).json({ message: 'Receiver not found' });
    if (listingId && !await Listing.exists({ _id: listingId })) return res.status(404).json({ message: 'Listing not found' });
    let conversation = conversationId
      ? await Conversation.findOne({ _id: conversationId, participants: { $all: [req.user._id, receiverId], $size: 2 } })
      : null;
    if (!conversation) conversation = await findOrCreateConversation(req.user._id, receiverId);
    const message = await Message.create({ conversationId: conversation._id, senderId: req.user._id, receiverId, listingId, content: content.trim() });
    conversation.lastMessage = message.content;
    conversation.updatedAt = new Date();
    await conversation.save();
    const populated = await message.populate('senderId', 'name profilePicture');
    socketServer(req)?.to(`user:${receiverId}`).emit('newMessage', populated);
    socketServer(req)?.to(`user:${req.user._id}`).emit('newMessage', populated);
    res.status(201).json({ conversationId: conversation._id, message: populated });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
});

router.get('/messages/unread/count', protect, async (req, res) => {
  const count = await Message.countDocuments({ receiverId: req.user._id, read: false });
  res.json({ count });
});

export default router;