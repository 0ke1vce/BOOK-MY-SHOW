const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');

// Get all movies
router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find().sort({ releaseDate: -1 });
    res.json(movies);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get movie by ID
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.json(movie);
  } catch (error) {
    console.error('Error fetching movie:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new movie (admin only)
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      duration,
      language,
      genre,
      releaseDate,
      posterUrl,
      rating,
      showtimes,
    } = req.body;

    const movie = new Movie({
      title,
      description,
      duration,
      language,
      genre,
      releaseDate,
      posterUrl,
      rating,
      showtimes,
    });

    await movie.save();
    res.status(201).json(movie);
  } catch (error) {
    console.error('Error creating movie:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update movie (admin only)
router.put('/:id', async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.json(movie);
  } catch (error) {
    console.error('Error updating movie:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete movie (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    console.error('Error deleting movie:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add showtime to movie (admin only)
router.post('/:id/showtimes', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    movie.showtimes.push(req.body);
    await movie.save();
    res.json(movie);
  } catch (error) {
    console.error('Error adding showtime:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 