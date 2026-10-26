import {
    Activity,
    Brain,
    CalendarDays,
    Clock3,
    Film,
    Heart,
    RefreshCw,
    Sparkles,
    Star,
    Ticket,
    TrendingUp,
    UserRound,
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
    useAppContext,
} from "../context/AppContext";

const MovieDNA = () => {
    const navigate = useNavigate();

    const {
        axios,
        isSignedIn,
        isAuthLoaded,
    } = useAppContext();

    const [dna, setDNA] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const fetchDNA = useCallback(
        async (isRefresh = false) => {
            if (!isAuthLoaded) {
                return;
            }

            if (!isSignedIn) {
                setDNA(null);
                setLoading(false);
                setError(
                    "Please sign in to view your Movie DNA."
                );
                return;
            }

            try {
                if (isRefresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");

                const response = await axios.get(
                    "/api/movie-dna"
                );

                if (response?.data?.success) {
                    setDNA(response.data.dna);
                } else {
                    setDNA(null);

                    setError(
                        response?.data?.message ||
                            "Unable to load Movie DNA."
                    );
                }
            } catch (err) {
                console.error(
                    "MOVIE DNA FETCH ERROR:",
                    err?.response?.data || err
                );

                if (
                    err?.response?.status === 401
                ) {
                    setDNA(null);
                    setError(
                        "Your login session is not ready. Please refresh the page or sign in again."
                    );
                } else {
                    setError(
                        err?.response?.data?.message ||
                            "Failed to load Movie DNA."
                    );
                }
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [
            axios,
            isAuthLoaded,
            isSignedIn,
        ]
    );

    useEffect(() => {
        fetchDNA();
    }, [fetchDNA]);

    const sortedGenres = useMemo(() => {
        if (!Array.isArray(dna?.genres)) {
            return [];
        }

        return [...dna.genres]
            .sort(
                (a, b) =>
                    Number(b?.score || 0) -
                    Number(a?.score || 0)
            )
            .slice(0, 6);
    }, [dna]);

    const sortedMoods = useMemo(() => {
        if (!Array.isArray(dna?.moods)) {
            return [];
        }

        return [...dna.moods]
            .sort(
                (a, b) =>
                    Number(b?.score || 0) -
                    Number(a?.score || 0)
            )
            .slice(0, 6);
    }, [dna]);

    const sortedLanguages = useMemo(() => {
        if (!Array.isArray(dna?.languages)) {
            return [];
        }

        return [...dna.languages]
            .sort(
                (a, b) =>
                    Number(b?.score || 0) -
                    Number(a?.score || 0)
            )
            .slice(0, 6);
    }, [dna]);

    const totalGenreScore = useMemo(() => {
        return sortedGenres.reduce(
            (sum, item) =>
                sum + Number(item?.score || 0),
            0
        );
    }, [sortedGenres]);

    const getPercentage = (score) => {
        if (!totalGenreScore) {
            return 0;
        }

        return Math.round(
            (Number(score || 0) /
                totalGenreScore) *
                100
        );
    };

    const dominantGenre =
        sortedGenres?.[0]?.name || "Explorer";

    const averageRuntime = Math.round(
        Number(dna?.averageRuntime || 0)
    );

    const averageRating = Number(
        dna?.averageRating || 0
    ).toFixed(1);

    if (!isAuthLoaded || loading) {
        return (
            <div className="min-h-screen bg-[#09090b] text-white">
                <div className="mx-auto max-w-7xl px-6 py-12">
                    <div className="animate-pulse space-y-8">
                        <div className="h-10 w-72 rounded-xl bg-white/10" />

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {[
                                1,
                                2,
                                3,
                                4,
                            ].map((item) => (
                                <div
                                    key={item}
                                    className="h-32 rounded-2xl bg-white/5"
                                />
                            ))}
                        </div>

                        <div className="h-72 rounded-3xl bg-white/5" />
                    </div>
                </div>
            </div>
        );
    }

    if (!isSignedIn) {
        return (
            <div className="min-h-screen bg-[#09090b] text-white">
                <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-6">
                    <div className="w-full rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
                        <UserRound className="mx-auto mb-5 h-12 w-12 text-pink-400" />

                        <h1 className="text-3xl font-bold">
                            Your Movie DNA
                        </h1>

                        <p className="mt-3 text-zinc-400">
                            Sign in to discover your
                            personalized movie personality.
                        </p>

                        <button
                            onClick={() =>
                                navigate("/")
                            }
                            className="mt-7 rounded-xl bg-pink-500 px-6 py-3 font-semibold transition hover:bg-pink-400"
                        >
                            Go Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-white">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
                    <div>
                        <div className="mb-3 flex items-center gap-2 text-pink-400">
                            <Brain className="h-5 w-5" />

                            <span className="text-sm font-semibold uppercase tracking-[0.2em]">
                                GenZ Intelligence
                            </span>
                        </div>

                        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                            Your Movie DNA
                        </h1>

                        <p className="mt-3 max-w-2xl text-zinc-400">
                            A living profile of your movie
                            taste, built from what you watch,
                            favorite, book, and ask GenZ AI
                            about.
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            fetchDNA(true)
                        }
                        disabled={refreshing}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${
                                refreshing
                                    ? "animate-spin"
                                    : ""
                            }`}
                        />

                        Refresh DNA
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                        {error}
                    </div>
                )}

                {/* Personality */}
                <div className="mb-8 overflow-hidden rounded-3xl border border-pink-500/20 bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-transparent p-7">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="mb-3 flex items-center gap-2 text-pink-400">
                                <Sparkles className="h-5 w-5" />

                                <span className="text-sm font-semibold uppercase tracking-wider">
                                    Your Movie Personality
                                </span>
                            </div>

                            <h2 className="text-3xl font-black sm:text-4xl">
                                {dna?.personality ||
                                    "Explorer"}
                            </h2>

                            <p className="mt-3 max-w-2xl leading-7 text-zinc-400">
                                {dna?.personalityDescription ||
                                    "You are discovering your movie taste."}
                            </p>
                        </div>

                        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border border-pink-400/20 bg-pink-500/10">
                            <Brain className="h-10 w-10 text-pink-400" />
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        icon={
                            <Film className="h-5 w-5" />
                        }
                        label="Movies Viewed"
                        value={
                            dna?.totalMovieViews ||
                            0
                        }
                    />

                    <StatCard
                        icon={
                            <Heart className="h-5 w-5" />
                        }
                        label="Favorites"
                        value={
                            dna?.totalFavorites ||
                            0
                        }
                    />

                    <StatCard
                        icon={
                            <Ticket className="h-5 w-5" />
                        }
                        label="Bookings"
                        value={
                            dna?.totalBookings ||
                            0
                        }
                    />

                    <StatCard
                        icon={
                            <Sparkles className="h-5 w-5" />
                        }
                        label="AI Requests"
                        value={
                            dna?.totalAIRequests ||
                            0
                        }
                    />
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Genres */}
                    <DNASection
                        title="Top Genres"
                        icon={
                            <TrendingUp className="h-5 w-5" />
                        }
                    >
                        {sortedGenres.length ===
                        0 ? (
                            <EmptyState text="Watch more movies to build your genre profile." />
                        ) : (
                            <div className="space-y-5">
                                {sortedGenres.map(
                                    (
                                        genre
                                    ) => {
                                        const percentage =
                                            getPercentage(
                                                genre.score
                                            );

                                        return (
                                            <div
                                                key={
                                                    genre.name
                                                }
                                            >
                                                <div className="mb-2 flex items-center justify-between">
                                                    <span className="font-medium">
                                                        {
                                                            genre.name
                                                        }
                                                    </span>

                                                    <span className="text-sm text-zinc-500">
                                                        {
                                                            percentage
                                                        }
                                                        %
                                                    </span>
                                                </div>

                                                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
                                                        style={{
                                                            width: `${percentage}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        )}
                    </DNASection>

                    {/* Moods */}
                    <DNASection
                        title="Your Moods"
                        icon={
                            <Activity className="h-5 w-5" />
                        }
                    >
                        {sortedMoods.length ===
                        0 ? (
                            <EmptyState text="Use GenZ AI and interact with movies to build your mood profile." />
                        ) : (
                            <div className="flex flex-wrap gap-3">
                                {sortedMoods.map(
                                    (
                                        mood
                                    ) => (
                                        <div
                                            key={
                                                mood.name
                                            }
                                            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                                        >
                                            <div className="font-semibold">
                                                {
                                                    mood.name
                                                }
                                            </div>

                                            <div className="mt-1 text-xs text-zinc-500">
                                                Score{" "}
                                                {
                                                    mood.score
                                                }
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </DNASection>

                    {/* Languages */}
                    <DNASection
                        title="Languages"
                        icon={
                            <Film className="h-5 w-5" />
                        }
                    >
                        {sortedLanguages.length ===
                        0 ? (
                            <EmptyState text="Your preferred movie languages will appear here." />
                        ) : (
                            <div className="flex flex-wrap gap-3">
                                {sortedLanguages.map(
                                    (
                                        language
                                    ) => (
                                        <div
                                            key={
                                                language.name
                                            }
                                            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                                        >
                                            <span className="font-semibold">
                                                {
                                                    language.name
                                                }
                                            </span>

                                            <span className="ml-2 text-xs text-zinc-500">
                                                {
                                                    language.score
                                                }
                                            </span>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </DNASection>

                    {/* Movie Stats */}
                    <DNASection
                        title="Movie Habits"
                        icon={
                            <CalendarDays className="h-5 w-5" />
                        }
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <MiniStat
                                icon={
                                    <Clock3 className="h-4 w-4" />
                                }
                                label="Avg Runtime"
                                value={
                                    averageRuntime
                                        ? `${averageRuntime} min`
                                        : "—"
                                }
                            />

                            <MiniStat
                                icon={
                                    <Star className="h-4 w-4" />
                                }
                                label="Avg Rating"
                                value={
                                    averageRating !==
                                    "0.0"
                                        ? averageRating
                                        : "—"
                                }
                            />

                            <MiniStat
                                icon={
                                    <Film className="h-4 w-4" />
                                }
                                label="Top Genre"
                                value={
                                    dominantGenre
                                }
                            />

                            <MiniStat
                                icon={
                                    <Brain className="h-4 w-4" />
                                }
                                label="DNA Status"
                                value="Active"
                            />
                        </div>
                    </DNASection>
                </div>

                {/* AI CTA */}
                <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-7">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h3 className="text-xl font-bold">
                                Want your next movie?
                            </h3>

                            <p className="mt-2 text-sm text-zinc-500">
                                Ask GenZ AI for recommendations
                                based on your evolving Movie
                                DNA.
                            </p>
                        </div>

                        <button
                            onClick={() =>
                                navigate(
                                    "/genz-ai"
                                )
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-pink-500 px-6 py-3 font-semibold transition hover:bg-pink-400"
                        >
                            <Sparkles className="h-4 w-4" />

                            Ask GenZ AI
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({
    icon,
    label,
    value,
}) => {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400">
                {icon}
            </div>

            <p className="text-sm text-zinc-500">
                {label}
            </p>

            <p className="mt-1 text-3xl font-black">
                {value}
            </p>
        </div>
    );
};

const DNASection = ({
    title,
    icon,
    children,
}) => {
    return (
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400">
                    {icon}
                </div>

                <h3 className="text-xl font-bold">
                    {title}
                </h3>
            </div>

            {children}
        </section>
    );
};

const MiniStat = ({
    icon,
    label,
    value,
}) => {
    return (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="mb-2 flex items-center gap-2 text-zinc-500">
                {icon}

                <span className="text-xs">
                    {label}
                </span>
            </div>

            <p className="truncate text-lg font-bold">
                {value}
            </p>
        </div>
    );
};

const EmptyState = ({ text }) => {
    return (
        <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-6 text-center text-sm leading-6 text-zinc-500">
            {text}
        </div>
    );
};

export default MovieDNA;