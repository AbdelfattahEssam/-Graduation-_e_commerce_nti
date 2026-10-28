const User = require("../models/user.model");
const Product = require('../models/product.model');
const Order = require('../models/order.model');
const Testimonial = require('../models/testimonial.model');
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
exports.createAdmin = catchAsync(async (req, res) => {
  const { name, email, password } = req.body || {};
  const admin = await User.create({ name, email, password, role: "admin" });
  res.status(201).json({
    success: true,
    data: {
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    },
  });
});

exports.getUsers = catchAsync(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);

  const filter = { role: "user" };
  if (req.query.search) {
    const rx = new RegExp(
      req.query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i",
    );
    filter.$or = [{ name: rx }, { email: rx }];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: { users, total, page, totalPages: Math.ceil(total / limit) },
  });
});
exports.setBlocked = catchAsync(async (req, res) => {
  const { isBlocked } = req.body || {};
  if (typeof isBlocked !== "boolean")
    throw new AppError("isBlocked must be true or false", 400);
  const user = await User.findOne({ _id: req.params.id, role: "user" });
  if (!user) throw new AppError("User not found", 404);
  user.isBlocked = isBlocked;
  await user.save();
  res.json({ success: true, data: { user } });
});
exports.getStats = catchAsync(async (req, res) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [pendingOrders, newOrdersToday, outOfStockProducts, pendingTestimonials] =
    await Promise.all([
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ createdAt: { $gte: startOfToday } }),
      Product.countDocuments({ stock: { $lte: 0 }, isDeleted: false }),
      Testimonial.countDocuments({ status: 'pending' }),
    ]);

  res.json({
    success: true,
    data: { pendingOrders, newOrdersToday, outOfStockProducts, pendingTestimonials },
  });
});