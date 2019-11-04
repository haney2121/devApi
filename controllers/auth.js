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
  //create Token
  const token = user.getSignedJwtToken();
  res.status(200).json({ success: true, token });
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

  //create Token
  const token = user.getSignedJwtToken();

  res.status(200).json({ success: true, token });
});
