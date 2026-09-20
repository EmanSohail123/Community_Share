import { Router } from 'express';
import Listing from '../models/Listing.js';
import { protect } from '../middleware/protect.js';
import { upload, cleanupTempFile } from '../middleware/multer.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import Review from '../models/Review.js';

const router = Router();

// POST /api/listings - Create a new listing (protected, with image upload)
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, type, location, latitude, longitude } = req.body;

    // Validate required fields
    if (!title?.trim() || !description?.trim() || !category || !type || !location?.trim()) {
      if (req.file) cleanupTempFile(req.file.path);
      return res.status(400).json({ 
        message: 'Title, description, category, type, and location are required' 
      });
    }

    // Validate enum values
    if (!['Tool', 'Skill', 'Service'].includes(category)) {
      if (req.file) cleanupTempFile(req.file.path);
      return res.status(400).json({ message: 'Invalid category' });
    }

    if (!['Offer', 'Request'].includes(type)) {
      if (req.file) cleanupTempFile(req.file.path);
      return res.status(400).json({ message: 'Invalid type' });
    }

    // Upload image to Cloudinary if provided
    let imageUrl = '';
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.path);
      cleanupTempFile(req.file.path);
    }

    const listing = await Listing.create({
      title: title.trim(),
      description: description.trim(),
      category,
      type,
      location: location.trim(),
      image: imageUrl,
      createdBy: req.user._id,
      coordinates: latitude && longitude ? { lat: Number(latitude), lng: Number(longitude) } : undefined,
    });

    const populatedListing = await listing.populate('createdBy', 'name email profilePicture location');
    res.status(201).json(populatedListing);
  } catch (error) {
    if (req.file) cleanupTempFile(req.file.path);
    res.status(500).json({ message: 'Failed to create listing', error: error.message });
  }
});

// GET /api/listings - Get all listings with filters (category, keyword, type)
router.get('/', async (req, res) => {
  try {
    const { category, keyword, type, sortBy = 'recent' } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (type) {
      filter.type = type;
    }

    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { location: { $regex: keyword, $options: 'i' } },
      ];
    }

    let query = Listing.find(filter).populate('createdBy', 'name email profilePicture location');

    // Sort options
    if (sortBy === 'oldest') {
      query = query.sort({ createdAt: 1 });
    } else {
      query = query.sort({ createdAt: -1 }); // recent is default
    }

    const listings = await query;
    const creatorIds = listings.map((listing) => listing.createdBy?._id).filter(Boolean);
    const ratings = await Review.aggregate([
      { $match: { revieweeId: { $in: creatorIds } } },
      { $group: { _id: '$revieweeId', averageRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } },
    ]);
    const ratingByUser = new Map(ratings.map((rating) => [rating._id.toString(), rating]));
    res.json(listings.map((listing) => {
      const result = listing.toObject();
      const rating = ratingByUser.get(listing.createdBy?._id?.toString());
      result.createdBy = { ...result.createdBy, averageRating: rating ? Number(rating.averageRating.toFixed(1)) : 0, reviewCount: rating?.reviewCount || 0 };
      return result;
    }));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch listings', error: error.message });
  }
});

// GET /api/listings/user/mylistings - Get all listings by the logged-in user
router.get('/user/mylistings', protect, async (req, res) => {
  try {
    const listings = await Listing.find({ createdBy: req.user._id })
      .populate('createdBy', 'name email profilePicture location')
      .sort({ createdAt: -1 });

    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your listings', error: error.message });
  }
});

// GET /api/listings/:id - Get a single listing by ID
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate(
      'createdBy',
      'name email profilePicture location'
    );

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch listing', error: error.message });
  }
});

// PUT /api/listings/:id - Update a listing (only owner can update)
router.put('/:id', protect, upload.single('image'), async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      if (req.file) cleanupTempFile(req.file.path);
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user is the owner
    if (listing.createdBy.toString() !== req.user._id.toString()) {
      if (req.file) cleanupTempFile(req.file.path);
      return res.status(403).json({ message: 'Only the owner can update this listing' });
    }

    const { title, description, category, type, location, latitude, longitude } = req.body;

    // Update fields if provided
    if (title?.trim()) listing.title = title.trim();
    if (description?.trim()) listing.description = description.trim();
    if (category && ['Tool', 'Skill', 'Service'].includes(category)) listing.category = category;
    if (type && ['Offer', 'Request'].includes(type)) listing.type = type;
    if (location?.trim()) listing.location = location.trim();
    if (latitude && longitude) listing.coordinates = { lat: Number(latitude), lng: Number(longitude) };

    // Handle image update
    if (req.file) {
      // Delete old image if exists
      if (listing.image) {
        await deleteFromCloudinary(listing.image);
      }
      const newImageUrl = await uploadToCloudinary(req.file.path);
      listing.image = newImageUrl;
      cleanupTempFile(req.file.path);
    }

    await listing.save();
    const updatedListing = await listing.populate('createdBy', 'name email profilePicture location');
    res.json(updatedListing);
  } catch (error) {
    if (req.file) cleanupTempFile(req.file.path);
    res.status(500).json({ message: 'Failed to update listing', error: error.message });
  }
});

// DELETE /api/listings/:id - Delete a listing (only owner can delete)
router.delete('/:id', protect, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user is the owner
    if (listing.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can delete this listing' });
    }

    // Delete image from Cloudinary if exists
    if (listing.image) {
      await deleteFromCloudinary(listing.image);
    }

    await Listing.findByIdAndDelete(req.params.id);
    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete listing', error: error.message });
  }
});

export default router;
