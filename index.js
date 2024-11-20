import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

const app = express(); // Initialize the Express app

app.use(express.json());
app.use(cors()); // Enable CORS for all routes
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MONGODB_URI is not defined in the environment variables.");
  process.exit(1); // Exit if MongoDB URI is not provided
}

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });


// Movie schema
const movieSchema = new mongoose.Schema({
  movie: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: false }, // Optional field for image URL
});

const Movie = mongoose.model("Movie", movieSchema);


// Movie routes
app.post("/api/movies", async (req, res) => {
  const newMovie = new Movie({
    movie: req.body.movie,
    description: req.body.description,
    image: req.body.image, // Optional image field
  });

  try {
    const savedMovie = await newMovie.save();
    res.status(200).json(savedMovie);
  } catch (error) {
    res.status(400).json({ message: "Error creating new movie", error });
  }
});

app.get("/api/movies", async (req, res) => {
   try {
    const limit = Number(req.query.limit);
    const movies = limit ? await Movie.find().limit(limit) : await Movie.find();
    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
 

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
