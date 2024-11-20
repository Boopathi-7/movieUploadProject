// index.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Enable CORS for all routes

// MongoDB connection
const uri = process.env.MONGO_URI;

if (!uri) {
  console.error("MONGO_URI is not defined in .env file");
  process.exit(1);
}

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit the application if MongoDB connection fails
  });

// Movie schema
const movieSchema = new mongoose.Schema({
  movie: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: false }, // Optional field for image URL
});

const Movie = mongoose.model("Movie", movieSchema);

// Movie routes
// Create a new movie
app.post("/api/movies", async (req, res) => {
  const { movie, description, image } = req.body;

  try {
    const newMovie = new Movie({ movie, description, image });
    const savedMovie = await newMovie.save();
    res.status(201).json(savedMovie);
  } catch (error) {
    res.status(400).json({ message: "Error creating new movie", error });
  }
});

// Get all movies
app.get("/api/movies", async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 0; // Default to 0 (no limit)
    const movies = await Movie.find().limit(limit);
    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ message: "Error fetching movies", error });
  }
});

// Get a single movie by ID
app.get("/api/movies/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (movie) {
      res.status(200).json(movie);
    } else {
      res.status(404).json({ message: `Movie with ID ${req.params.id} not found` });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching movie", error });
  }
});

// Update a movie by ID
app.put("/api/movies/:id", async (req, res) => {
  try {
    const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (updatedMovie) {
      res.status(200).json(updatedMovie);
    } else {
      res.status(404).json({ message: `Movie with ID ${req.params.id} not found` });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating movie", error });
  }
});

// Delete a movie by ID
app.delete("/api/movies/:id", async (req, res) => {
  try {
    const deletedMovie = await Movie.findByIdAndDelete(req.params.id);

    if (deletedMovie) {
      res.status(200).json({ message: `Movie with ID ${req.params.id} deleted successfully` });
    } else {
      res.status(404).json({ message: `Movie with ID ${req.params.id} not found` });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting movie", error });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
