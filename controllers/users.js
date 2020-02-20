const crypto = require('crypto');
const db = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');

//@desc Get All Users
//@route GET /api/v1/users
//@access Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

//@desc Get Single User
//@route GET /api/v1/users/:id
//@access Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await db.User.findById(req.params.id);
  if (!user) {
    return next(new ErrorResponse(`Could not find the user requested.`, 400));
  }
  res.status(200).json({ succes: true, data: user });
});

//@desc Create Single User
//@route POST /api/v1/users
//@access Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  const user = await db.User.create({ name, email, role, password });
  res.status(201).json({ succes: true, data: user });
});

//@desc Update Single User
//@route PUT /api/v1/users/:id
//@access Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await db.User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  res.status(200).json({ succes: true, data: user });
});

//@desc Delete Single User
//@route DELETE /api/v1/users/:id
//@access Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  let user = await db.User.findById(req.params.id);
  if (!user) {
    return next(new ErrorResponse(`Could not find users`, 400));
  }
  user.remove();
  res
    .status(200)
    .json({ succes: true, data: user, message: 'User was removed.' });
});
