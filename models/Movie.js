const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  genre: [{
    type: String,
    required: true
  }],
  releaseDate: {
    type: Date,
    required: true
  },
  posterUrl: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  showtimes: [{
    theaterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theater',
      required: true
    },
    time: {
      type: Date,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    availableSeats: {
      type: Number,
      required: true
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Movie', movieSchema); 