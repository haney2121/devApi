const db = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

//@desc Get reviews
//@route GET /api/v1/reviews
//@route GET /api/v1/bootcamps/:bootcampId/reviews
//@access Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await db.Review.find({ bootcamp: req.params.bootcampId });
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

//@desc Get Single Review
//@route GET /api/v1/review
//@access Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await (
    await db.Review.findById(req.params.reviewId)
  ).populate({ path: 'bootcamp', select: 'name description' });

  if (!review) {
    return next(
      new ErrorResponse(
        `No review found with the id of ${req.params.reviewId}`,
        404
      )
    );
  }
  res.status(200).json({
    success: true,
    data: review
  });
});

//@desc Create a Review
//@route POST /api/v1/bootcamps/:bootcampId/reviews
//@access Private
exports.createReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await db.BootCamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `No bootcamp with the id of ${req.params.bootcampId}`,
        404
      )
    );
  }

  const review = await db.Review.create(req.body);
  res.status(201).json({
    success: true,
    data: review
  });
});

//@desc Update Review
//@route PUT /api/v1/review/:reviewId
//@access Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await db.Review.findById(req.params.reviewId);
  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${req.params.reviewId}`, 404)
    );
  }
  console.log(req.user.id);
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `You do not have permission to update this review.`,
        400
      )
    );
  }

  review = await db.Review.findByIdAndUpdate(review.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: review
  });
});

//@desc Delete a Review
//@route DELETE /api/v1/reviews/:reviewId
//@access Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await db.Review.findById(req.params.reviewId);

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${req.params.reviewId}`, 404)
    );
  }

  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `You do not have permission to remove this review.`,
        400
      )
    );
  }

  review.remove();

  res.status(200).json({
    success: true,
    data: {},
    message: `Review: ${review.title} has been delete`
  });
});
