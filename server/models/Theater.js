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
    },
    seats: [{
      row: {
        type: Number,
        required: true
      },
      column: {
        type: Number,
        required: true
      },
      status: {
        type: String,
        enum: ['available', 'booked', 'reserved'],
        default: 'available'
      },
      bookedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
      },
      bookingTime: {
        type: Date,
        default: null
      }
    }]
  }],
  amenities: [{
    type: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Theater', theaterSchema); 