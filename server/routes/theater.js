const express = require('express');
const router = express.Router();
const Theater = require('../models/Theater');
const auth = require('../middleware/auth');

// Get seats for a specific screen
router.get('/:theaterId/screens/:screenNumber/seats', async (req, res) => {
  try {
    const theater = await Theater.findById(req.params.theaterId);
    if (!theater) {
      return res.status(404).json({ message: 'Theater not found' });
    }

    const screen = theater.screens.find(s => s.screenNumber === parseInt(req.params.screenNumber));
    if (!screen) {
      return res.status(404).json({ message: 'Screen not found' });
    }

    res.json(screen.seats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Book seats
router.post('/:theaterId/screens/:screenNumber/book', auth, async (req, res) => {
  try {
    const { seats, userId } = req.body;
    const theater = await Theater.findById(req.params.theaterId);
    
    if (!theater) {
      return res.status(404).json({ message: 'Theater not found' });
    }

    const screen = theater.screens.find(s => s.screenNumber === parseInt(req.params.screenNumber));
    if (!screen) {
      return res.status(404).json({ message: 'Screen not found' });
    }

    // Check if seats are available
    for (const seat of seats) {
      const existingSeat = screen.seats.find(
        s => s.row === seat.row && s.column === seat.column
      );
      
      if (existingSeat && existingSeat.status === 'booked') {
        return res.status(400).json({ message: 'One or more seats are already booked' });
      }
    }

    // Book the seats
    for (const seat of seats) {
      const existingSeat = screen.seats.find(
        s => s.row === seat.row && s.column === seat.column
      );

      if (existingSeat) {
        existingSeat.status = 'booked';
        existingSeat.bookedBy = userId;
        existingSeat.bookingTime = new Date();
      } else {
        screen.seats.push({
          row: seat.row,
          column: seat.column,
          status: 'booked',
          bookedBy: userId,
          bookingTime: new Date()
        });
      }
    }

    await theater.save();
    res.json({ success: true, message: 'Seats booked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel booking
router.post('/:theaterId/screens/:screenNumber/cancel', auth, async (req, res) => {
  try {
    const { seatId, userId } = req.body;
    const theater = await Theater.findById(req.params.theaterId);
    
    if (!theater) {
      return res.status(404).json({ message: 'Theater not found' });
    }

    const screen = theater.screens.find(s => s.screenNumber === parseInt(req.params.screenNumber));
    if (!screen) {
      return res.status(404).json({ message: 'Screen not found' });
    }

    const seat = screen.seats.id(seatId);
    if (!seat) {
      return res.status(404).json({ message: 'Seat not found' });
    }

    if (seat.bookedBy.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    seat.status = 'available';
    seat.bookedBy = null;
    seat.bookingTime = null;

    await theater.save();
    res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 