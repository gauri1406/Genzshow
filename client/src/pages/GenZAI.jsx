import React, { useState } from "react";

import {
    ArrowRight,
    Bot,
    Search,
    Sparkles,
    Star,
    X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import MovieCard from "../components/MovieCard";

import { useAppContext } from "../context/AppContext";

import { trackAIRequestDNA } from "../utils/movieDNA";

const QUICK_PROMPTS = [
    "Give me a mind-bending thriller with a huge twist",
    "Find me a funny movie for a chill night",
    "I want an emotional romantic movie",
    "Suggest an action movie with a powerful hero",
    "Find a scary horror movie for tonight",
    "Give me a futuristic sci-fi movie",
];

const formatVibe = (vibe) => {
    if (!vibe) {
        return "";
    }

    if (typeof vibe === "string") {
        return vibe;
    }

    if (typeof vibe !== "object") {
        return String(vibe);
    }

    const parts = [];

    if (vibe.mood) {
        parts.push(`Mood: ${vibe.mood}`);
    }

    if (
        Array.isArray(vibe.moods) &&
        vibe.moods.length > 0
    ) {
        parts.push(
            `Moods: ${vibe.moods.join(", ")}`
        );
    }

    if (
        Array.isArray(vibe.genres) &&
        vibe.genres.length > 0
    ) {
        parts.push(
            `Genres: ${vibe.genres.join(", ")}`
        );
    }

    if (vibe.audience) {
        parts.push(
            `Audience: ${vibe.audience}`
        );
    }

    if (vibe.language) {
        parts.push(
            `Language: ${vibe.language}`
        );
    }

    if (
        vibe.minRuntime !== undefined &&
        vibe.maxRuntime !== undefined
    ) {
        parts.push(
            `Runtime: ${vibe.minRuntime}-${vibe.maxRuntime} min`
        );
    }

    if (vibe.minRating !== undefined) {
        parts.push(
            `Rating: ${vibe.minRating}+`
        );
    }

    return parts.join(" • ");
};

const getVibeGenres = (vibe) => {
    if (!vibe || typeof vibe !== "object") {
        return [];
    }

    if (Array.isArray(vibe.genres)) {
        return vibe.genres;
    }

    return [];
};

const getMovieId = (movie) => {
    return (
        movie?._id ||
        movie?.id ||
        movie?.tmdbId ||
        movie?.tmdb_id
    );
};

const GenZAI = () => {
    const navigate = useNavigate();

    const {
        axios,
    } = useAppContext();

    const [prompt, setPrompt] = useState("");

    const [results, setResults] = useState([]);

    const [reason, setReason] = useState("");

    const [vibe, setVibe] = useState(null);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [hasSearched, setHasSearched] =
        useState(false);

    const handleSearch = async (
        customPrompt = null
    ) => {
        const cleanPrompt = String(
            customPrompt ?? prompt
        ).trim();

        if (!cleanPrompt) {
            toast.error(
                "Tell me what kind of movie you want."
            );
            return;
        }

        setPrompt(cleanPrompt);
        setLoading(true);
        setError("");
        setHasSearched(true);

        try {
            const { data } = await axios.post(
                "/api/recommendation/ai",
                {
                    prompt: cleanPrompt,
                }
            );

            if (!data?.success) {
                throw new Error(
                    data?.message ||
                        "Unable to generate recommendations."
                );
            }

            const movies = Array.isArray(
                data?.movies
            )
                ? data.movies
                : Array.isArray(data?.results)
                ? data.results
                : [];

            setResults(movies);

            setReason(
                typeof data?.reason === "string"
                    ? data.reason
                    : ""
            );

            setVibe(
                data?.vibe ||
                    data?.profile ||
                    data?.filters ||
                    null
            );

            await trackAIRequestDNA({
                axios,
                prompt: cleanPrompt,
            });

            if (movies.length === 0) {
                toast(
                    "I couldn't find matching movies in the current catalogue."
                );
            }
        } catch (err) {
            console.error(
                "GENZ AI ERROR:",
                err?.response?.data || err
            );

            const message =
                err?.response?.data?.message ||
                err?.message ||
                "Something went wrong while generating recommendations.";

            setError(message);
            setResults([]);
            setReason("");
            setVibe(null);

            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickPrompt = (
        quickPrompt
    ) => {
        setPrompt(quickPrompt);
        handleSearch(quickPrompt);
    };

    const clearSearch = () => {
        setPrompt("");
        setResults([]);
        setReason("");
        setVibe(null);
        setError("");
        setHasSearched(false);
    };

    const openMovie = (movie) => {
        const movieId = getMovieId(movie);

        if (!movieId) {
            console.error(
                "MOVIE ID MISSING:",
                movie
            );
            return;
        }

        navigate(`/movies/${movieId}`);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const vibeGenres = getVibeGenres(vibe);

    return (
        <div className="min-h-screen px-5 md:px-10 lg:px-20 pt-28 pb-20">
            {/* HERO */}
            <section className="max-w-5xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm mb-6">
                    <Sparkles className="w-4 h-4" />
                    GenZ AI Movie Discovery
                </div>

                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                    Tell me your{" "}
                    <span className="text-primary">
                        vibe.
                    </span>
                </h1>

                <p className="text-gray-400 max-w-2xl mx-auto mt-5 text-base md:text-lg leading-relaxed">
                    Don't search through thousands of
                    movies. Just describe what you feel
                    like watching and GenZ AI will find
                    movies from the GenZShow catalogue
                    for you.
                </p>
            </section>

            {/* SEARCH */}
            <section className="max-w-4xl mx-auto mt-10">
                <div className="relative">
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-3 shadow-2xl focus-within:border-primary/50 transition">
                        <Search className="w-5 h-5 text-gray-500 ml-2 shrink-0" />

                        <input
                            type="text"
                            value={prompt}
                            onChange={(event) =>
                                setPrompt(
                                    event.target.value
                                )
                            }
                            onKeyDown={(event) => {
                                if (
                                    event.key ===
                                    "Enter"
                                ) {
                                    handleSearch();
                                }
                            }}
                            placeholder="e.g. I want a dark mind-bending movie with a crazy ending..."
                            className="flex-1 bg-transparent outline-none text-white placeholder:text-gray-500 py-3 text-sm md:text-base"
                        />

                        {prompt && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="p-2 rounded-full hover:bg-white/10 transition"
                            >
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        )}

                        <button
                            type="button"
                            disabled={loading}
                            onClick={() =>
                                handleSearch()
                            }
                            className="flex items-center gap-2 bg-primary hover:bg-primary-dull disabled:opacity-50 disabled:cursor-not-allowed px-5 md:px-7 py-3 rounded-xl font-medium text-sm transition active:scale-95"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Thinking
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    Find Movies
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* QUICK PROMPTS */}
                <div className="mt-5">
                    <p className="text-xs text-gray-500 mb-3">
                        Try a vibe
                    </p>

                    <div className="flex flex-wrap gap-2">
                        {QUICK_PROMPTS.map(
                            (quickPrompt) => (
                                <button
                                    key={quickPrompt}
                                    type="button"
                                    onClick={() =>
                                        handleQuickPrompt(
                                            quickPrompt
                                        )
                                    }
                                    disabled={loading}
                                    className="text-xs md:text-sm px-3 py-2 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-primary/30 text-gray-300 transition disabled:opacity-50"
                                >
                                    {quickPrompt}
                                </button>
                            )
                        )}
                    </div>
                </div>
            </section>

            {/* ERROR */}
            {error && (
                <section className="max-w-4xl mx-auto mt-8">
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                                <Bot className="w-5 h-5 text-red-400" />
                            </div>

                            <div>
                                <p className="font-medium text-red-300">
                                    GenZ AI couldn't complete
                                    the request
                                </p>

                                <p className="text-sm text-red-300/70 mt-1">
                                    {error}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* LOADING */}
            {loading && (
                <section className="max-w-5xl mx-auto mt-14">
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />

                            <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-primary" />
                        </div>

                        <h2 className="text-lg font-medium mt-6">
                            Understanding your vibe...
                        </h2>

                        <p className="text-sm text-gray-500 mt-2">
                            GenZ AI is searching the
                            movie catalogue
                        </p>
                    </div>
                </section>
            )}

            {/* RESULTS */}
            {!loading &&
                hasSearched &&
                results.length > 0 && (
                    <section className="max-w-6xl mx-auto mt-14">
                        {/* AI SUMMARY */}
                        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8 mb-10">
                            <div className="flex items-start gap-4">
                                <div className="w-11 h-11 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
                                    <Bot className="w-5 h-5 text-primary" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-primary font-medium">
                                        GenZ AI
                                    </p>

                                    <h2 className="text-xl md:text-2xl font-semibold mt-1">
                                        Your recommendations
                                    </h2>

                                    {reason && (
                                        <p className="text-gray-400 mt-3 leading-relaxed">
                                            {reason}
                                        </p>
                                    )}

                                    {/* VIBE */}
                                    {vibe && (
                                        <div className="mt-5">
                                            <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">
                                                Your vibe
                                            </p>

                                            <div className="flex flex-wrap gap-2">
                                                {vibe?.mood && (
                                                    <span className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs">
                                                        Mood:{" "}
                                                        {
                                                            vibe.mood
                                                        }
                                                    </span>
                                                )}

                                                {vibeGenres.map(
                                                    (
                                                        genre
                                                    ) => (
                                                        <span
                                                            key={
                                                                genre
                                                            }
                                                            className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs"
                                                        >
                                                            {
                                                                genre
                                                            }
                                                        </span>
                                                    )
                                                )}

                                                {vibe?.audience && (
                                                    <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs">
                                                        {
                                                            vibe.audience
                                                        }
                                                    </span>
                                                )}

                                                {vibe?.language && (
                                                    <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs">
                                                        {
                                                            vibe.language
                                                        }
                                                    </span>
                                                )}

                                                {vibe?.minRuntime !==
                                                    undefined &&
                                                    vibe?.maxRuntime !==
                                                        undefined && (
                                                        <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs">
                                                            {
                                                                vibe.minRuntime
                                                            }

                                                            -
                                                            {
                                                                vibe.maxRuntime
                                                            }{" "}
                                                            min
                                                        </span>
                                                    )}

                                                {vibe?.minRating !==
                                                    undefined && (
                                                    <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs">
                                                        <Star className="w-3 h-3 fill-primary text-primary" />

                                                        {
                                                            vibe.minRating
                                                        }
                                                        +
                                                    </span>
                                                )}
                                            </div>

                                            {!formatVibe(
                                                vibe
                                            ) && (
                                                <p className="text-sm text-gray-500">
                                                    AI identified a
                                                    personalized
                                                    movie vibe for
                                                    you.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* MOVIES */}
                        <div className="flex items-center justify-between mb-7">
                            <div>
                                <p className="text-xs uppercase tracking-wider text-primary font-medium">
                                    AI matched
                                </p>

                                <h2 className="text-2xl font-semibold mt-1">
                                    Movies for you
                                </h2>
                            </div>

                            <span className="text-sm text-gray-500">
                                {results.length}{" "}
                                {results.length === 1
                                    ? "movie"
                                    : "movies"}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 md:gap-7">
                            {results.map(
                                (
                                    movie,
                                    index
                                ) => (
                                    <div
                                        key={
                                            getMovieId(
                                                movie
                                            ) ||
                                            index
                                        }
                                        className="group"
                                    >
                                        <MovieCard
                                            movie={movie}
                                        />
                                    </div>
                                )
                            )}
                        </div>
                    </section>
                )}

            {/* EMPTY RESULT */}
            {!loading &&
                hasSearched &&
                !error &&
                results.length === 0 && (
                    <section className="max-w-3xl mx-auto mt-14">
                        <div className="text-center rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-14">
                            <div className="w-14 h-14 mx-auto rounded-2xl bg-white/5 flex items-center justify-center">
                                <Search className="w-6 h-6 text-gray-500" />
                            </div>

                            <h2 className="text-xl font-semibold mt-5">
                                No exact matches
                            </h2>

                            <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
                                Try describing your mood,
                                genre, language, or the
                                kind of experience you want.
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    setPrompt(
                                        "Give me something really good to watch tonight"
                                    )
                                }
                                className="inline-flex items-center gap-2 mt-6 px-5 py-3 bg-primary rounded-xl text-sm font-medium hover:bg-primary-dull transition"
                            >
                                Try another vibe
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </section>
                )}

            {/* INITIAL STATE */}
            {!loading && !hasSearched && (
                <section className="max-w-5xl mx-auto mt-16">
                    <div className="grid md:grid-cols-3 gap-5">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-primary" />
                            </div>

                            <h3 className="font-medium mt-5">
                                Describe your vibe
                            </h3>

                            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                                Tell GenZ AI how you feel
                                instead of searching by
                                complicated filters.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-primary" />
                            </div>

                            <h3 className="font-medium mt-5">
                                AI understands you
                            </h3>

                            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                                GenZ AI converts your
                                natural language into movie
                                preferences.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <ArrowRight className="w-5 h-5 text-primary" />
                            </div>

                            <h3 className="font-medium mt-5">
                                Get real movies
                            </h3>

                            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                                Recommendations come from
                                the actual GenZShow movie
                                catalogue.
                            </p>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default GenZAI;