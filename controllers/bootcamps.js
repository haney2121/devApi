const db = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');

//@desc Get all bootcamps
//@route GET /api/v1/bootcamps
//@access Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  let query;
  //copy request query
  const reqQuery = { ...req.query };
  //fields to exclude
  const removeFields = ['select', 'sort', 'limit', 'page'];
  // loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // create query string
  let queryStr = JSON.stringify(reqQuery);
  // gt > Greate Then | gte >= Greater Then Equal | lt > Lesser Then | lte <= Lesser Then Equal | in [] Array List
  //create operators ($gt, $gte, etc) for mongoose
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => {
    return `$${match}`;
  });
  //finding resources
  query = db.BootCamp.find(JSON.parse(queryStr)).populate('courses');

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }
  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }
  //Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 100;
  //skip
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await db.BootCamp.countDocuments();

  query = query.skip(startIndex).limit(limit);

  //Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  //Executing the query
  let bootcamps = await query;

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    pagination,
    data: bootcamps
  });
});

//@desc Get a single bootcamp
//@route GET /api/v1/bootcamps/:id
//@access Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await db.BootCamp.findById(req.params.id);
  //checking if bootcamp exist
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: bootcamp });
});

//@desc Create new bootcamp
//@route GET /api/v1/bootcamps
//@access Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  let newBootcamp = await db.BootCamp.create(req.body);
  res.status(201).json({ success: true, data: newBootcamp });
});

//@desc Update :id bootcamp
//@route PUT /api/v1/bootcamps/:id
//@access Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await db.BootCamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  //checking if bootcamp exist
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: bootcamp });
});

//@desc Delete :id bootcamp
//@route DELETE /api/v1/bootcamps/:id
//@access Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await db.BootCamp.findById(req.params.id);
  //checking if bootcamp exist
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  bootcamp.remove();

  res.status(200).json({
    success: true,
    data: `Bootcamp id: ${req.params.id} has been removed.`
  });
});

//@desc Get bootcamps within radius
//@route GET /api/v1/bootcamps/radius/:zipcode/:distance
//@access Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  //Get lat/long from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const long = loc[0].longitude;

  //calc radius using radians
  //divide distance by radius of earth
  //Radius of earth is 3,963 miles / 6,378 km
  const earthRadius = 3963;
  const radius = distance / earthRadius;

  const bootcamps = await db.BootCamp.find({
    location: { $geoWithin: { $centerSphere: [[long, lat], radius] } }
  });

  res
    .status(200)
    .json({ success: true, count: bootcamps.length, data: bootcamps });
});
