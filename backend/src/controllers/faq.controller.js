const FAQ = require('../models/faq.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.getFaqs = catchAsync(async (req, res) => {
  const faqs = await FAQ.find().sort({ createdAt: 1 });
  res.json({ success: true, data: { faqs } });
});

exports.createFaq = catchAsync(async (req, res) => {
  const { question, answer } = req.body || {};
  const faq = await FAQ.create({ question, answer });
  res.status(201).json({ success: true, data: { faq } });
});

exports.updateFaq = catchAsync(async (req, res) => {
  const faq = await FAQ.findById(req.params.id);
  if (!faq) throw new AppError('FAQ not found', 404);

  const { question, answer } = req.body || {};
  if (question !== undefined) faq.question = question;
  if (answer !== undefined) faq.answer = answer;

  await faq.save();
  res.json({ success: true, data: { faq } });
});

exports.deleteFaq = catchAsync(async (req, res) => {
  const faq = await FAQ.findByIdAndDelete(req.params.id);
  if (!faq) throw new AppError('FAQ not found', 404);

  res.json({ success: true, message: 'FAQ deleted' });
});