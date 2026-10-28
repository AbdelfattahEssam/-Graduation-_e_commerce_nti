const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const ShippingZone = require("../models/shippingZone.model");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

exports.createOrder = catchAsync(async (req, res) => {
  const user = req.user;

  if (!user.mobile)
    throw new AppError("Please add your mobile number first", 400);
  if (!user.addresses.length)
    throw new AppError("Please add an address first", 400);

  const { addressId } = req.body || {};
  const address = addressId
    ? user.addresses.id(addressId)
    : user.addresses.find((a) => a.isDefault) || user.addresses[0];
  if (!address) throw new AppError("Address not found", 404);

  const zone = await ShippingZone.findOne({ governorate: address.governorate });
  if (!zone || !zone.isAvailable) {
    throw new AppError(
      `Shipping is not available to ${address.governorate}`,
      400,
    );
  }

  const cart = await Cart.findOne({ clientId: user._id });
  if (!cart || cart.products.length === 0)
    throw new AppError("Your cart is empty", 400);

  const products = await Product.find({
    _id: { $in: cart.products.map((i) => i.productId) },
  });
  const map = new Map(products.map((p) => [p._id.toString(), p]));

  for (const item of cart.products) {
    const p = map.get(item.productId.toString());
    if (!p || !p.isActive || p.isDeleted) {
      throw new AppError(
        "Some products in your cart are no longer available",
        400,
      );
    }
    if (p.price !== item.priceAtAdd) {
      throw new AppError(
        `Price of "${p.title}" has changed. Please review your cart`,
        409,
      );
    }
  }

  const deducted = [];
  try {
    for (const item of cart.products) {
      const updated = await Product.findOneAndUpdate(
        {
          _id: item.productId,
          stock: { $gte: item.quantity },
          isActive: true,
          isDeleted: false,
        },
        { $inc: { stock: -item.quantity } },
        { new: true },
      );
      if (!updated) {
        const title = map.get(item.productId.toString()).title;
        throw new AppError(
          `"${title}" is out of stock or has insufficient quantity`,
          409,
        );
      }
      deducted.push(item);
    }
  } catch (err) {
    await Promise.all(
      deducted.map((i) =>
        Product.updateOne(
          { _id: i.productId },
          { $inc: { stock: i.quantity } },
        ),
      ),
    );
    throw err;
  }

  try {
    const orderItems = cart.products.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      price: map.get(i.productId.toString()).price,
    }));
    const itemsTotal = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);

    const order = await Order.create({
      userId: user._id,
      addressId: address._id,
      addressSnapshot: address.toObject(),
      mobileSnapshot: user.mobile,
      shippingCost: zone.cost,
      totalPrice: itemsTotal + zone.cost,
      orderItems,
    });

    cart.products = [];
    await cart.save();

    res.status(201).json({ success: true, data: { order } });
  } catch (err) {
    await Promise.all(
      cart.products.map((i) =>
        Product.updateOne(
          { _id: i.productId },
          { $inc: { stock: i.quantity } },
        ),
      ),
    );
    throw err;
  }
});
exports.getMyOrders = catchAsync(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);

  const filter = { userId: req.user._id };

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('orderItems.productId', 'title slug image')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: { orders, total, page, totalPages: Math.ceil(total / limit) },
  });
});

exports.getMyOrder = catchAsync(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, userId: req.user._id }).populate(
    'orderItems.productId',
    'title slug image'
  );
  if (!order) throw new AppError('Order not found', 404);

  res.json({ success: true, data: { order } });
});
exports.cancelMyOrder = catchAsync(async (req, res) => {
  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id, status: 'pending' },
    { status: 'cancelled by client' },
    { new: true }
  );

  if (!order) {
    const exists = await Order.exists({ _id: req.params.id, userId: req.user._id });
    if (!exists) throw new AppError('Order not found', 404);
    throw new AppError('Only pending orders can be cancelled', 400);
  }

  await Promise.all(
    order.orderItems.map((i) =>
      Product.updateOne({ _id: i.productId }, { $inc: { stock: i.quantity } })
    )
  );

  res.json({ success: true, data: { order } });
});
exports.getAllOrders = catchAsync(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);

  const filter = {};
  if (req.query.status) {
    if (!Order.ORDER_STATUSES.includes(req.query.status)) {
      throw new AppError('Invalid status', 400);
    }
    filter.status = req.query.status;
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('userId', 'name email')
      .populate('orderItems.productId', 'title slug image')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: { orders, total, page, totalPages: Math.ceil(total / limit) },
  });
});
const TRANSITIONS = {
  pending: ['preparing', 'cancelled by admin', 'rejected'],
  preparing: ['shipped', 'cancelled by admin'],
  shipped: ['delivered'],
  delivered: ['received', 'refunded'],
  received: ['refunded'],
};

const RESTOCK_STATUSES = ['cancelled by admin', 'rejected'];

exports.updateOrderStatus = catchAsync(async (req, res) => {
  const { status } = req.body || {};
  if (!Order.ORDER_STATUSES.includes(status)) throw new AppError('Invalid status', 400);

  const current = await Order.findById(req.params.id);
  if (!current) throw new AppError('Order not found', 404);

  const allowed = TRANSITIONS[current.status] || [];
  if (!allowed.includes(status)) {
    throw new AppError(`Cannot change status from "${current.status}" to "${status}"`, 400);
  }

  const order = await Order.findOneAndUpdate(
    { _id: current._id, status: current.status },
    { status },
    { new: true }
  );
  if (!order) throw new AppError('Order status was changed by someone else. Please refresh', 409);

  if (RESTOCK_STATUSES.includes(status)) {
    await Promise.all(
      order.orderItems.map((i) =>
        Product.updateOne({ _id: i.productId }, { $inc: { stock: i.quantity } })
      )
    );
  }

  res.json({ success: true, data: { order } });
});