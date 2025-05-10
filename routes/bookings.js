const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Create new booking
router.post('/', auth, async (req, res) => {
  try {
    const {
      movieId,
      theaterId,
      showtime,
      seats,
      totalAmount,
    } = req.body;

    // Check if seats are available
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const showtimeData = movie.showtimes.find(
      st => st.theaterId.toString() === theaterId && new Date(st.time).getTime() === new Date(showtime).getTime()
    );

    if (!showtimeData) {
      return res.status(400).json({ message: 'Showtime not found' });
    }

    if (showtimeData.availableSeats < seats.length) {
      return res.status(400).json({ message: 'Not enough seats available' });
    }

    // Create booking
    const booking = new Booking({
      userId: req.userId,
      movieId,
      theaterId,
      showtime,
      seats,
      totalAmount,
    });

    // Update available seats
    showtimeData.availableSeats -= seats.length;
    await movie.save();
    await booking.save();

    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's bookings
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.userId })
      .populate('movieId')
      .populate('theaterId')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get booking by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('movieId')
      .populate('theaterId');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if booking belongs to user
    if (booking.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel booking
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if booking belongs to user
    if (booking.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if booking can be cancelled (e.g., not too close to showtime)
    const showtime = new Date(booking.showtime);
    const now = new Date();
    const hoursUntilShowtime = (showtime - now) / (1000 * 60 * 60);

    if (hoursUntilShowtime < 2) {
      return res.status(400).json({ message: 'Cannot cancel booking less than 2 hours before showtime' });
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();

    // Update available seats
    const movie = await Movie.findById(booking.movieId);
    const showtimeData = movie.showtimes.find(
      st => st.theaterId.toString() === booking.theaterId.toString() && 
      new Date(st.time).getTime() === new Date(booking.showtime).getTime()
    );

    if (showtimeData) {
      showtimeData.availableSeats += booking.seats.length;
      await movie.save();
    }

    res.json(booking);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 