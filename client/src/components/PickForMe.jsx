import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowRight,
    Brain,
    Clock3,
    Heart,
    Laugh,
    RefreshCw,
    Sparkles,
    Users,
    Zap,
    Ghost,
    Smile,
    User,
    Check,
    X,
} from "lucide-react";

import { useAppContext } from "../context/AppContext";

const MOODS = [
    {
        id: "fun",
        label: "Fun",
        description: "I just want to have a good time",
        icon: Laugh,
        genres: [35, 12],
    },
    {
        id: "action",
        label: "Adrenaline",
        description: "Give me something intense",
        icon: Zap,
        genres: [28, 53],
    },
    {
        id: "romantic",
        label: "Romantic",
        description: "Something for the heart",
        icon: Heart,
        genres: [10749, 18],
    },
    {
        id: "horror",
        label: "Scary",
        description: "I want to be scared",
        icon: Ghost,
        genres: [27, 53],
    },
    {
        id: "mind",
        label: "Mind-bending",
        description: "Make me think",
        icon: Brain,
        genres: [878, 9648, 53],
    },
    {
        id: "emotional",
        label: "Emotional",
        description: "I want something meaningful",
        icon: Heart,
        genres: [18, 10751],
    },
    {
        id: "chill",
        label: "Chill",
        description: "Easy and relaxing",
        icon: Smile,
        genres: [35, 16, 10751],
    },
];

const PEOPLE = [
    {
        id: "solo",
        label: "Solo",
        description: "Just me",
        icon: User,
    },
    {
        id: "date",
        label: "Date",
        description: "Movie night for two",
        icon: Heart,
    },
    {
        id: "friends",
        label: "Friends",
        description: "Movie night with the squad",
        icon: Users,
    },
    {
        id: "family",
        label: "Family",
        description: "Something everyone can enjoy",
        icon: Users,
    },
];

const DURATIONS = [
    {
        id: "short",
        label: "Under 90 min",
        description: "Quick watch",
        min: 0,
        max: 90,
        icon: Zap,
    },
    {
        id: "medium",
        label: "90–120 min",
        description: "Perfect movie night",
        min: 90,
        max: 120,
        icon: Clock3,
    },
    {
        id: "long",
        label: "2+ hours",
        description: "I'm here for the experience",
        min: 120,
        max: 500,
        icon: Clock3,
    },
];

const PickForMe = () => {
    const navigate = useNavigate();

    const {
        shows = [],
        image_base_url,
    } = useAppContext();

    const movies = Array.isArray(shows)
        ? shows
        : [];

    const [isOpen, setIsOpen] =
        useState(false);

    const [step, setStep] =
        useState(1);

    const [mood, setMood] =
        useState(null);

    const [people, setPeople] =
        useState(null);

    const [duration, setDuration] =
        useState(null);

    const [showResult, setShowResult] =
        useState(false);

    const reset = () => {
        setStep(1);
        setMood(null);
        setPeople(null);
        setDuration(null);
        setShowResult(false);
    };

    const close = () => {
        setIsOpen(false);
        reset();
    };

    const getMovieGenres = (movie) => {
        if (
            Array.isArray(
                movie?.genres
            )
        ) {
            return movie.genres.map(
                (genre) =>
                    typeof genre === "object"
                        ? genre.id
                        : genre
            );
        }

        return [];
    };

    const getRuntime = (movie) => {
        const runtime =
            Number(
                movie?.runtime
            );

        if (
            Number.isFinite(runtime) &&
            runtime > 0
        ) {
            return runtime;
        }

        return 120;
    };

    const recommendedMovies = useMemo(() => {

        if (
            !mood ||
            !duration ||
            movies.length === 0
        ) {
            return [];
        }

        const scoredMovies =
            movies.map((movie) => {

                let score = 0;

                const movieGenres =
                    getMovieGenres(
                        movie
                    );

                const matchingGenres =
                    movieGenres.filter(
                        (genre) =>
                            mood.genres.includes(
                                genre
                            )
                    );

                score +=
                    matchingGenres.length *
                    20;

                const runtime =
                    getRuntime(movie);

                if (
                    runtime >= duration.min &&
                    runtime <= duration.max
                ) {
                    score += 30;
                } else {
                    const distance =
                        Math.min(
                            Math.abs(
                                runtime -
                                    duration.min
                            ),
                            Math.abs(
                                runtime -
                                    duration.max
                            )
                        );

                    score += Math.max(
                        0,
                        15 -
                            distance /
                                10
                    );
                }

                const rating =
                    Number(
                        movie?.vote_average
                    ) || 0;

                score += rating * 2;

                if (
                    people?.id ===
                    "family"
                ) {
                    if (
                        movieGenres.includes(
                            10751
                        ) ||
                        movieGenres.includes(
                            16
                        )
                    ) {
                        score += 20;
                    }
                }

                if (
                    people?.id ===
                    "date"
                ) {
                    if (
                        movieGenres.includes(
                            10749
                        ) ||
                        movieGenres.includes(
                            35
                        )
                    ) {
                        score += 20;
                    }
                }

                if (
                    people?.id ===
                    "friends"
                ) {
                    if (
                        movieGenres.includes(
                            28
                        ) ||
                        movieGenres.includes(
                            35
                        ) ||
                        movieGenres.includes(
                            12
                        )
                    ) {
                        score += 15;
                    }
                }

                return {
                    movie,
                    score,
                };

            });

        return scoredMovies
            .sort(
                (a, b) =>
                    b.score -
                    a.score
            )
            .slice(0, 3)
            .map(
                (item) =>
                    item.movie
            );

    }, [
        movies,
        mood,
        people,
        duration,
    ]);

    const selectedMovie =
        recommendedMovies[0];

    const getPoster = (movie) => {

        if (
            !movie?.poster_path
        ) {
            return null;
        }

        if (
            movie.poster_path.startsWith(
                "http"
            )
        ) {
            return movie.poster_path;
        }

        return `${
            image_base_url ||
            "https://image.tmdb.org/t/p/original"
        }${movie.poster_path}`;

    };

    const openPicker = () => {
        setIsOpen(true);
        reset();
    };

    const handleMood = (selectedMood) => {
        setMood(selectedMood);
        setStep(2);
    };

    const handlePeople = (selectedPeople) => {
        setPeople(selectedPeople);
        setStep(3);
    };

    const handleDuration = (selectedDuration) => {
        setDuration(selectedDuration);
        setShowResult(true);
    };

    const viewMovie = () => {

        if (!selectedMovie) {
            return;
        }

        const movieId =
            selectedMovie._id ||
            selectedMovie.id;

        navigate(
            `/movies/${movieId}`
        );

        close();

    };

    return (
        <>
            {/* =====================================================
                PICK FOR ME SECTION
            ===================================================== */}

            <section className="relative px-6 py-16 md:px-16 lg:px-36">

                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-red-500/10 via-black to-pink-500/10 p-8 md:p-12">

                    {/* Background Glow */}

                    <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-red-500/10 blur-3xl" />

                    <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-pink-500/10 blur-3xl" />

                    <div className="relative z-10 flex flex-col items-center text-center">

                        <div className="mb-4 flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-400">

                            <Sparkles
                                size={16}
                            />

                            GenZShow
                            Recommendation

                        </div>

                        <h2 className="text-3xl font-bold text-white md:text-5xl">

                            Don't know what to watch?

                        </h2>

                        <p className="mt-4 max-w-2xl text-zinc-400">

                            Tell us your vibe, who you're
                            watching with, and how much
                            time you have. We'll pick a
                            movie for you.

                        </p>

                        <button
                            type="button"
                            onClick={
                                openPicker
                            }
                            className="mt-8 flex items-center gap-3 rounded-full bg-red-500 px-7 py-3.5 font-semibold text-white transition hover:bg-red-400 hover:shadow-[0_0_30px_rgba(239,68,68,0.25)]"
                        >

                            <Sparkles
                                size={18}
                            />

                            Pick For Me

                            <ArrowRight
                                size={18}
                            />

                        </button>

                    </div>

                </div>

            </section>


            {/* =====================================================
                MODAL
            ===================================================== */}

            {isOpen && (

                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur-md">

                    <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-white/10 bg-[#0d0d11] shadow-2xl">

                        {/* CLOSE */}

                        <button
                            type="button"
                            onClick={
                                close
                            }
                            className="absolute right-5 top-5 z-20 rounded-full bg-white/5 p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
                        >
                            <X
                                size={20}
                            />
                        </button>


                        {!showResult ? (

                            <div className="p-7 md:p-10">

                                {/* HEADER */}

                                <div className="mb-8">

                                    <div className="mb-3 flex items-center gap-2 text-red-400">

                                        <Sparkles
                                            size={18}
                                        />

                                        <span className="text-sm font-medium">
                                            GenZShow Pick For Me
                                        </span>

                                    </div>

                                    <h2 className="text-2xl font-bold text-white md:text-3xl">

                                        {step === 1 &&
                                            "What's the vibe tonight?"}

                                        {step === 2 &&
                                            "Who's watching?"}

                                        {step === 3 &&
                                            "How much time do you have?"}

                                    </h2>

                                    <div className="mt-5 flex gap-2">

                                        {[1, 2, 3].map(
                                            (number) => (

                                                <div
                                                    key={
                                                        number
                                                    }
                                                    className={`h-1 flex-1 rounded-full ${
                                                        number <=
                                                        step
                                                            ? "bg-red-500"
                                                            : "bg-white/10"
                                                    }`}
                                                />

                                            )
                                        )}

                                    </div>

                                </div>


                                {/* STEP 1 */}

                                {step === 1 && (

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                                        {MOODS.map(
                                            (item) => {

                                                const Icon =
                                                    item.icon;

                                                return (

                                                    <button
                                                        key={
                                                            item.id
                                                        }
                                                        type="button"
                                                        onClick={() =>
                                                            handleMood(
                                                                item
                                                            )
                                                        }
                                                        className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-red-500/40 hover:bg-red-500/5"
                                                    >

                                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 text-zinc-300 transition group-hover:bg-red-500/10 group-hover:text-red-400">

                                                            <Icon
                                                                size={22}
                                                            />

                                                        </div>

                                                        <div>

                                                            <p className="font-semibold text-white">
                                                                {
                                                                    item.label
                                                                }
                                                            </p>

                                                            <p className="mt-1 text-sm text-zinc-500">
                                                                {
                                                                    item.description
                                                                }
                                                            </p>

                                                        </div>

                                                    </button>

                                                );

                                            }
                                        )}

                                    </div>

                                )}


                                {/* STEP 2 */}

                                {step === 2 && (

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                                        {PEOPLE.map(
                                            (item) => {

                                                const Icon =
                                                    item.icon;

                                                return (

                                                    <button
                                                        key={
                                                            item.id
                                                        }
                                                        type="button"
                                                        onClick={() =>
                                                            handlePeople(
                                                                item
                                                            )
                                                        }
                                                        className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-red-500/40 hover:bg-red-500/5"
                                                    >

                                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 text-zinc-300 group-hover:bg-red-500/10 group-hover:text-red-400">

                                                            <Icon
                                                                size={22}
                                                            />

                                                        </div>

                                                        <div>

                                                            <p className="font-semibold text-white">
                                                                {
                                                                    item.label
                                                                }
                                                            </p>

                                                            <p className="mt-1 text-sm text-zinc-500">
                                                                {
                                                                    item.description
                                                                }
                                                            </p>

                                                        </div>

                                                    </button>

                                                );

                                            }
                                        )}

                                    </div>

                                )}


                                {/* STEP 3 */}

                                {step === 3 && (

                                    <div className="grid grid-cols-1 gap-3">

                                        {DURATIONS.map(
                                            (item) => {

                                                const Icon =
                                                    item.icon;

                                                return (

                                                    <button
                                                        key={
                                                            item.id
                                                        }
                                                        type="button"
                                                        onClick={() =>
                                                            handleDuration(
                                                                item
                                                            )
                                                        }
                                                        className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-red-500/40 hover:bg-red-500/5"
                                                    >

                                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 text-zinc-300 group-hover:bg-red-500/10 group-hover:text-red-400">

                                                            <Icon
                                                                size={22}
                                                            />

                                                        </div>

                                                        <div>

                                                            <p className="font-semibold text-white">
                                                                {
                                                                    item.label
                                                                }
                                                            </p>

                                                            <p className="mt-1 text-sm text-zinc-500">
                                                                {
                                                                    item.description
                                                                }
                                                            </p>

                                                        </div>

                                                    </button>

                                                );

                                            }
                                        )}

                                    </div>

                                )}

                            </div>

                        ) : (

                            /* =================================================
                                RESULT
                            ================================================= */

                            <div className="p-7 md:p-10">

                                <div className="mb-8 text-center">

                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-400">

                                        <Sparkles
                                            size={26}
                                        />

                                    </div>

                                    <p className="text-sm font-medium text-red-400">
                                        YOUR GENZSHOW PICK
                                    </p>

                                    <h2 className="mt-2 text-3xl font-bold text-white">
                                        We found something for you
                                    </h2>

                                </div>


                                {selectedMovie ? (

                                    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">

                                        <div className="flex flex-col md:flex-row">

                                            {/* POSTER */}

                                            <div className="h-80 w-full shrink-0 md:h-auto md:w-64">

                                                {getPoster(
                                                    selectedMovie
                                                ) ? (

                                                    <img
                                                        src={
                                                            getPoster(
                                                                selectedMovie
                                                            )
                                                        }
                                                        alt={
                                                            selectedMovie.title
                                                        }
                                                        className="h-full w-full object-cover"
                                                    />

                                                ) : (

                                                    <div className="flex h-full items-center justify-center bg-white/5 text-zinc-600">
                                                        No Image
                                                    </div>

                                                )}

                                            </div>


                                            {/* DETAILS */}

                                            <div className="flex flex-1 flex-col p-6">

                                                <div>

                                                    <div className="mb-2 flex items-center gap-2">

                                                        <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
                                                            GenZ Pick
                                                        </span>

                                                        {selectedMovie.vote_average && (

                                                            <span className="text-sm text-zinc-400">
                                                                ⭐{" "}
                                                                {Number(
                                                                    selectedMovie.vote_average
                                                                ).toFixed(
                                                                    1
                                                                )}
                                                            </span>

                                                        )}

                                                    </div>

                                                    <h3 className="text-2xl font-bold text-white">
                                                        {
                                                            selectedMovie.title
                                                        }
                                                    </h3>

                                                    <p className="mt-4 line-clamp-4 text-sm leading-6 text-zinc-400">
                                                        {
                                                            selectedMovie.overview ||
                                                            "A movie picked especially for your vibe."
                                                        }
                                                    </p>

                                                </div>


                                                <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row">

                                                    <button
                                                        type="button"
                                                        onClick={
                                                            viewMovie
                                                        }
                                                        className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-500 px-5 py-3 font-semibold text-white transition hover:bg-red-400"
                                                    >

                                                        View Movie

                                                        <ArrowRight
                                                            size={17}
                                                        />

                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={
                                                            reset
                                                        }
                                                        className="flex items-center justify-center gap-2 rounded-full border border-white/10 px-5 py-3 font-medium text-zinc-300 transition hover:bg-white/5 hover:text-white"
                                                    >

                                                        <RefreshCw
                                                            size={17}
                                                        />

                                                        Try Again

                                                    </button>

                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                ) : (

                                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">

                                        <p className="text-zinc-400">
                                            We couldn't find a matching
                                            movie right now.
                                        </p>

                                        <button
                                            type="button"
                                            onClick={
                                                reset
                                            }
                                            className="mt-5 rounded-full bg-red-500 px-6 py-2.5 font-medium text-white"
                                        >
                                            Try Again
                                        </button>

                                    </div>

                                )}

                            </div>

                        )}

                    </div>

                </div>

            )}

        </>
    );
};

export default PickForMe;