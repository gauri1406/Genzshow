const GENRE_NAMES = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

const MOOD_KEYWORDS = {
  funny: [
    "funny",
    "comedy",
    "hilarious",
    "laugh",
    "laughing",
    "fun",
  ],

  scary: [
    "scary",
    "horror",
    "terrifying",
    "haunted",
    "ghost",
    "fear",
  ],

  romantic: [
    "romantic",
    "romance",
    "love",
    "date",
    "couple",
  ],

  action: [
    "action",
    "fight",
    "fighting",
    "hero",
    "superhero",
  ],

  emotional: [
    "emotional",
    "sad",
    "cry",
    "heartbreaking",
    "deep",
    "touching",
  ],

  mindBending: [
    "mind bending",
    "mind-bending",
    "twist",
    "psychological",
    "complex",
    "confusing",
  ],

  relaxing: [
    "relaxing",
    "calm",
    "peaceful",
    "chill",
    "comfort",
    "feel good",
  ],

  adventurous: [
    "adventure",
    "adventurous",
    "explore",
    "exploration",
    "journey",
  ],
};

const LANGUAGE_KEYWORDS = {
  Hindi: [
    "hindi",
    "bollywood",
  ],

  English: [
    "english",
    "hollywood",
  ],

  Tamil: [
    "tamil",
  ],

  Telugu: [
    "telugu",
  ],

  Malayalam: [
    "malayalam",
  ],

  Kannada: [
    "kannada",
  ],

  Korean: [
    "korean",
    "k-drama",
    "kdrama",
  ],
};

const GENRE_KEYWORDS = {
  Action: [
    "action",
    "fight",
    "fighting",
    "superhero",
  ],

  Adventure: [
    "adventure",
    "adventurous",
    "journey",
    "explore",
  ],

  Animation: [
    "animation",
    "animated",
    "cartoon",
  ],

  Comedy: [
    "comedy",
    "funny",
    "hilarious",
    "fun",
  ],

  Crime: [
    "crime",
    "criminal",
    "gangster",
    "mafia",
  ],

  Documentary: [
    "documentary",
    "real life",
    "non fiction",
  ],

  Drama: [
    "drama",
    "dramatic",
    "emotional",
  ],

  Family: [
    "family",
    "kids",
    "children",
  ],

  Fantasy: [
    "fantasy",
    "magic",
    "magical",
    "fairy",
  ],

  Horror: [
    "horror",
    "scary",
    "ghost",
    "haunted",
    "terrifying",
  ],

  Music: [
    "music",
    "musical",
    "concert",
  ],

  Mystery: [
    "mystery",
    "detective",
    "investigation",
    "mysterious",
  ],

  Romance: [
    "romance",
    "romantic",
    "love",
    "date",
    "couple",
  ],

  "Sci-Fi": [
    "sci-fi",
    "scifi",
    "science fiction",
    "space",
    "future",
    "robot",
    "ai",
  ],

  Thriller: [
    "thriller",
    "suspense",
    "suspenseful",
    "psychological",
    "twist",
  ],

  War: [
    "war",
    "soldier",
    "military",
    "battle",
  ],

  Western: [
    "western",
    "cowboy",
  ],
};

const findKeywordMatches = (
  text,
  dictionary
) => {
  const lowerText =
    String(text || "").toLowerCase();

  const matches = [];

  Object.entries(dictionary).forEach(
    ([name, keywords]) => {
      const found = keywords.some(
        (keyword) =>
          lowerText.includes(
            keyword.toLowerCase()
          )
      );

      if (found) {
        matches.push(name);
      }
    }
  );

  return matches;
};

const getMovieGenres = (movie) => {
  if (!movie) {
    return [];
  }

  if (Array.isArray(movie?.genres)) {
    return movie.genres
      .map((genre) => {
        if (
          typeof genre === "object"
        ) {
          return (
            genre?.name || ""
          );
        }

        const genreId =
          Number(genre);

        return (
          GENRE_NAMES[genreId] ||
          String(genre)
        );
      })
      .filter(Boolean);
  }

  if (
    Array.isArray(
      movie?.genre_ids
    )
  ) {
    return movie.genre_ids
      .map(
        (genreId) =>
          GENRE_NAMES[
            Number(genreId)
          ] ||
          String(genreId)
      )
      .filter(Boolean);
  }

  return [];
};

const getAIProfileFromPrompt = (
  prompt
) => {
  const text =
    String(prompt || "").trim();

  if (!text) {
    return {
      genres: [],
      moods: [],
      languages: [],
    };
  }

  return {
    genres:
      findKeywordMatches(
        text,
        GENRE_KEYWORDS
      ),

    moods:
      findKeywordMatches(
        text,
        MOOD_KEYWORDS
      ),

    languages:
      findKeywordMatches(
        text,
        LANGUAGE_KEYWORDS
      ),
  };
};

const trackMovieDNA = async ({
  axios,
  movie,
  action = "view",
}) => {
  try {
    if (!axios || !movie) {
      return;
    }

    const genres =
      getMovieGenres(movie);

    const isView =
      action === "view";

    const isFavorite =
      action === "favorite";

    const isBooking =
      action === "booking";

    const isAIRequest =
      action === "ai";

    const runtime =
      Number(movie?.runtime) || 0;

    const rating =
      Number(
        movie?.vote_average
      ) || 0;

    await axios.post(
      "/api/movie-dna/update",
      {
        genres,

        movieView: isView,

        favorite: isFavorite,

        booking: isBooking,

        aiRequest: isAIRequest,

        runtime:
          isView
            ? runtime
            : 0,

        rating:
          isView
            ? rating
            : 0,
      }
    );
  } catch (error) {
    console.error(
      "MOVIE DNA TRACKING ERROR:",
      error
    );
  }
};

const trackAIRequestDNA =
  async ({
    axios,
    prompt,
  }) => {
    try {
      if (!axios || !prompt) {
        return;
      }

      const profile =
        getAIProfileFromPrompt(
          prompt
        );

      await axios.post(
        "/api/movie-dna/update",
        {
          genres:
            profile.genres,

          moods:
            profile.moods,

          languages:
            profile.languages,

          movieView: false,

          favorite: false,

          booking: false,

          aiRequest: true,

          runtime: 0,

          rating: 0,
        }
      );
    } catch (error) {
      console.error(
        "AI DNA TRACKING ERROR:",
        error
      );
    }
  };

export {
  trackMovieDNA,
  trackAIRequestDNA,
  getMovieGenres,
  getAIProfileFromPrompt,
};

export default trackMovieDNA;