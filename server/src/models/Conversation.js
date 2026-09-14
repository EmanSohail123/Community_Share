import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      required: true,
      validate: {
        validator: (participants) => participants.length === 2,
        message: 'A conversation must have exactly two participants',
      },
    },
    lastMessage: { type: String, default: '' },
  },
  { timestamps: { createdAt: false, updatedAt: true } },
);

conversationSchema.index({ participants: 1, updatedAt: -1 });

export default mongoose.model('Conversation', conversationSchema);