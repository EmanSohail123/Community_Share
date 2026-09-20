import { Router } from 'express';
import Conversation from '../models/Conversation.js';
import Listing from '../models/Listing.js';
import Review from '../models/Review.js';
import User from '../models/User.js';
import { protect } from '../middleware/protect.js';

const router = Router();

async function ratingSummary(userId) {
  const [summary] = await Review.aggregate([
    { $match: { revieweeId: userId } },
    { $group: { _id: '$revieweeId', averageRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } },
  ]);
  return { averageRating: summary ? Number(summary.averageRating.toFixed(1)) : 0, reviewCount: summary?.reviewCount || 0 };
}

router.post('/', protect, async (req, res) => {
  try {
    const { revieweeId, listingId, rating, comment = '' } = req.body;
    const numericRating = Number(rating);
    if (!revieweeId || req.user._id.toString() === revieweeId) return res.status(400).json({ message: 'A valid reviewee is required' });
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) return res.status(400).json({ message: 'Rating must be an integer from 1 to 5' });
    if (!await User.exists({ _id: revieweeId })) return res.status(404).json({ message: 'Reviewee not found' });
    if (listingId && !await Listing.exists({ _id: listingId, createdBy: revieweeId })) return res.status(400).json({ message: 'Listing does not belong to the reviewee' });
    if (!await Conversation.exists({ participants: { $all: [req.user._id, revieweeId], $size: 2 } })) return res.status(403).json({ message: 'You can only review a user after an exchange conversation' });
    const duplicateFilter = { reviewerId: req.user._id, revieweeId, ...(listingId ? { listingId } : { listingId: { $exists: false } }) };
    if (await Review.exists(duplicateFilter)) return res.status(409).json({ message: 'You have already reviewed this exchange' });

    const review = await Review.create({ reviewerId: req.user._id, revieweeId, listingId: listingId || undefined, rating: numericRating, comment: comment.trim() });
    const populated = await review.populate([{ path: 'reviewerId', select: 'name profilePicture' }, { path: 'listingId', select: 'title' }]);
    res.status(201).json({ review: populated, ...(await ratingSummary(revieweeId)) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'You have already reviewed this exchange' });
    res.status(500).json({ message: 'Failed to create review', error: error.message });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ revieweeId: req.params.userId }).populate('reviewerId', 'name profilePicture').populate('listingId', 'title').sort({ createdAt: -1 });
    res.json({ reviews, ...(await ratingSummary(req.params.userId)) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
  }
});

export default router;
