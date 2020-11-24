const Review = require('../models/reviewModel');
//const APIFeatures = require('../utils/apiFeatures');
const factory = require('./handlerFactory');

// Get all reviews
exports.getAllReviews = factory.getAll(Review);

// Get single review
exports.getReview = factory.getOne(Review);

exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tourRef) req.body.tourRef = req.params.tourId;
  if (!req.body.userRef) req.body.userRef = req.user.id;

  next();
};

// Create a new review with POST
exports.createReview = factory.createOne(Review);

exports.updateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);
