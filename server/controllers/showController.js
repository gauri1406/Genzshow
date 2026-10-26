import axios from "axios";

import Movie from "../models/Movie.js";
import Show from "../models/Show.js";

import { inngest } from "../inngest/index.js";


// ============================================================
// GET NOW PLAYING MOVIES FROM TMDB
// ============================================================

export const getNowPlayingMovies = async (req, res) => {
    try {
        const response = await axios.get(
            "https://api.themoviedb.org/3/movie/now_playing",
            {
                headers: {
                    Authorization:
                        `Bearer ${process.env.TMDB_API_KEY}`,
                },
                params: {
                    language: "en-US",
                    page: 1,
                    region: "IN",
                },
            }
        );

        const movies =
            response.data?.results || [];

        return res.json({
            success: true,
            movies,
        });

    } catch (error) {
        console.error(
            "NOW PLAYING MOVIES ERROR:",
            error.response?.data ||
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                error.response?.data?.status_message ||
                error.message ||
                "Failed to fetch now playing movies.",
        });
    }
};


// ============================================================
// ADD A NEW SHOW
// ============================================================

export const addShow = async (req, res) => {
    try {
        const {
            movieId,
            theatreId,
            showsInput,
            showPrice,
        } = req.body;


        // ====================================================
        // VALIDATE MOVIE
        // ====================================================

        if (!movieId) {
            return res.status(400).json({
                success: false,
                message: "Movie is required.",
            });
        }


        // ====================================================
        // VALIDATE THEATRE
        // ====================================================

        if (!theatreId) {
            return res.status(400).json({
                success: false,
                message: "Theatre is required.",
            });
        }


        // ====================================================
        // VALIDATE SHOW INPUT
        // ====================================================

        if (
            !Array.isArray(showsInput) ||
            showsInput.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Show date and time are required.",
            });
        }


        // ====================================================
        // VALIDATE PRICE
        // ====================================================

        if (
            showPrice === undefined ||
            showPrice === null ||
            Number(showPrice) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Valid show price is required.",
            });
        }


        // ====================================================
        // FIND MOVIE
        // ====================================================

        let movie =
            await Movie.findById(movieId);


        // ====================================================
        // IF MOVIE DOES NOT EXIST
        // FETCH FROM TMDB
        // ====================================================

        if (!movie) {

            const [
                movieDetailsResponse,
                movieCreditsResponse,
            ] = await Promise.all([

                axios.get(
                    `https://api.themoviedb.org/3/movie/${movieId}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${process.env.TMDB_API_KEY}`,
                        },
                    }
                ),

                axios.get(
                    `https://api.themoviedb.org/3/movie/${movieId}/credits`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${process.env.TMDB_API_KEY}`,
                        },
                    }
                ),

            ]);


            const movieApiData =
                movieDetailsResponse.data;

            const movieCreditsData =
                movieCreditsResponse.data;


            const movieDetails = {
                _id: movieId,

                title:
                    movieApiData.title,

                overview:
                    movieApiData.overview,

                poster_path:
                    movieApiData.poster_path,

                backdrop_path:
                    movieApiData.backdrop_path,

                genres:
                    movieApiData.genres,

                casts:
                    movieCreditsData.cast,

                release_date:
                    movieApiData.release_date,

                original_language:
                    movieApiData.original_language,

                tagline:
                    movieApiData.tagline || "",

                vote_average:
                    movieApiData.vote_average,

                runtime:
                    movieApiData.runtime,
            };


            movie =
                await Movie.create(
                    movieDetails
                );
        }


        // ====================================================
        // PREPARE SHOWS
        // ====================================================

        const showsToCreate = [];


        showsInput.forEach((show) => {

            const showDate =
                show.date;


            if (
                !Array.isArray(
                    show.time
                )
            ) {
                throw new Error(
                    "Invalid show time format."
                );
            }


            show.time.forEach((time) => {

                const dateTimeString =
                    `${showDate}T${time}`;


                const showDateTime =
                    new Date(
                        dateTimeString
                    );


                if (
                    Number.isNaN(
                        showDateTime.getTime()
                    )
                ) {
                    throw new Error(
                        `Invalid date/time: ${dateTimeString}`
                    );
                }


                showsToCreate.push({
                    movie:
                        movie._id,

                    theatre:
                        theatreId,

                    showDateTime,

                    showPrice:
                        Number(showPrice),

                    occupiedSeats: {},
                });

            });

        });


        // ====================================================
        // INSERT SHOWS
        // ====================================================

        if (
            showsToCreate.length > 0
        ) {
            await Show.insertMany(
                showsToCreate
            );
        }


        // ====================================================
        // INNGEST EVENT
        // ====================================================

        await inngest.send({
            name:
                "app/show.added",

            data: {
                movieTitle:
                    movie.title,
            },
        });


        // ====================================================
        // RESPONSE
        // ====================================================

        return res.json({
            success: true,

            message:
                "Show Added successfully.",
        });

    } catch (error) {

        console.error(
            "ADD SHOW ERROR:",
            error
        );

        return res.status(500).json({
            success: false,

            message:
                error.message ||
                "Failed to add show.",
        });
    }
};


// ============================================================
// GET ALL SHOWS
// ============================================================

export const getShows = async (req, res) => {
    try {

        const shows =
            await Show.find({
                showDateTime: {
                    $gte: new Date(),
                },
            })
                .populate("movie")
                .populate("theatre")
                .sort({
                    showDateTime: 1,
                });


        // ====================================================
        // UNIQUE MOVIES
        // ====================================================

        const uniqueMovies = [
            ...new Map(
                shows
                    .filter(
                        (show) =>
                            show.movie
                    )
                    .map(
                        (show) => [
                            show.movie._id.toString(),
                            show.movie,
                        ]
                    )
            ).values(),
        ];


        return res.json({
            success: true,
            shows: uniqueMovies,
        });

    } catch (error) {

        console.error(
            "GET SHOWS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,

            message:
                error.message ||
                "Failed to fetch shows.",
        });
    }
};


// ============================================================
// GET MOVIE SHOWS
// ============================================================

export const getShow = async (req, res) => {
    try {

        const {
            movieId,
        } = req.params;


        const {
            theatreId,
        } = req.query;


        // ====================================================
        // BUILD FILTER
        // ====================================================

        const filter = {
            movie: movieId,

            showDateTime: {
                $gte: new Date(),
            },
        };


        if (theatreId) {
            filter.theatre =
                theatreId;
        }


        // ====================================================
        // FIND SHOWS
        // ====================================================

        const shows =
            await Show.find(
                filter
            )
                .populate("theatre")
                .sort({
                    showDateTime: 1,
                });


        // ====================================================
        // MOVIE
        // ====================================================

        const movie =
            await Movie.findById(
                movieId
            );


        // ====================================================
        // GROUP BY DATE
        // ====================================================

        const dateTime = {};


        shows.forEach((show) => {

            const date =
                show.showDateTime
                    .toISOString()
                    .split("T")[0];


            if (
                !dateTime[date]
            ) {
                dateTime[date] = [];
            }


            dateTime[date].push({
                time:
                    show.showDateTime,

                showId:
                    show._id,

                theatre:
                    show.theatre,

                showPrice:
                    show.showPrice,
            });

        });


        // ====================================================
        // RESPONSE
        // ====================================================

        return res.json({
            success: true,

            movie,

            dateTime,
        });

    } catch (error) {

        console.error(
            "GET SHOW ERROR:",
            error
        );

        return res.status(500).json({
            success: false,

            message:
                error.message ||
                "Failed to fetch movie shows.",
        });
    }
};


// ============================================================
// GET SHOWS BY TMDB MOVIE ID
// ============================================================
//
// IMPORTANT:
//
// In your database the TMDB movie ID is stored as Movie._id.
// Therefore we directly query:
//
// Show.movie === TMDB movie ID
//
// We do NOT need movie.tmdbId.
//
// ============================================================

export const getShowsByTmdbMovieId = async (
    req,
    res
) => {

    try {

        const {
            movieId,
        } = req.params;


        if (!movieId) {

            return res.status(400).json({
                success: false,
                message:
                    "Movie ID is required.",
            });

        }


        // ====================================================
        // FIND SHOWS
        // ====================================================

        const shows =
            await Show.find({
                movie: movieId,

                showDateTime: {
                    $gte: new Date(),
                },

            })
                .populate("movie")
                .populate("theatre")
                .sort({
                    showDateTime: 1,
                })
                .lean();


        // ====================================================
        // GROUP SHOWS BY THEATRE
        // ====================================================

        const theatreMap =
            new Map();


        shows.forEach((show) => {

            if (!show.theatre) {
                return;
            }


            const theatreId =
                String(
                    show.theatre._id
                );


            if (
                !theatreMap.has(
                    theatreId
                )
            ) {

                theatreMap.set(
                    theatreId,
                    {
                        theatre:
                            show.theatre,

                        shows: [],
                    }
                );

            }


            theatreMap
                .get(theatreId)
                .shows
                .push({
                    _id:
                        show._id,

                    showDateTime:
                        show.showDateTime,

                    showPrice:
                        show.showPrice,

                    occupiedSeats:
                        show.occupiedSeats ||
                        {},
                });

        });


        const theatreShows =
            Array.from(
                theatreMap.values()
            );


        // ====================================================
        // RESPONSE
        // ====================================================

        return res.json({

            success: true,

            movieId,

            shows,

            theatreShows,

        });

    } catch (error) {

        console.error(
            "GET SHOWS BY TMDB MOVIE ID ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to fetch movie shows.",

        });

    }

};