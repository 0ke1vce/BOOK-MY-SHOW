const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Data file paths
const dataPath = path.join(__dirname, 'data');
const moviesPath = path.join(dataPath, 'movies.json');
const theatersPath = path.join(dataPath, 'theaters.json');
const usersPath = path.join(dataPath, 'users.json');

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

// Routes
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

app.post('/api/bookings', async (req, res) => {
  const { movieId, theaterId, showtime, seats, totalAmount } = req.body;
  // In a real application, you would save the booking to a bookings.json file
  res.status(201).json({
    message: 'Booking successful',
    booking: {
      id: Date.now().toString(),
      movieId,
      theaterId,
      showtime,
      seats,
      totalAmount
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 