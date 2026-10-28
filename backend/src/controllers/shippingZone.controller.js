const ShippingZone = require('../models/shippingZone.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.getZones = catchAsync(async (req, res) => {
  const zones = await ShippingZone.find().sort('governorate');
  res.json({ success: true, data: { zones } });
});

exports.updateZone = catchAsync(async (req, res) => {
  const zone = await ShippingZone.findById(req.params.id);
  if (!zone) throw new AppError('Shipping zone not found', 404);

  const { cost, isAvailable } = req.body || {};
  if (cost !== undefined) zone.cost = cost;
  if (isAvailable !== undefined) zone.isAvailable = isAvailable;

  await zone.save();
  res.json({ success: true, data: { zone } });
});