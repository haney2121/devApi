const path = require('path');
const db = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');

//@desc Get all bootcamps
//@route GET /api/v1/bootcamps
//@access Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
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

//@desc Upload photo for bootcamp
//@route PUT /api/v1/bootcamps/:id/photo
//@access Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  let bootcamp = await db.BootCamp.findById(req.params.id);
  //checking if bootcamp exist
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  //make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  //checking file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  //create custom name for file
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }
    await db.BootCamp.findByIdAndUpdate(req.params.id, { photo: file.name });
    res.status(200).json({
      success: true,
      data: file.name
    });
  });
});
