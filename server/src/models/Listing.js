import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true, 
      trim: true, 
      maxlength: 100 
    },
    description: { 
      type: String, 
      required: true, 
      trim: true, 
      maxlength: 2000 
    },
    category: { 
      type: String, 
      enum: ['Tool', 'Skill', 'Service'], 
      required: true 
    },
    type: { 
      type: String, 
      enum: ['Offer', 'Request'], 
      required: true 
    },
    image: { 
      type: String, 
      default: '' 
    },
    location: { 
      type: String, 
      required: true, 
      trim: true 
    },
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
  },
  { timestamps: true }
);

export default mongoose.model('Listing', listingSchema);
