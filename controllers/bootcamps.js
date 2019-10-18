const db = require('../models');
const ErrorResponse = require('../utils/errorResponse');

//@desc Get all bootcamps
//@route GET /api/v1/bootcamps
//@access Public
exports.getBootcamps = async (req, res, next) => {
  try {
    let bootcamps = await db.BootCamp.find();
    res
      .status(200)
      .json({ success: true, count: bootcamps.length, data: bootcamps });
  } catch (err) {
    next(err);
  }
};

//@desc Get a single bootcamp
//@route GET /api/v1/bootcamps/:id
//@access Public
exports.getBootcamp = async (req, res, next) => {
  try {
    let bootcamp = await db.BootCamp.findById(req.params.id);
    //checking if bootcamp exist
    if (!bootcamp) {
      return next(
        new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
      );
    }
    res.status(200).json({ success: true, data: bootcamp });
  } catch (err) {
    next(err);
  }
};

//@desc Create new bootcamp
//@route GET /api/v1/bootcamps
//@access Private
exports.createBootcamp = async (req, res, next) => {
  try {
    let newBootcamp = await db.BootCamp.create(req.body);
    res.status(201).json({ success: true, data: newBootcamp });
  } catch (err) {
    next(err);
  }
};

//@desc Update :id bootcamp
//@route PUT /api/v1/bootcamps/:id
//@access Private
exports.updateBootcamp = async (req, res, next) => {
  try {
    let bootcamp = await db.BootCamp.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    //checking if bootcamp exist
    if (!bootcamp) {
      return next(
        new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
      );
    }
    res.status(200).json({ success: true, data: bootcamp });
  } catch (err) {
    next(err);
  }
};

//@desc Delete :id bootcamp
//@route DELETE /api/v1/bootcamps/:id
//@access Private
exports.deleteBootcamp = async (req, res, next) => {
  try {
    let bootcamp = await db.BootCamp.findByIdAndDelete(req.params.id);
    //checking if bootcamp exist
    if (!bootcamp) {
      return next(
        new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
      );
    }
    res.status(200).json({
      success: true,
      data: `Bootcamp id: ${req.params.id} has been removed.`
    });
  } catch (err) {
    next(err);
  }
};
