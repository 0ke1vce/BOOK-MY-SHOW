const mongoose = require('mongoose');
const Movie = require('./models/Movie');
const Theater = require('./models/Theater');
const User = require('./models/User');
require('dotenv').config();

const sampleMovies = [
  {
    title: "The Dark Knight",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    duration: 152,
    language: "English",
    genre: ["Action", "Crime", "Drama"],
    rating: 9.0,
    releaseDate: new Date("2024-03-15"),
    posterUrl: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg"
  },
  {
    title: "Inception",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    duration: 148,
    language: "English",
    genre: ["Action", "Adventure", "Sci-Fi"],
    rating: 8.8,
    releaseDate: new Date("2024-03-20"),
    posterUrl: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg"
  },
  {
    title: "RRR",
    description: "A fictitious story about two legendary revolutionaries and their journey away from home before they started fighting for their country in the 1920s.",
    duration: 187,
    language: "Hindi",
    genre: ["Action", "Drama"],
    rating: 8.5,
    releaseDate: new Date("2024-03-18"),
    posterUrl: "https://m.media-amazon.com/images/M/MV5BODUwNDNjYzctODUxNy00ZTA2LWIyYTEtMDc5Y2E5ZjBmNTMzXkEyXkFqcGdeQXVyODE5NzE3OTE@._V1_.jpg"
  }
];

const sampleTheaters = [
  {
    name: "PVR Cinemas",
    location: {
      address: "123 Main Street",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400001"
    },
    screens: [
      { screenNumber: 1, totalSeats: 200 },
      { screenNumber: 2, totalSeats: 150 },
      { screenNumber: 3, totalSeats: 100 }
    ],
    amenities: ["3D", "Dolby Atmos", "Food Court", "Parking"]
  },
  {
    name: "INOX Megaplex",
    location: {
      address: "456 Park Avenue",
      city: "Delhi",
      state: "Delhi",
      zipCode: "110001"
    },
    screens: [
      { screenNumber: 1, totalSeats: 250 },
      { screenNumber: 2, totalSeats: 200 }
    ],
    amenities: ["4DX", "IMAX", "Restaurant", "Valet Parking"]
  },
  {
    name: "Cinepolis",
    location: {
      address: "789 Beach Road",
      city: "Chennai",
      state: "Tamil Nadu",
      zipCode: "600001"
    },
    screens: [
      { screenNumber: 1, totalSeats: 180 },
      { screenNumber: 2, totalSeats: 160 },
      { screenNumber: 3, totalSeats: 140 }
    ],
    amenities: ["3D", "Premium Lounger", "Cafe", "Parking"]
  }
];

const sampleUsers = [
  {
    name: "John Doe",
    email: "john@example.com",
    password: "password123"
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    password: "password123"
  }
];

const generateShowtimes = (movieId, theaterId) => {
  const showtimes = [];
  const today = new Date();
  
  // Generate showtimes for next 7 days
  for (let day = 0; day < 7; day++) {
    const date = new Date(today);
    date.setDate(today.getDate() + day);
    
    // Generate 4 showtimes per day
    for (let time = 10; time <= 22; time += 4) {
      const showtime = new Date(date);
      showtime.setHours(time, 0, 0, 0);
      
      showtimes.push({
        movieId,
        theaterId,
        time: showtime,
        price: Math.floor(Math.random() * 10) + 10, // Random price between 10 and 20
        availableSeats: Math.floor(Math.random() * 50) + 50 // Random available seats between 50 and 100
      });
    }
  }
  
  return showtimes;
};

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Movie.deleteMany({});
    await Theater.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Insert movies
    const movies = await Movie.insertMany(sampleMovies);
    console.log('Inserted movies');

    // Insert theaters
    const theaters = await Theater.insertMany(sampleTheaters);
    console.log('Inserted theaters');

    // Insert users
    const users = await User.insertMany(sampleUsers);
    console.log('Inserted users');

    // Add showtimes to movies
    for (const movie of movies) {
      for (const theater of theaters) {
        const showtimes = generateShowtimes(movie._id, theater._id);
        movie.showtimes.push(...showtimes);
      }
      await movie.save();
    }
    console.log('Added showtimes to movies');

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase(); 