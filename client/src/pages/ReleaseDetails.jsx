
import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  Bookmark,
  CalendarDays,
  Check,
  Clock3,
  Heart,
  MapPin,
  Play,
  Star,
  Ticket,
  Users,
  X,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

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
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

const WATCHLIST_KEY = "genzshow_watchlist";

function getMovieImage(movie, imageBaseUrl, type = "poster") {
  if (!movie) return "";

  const value =
    type === "backdrop"
      ? movie.backdrop_path || movie.backdrop
      : movie.poster_path || movie.poster || movie.posterUrl;

  if (!value) return "";

  if (value.startsWith("http")) {
    return value;
  }

  return `${imageBaseUrl || "https://image.tmdb.org/t/p/w500"}${value}`;
}

function getGenres(movie) {
  if (!movie) return [];

  if (Array.isArray(movie.genres)) {
    return movie.genres
      .map((genre) => {
        if (typeof genre === "string") return genre;
        return genre?.name;
      })
      .filter(Boolean);
  }

  if (Array.isArray(movie.genre_ids)) {
    return movie.genre_ids
      .map((id) => GENRE_NAMES[id])
      .filter(Boolean);
  }

  return [];
}

function getMovieTitle(movie) {
  return (
    movie?.title ||
    movie?.name ||
    movie?.original_title ||
    movie?.original_name ||
    "Untitled Movie"
  );
}

function getReleaseDate(movie) {
  return (
    movie?.release_date ||
    movie?.first_air_date ||
    movie?.releaseDate ||
    ""
  );
}

function formatReleaseDate(date) {
  if (!date) return "Release date unavailable";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(date) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function formatDay(date) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toLocaleDateString("en-IN", {
    weekday: "short",
  });
}

function getYear(movie) {
  const date = getReleaseDate(movie);

  if (!date) return "";

  return String(date).slice(0, 4);
}

function getRating(movie) {
  const value =
    movie?.vote_average ??
    movie?.rating ??
    movie?.average_rating;

  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "N/A";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return value;
  }

  return number.toFixed(1);
}

function getRuntime(movie) {
  const runtime =
    movie?.runtime ||
    movie?.duration ||
    movie?.runtime_minutes;

  if (!runtime) {
    return "Runtime unavailable";
  }

  const minutes = Number(runtime);

  if (Number.isNaN(minutes)) {
    return String(runtime);
  }

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  if (hours === 0) {
    return `${remaining} min`;
  }

  if (remaining === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remaining}m`;
}

function getTrailerUrl(movie) {
  if (!movie) return "";

  if (movie.trailer_url) return movie.trailer_url;
  if (movie.trailerUrl) return movie.trailerUrl;
  if (movie.youtube_url) return movie.youtube_url;
  if (movie.youtubeUrl) return movie.youtubeUrl;

  if (movie.videos?.results?.length) {
    const trailer =
      movie.videos.results.find(
        (video) =>
          video.type === "Trailer" &&
          video.site === "YouTube"
      ) ||
      movie.videos.results.find(
        (video) =>
          video.site === "YouTube"
      );

    if (trailer?.key) {
      return `https://www.youtube.com/watch?v=${trailer.key}`;
    }
  }

  if (movie.trailer?.key) {
    return `https://www.youtube.com/watch?v=${movie.trailer.key}`;
  }

  return "";
}

function getYoutubeEmbedUrl(url) {
  if (!url) return "";

  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");

      if (id) {
        return `https://www.youtube.com/embed/${id}`;
      }
    }

    if (parsed.hostname.includes("youtube.com")) {
      const videoId = parsed.searchParams.get("v");

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }

      if (parsed.pathname.includes("/embed/")) {
        return url;
      }
    }
  } catch {
    return "";
  }

  return "";
}

function getShowId(show) {
  return (
    show?.id ||
    show?._id ||
    show?.showId ||
    show?.show_id ||
    `${show?.date || ""}-${show?.time || ""}`
  );
}

function getShowDate(show) {
  return (
    show?.date ||
    show?.showDate ||
    show?.show_date ||
    show?.startDate ||
    show?.start_date ||
    ""
  );
}

function getShowTime(show) {
  return (
    show?.time ||
    show?.showTime ||
    show?.show_time ||
    show?.startTime ||
    show?.start_time ||
    ""
  );
}

function getTheatreName(theatre) {
  return (
    theatre?.name ||
    theatre?.theatre_name ||
    theatre?.theatreName ||
    theatre?.cinema_name ||
    theatre?.cinemaName ||
    "Cinema"
  );
}

function getTheatreCity(theatre) {
  return (
    theatre?.city ||
    theatre?.location ||
    theatre?.area ||
    theatre?.address?.city ||
    ""
  );
}

function getTheatreAddress(theatre) {
  return (
    theatre?.address ||
    theatre?.full_address ||
    theatre?.addressLine ||
    ""
  );
}

function normalizeTheatres(data) {
  if (!data) return [];

  let source = [];

  if (Array.isArray(data)) {
    source = data;
  } else if (Array.isArray(data.theatres)) {
    source = data.theatres;
  } else if (Array.isArray(data.theatreShows)) {
    source = data.theatreShows;
  } else if (Array.isArray(data.shows)) {
    source = data.shows;
  } else if (Array.isArray(data.results)) {
    source = data.results;
  } else if (Array.isArray(data.data)) {
    source = data.data;
  }

  if (!source.length) {
    return [];
  }

  return source.map((item, index) => {
    const theatre =
      item?.theatre ||
      item?.cinema ||
      item?.theater ||
      item;

    let shows = [];

    if (Array.isArray(item?.shows)) {
      shows = item.shows;
    } else if (Array.isArray(item?.showtimes)) {
      shows = item.showtimes;
    } else if (Array.isArray(item?.times)) {
      shows = item.times.map((time) => ({
        time,
      }));
    } else if (
      item?.time ||
      item?.showTime ||
      item?.show_time
    ) {
      shows = [item];
    }

    return {
      ...theatre,
      id:
        theatre?.id ||
        theatre?._id ||
        theatre?.theatre_id ||
        `theatre-${index}`,
      shows,
    };
  });
}

function normalizeMovie(data) {
  if (!data) return null;

  if (data.movie) {
    return data.movie;
  }

  if (data.data?.movie) {
    return data.data.movie;
  }

  if (data.result?.movie) {
    return data.result.movie;
  }

  if (
    data.title ||
    data.name ||
    data.poster_path ||
    data.backdrop_path ||
    data.overview
  ) {
    return data;
  }

  if (data.data) {
    if (
      data.data.title ||
      data.data.name ||
      data.data.poster_path
    ) {
      return data.data;
    }
  }

  return null;
}

export default function ReleaseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    axios,
    image_base_url,
    favoriteMovies,
    fetchFavoriteMovies,
    isSignedIn,
  } = useAppContext();

  const [movie, setMovie] = useState(null);

  const [theatres, setTheatres] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showtimesLoading, setShowtimesLoading] =
    useState(true);

  const [error, setError] = useState("");
  const [showtimesError, setShowtimesError] =
    useState("");

  const [selectedDate, setSelectedDate] =
    useState("");

  const [isBookmarked, setIsBookmarked] =
    useState(false);

  const [isFavorite, setIsFavorite] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [trailerOpen, setTrailerOpen] =
    useState(false);

  const [trailerUrl, setTrailerUrl] =
    useState("");

  /*
   * ------------------------------------------------------
   * LOAD MOVIE DETAILS
   * ------------------------------------------------------
   *
   * Movie loading is completely independent from
   * theatre/showtime loading.
   *
   * This means:
   *
   * TMDB movie exists
   *       ↓
   * Movie details load
   *       ↓
   * No theatre/show?
   *       ↓
   * Still show the movie page
   *
   * ------------------------------------------------------
   */
  useEffect(() => {
    let mounted = true;

    async function loadMovie() {
      if (!id) {
        setError("Movie ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await axios.get(
          `/api/show/tmdb/${id}`
        );

        if (!mounted) return;

        const movieData = normalizeMovie(
          response?.data
        );

        if (movieData) {
          setMovie(movieData);
          setLoading(false);
          return;
        }

        /*
         * Fallback:
         * If /api/show/tmdb/:id doesn't return the
         * movie directly, try now-playing data.
         *
         * This does NOT make showtimes mandatory.
         */
        try {
          const fallbackResponse = await axios.get(
            "/api/show/now-playing"
          );

          if (!mounted) return;

          const movies =
            fallbackResponse?.data?.movies ||
            fallbackResponse?.data?.results ||
            [];

          const foundMovie = movies.find(
            (item) =>
              String(
                item?.id ||
                  item?.tmdb_id ||
                  item?.tmdbId
              ) === String(id)
          );

          if (foundMovie) {
            setMovie(foundMovie);
            setLoading(false);
            return;
          }
        } catch {
          // Fallback failure should not crash the page.
        }

        if (mounted) {
          setError("Movie not found.");
          setLoading(false);
        }
      } catch (err) {
        if (!mounted) return;

        /*
         * Even if the movie endpoint fails, try the
         * now-playing endpoint before giving up.
         */
        try {
          const fallbackResponse = await axios.get(
            "/api/show/now-playing"
          );

          if (!mounted) return;

          const movies =
            fallbackResponse?.data?.movies ||
            fallbackResponse?.data?.results ||
            [];

          const foundMovie = movies.find(
            (item) =>
              String(
                item?.id ||
                  item?.tmdb_id ||
                  item?.tmdbId
              ) === String(id)
          );

          if (foundMovie) {
            setMovie(foundMovie);
            setLoading(false);
            return;
          }
        } catch {
          // Ignore fallback error.
        }

        if (mounted) {
          setError(
            "Unable to load movie details right now."
          );
          setLoading(false);
        }
      }
    }

    loadMovie();

    return () => {
      mounted = false;
    };
  }, [id, axios]);

  /*
   * ------------------------------------------------------
   * LOAD THEATRES / SHOWTIMES
   * ------------------------------------------------------
   *
   * This request is OPTIONAL.
   *
   * If it fails:
   * - movie remains visible
   * - movie details remain visible
   * - no blank page
   * - no Movie Not Found error
   *
   * ------------------------------------------------------
   */
  useEffect(() => {
    let mounted = true;

    async function loadShowtimes() {
      if (!id) {
        setShowtimesLoading(false);
        return;
      }

      setShowtimesLoading(true);
      setShowtimesError("");

      try {
        const response = await axios.get(
          `/api/show/tmdb/${id}`
        );

        if (!mounted) return;

        const data = response?.data || {};

        const theatreData =
          data.theatreShows ||
          data.theatres ||
          data.shows ||
          data.data?.theatreShows ||
          data.data?.theatres ||
          data.data?.shows ||
          [];

        const normalized =
          normalizeTheatres(theatreData);

        setTheatres(normalized);

        if (normalized.length > 0) {
          const dates = [];

          normalized.forEach((theatre) => {
            (theatre.shows || []).forEach((show) => {
              const date = getShowDate(show);

              if (
                date &&
                !dates.includes(date)
              ) {
                dates.push(date);
              }
            });
          });

          dates.sort();

          if (dates.length > 0) {
            setSelectedDate((current) => {
              if (current && dates.includes(current)) {
                return current;
              }

              return dates[0];
            });
          }
        }
      } catch {
        if (!mounted) return;

        /*
         * Do NOT set main movie error here.
         */
        setTheatres([]);
        setShowtimesError(
          "Showtimes are not available yet."
        );
      } finally {
        if (mounted) {
          setShowtimesLoading(false);
        }
      }
    }

    loadShowtimes();

    return () => {
      mounted = false;
    };
  }, [id, axios]);

  /*
   * ------------------------------------------------------
   * WATCHLIST
   * ------------------------------------------------------
   */
  useEffect(() => {
    if (!id) return;

    try {
      const stored =
        localStorage.getItem(WATCHLIST_KEY);

      const watchlist = stored
        ? JSON.parse(stored)
        : [];

      const exists = watchlist.some(
        (item) =>
          String(
            item?.id || item?.tmdb_id
          ) === String(id)
      );

      setIsBookmarked(exists);
    } catch {
      setIsBookmarked(false);
    }
  }, [id]);

  /*
   * ------------------------------------------------------
   * FAVORITE
   * ------------------------------------------------------
   */
  useEffect(() => {
    if (!movie) return;

    const movieId = String(
      movie?.id ||
        movie?.tmdb_id ||
        movie?.tmdbId ||
        id
    );

    const exists = Array.isArray(favoriteMovies)
      ? favoriteMovies.some(
          (item) =>
            String(
              item?.id ||
                item?.tmdb_id ||
                item?.tmdbId
            ) === movieId
        )
      : false;

    setIsFavorite(exists);
  }, [movie, favoriteMovies, id]);

  /*
   * ------------------------------------------------------
   * MOVIE INFORMATION
   * ------------------------------------------------------
   */
  const genres = useMemo(() => {
    return getGenres(movie);
  }, [movie]);

  const posterUrl = useMemo(() => {
    return getMovieImage(
      movie,
      image_base_url,
      "poster"
    );
  }, [movie, image_base_url]);

  const backdropUrl = useMemo(() => {
    return getMovieImage(
      movie,
      image_base_url,
      "backdrop"
    );
  }, [movie, image_base_url]);

  const title = useMemo(() => {
    return getMovieTitle(movie);
  }, [movie]);

  const releaseDate = useMemo(() => {
    return getReleaseDate(movie);
  }, [movie]);

  const rating = useMemo(() => {
    return getRating(movie);
  }, [movie]);

  const runtime = useMemo(() => {
    return getRuntime(movie);
  }, [movie]);

  /*
   * ------------------------------------------------------
   * AVAILABLE SHOW DATES
   * ------------------------------------------------------
   */
  const availableDates = useMemo(() => {
    const dates = [];

    theatres.forEach((theatre) => {
      (theatre.shows || []).forEach((show) => {
        const date = getShowDate(show);

        if (
          date &&
          !dates.includes(date)
        ) {
          dates.push(date);
        }
      });
    });

    return dates.sort();
  }, [theatres]);

  /*
   * ------------------------------------------------------
   * FILTERED THEATRES
   * ------------------------------------------------------
   */
  const filteredTheatres = useMemo(() => {
    if (!selectedDate) {
      return theatres;
    }

    return theatres
      .map((theatre) => {
        const filteredShows =
          (theatre.shows || []).filter(
            (show) =>
              getShowDate(show) ===
              selectedDate
          );

        return {
          ...theatre,
          shows: filteredShows,
        };
      })
      .filter(
        (theatre) =>
          theatre.shows &&
          theatre.shows.length > 0
      );
  }, [theatres, selectedDate]);

  /*
   * ------------------------------------------------------
   * BOOKMARK
   * ------------------------------------------------------
   */
  const handleBookmark = () => {
    if (!movie || !id) return;

    try {
      const stored =
        localStorage.getItem(WATCHLIST_KEY);

      let watchlist = stored
        ? JSON.parse(stored)
        : [];

      if (!Array.isArray(watchlist)) {
        watchlist = [];
      }

      const movieId = String(
        movie?.id ||
          movie?.tmdb_id ||
          movie?.tmdbId ||
          id
      );

      const exists = watchlist.some(
        (item) =>
          String(
            item?.id ||
              item?.tmdb_id ||
              item?.tmdbId
          ) === movieId
      );

      if (exists) {
        watchlist = watchlist.filter(
          (item) =>
            String(
              item?.id ||
                item?.tmdb_id ||
                item?.tmdbId
            ) !== movieId
        );

        setIsBookmarked(false);
      } else {
        watchlist.push({
          ...movie,
          id: movie?.id || id,
          tmdb_id:
            movie?.tmdb_id ||
            movie?.tmdbId ||
            movie?.id ||
            id,
          savedAt: new Date().toISOString(),
        });

        setIsBookmarked(true);
      }

      localStorage.setItem(
        WATCHLIST_KEY,
        JSON.stringify(watchlist)
      );
    } catch (err) {
      console.error(
        "Bookmark error:",
        err
      );
    }
  };

  /*
   * ------------------------------------------------------
   * FAVORITE
   * ------------------------------------------------------
   */
  const handleFavorite = async () => {
    if (actionLoading) return;

    if (!isSignedIn) {
      navigate("/sign-in");
      return;
    }

    try {
      setActionLoading(true);

      /*
       * Keep this flexible because different versions
       * of the backend may expose slightly different
       * favorite endpoints.
       */
      const movieId =
        movie?.id ||
        movie?.tmdb_id ||
        movie?.tmdbId ||
        id;

      if (isFavorite) {
        await axios.delete(
          `/api/user/favorites/${movieId}`
        );
      } else {
        await axios.post(
          "/api/user/favorites",
          {
            movieId,
            movie: movie,
          }
        );
      }

      setIsFavorite((current) => !current);

      if (typeof fetchFavoriteMovies === "function") {
        await fetchFavoriteMovies();
      }
    } catch (err) {
      console.error(
        "Favorite error:",
        err
      );

      /*
       * If backend route differs, keep UI stable
       * instead of breaking the entire movie page.
       */
    } finally {
      setActionLoading(false);
    }
  };

  /*
   * ------------------------------------------------------
   * TRAILER
   * ------------------------------------------------------
   */
  const handleTrailer = () => {
    const directTrailer =
      getTrailerUrl(movie);

    if (directTrailer) {
      const embed =
        getYoutubeEmbedUrl(
          directTrailer
        );

      if (embed) {
        setTrailerUrl(embed);
        setTrailerOpen(true);
        return;
      }

      window.open(
        directTrailer,
        "_blank",
        "noopener,noreferrer"
      );

      return;
    }

    /*
     * No trailer from API:
     * open YouTube search.
     */
    const searchQuery = encodeURIComponent(
      `${title} official trailer`
    );

    window.open(
      `https://www.youtube.com/results?search_query=${searchQuery}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  /*
   * ------------------------------------------------------
   * BOOK SHOW
   * ------------------------------------------------------
   */
  const handleBookShow = (
    theatre,
    show
  ) => {
    const theatreId =
      theatre?.id ||
      theatre?._id ||
      theatre?.theatre_id;

    const showId = getShowId(show);

    const date =
      getShowDate(show) ||
      selectedDate;

    /*
     * Main booking route used by GenzShow.
     */
    navigate(
      `/movies/${id}/${date}`,
      {
        state: {
          movie,
          theatre,
          show,
          theatreId,
          showId,
          movieId: id,
          date,
        },
      }
    );
  };

  /*
   * ------------------------------------------------------
   * LOADING
   * ------------------------------------------------------
   */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070a] text-white">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-red-500" />

            <p className="text-sm text-zinc-400">
              Loading movie details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ------------------------------------------------------
   * ERROR
   * ------------------------------------------------------
   */
  if (error || !movie) {
    return (
      <div className="min-h-screen bg-[#07070a] text-white">
        <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6">
          <div className="w-full rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
              <Ticket className="h-8 w-8 text-red-400" />
            </div>

            <h1 className="text-2xl font-bold">
              Movie Not Found
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-400">
              We couldn't load this movie right now.
              Please go back and try another movie.
            </p>

            <button
              onClick={() => navigate(-1)}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070a] text-white">
      {/* ==================================================
          BACKDROP
      ================================================== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          {backdropUrl ? (
            <img
              src={backdropUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : posterUrl ? (
            <img
              src={posterUrl}
              alt=""
              className="h-full w-full object-cover blur-sm"
            />
          ) : (
            <div className="h-full w-full bg-zinc-900" />
          )}
        </div>

        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-[#07070a]/80 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07070a]/95 via-[#07070a]/50 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-6 lg:px-8 lg:pb-24">
          {/* TOP BAR */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBookmark}
                className={`flex h-11 w-11 items-center justify-center rounded-xl border backdrop-blur-md transition ${
                  isBookmarked
                    ? "border-red-500/40 bg-red-500/20 text-red-400"
                    : "border-white/10 bg-black/30 text-white hover:bg-white/10"
                }`}
                title={
                  isBookmarked
                    ? "Remove bookmark"
                    : "Add bookmark"
                }
              >
                {isBookmarked ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Bookmark className="h-5 w-5" />
                )}
              </button>

              <button
                onClick={handleFavorite}
                disabled={actionLoading}
                className={`flex h-11 w-11 items-center justify-center rounded-xl border backdrop-blur-md transition ${
                  isFavorite
                    ? "border-pink-500/40 bg-pink-500/20 text-pink-400"
                    : "border-white/10 bg-black/30 text-white hover:bg-white/10"
                }`}
                title="Favorite"
              >
                <Heart
                  className={`h-5 w-5 ${
                    isFavorite
                      ? "fill-current"
                      : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* HERO CONTENT */}
          <div className="mt-16 grid items-end gap-10 lg:grid-cols-[250px_1fr]">
            {/* POSTER */}
            <div className="mx-auto w-full max-w-[250px] overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl lg:mx-0">
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt={title}
                  className="aspect-[2/3] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[2/3] items-center justify-center text-zinc-500">
                  No Poster
                </div>
              )}
            </div>

            {/* DETAILS */}
            <div className="max-w-4xl">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {genres
                  .slice(0, 4)
                  .map((genre) => (
                    <span
                      key={genre}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300"
                    >
                      {genre}
                    </span>
                  ))}
              </div>

              <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                {title}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-zinc-300">
                {getYear(movie) && (
                  <span>
                    {getYear(movie)}
                  </span>
                )}

                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <strong className="text-white">
                    {rating}
                  </strong>
                  <span className="text-zinc-500">
                    / 10
                  </span>
                </span>

                <span className="flex items-center gap-1.5">
                  <Clock3 className="h-4 w-4" />
                  {runtime}
                </span>
              </div>

              <p className="mt-7 max-w-3xl text-base leading-7 text-zinc-300 sm:text-lg">
                {movie?.overview ||
                  movie?.description ||
                  "No movie description is available yet."}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    if (
                      filteredTheatres.length > 0
                    ) {
                      document
                        .getElementById(
                          "showtimes"
                        )
                        ?.scrollIntoView({
                          behavior: "smooth",
                        });
                    } else {
                      handleTrailer();
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold transition hover:bg-red-500"
                >
                  <Ticket className="h-4 w-4" />

                  {filteredTheatres.length > 0
                    ? "Book Tickets"
                    : "Where to Watch"}
                </button>

                <button
                  onClick={handleTrailer}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-bold backdrop-blur-md transition hover:bg-white/15"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Watch Trailer
                </button>

                <button
                  onClick={handleBookmark}
                  className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition ${
                    isBookmarked
                      ? "border-red-500/30 bg-red-500/10 text-red-400"
                      : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  <Bookmark
                    className={`h-4 w-4 ${
                      isBookmarked
                        ? "fill-current"
                        : ""
                    }`}
                  />

                  {isBookmarked
                    ? "Bookmarked"
                    : "Add to Watchlist"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          MOVIE INFORMATION
      ================================================== */}
      <main className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
        <section className="grid gap-6 border-b border-white/10 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <CalendarDays className="mb-4 h-5 w-5 text-red-400" />

            <p className="text-xs uppercase tracking-wider text-zinc-500">
              Release Date
            </p>

            <p className="mt-2 font-semibold">
              {formatReleaseDate(
                releaseDate
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <Star className="mb-4 h-5 w-5 text-yellow-400" />

            <p className="text-xs uppercase tracking-wider text-zinc-500">
              Rating
            </p>

            <p className="mt-2 font-semibold">
              {rating}
              <span className="ml-1 text-zinc-500">
                / 10
              </span>
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <Clock3 className="mb-4 h-5 w-5 text-blue-400" />

            <p className="text-xs uppercase tracking-wider text-zinc-500">
              Runtime
            </p>

            <p className="mt-2 font-semibold">
              {runtime}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <Users className="mb-4 h-5 w-5 text-pink-400" />

            <p className="text-xs uppercase tracking-wider text-zinc-500">
              Genres
            </p>

            <p className="mt-2 font-semibold">
              {genres.length
                ? genres
                    .slice(0, 2)
                    .join(", ")
                : "Not available"}
            </p>
          </div>
        </section>

        {/* ==================================================
            WHERE TO WATCH
        ================================================== */}
        <section
          id="showtimes"
          className="scroll-mt-20 pt-12"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">
                GenzShow
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                Where to Watch
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                Find available theatres and showtimes
                for this movie.
              </p>
            </div>

            {!showtimesLoading &&
              filteredTheatres.length > 0 && (
                <div className="flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-2 text-sm text-green-400">
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  Available for booking
                </div>
              )}
          </div>

          {/* SHOWTIME LOADING */}
          {showtimesLoading && (
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-10">
              <div className="flex items-center justify-center gap-3 text-zinc-400">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/10 border-t-red-500" />
                Checking theatres and showtimes...
              </div>
            </div>
          )}

          {/* NO SHOWS */}
          {!showtimesLoading &&
            filteredTheatres.length === 0 && (
              <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02]">
                <div className="grid gap-8 p-8 lg:grid-cols-[1fr_auto] lg:p-10">
                  <div>
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10">
                      <Clock3 className="h-6 w-6 text-red-400" />
                    </div>

                    <h3 className="text-2xl font-bold">
                      No shows available yet
                    </h3>

                    <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-400">
                      This movie is available in
                      GenzShow's movie catalogue, but
                      theatres have not added showtimes
                      yet.
                    </p>

                    <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-500">
                      You can still bookmark the movie
                      and check back later.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        onClick={
                          handleBookmark
                        }
                        className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
                          isBookmarked
                            ? "bg-red-500/10 text-red-400"
                            : "bg-white text-black hover:bg-zinc-200"
                        }`}
                      >
                        <Bookmark
                          className={`h-4 w-4 ${
                            isBookmarked
                              ? "fill-current"
                              : ""
                          }`}
                        />

                        {isBookmarked
                          ? "Saved to Watchlist"
                          : "Watchlist"}
                      </button>

                      <button
                        onClick={
                          handleTrailer
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:bg-white/10"
                      >
                        <Play className="h-4 w-4" />
                        Watch Trailer
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-red-500/10 blur-3xl" />

                      <div className="relative flex h-36 w-36 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                        <Ticket className="h-14 w-14 text-zinc-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* DATE SELECTOR */}
          {!showtimesLoading &&
            filteredTheatres.length > 0 &&
            availableDates.length > 0 && (
              <div className="mt-8 overflow-x-auto">
                <div className="flex min-w-max gap-3">
                  {availableDates.map(
                    (date) => {
                      const active =
                        date ===
                        selectedDate;

                      return (
                        <button
                          key={date}
                          onClick={() =>
                            setSelectedDate(
                              date
                            )
                          }
                          className={`min-w-[92px] rounded-2xl border px-4 py-3 text-left transition ${
                            active
                              ? "border-red-500 bg-red-600 text-white"
                              : "border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06]"
                          }`}
                        >
                          <p className="text-xs opacity-70">
                            {formatShortDate(
                              date
                            )}
                          </p>

                          <p className="mt-1 font-semibold">
                            {formatDay(
                              date
                            )}
                          </p>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            )}

          {/* THEATRES */}
          {!showtimesLoading &&
            filteredTheatres.length > 0 && (
              <div className="mt-8 space-y-4">
                {filteredTheatres.map(
                  (theatre) => (
                    <div
                      key={
                        theatre.id ||
                        theatre._id
                      }
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/15 hover:bg-white/[0.04]"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        {/* THEATRE */}
                        <div>
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
                              <MapPin className="h-5 w-5 text-red-400" />
                            </div>

                            <div>
                              <h3 className="font-bold">
                                {getTheatreName(
                                  theatre
                                )}
                              </h3>

                              {(getTheatreCity(
                                theatre
                              ) ||
                                getTheatreAddress(
                                  theatre
                                )) && (
                                <p className="mt-1 text-sm text-zinc-500">
                                  {[
                                    getTheatreCity(
                                      theatre
                                    ),
                                    getTheatreAddress(
                                      theatre
                                    ),
                                  ]
                                    .filter(
                                      Boolean
                                    )
                                    .join(
                                      " • "
                                    )}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* SHOWS */}
                        <div className="flex flex-wrap gap-2">
                          {(
                            theatre.shows ||
                            []
                          ).map(
                            (
                              show,
                              index
                            ) => {
                              const showId =
                                getShowId(
                                  show
                                );

                              return (
                                <button
                                  key={`${showId}-${index}`}
                                  onClick={() =>
                                    handleBookShow(
                                      theatre,
                                      show
                                    )
                                  }
                                  className="group rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-left transition hover:border-red-500/40 hover:bg-red-500/10"
                                >
                                  <div className="flex items-center gap-2">
                                    <Clock3 className="h-4 w-4 text-zinc-500 group-hover:text-red-400" />

                                    <span className="text-sm font-semibold">
                                      {getShowTime(
                                        show
                                      ) ||
                                        "Showtime"}
                                    </span>
                                  </div>

                                  <p className="mt-1 text-[11px] text-zinc-600 group-hover:text-zinc-400">
                                    Select seats
                                  </p>
                                </button>
                              );
                            }
                          )}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
        </section>

        {/* ==================================================
            MOVIE DETAILS
        ================================================== */}
        <section className="mt-16 grid gap-8 lg:grid-cols-[1fr_300px]">
          <div>
            <h2 className="text-2xl font-bold">
              About {title}
            </h2>

            <p className="mt-4 max-w-4xl text-sm leading-7 text-zinc-400">
              {movie?.overview ||
                movie?.description ||
                "No additional information is available for this movie."}
            </p>

            {genres.length > 0 && (
              <div className="mt-6">
                <p className="mb-3 text-sm font-semibold text-zinc-300">
                  Genres
                </p>

                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <span
                      key={genre}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Movie Status
            </p>

            <div className="mt-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
                <Check className="h-5 w-5 text-green-400" />
              </div>

              <div>
                <p className="font-semibold">
                  Available on GenzShow
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  Movie information loaded
                  successfully
                </p>
              </div>
            </div>

            <div className="mt-5 border-t border-white/10 pt-5">
              <p className="text-xs text-zinc-500">
                Theatre availability
              </p>

              <p className="mt-1 text-sm font-medium">
                {showtimesLoading
                  ? "Checking..."
                  : filteredTheatres.length > 0
                  ? "Shows available"
                  : "Coming soon"}
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* ==================================================
          TRAILER MODAL
      ================================================== */}
      {trailerOpen && trailerUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() =>
            setTrailerOpen(false)
          }
        >
          <div
            className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              onClick={() =>
                setTrailerOpen(false)
              }
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="aspect-video">
              <iframe
                src={trailerUrl}
                title={`${title} Trailer`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}