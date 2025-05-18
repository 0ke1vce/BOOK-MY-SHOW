const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Data file paths
const dataPath = path.join(__dirname, 'data');
const moviesPath = path.join(dataPath, 'movies.json');
const theatersPath = path.join(dataPath, 'theaters.json');
const usersPath = path.join(dataPath, 'users.json');
const bookingsPath = path.join(dataPath, 'bookings.json');

// Helper function to read JSON files
const readJsonFile = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return null;
  }
};

// Helper function to write JSON files
const writeJsonFile = async (filePath, data) => {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing to ${filePath}:`, error);
    return false;
  }
};

// Movies routes
app.get('/api/movies', async (req, res) => {
  const data = await readJsonFile(moviesPath);
  res.json(data.movies);
});

app.get('/api/movies/:id', async (req, res) => {
  const data = await readJsonFile(moviesPath);
  const movie = data.movies.find(m => m.id === req.params.id);
  if (movie) {
    res.json(movie);
  } else {
    res.status(404).json({ message: 'Movie not found' });
  }
});

// Theaters routes
app.get('/api/theaters', async (req, res) => {
  const data = await readJsonFile(theatersPath);
  res.json(data.theaters);
});

app.get('/api/theaters/:id', async (req, res) => {
  const data = await readJsonFile(theatersPath);
  const theater = data.theaters.find(t => t.id === req.params.id);
  if (theater) {
    res.json(theater);
  } else {
    res.status(404).json({ message: 'Theater not found' });
  }
});

// User authentication routes
app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;
  const data = await readJsonFile(usersPath);
  const user = data.users.find(u => u.email === email && u.password === password);
  
  if (user) {
    res.json({
      id: user.id,
      name: user.name,
      email: user.email
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.post('/api/users/register', async (req, res) => {
  const { name, email, password } = req.body;
  const data = await readJsonFile(usersPath);
  
  if (data.users.some(u => u.email === email)) {
    return res.status(400).json({ message: 'Email already exists' });
  }

  const newUser = {
    id: (data.users.length + 1).toString(),
    name,
    email,
    password
  };

  data.users.push(newUser);
  await writeJsonFile(usersPath, data);

  res.status(201).json({
    id: newUser.id,
    name: newUser.name,
    email: newUser.email
  });
});

// GET user profile
app.get('/api/users/profile', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ message: 'Missing userId' });
  }
  const usersData = await readJsonFile(usersPath);
  const user = usersData.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json({ id: user.id, name: user.name, email: user.email });
});

// Booking routes

// GET booked seats for a show
app.get('/api/bookings', async (req, res) => {
  const { movieId, theaterId, showtime } = req.query;
  const data = await readJsonFile(bookingsPath);
  const bookings = data.bookings.filter(
    b => b.movieId === movieId && b.theaterId === theaterId && b.showtime === showtime && b.status === 'confirmed'
  );
  // Flatten all booked seats
  const bookedSeats = bookings.flatMap(b => b.seats);
  res.json({ bookedSeats });
});

// POST create a booking
app.post('/api/bookings', async (req, res) => {
  const { userId, movieId, theaterId, showtime, seats } = req.body;
  const data = await readJsonFile(bookingsPath);
  const newBooking = {
    bookingId: Date.now().toString(),
    userId,
    movieId,
    theaterId,
    showtime,
    seats,
    status: 'confirmed'
  };
  data.bookings.push(newBooking);
  await writeJsonFile(bookingsPath, data);
  res.status(201).json({ booking: newBooking });
});

// DELETE cancel a booking
app.delete('/api/bookings/:bookingId', async (req, res) => {
  const { bookingId } = req.params;
  const data = await readJsonFile(bookingsPath);
  const booking = data.bookings.find(b => b.bookingId === bookingId);
  if (booking) {
    booking.status = 'cancelled';
    await writeJsonFile(bookingsPath, data);
    res.json({ message: 'Booking cancelled' });
  } else {
    res.status(404).json({ message: 'Booking not found' });
  }
});

// GET bookings for a user
app.get('/api/bookings/user', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ message: 'Missing userId' });
  }
  const bookingsData = await readJsonFile(bookingsPath);
  const moviesData = await readJsonFile(moviesPath);
  const theatersData = await readJsonFile(theatersPath);
  const userBookings = bookingsData.bookings.filter(b => b.userId === userId);
  // Enrich with movie and theater info
  const enriched = userBookings.map(b => ({
    ...b,
    movie: moviesData.movies.find(m => m.id === b.movieId) || {},
    theaterName: (theatersData.theaters.find(t => t.id === b.theaterId) || {}).name || '',
  }));
  res.json(enriched);
});

// PUT cancel a booking (JSON version)
app.put('/api/bookings/:bookingId/cancel', async (req, res) => {
  const { bookingId } = req.params;
  const data = await readJsonFile(bookingsPath);
  const booking = data.bookings.find(b => b.bookingId === bookingId);
  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }
  // Check if booking can be cancelled (not too close to showtime)
  const showtime = new Date(booking.showtime);
  const now = new Date();
  const hoursUntilShowtime = (showtime - now) / (1000 * 60 * 60);
  if (hoursUntilShowtime < 2) {
    return res.status(400).json({ message: 'Cannot cancel booking less than 2 hours before showtime' });
  }
  booking.status = 'cancelled';
  await writeJsonFile(bookingsPath, data);
  res.json({ message: 'Booking cancelled successfully', booking });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 