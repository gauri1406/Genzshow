import React, {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  dummyDateTimeData,
  dummyShowsData,
} from "../assets/assets";

import BlurCircle from "../components/BlurCircle";

import {
  Heart,
  PlayCircleIcon,
  StarIcon,
} from "lucide-react";

import timeFormat from "../lib/timeFormat";
import DateSelect from "../components/DateSelect";
import MovieCard from "../components/MovieCard";
import Loading from "../components/Loading";

import trackMovieDNA from "../utils/movieDNA";

import {
  useAppContext,
} from "../context/AppContext";

import toast from "react-hot-toast";

const MovieDetails = () => {
  const navigate = useNavigate();

  const { id } = useParams();

  const [show, setShow] = useState(null);

  const {
    shows,
    axios,
    getToken,
    user,
    fetchFavoriteMovies,
    favoriteMovies,
    image_base_url,
  } = useAppContext();

  /*
   * ----------------------------------------------------
   * GET MOVIE / SHOW DETAILS
   * ----------------------------------------------------
   */

  const getShow = async () => {
    try {
      const { data } =
        await axios.get(
          `/api/show/${id}`
        );

      if (data.success) {
        setShow(data);
      }
    } catch (error) {
      console.error(
        "GET MOVIE DETAILS ERROR:",
        error
      );
    }
  };

  /*
   * ----------------------------------------------------
   * MOVIE DNA - VIEW TRACKING
   * ----------------------------------------------------
   *
   * Every time a movie details page is opened,
   * Movie DNA learns from the movie.
   *
   * The tracker itself handles errors so this
   * never breaks the movie page.
   */

  useEffect(() => {
    if (!show?.movie) {
      return;
    }

    trackMovieDNA({
      axios,
      movie: show.movie,
      action: "view",
    });
  }, [show]);

  /*
   * ----------------------------------------------------
   * FAVORITE HANDLER
   * ----------------------------------------------------
   */

  const handleFavorite = async () => {
    try {
      /*
       * User must be logged in.
       */

      if (!user) {
        toast.error(
          "Please login to proceed"
        );

        return;
      }

      /*
       * Check whether the movie is already
       * in the user's favorites BEFORE changing it.
       */

      const wasFavorite =
        Array.isArray(
          favoriteMovies
        ) &&
        favoriteMovies.some(
          (movie) =>
            String(
              movie?._id
            ) === String(id)
        );

      /*
       * Get Clerk token.
       */

      const token =
        await getToken();

      /*
       * Existing favorite API.
       */

      const { data } =
        await axios.post(
          "/api/user/update-favorite",
          {
            movieId: id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      if (data.success) {
        /*
         * Refresh favorite movies.
         */

        await fetchFavoriteMovies();

        /*
         * --------------------------------------------
         * MOVIE DNA FAVORITE TRACKING
         * --------------------------------------------
         *
         * Only track when the movie is being ADDED
         * to favorites.
         *
         * If the user removes the movie from favorites,
         * we don't increase the DNA favorite score.
         */

        if (!wasFavorite && show?.movie) {
          await trackMovieDNA({
            axios,
            movie: show.movie,
            action: "favorite",
          });
        }

        toast.success(
          data.message
        );
      }
    } catch (error) {
      console.error(
        "FAVORITE ERROR:",
        error
      );

      toast.error(
        "Something went wrong. Please try again."
      );
    }
  };

  /*
   * ----------------------------------------------------
   * INITIAL LOAD
   * ----------------------------------------------------
   */

  useEffect(() => {
    getShow();
  }, [id]);

  /*
   * ----------------------------------------------------
   * LOADING STATE
   * ----------------------------------------------------
   */

  if (!show?.movie) {
    return <Loading />;
  }

  const movie = show.movie;

  /*
   * ----------------------------------------------------
   * SAFE MOVIE DATA
   * ----------------------------------------------------
   */

  const movieTitle =
    movie?.title ||
    movie?.name ||
    "Movie";

  const movieRating =
    Number(
      movie?.vote_average
    ) || 0;

  const movieRuntime =
    Number(
      movie?.runtime
    ) || 0;

  const movieOverview =
    movie?.overview ||
    "No overview available for this movie.";

  const movieGenres =
    Array.isArray(
      movie?.genres
    )
      ? movie.genres
          .map((genre) => {
            if (
              typeof genre ===
              "object"
            ) {
              return (
                genre?.name || ""
              );
            }

            return String(
              genre
            );
          })
          .filter(Boolean)
      : [];

  const releaseYear =
    movie?.release_date
      ? movie.release_date.split(
          "-"
        )[0]
      : "";

  const moviePoster =
    movie?.poster_path
      ? image_base_url +
        movie.poster_path
      : "/placeholder.png";

  const movieCasts =
    Array.isArray(
      movie?.casts
    )
      ? movie.casts
      : [];

  /*
   * Check favorite state.
   */

  const isFavorite =
    Array.isArray(
      favoriteMovies
    ) &&
    favoriteMovies.some(
      (favoriteMovie) =>
        String(
          favoriteMovie?._id
        ) === String(id)
    );

  /*
   * ----------------------------------------------------
   * PAGE
   * ----------------------------------------------------
   */

  return (
    <div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-50 pb-20">
      {/* =================================================
          MOVIE HERO SECTION
          ================================================= */}

      <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
        {/* POSTER */}

        <img
          src={moviePoster}
          alt={movieTitle}
          className="max-md:mx-auto rounded-xl h-104 max-w-70 object-cover shadow-xl"
        />

        {/* MOVIE INFORMATION */}

        <div className="relative flex flex-col gap-3">
          <BlurCircle
            top="-100px"
            left="-100px"
          />

          {/* LANGUAGE */}

          <p className="text-primary font-medium">
            {movie?.original_language
              ? movie.original_language.toUpperCase()
              : "ENGLISH"}
          </p>

          {/* TITLE */}

          <h1 className="text-4xl font-semibold max-w-96 text-balance">
            {movieTitle}
          </h1>

          {/* RATING */}

          <div className="flex items-center gap-2 text-gray-300">
            <StarIcon className="w-5 h-5 text-primary fill-primary" />

            {movieRating.toFixed(
              1
            )}

            <span>
              User Rating
            </span>
          </div>

          {/* OVERVIEW */}

          <p className="text-gray-400 mt-2 text-sm leading-tight max-w-xl">
            {movieOverview}
          </p>

          {/* MOVIE META */}

          <p className="text-gray-300">
            {movieRuntime > 0
              ? timeFormat(
                  movieRuntime
                )
              : "Runtime unavailable"}

            {movieGenres.length >
              0 && (
              <>
                {" "}
                •{" "}
                {
                  movieGenres.join(
                    ", "
                  )
                }
              </>
            )}

            {releaseYear && (
              <>
                {" "}
                •{" "}
                {releaseYear}
              </>
            )}
          </p>

          {/* ACTION BUTTONS */}

          <div className="flex items-center flex-wrap gap-4 mt-4">
            {/* TRAILER */}

            <button
              type="button"
              className="flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium cursor-pointer active:scale-95"
            >
              <PlayCircleIcon className="w-5 h-5" />

              Watch Trailer
            </button>

            {/* BUY TICKETS */}

            <a
              href="#dateSelect"
              className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer active:scale-95"
            >
              Buy Tickets
            </a>

            {/* FAVORITE */}

            <button
              type="button"
              onClick={handleFavorite}
              aria-label={
                isFavorite
                  ? "Remove from favorites"
                  : "Add to favorites"
              }
              className="bg-gray-700 hover:bg-gray-600 p-2.5 rounded-full transition cursor-pointer active:scale-95"
            >
              <Heart
                className={`w-5 h-5 transition ${
                  isFavorite
                    ? "fill-primary text-primary"
                    : "text-white"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* =================================================
          CAST SECTION
          ================================================= */}

      <p className="text-lg font-medium mt-20">
        Your Favorite Cast
      </p>

      <div className="overflow-x-auto no-scrollbar mt-8 pb-4">
        <div className="flex items-center gap-4 w-max px-4">
          {movieCasts
            .slice(0, 12)
            .map(
              (
                cast,
                index
              ) => (
                <div
                  key={
                    cast?._id ||
                    cast?.id ||
                    index
                  }
                  className="flex flex-col items-center text-center"
                >
                  {/* CAST IMAGE */}

                  {cast?.profile_path ? (
                    <img
                      src={
                        image_base_url +
                        cast.profile_path
                      }
                      alt={
                        cast?.name ||
                        "Cast"
                      }
                      className="rounded-full h-20 md:h-20 aspect-square object-cover"
                    />
                  ) : (
                    <div className="rounded-full h-20 w-20 bg-gray-800 flex items-center justify-center text-gray-500 text-xs">
                      No Image
                    </div>
                  )}

                  {/* CAST NAME */}

                  <p className="font-medium text-xs mt-3 max-w-20">
                    {cast?.name ||
                      "Unknown"}
                  </p>
                </div>
              )
            )}
        </div>
      </div>

      {/* =================================================
          DATE / SHOW SELECTION
          ================================================= */}

      <div id="dateSelect">
        <DateSelect
          dateTime={
            show?.dateTime
          }
          id={id}
        />
      </div>

      {/* =================================================
          RECOMMENDED MOVIES
          ================================================= */}

      <p className="text-lg font-medium mt-20 mb-8">
        You May Also Like
      </p>

      <div className="flex flex-wrap max-sm:justify-center gap-8">
        {Array.isArray(
          shows
        ) &&
          shows
            .slice(0, 4)
            .map(
              (
                movieItem,
                index
              ) => (
                <MovieCard
                  key={
                    movieItem?._id ||
                    movieItem?.id ||
                    index
                  }
                  movie={
                    movieItem
                  }
                />
              )
            )}
      </div>

      {/* =================================================
          SHOW MORE
          ================================================= */}

      <div className="flex justify-center mt-20">
        <button
          type="button"
          onClick={() => {
            navigate(
              "/movies"
            );

            window.scrollTo(
              0,
              0
            );
          }}
          className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer active:scale-95"
        >
          Show more
        </button>
      </div>
    </div>
  );
};

export default MovieDetails;