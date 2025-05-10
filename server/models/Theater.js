const mongoose = require('mongoose');

const theaterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    }
  },
  screens: [{
    screenNumber: {
      type: Number,
      required: true
    },
    totalSeats: {
      type: Number,
      required: true
    }
  }],
  amenities: [{
    type: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Theater', theaterSchema); 