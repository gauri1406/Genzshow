import MovieDNA from "../models/MovieDNA.js";

const PERSONALITY_DATA = {
  Action: {
    name: "The Adrenaline Seeker",
    description:
      "You love high-energy movies, intense moments and characters who keep things moving.",
  },

  Thriller: {
    name: "The Mystery Hunter",
    description:
      "You enjoy suspense, tension, unpredictable stories and movies that keep you guessing.",
  },

  "Sci-Fi": {
    name: "The Future Explorer",
    description:
      "You are drawn to futuristic worlds, technology, science and big ideas.",
  },

  Comedy: {
    name: "The Fun Seeker",
    description:
      "You like movies that keep the mood light, entertaining and fun.",
  },

  Horror: {
    name: "The Fear Chaser",
    description:
      "You enjoy suspense, scares, dark stories and movies that keep your heart racing.",
  },

  Romance: {
    name: "The Heart Hunter",
    description:
      "You enjoy emotional connections, relationships and memorable romantic stories.",
  },

  Drama: {
    name: "The Story Seeker",
    description:
      "You appreciate emotional storytelling, strong characters and meaningful stories.",
  },

  Adventure: {
    name: "The Explorer",
    description:
      "You enjoy journeys, discoveries, exciting worlds and stories filled with adventure.",
  },

  Fantasy: {
    name: "The Dreamer",
    description:
      "You enjoy imaginative worlds, magic, mythology and stories beyond ordinary reality.",
  },

  Mystery: {
    name: "The Detective",
    description:
      "You enjoy solving puzzles, uncovering secrets and figuring out what happens next.",
  },

  Family: {
    name: "The Feel-Good Viewer",
    description:
      "You enjoy entertaining stories that can be shared with people you care about.",
  },

  Animation: {
    name: "The Imagination Explorer",
    description:
      "You appreciate creative worlds, animation and stories that push imagination.",
  },

  Crime: {
    name: "The Crime Observer",
    description:
      "You enjoy stories involving criminals, investigations, power and complex characters.",
  },

  Fantasy: {
    name: "The Dreamer",
    description:
      "You enjoy imaginative worlds and stories beyond ordinary reality.",
  },

  Music: {
    name: "The Rhythm Seeker",
    description:
      "You enjoy movies where music, performances and emotion play a major role.",
  },
};

const normalizeEntries = (
  entries = []
) => {
  return [...entries]
    .sort(
      (a, b) =>
        Number(b?.score || 0) -
        Number(a?.score || 0)
    );
};

const addScore = (
  entries,
  name,
  amount
) => {
  if (!name) {
    return;
  }

  const cleanName =
    String(name).trim();

  if (!cleanName) {
    return;
  }

  const existing =
    entries.find(
      (item) =>
        String(
          item?.name
        ).toLowerCase() ===
        cleanName.toLowerCase()
    );

  if (existing) {
    existing.score =
      Number(
        existing.score || 0
      ) + amount;
  } else {
    entries.push({
      name: cleanName,
      score: amount,
    });
  }
};

const calculatePersonality = (
  genres
) => {
  const sortedGenres =
    normalizeEntries(
      genres
    );

  const topGenre =
    sortedGenres?.[0]
      ?.name;

  if (!topGenre) {
    return {
      personality: "Explorer",

      personalityDescription:
        "You are discovering your movie taste. Keep exploring movies and GenZ AI will learn what you love.",
    };
  }

  const personality =
    PERSONALITY_DATA[
      topGenre
    ];

  if (personality) {
    return {
      personality:
        personality.name,

      personalityDescription:
        personality.description,
    };
  }

  return {
    personality: `The ${topGenre} Explorer`,

    personalityDescription:
      `You currently seem to enjoy ${topGenre} movies more than other genres.`,
  };
};

const createOrGetDNA = async (
  userId
) => {
  let dna =
    await MovieDNA.findOne({
      userId,
    });

  if (!dna) {
    dna =
      await MovieDNA.create({
        userId,

        genres: [],

        moods: [],

        languages: [],

        totalMovieViews: 0,

        totalFavorites: 0,

        totalBookings: 0,

        totalAIRequests: 0,

        averageRuntime: 0,

        averageRating: 0,

        personality:
          "Explorer",

        personalityDescription:
          "You are discovering your movie taste.",
      });
  }

  return dna;
};

export const getMovieDNA =
  async (req, res) => {
    try {
      const userId =
        req.auth?.userId;

      if (!userId) {
        return res
          .status(401)
          .json({
            success: false,
            message:
              "Please login to view your Movie DNA.",
          });
      }

      const dna =
        await createOrGetDNA(
          userId
        );

      const personality =
        calculatePersonality(
          dna.genres
        );

      dna.personality =
        personality.personality;

      dna.personalityDescription =
        personality.personalityDescription;

      dna.genres =
        normalizeEntries(
          dna.genres
        );

      dna.moods =
        normalizeEntries(
          dna.moods
        );

      dna.languages =
        normalizeEntries(
          dna.languages
        );

      await dna.save();

      return res.json({
        success: true,
        dna,
      });
    } catch (error) {
      console.error(
        "GET MOVIE DNA ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to load Movie DNA.",
        });
    }
  };

export const updateMovieDNA =
  async (req, res) => {
    try {
      const userId =
        req.auth?.userId;

      if (!userId) {
        return res
          .status(401)
          .json({
            success: false,
            message:
              "Please login to update Movie DNA.",
          });
      }

      const {
        genres = [],
        moods = [],
        languages = [],

        movieView = false,
        favorite = false,
        booking = false,
        aiRequest = false,

        runtime = 0,
        rating = 0,
      } = req.body || {};

      const dna =
        await createOrGetDNA(
          userId
        );

      /*
       * ---------------------------------------------
       * GENRE LEARNING
       * ---------------------------------------------
       */

      if (
        Array.isArray(genres)
      ) {
        genres.forEach(
          (genre) => {
            addScore(
              dna.genres,
              genre,
              10
            );
          }
        );
      }

      /*
       * ---------------------------------------------
       * MOOD LEARNING
       * ---------------------------------------------
       */

      if (
        Array.isArray(moods)
      ) {
        moods.forEach(
          (mood) => {
            addScore(
              dna.moods,
              mood,
              5
            );
          }
        );
      }

      /*
       * ---------------------------------------------
       * LANGUAGE LEARNING
       * ---------------------------------------------
       */

      if (
        Array.isArray(languages)
      ) {
        languages.forEach(
          (language) => {
            addScore(
              dna.languages,
              language,
              5
            );
          }
        );
      }

      /*
       * ---------------------------------------------
       * MOVIE VIEW
       * ---------------------------------------------
       */

      if (movieView) {
        const previousViews =
          Number(
            dna.totalMovieViews
          ) || 0;

        const newViews =
          previousViews + 1;

        dna.totalMovieViews =
          newViews;

        const numericRuntime =
          Number(runtime) || 0;

        const numericRating =
          Number(rating) || 0;

        if (
          numericRuntime > 0
        ) {
          dna.averageRuntime =
            (
              (
                Number(
                  dna.averageRuntime
                ) *
                previousViews
              ) +
              numericRuntime
            ) /
            newViews;
        }

        if (
          numericRating > 0
        ) {
          dna.averageRating =
            (
              (
                Number(
                  dna.averageRating
                ) *
                previousViews
              ) +
              numericRating
            ) /
            newViews;
        }
      }

      /*
       * ---------------------------------------------
       * FAVORITE
       * ---------------------------------------------
       */

      if (favorite) {
        dna.totalFavorites =
          Number(
            dna.totalFavorites
          ) + 1;
      }

      /*
       * ---------------------------------------------
       * BOOKING
       * ---------------------------------------------
       */

      if (booking) {
        dna.totalBookings =
          Number(
            dna.totalBookings
          ) + 1;
      }

      /*
       * ---------------------------------------------
       * AI REQUEST
       * ---------------------------------------------
       */

      if (aiRequest) {
        dna.totalAIRequests =
          Number(
            dna.totalAIRequests
          ) + 1;
      }

      /*
       * ---------------------------------------------
       * PERSONALITY
       * ---------------------------------------------
       */

      const personality =
        calculatePersonality(
          dna.genres
        );

      dna.personality =
        personality.personality;

      dna.personalityDescription =
        personality.personalityDescription;

      dna.genres =
        normalizeEntries(
          dna.genres
        );

      dna.moods =
        normalizeEntries(
          dna.moods
        );

      dna.languages =
        normalizeEntries(
          dna.languages
        );

      await dna.save();

      return res.json({
        success: true,

        message:
          "Movie DNA updated successfully.",

        dna,
      });
    } catch (error) {
      console.error(
        "UPDATE MOVIE DNA ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to update Movie DNA.",
        });
    }
  };