const mongoose = require('mongoose');
const Tour = require('./tourmodel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A review must be provided'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'A rating must be provided'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tourRef: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must be connected to a tour'],
    },
    userRef: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must be connected to a user'],
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

reviewSchema.index({ tourRef: 1, userRef: 1 }, { unique: true });

// Query Middleware
reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tourRef',
  //   select: 'name',
  // }).populate({
  //   path: 'userRef',
  //   select: 'name photo',
  // });

  this.populate({
    path: 'userRef',
    select: 'name photo',
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tourRef: tourId },
    },
    {
      $group: {
        _id: '$tourRef',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }

  // console.log(stats);
};

reviewSchema.post('save', function () {
  // this keyword points to current review
  this.constructor.calcAverageRatings(this.tourRef);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  // console.log(this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne(); does NOT work here, query has already executed
  await this.r.constructor.calcAverageRatings(this.r.tourRef);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
