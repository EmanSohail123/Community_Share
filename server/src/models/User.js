import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    profilePicture: { type: String, default: '' },
    location: { type: String, default: '', trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model('User', userSchema);
