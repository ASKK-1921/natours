const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  // const value = err.errmsg.match(/(["'])(\\?.)*?\1/);
  // console.log(value);
  const key = Object.keys(err.keyValue).join('');
  const message = `The key ${key} has a duplicate value of ${err.keyValue[key]}`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTErrorDB = () =>
  new AppError('Invalid token, please log in again', 401);

const handleJWRExpiredErrorDB = () => new AppError('Token expired', 401);

const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  // RENDERED WEBSITE
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong.',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      // Operational, trusted error - send message to client
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // Programming or other unknown error - don't send message to client
    // 1) Log error to console
    console.log('ERROR 💩', err);
    // 2) Send generic error
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong.',
    });
  }
  // RENDERED WEBSITE
  if (err.isOperational) {
    // Operational, trusted error - send message to client
    return res.status(err.statusCode).render('error', {
      title: 'Somethings went wrong.',
      msg: err.message,
    });
  }
  // Programming or other unknown error - don't send message to client
  // 1) Log error to console
  console.log('ERROR 💩', err);
  // 2) Send generic error
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong.',
    msg: 'Please try again later',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTErrorDB();
    if (err.name === 'TokenExpiredError') error = handleJWRExpiredErrorDB();
    sendErrorProd(error, req, res);
  }
};
