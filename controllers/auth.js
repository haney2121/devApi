const db = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

//@desc Register User
//@route POST /api/v1/auth/register
//@access Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  //create a user
  const user = await db.User.create({ name, email, role, password });

  sendTokenResponse(user, 200, res);
});

//@desc Login User
//@route POST /api/v1/auth/login
//@access Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  //validate email and password
  if (!email || !password) {
    return next(new ErrorResponse(`Please provide an email and password`, 400));
  }
  //check for user
  const user = await db.User.findOne({ email }).select('+password');
  if (!user) {
    return next(new ErrorResponse(`Invalid credentials`, 401));
  }
  //check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse(`Invalid credentials`, 401));
  }

  sendTokenResponse(user, 200, res);
});

//Get Token from modal, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }
  res
    .status(statusCode)
    .cookie('auth.token', token, options)
    .json({ success: true, token });
};

//@desc Get current logged in User
//@route POST /api/v1/auth/me
//@access Private

exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await db.User.findById(req.user);
  res.status(200).json({ success: true, data: user });
});
