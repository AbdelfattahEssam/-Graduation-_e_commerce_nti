const Testimonial = require('../models/testimonial.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.createTestimonial = catchAsync(async (req, res) => {
  const { rating, content } = req.body || {};

  const testimonial = await Testimonial.create({
    userId: req.user._id,
    rating,
    content,
  });

  res.status(201).json({
    success: true,
    message: 'Thank you! Your feedback will appear after admin review.',
    data: { testimonial },
  });
});

exports.getApproved = catchAsync(async (req, res) => {
  const testimonials = await Testimonial.find({ status: 'approved' })
    .populate('userId', 'name')
    .sort({ createdAt: -1 })
    .limit(20);

  res.json({ success: true, data: { testimonials } });
});

exports.getAllAdmin = catchAsync(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);

  const filter = {};
  if (req.query.status) {
    if (!['pending', 'approved', 'rejected'].includes(req.query.status)) {
      throw new AppError('Invalid status', 400);
    }
    filter.status = req.query.status;
  }

  const [testimonials, total] = await Promise.all([
    Testimonial.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Testimonial.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: { testimonials, total, page, totalPages: Math.ceil(total / limit) },
  });
});

exports.updateStatus = catchAsync(async (req, res) => {
  const { status } = req.body || {};
  if (!['approved', 'rejected'].includes(status)) {
    throw new AppError('Status must be approved or rejected', 400);
  }

  const testimonial = await Testimonial.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );
  if (!testimonial) throw new AppError('Testimonial not found', 404);

  res.json({ success: true, data: { testimonial } });
});