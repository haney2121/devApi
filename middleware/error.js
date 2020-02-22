const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  //mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found`;
    error = new ErrorResponse(message, 404);
  }

  //mongoose duplicate key
  if (err.code === 11000) {
    let updatedError = err.errmsg.split(': "');
    let rebuild = updatedError[1].split('"')[0];

    const message = `A record already exist with the value of ${rebuild}`;
    error = new ErrorResponse(message, 400);
  }

  //mongoose validation error
  if (err.name === 'ValidationError') {
    error = new ErrorResponse(message, 400);
  }

  res
    .status(error.statusCode || 500)
    .json({ success: false, error: error.message || 'Server Error' });
};

module.exports = errorHandler;
