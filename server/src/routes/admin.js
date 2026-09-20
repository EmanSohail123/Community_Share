import { Router } from 'express';
import Listing from '../models/Listing.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import { protect } from '../middleware/protect.js';
import { adminOnly } from '../middleware/admin.js';

const router = Router();
router.use(protect, adminOnly);

router.get('/users', async (_req, res) => res.json(await User.find().select('-password').sort({ createdAt: -1 })));
router.get('/listings', async (_req, res) => res.json(await Listing.find().populate('createdBy', 'name email').sort({ createdAt: -1 })));

router.delete('/users/:id', async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) return res.status(400).json({ message: 'You cannot delete your own admin account' });
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await Promise.all([
      Listing.deleteMany({ createdBy: req.params.id }),
      Review.deleteMany({ $or: [{ reviewerId: req.params.id }, { revieweeId: req.params.id }] }),
      Message.deleteMany({ $or: [{ senderId: req.params.id }, { receiverId: req.params.id }] }),
      Conversation.deleteMany({ participants: req.params.id }),
    ]);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
});

router.delete('/listings/:id', async (req, res) => {
  const listing = await Listing.findByIdAndDelete(req.params.id);
  if (!listing) return res.status(404).json({ message: 'Listing not found' });
  await Review.deleteMany({ listingId: req.params.id });
  res.json({ message: 'Listing deleted' });
});

export default router;