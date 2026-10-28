const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const respond = (res, user, status = 200) =>
  res.status(status).json({ success: true, data: { addresses: user.addresses } });

exports.getAddresses = catchAsync(async (req, res) => {
  respond(res, req.user);
});

exports.addAddress = catchAsync(async (req, res) => {
  const { title, governorate, city, street, details, isDefault } = req.body || {};
  const user = req.user;

  const makeDefault = user.addresses.length === 0 || isDefault === true;
  if (makeDefault) user.addresses.forEach((a) => (a.isDefault = false));

  user.addresses.push({ title, governorate, city, street, details, isDefault: makeDefault });
  await user.save();

  respond(res, user, 201);
});

exports.updateAddress = catchAsync(async (req, res) => {
  const user = req.user;
  const address = user.addresses.id(req.params.id);
  if (!address) throw new AppError('Address not found', 404);

  const body = req.body || {};
  ['title', 'governorate', 'city', 'street', 'details'].forEach((f) => {
    if (body[f] !== undefined) address[f] = body[f];
  });

  await user.save();
  respond(res, user);
});

exports.deleteAddress = catchAsync(async (req, res) => {
  const user = req.user;
  const address = user.addresses.id(req.params.id);
  if (!address) throw new AppError('Address not found', 404);

  const wasDefault = address.isDefault;
  address.deleteOne();

  if (wasDefault && user.addresses.length > 0) user.addresses[0].isDefault = true;

  await user.save();
  respond(res, user);
});

exports.setDefault = catchAsync(async (req, res) => {
  const user = req.user;
  const address = user.addresses.id(req.params.id);
  if (!address) throw new AppError('Address not found', 404);

  user.addresses.forEach((a) => (a.isDefault = false));
  address.isDefault = true;

  await user.save();
  respond(res, user);
});