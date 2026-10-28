const User = require("../models/user.model");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { signToken } = require("../utils/token");

const sendAuthResponse = (user, statusCode, res) => {
  const token = signToken(user);
  res.status(statusCode).json({
    success: true,
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
};

exports.register = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;

  const user = await User.create({ name, email, password });

  sendAuthResponse(user, 201, res);
});

exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }
  if (user.isBlocked) throw new AppError("Your account has been blocked", 403);

  sendAuthResponse(user, 200, res);
});

exports.getMe = catchAsync(async (req, res) => {
  const u = req.user;
  res.json({
    success: true,
    data: {
      user: {
        id: u._id,
        name: u.name,
        email: u.email,
        mobile: u.mobile,
        role: u.role,
        addresses: u.addresses,
      },
    },
  });
});
exports.updateMe = catchAsync(async (req, res) => {
  const { name, mobile } = req.body || {};
  const user = req.user;

  if (name !== undefined) user.name = name;

  if (mobile !== undefined) {
    if (!/^01[0125][0-9]{8}$/.test(mobile)) {
      throw new AppError("Please enter a valid mobile number", 400);
    }
    user.mobile = mobile;
  }

  await user.save();

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        addresses: user.addresses,
      },
    },
  });
});
