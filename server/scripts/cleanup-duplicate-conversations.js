import 'dotenv/config';
import mongoose from 'mongoose';
import Conversation from '../src/models/Conversation.js';
import Message from '../src/models/Message.js';
import { connectDatabase } from '../src/config/db.js';

async function cleanupDuplicateConversations() {
  await connectDatabase();
  const conversations = await Conversation.find({}).lean();
  const groups = new Map();

  for (const conversation of conversations) {
    if (conversation.participants.length !== 2) continue;
    const key = conversation.participants.map(String).sort().join(':');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(conversation);
  }

  let removed = 0;
  let moved = 0;
  for (const duplicateGroup of groups.values()) {
    if (duplicateGroup.length < 2) continue;

    const ranked = await Promise.all(duplicateGroup.map(async (conversation) => ({
      conversation,
      messageCount: await Message.countDocuments({ conversationId: conversation._id }),
    })));
    ranked.sort((left, right) => right.messageCount - left.messageCount || new Date(right.conversation.updatedAt) - new Date(left.conversation.updatedAt));
    const keeper = ranked[0].conversation;

    for (const { conversation } of ranked.slice(1)) {
      const result = await Message.updateMany({ conversationId: conversation._id }, { conversationId: keeper._id });
      moved += result.modifiedCount;
      await Conversation.deleteOne({ _id: conversation._id });
      removed += 1;
    }

    const latestMessage = await Message.findOne({ conversationId: keeper._id }).sort({ createdAt: -1 }).select('content createdAt').lean();
    if (latestMessage) {
      await Conversation.updateOne({ _id: keeper._id }, { lastMessage: latestMessage.content, updatedAt: latestMessage.createdAt });
    }
    console.log(`Kept ${keeper._id} and merged ${duplicateGroup.length - 1} duplicate conversation(s).`);
  }

  console.log(`Cleanup complete: removed ${removed} duplicate conversation(s), moved ${moved} message(s).`);
  await mongoose.disconnect();
}

cleanupDuplicateConversations().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
