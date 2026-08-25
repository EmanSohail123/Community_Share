import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/protect.js';

const router = Router();

function createToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function userResponse(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    profilePicture: user.profilePicture,
    location: user.location,
    createdAt: user.createdAt,
  };
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name: name.trim(), email: normalizedEmail, password: hashedPassword });
    res.status(201).json({ token: createToken(user._id.toString()), user: userResponse(user) });
  } catch (error) {
    res.status(500).json({ message: 'Unable to create account', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.trim().toLowerCase() }).select('+password');
    const validPassword = user && await bcrypt.compare(password || '', user.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({ token: createToken(user._id.toString()), user: userResponse(user) });
  } catch (error) {
    res.status(500).json({ message: 'Unable to log in', error: error.message });
  }
});

router.get('/me', protect, (req, res) => {
  res.json({ user: userResponse(req.user) });
});

export default router;
