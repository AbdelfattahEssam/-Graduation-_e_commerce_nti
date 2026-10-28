const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
    },
    content: {
      type: String,
      required: [true, 'Testimonial content is required'],
      trim: true,
      maxlength: [500, 'Content cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

testimonialSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Testimonial', testimonialSchema);