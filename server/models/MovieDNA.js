import mongoose from "mongoose";

const dnaEntrySchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
      },

      score: {
        type: Number,
        default: 0,
      },
    },
    {
      _id: false,
    }
  );

const movieDNASchema =
  new mongoose.Schema(
    {
      userId: {
        type: String,
        required: true,
        unique: true,
        index: true,
      },

      genres: {
        type: [dnaEntrySchema],
        default: [],
      },

      moods: {
        type: [dnaEntrySchema],
        default: [],
      },

      languages: {
        type: [dnaEntrySchema],
        default: [],
      },

      totalMovieViews: {
        type: Number,
        default: 0,
      },

      totalFavorites: {
        type: Number,
        default: 0,
      },

      totalBookings: {
        type: Number,
        default: 0,
      },

      totalAIRequests: {
        type: Number,
        default: 0,
      },

      averageRuntime: {
        type: Number,
        default: 0,
      },

      averageRating: {
        type: Number,
        default: 0,
      },

      personality: {
        type: String,
        default: "Explorer",
      },

      personalityDescription: {
        type: String,
        default:
          "You are discovering your movie taste.",
      },
    },
    {
      timestamps: true,
    }
  );

const MovieDNA =
  mongoose.models.MovieDNA ||
  mongoose.model(
    "MovieDNA",
    movieDNASchema
  );

export default MovieDNA;