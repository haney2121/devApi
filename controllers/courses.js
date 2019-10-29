const db = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

//@desc Get all courses
//@route GET /api/v1/courses
//@route GET /api/v1/bootcamps/:bootcampId/courses
//@access Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  let query;
  if (req.params.bootcampId) {
    query = db.Course.find({ bootcamp: req.params.bootcampId });
  } else {
    query = db.Course.find().populate({
      path: 'bootcamp',
      select: 'name description'
    });
  }
  const courses = await query;
  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  });
});
