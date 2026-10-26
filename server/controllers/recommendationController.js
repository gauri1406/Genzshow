import Movie from "../models/Movie.js";
import Show from "../models/Show.js";

import {
    getAIRecommendations,
} from "../services/aiRecommendationService.js";

import {
    getVibeMatches,
} from "../services/movieVibeService.js";


export const getAIRecommendationsController =
    async (
        req,
        res
    ) => {

        try {

            const {
                prompt,
            } = req.body;


            if (
                !prompt ||
                !prompt.trim()
            ) {

                return res
                    .status(400)
                    .json({
                        success:
                            false,

                        message:
                            "Please tell GenZ AI what you want to watch.",
                    });
            }


            // =================================================
            // GET AVAILABLE SHOWS
            // =================================================

            const shows =
                await Show.find({
                    showDateTime: {
                        $gte:
                            new Date(),
                    },
                })
                    .populate(
                        "movie"
                    )
                    .sort({
                        showDateTime:
                            1,
                    })
                    .lean();


            // =================================================
            // UNIQUE MOVIES
            // =================================================

            const movieMap =
                new Map();


            shows.forEach(
                (show) => {

                    if (
                        !show.movie
                    ) {
                        return;
                    }


                    const movie =
                        show.movie;


                    const movieId =
                        String(
                            movie._id
                        );


                    if (
                        !movieMap.has(
                            movieId
                        )
                    ) {

                        movieMap.set(
                            movieId,
                            movie
                        );
                    }
                }
            );


            let movies =
                Array.from(
                    movieMap.values()
                );


            // =================================================
            // FALLBACK
            // =================================================

            if (
                movies.length ===
                0
            ) {

                movies =
                    await Movie.find(
                        {}
                    )
                        .sort({
                            vote_average:
                                -1,
                        })
                        .limit(
                            100
                        )
                        .lean();
            }


            movies =
                movies.slice(
                    0,
                    100
                );


            // =================================================
            // VIBE ENGINE
            // =================================================

            const {
                vibe,
                ranked,
            } =
                getVibeMatches(
                    movies,
                    prompt
                );


            // =================================================
            // TOP CANDIDATES
            // =================================================

            const candidateMovies =
                ranked
                    .filter(
                        (item) =>
                            item.score >
                            0
                    )
                    .slice(
                        0,
                        15
                    );


            const aiMovies =
                candidateMovies.length >
                0
                    ? candidateMovies.map(
                        (item) =>
                            item.movie
                    )
                    : movies;


            // =================================================
            // GEMINI RANKING
            // =================================================

            const result =
                await getAIRecommendations(
                    {
                        prompt,
                        movies:
                            aiMovies,
                    }
                );


            // =================================================
            // ADD MATCH DATA
            // =================================================

            const recommendations =
                result.movies.map(
                    (movie) => {

                        const match =
                            ranked.find(
                                (item) =>
                                    String(
                                        item.movie
                                            ?._id
                                    ) ===
                                    String(
                                        movie._id
                                    )
                            );


                        return {
                            ...movie,

                            matchScore:
                                match?.score ||
                                0,

                            matchedReasons:
                                match?.matchedReasons ||
                                [],
                        };
                    }
                );


            // =================================================
            // RESPONSE
            // =================================================

            return res.json({

                success:
                    true,

                movies:
                    recommendations,

                reason:
                    result.reason,

                vibe: {

                    mood:
                        vibe.mood,

                    moods:
                        vibe.moods,

                    genres:
                        vibe.genres,

                    audience:
                        vibe.audience,

                    language:
                        vibe.language,

                    minRuntime:
                        vibe.minRuntime,

                    maxRuntime:
                        vibe.maxRuntime,

                    minRating:
                        vibe.minRating,
                },
            });

        } catch (
            error
        ) {

            console.error(
                "GENZ AI RECOMMENDATION ERROR:",
                error
            );


            return res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        error?.message ||
                        "Failed to generate AI recommendations.",
                });
        }
    };