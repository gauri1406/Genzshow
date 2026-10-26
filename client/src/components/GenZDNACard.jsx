"use client";

import {
    ArrowRight,
    Brain,
    Clapperboard,
    Heart,
    Sparkles,
    Star,
    Ticket,
} from "lucide-react";

import {
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import {
    useAppContext,
} from "../context/AppContext";

export default function GenZDNACard() {
    const navigate = useNavigate();

    const {
        axios,
        isSignedIn,
        isAuthLoaded,
    } = useAppContext();

    const [dna, setDna] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthLoaded) {
            return;
        }

        if (!isSignedIn) {
            setDna(null);
            setLoading(false);
            return;
        }

        const fetchDNA = async () => {
            try {
                setLoading(true);

                const { data } = await axios.get(
                    "/api/movie-dna"
                );

                if (data?.success) {
                    setDna(data.dna);
                }
            } catch (error) {
                console.error(
                    "HOME GENZ DNA ERROR:",
                    error?.response?.data || error
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDNA();
    }, [
        axios,
        isSignedIn,
        isAuthLoaded,
    ]);

    if (!isAuthLoaded || loading) {
        return (
            <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="animate-pulse overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-[#111217]">
                    <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-white/10" />

                    <div className="mt-5 h-8 w-72 rounded bg-zinc-200 dark:bg-white/10" />

                    <div className="mt-3 h-4 w-96 max-w-full rounded bg-zinc-200 dark:bg-white/10" />

                    <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {[1, 2, 3, 4].map(
                            (item) => (
                                <div
                                    key={item}
                                    className="h-20 rounded-2xl bg-zinc-100 dark:bg-white/5"
                                />
                            )
                        )}
                    </div>
                </div>
            </section>
        );
    }

    /*
     * Don't show the DNA card to logged-out users.
     */
    if (!isSignedIn) {
        return null;
    }

    /*
     * If DNA doesn't exist yet, still show
     * a useful onboarding card.
     */
    if (!dna) {
        return (
            <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111217] sm:p-8">
                    <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-fuchsia-500/10 blur-3xl" />

                    <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="mb-3 flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-500/10">
                                    <Brain className="h-5 w-5 text-fuchsia-500" />
                                </div>

                                <span className="text-sm font-semibold text-fuchsia-500">
                                    GENZ DNA
                                </span>
                            </div>

                            <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-3xl">
                                Discover your movie DNA
                            </h2>

                            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                                Watch movies, save favorites and use
                                GenZ AI to build your personalized
                                movie personality.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/genz-dna")
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                        >
                            Explore My DNA

                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    const genres =
        Array.isArray(dna.genres)
            ? [...dna.genres]
                .sort(
                    (a, b) =>
                        Number(b.score || 0) -
                        Number(a.score || 0)
                )
                .slice(0, 3)
            : [];

    const totalGenreScore =
        genres.reduce(
            (sum, item) =>
                sum + Number(item.score || 0),
            0
        );

    const topGenre =
        genres[0]?.name ||
        "Explorer";

    const personality =
        dna.personality ||
        "The Explorer";

    const description =
        dna.personalityDescription ||
        "Your movie taste is still evolving.";

    const getGenrePercentage = (
        score
    ) => {
        if (!totalGenreScore) {
            return 0;
        }

        return Math.round(
            (Number(score || 0) /
                totalGenreScore) *
                100
        );
    };

    return (
        <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#111217]">
                {/* Decorative background */}
                <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />

                <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-purple-500/10 blur-3xl" />

                <div className="relative p-5 sm:p-7 lg:p-8">

                    {/* Header */}
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

                        <div className="flex gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-fuchsia-500/10">
                                <Brain className="h-6 w-6 text-fuchsia-500" />
                            </div>

                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-500">
                                        Your GenZ DNA
                                    </span>

                                    <span className="rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-2.5 py-1 text-[10px] font-semibold text-fuchsia-500">
                                        PERSONALIZED
                                    </span>
                                </div>

                                <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-3xl">
                                    {personality}
                                </h2>

                                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                                    {description}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/genz-dna")
                            }
                            className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-semibold text-zinc-900 transition hover:border-fuchsia-500/30 hover:bg-fuchsia-500/5 dark:border-white/10 dark:bg-white/5 dark:text-white"
                        >
                            View My DNA

                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>

                    {/* Main content */}
                    <div className="mt-7 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">

                        {/* Top genres */}
                        <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-5 dark:border-white/10 dark:bg-white/[0.03]">

                            <div className="mb-5 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
                                        Your taste
                                    </p>

                                    <h3 className="mt-1 font-semibold text-zinc-950 dark:text-white">
                                        Top movie genres
                                    </h3>
                                </div>

                                <Sparkles className="h-5 w-5 text-fuchsia-500" />
                            </div>

                            <div className="space-y-4">
                                {genres.length > 0 ? (
                                    genres.map(
                                        (
                                            genre,
                                            index
                                        ) => {
                                            const percentage =
                                                getGenrePercentage(
                                                    genre.score
                                                );

                                            return (
                                                <div
                                                    key={`${genre.name}-${index}`}
                                                >
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                                                            {genre.name}
                                                        </span>

                                                        <span className="text-xs font-semibold text-zinc-500">
                                                            {percentage}%
                                                        </span>
                                                    </div>

                                                    <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10">
                                                        <div
                                                            className="h-full rounded-full bg-fuchsia-500 transition-all duration-700"
                                                            style={{
                                                                width: `${percentage}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        }
                                    )
                                ) : (
                                    <p className="text-sm text-zinc-500">
                                        Keep exploring movies to
                                        build your DNA.
                                    </p>
                                )}
                            </div>

                            <div className="mt-5 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                                <Clapperboard className="h-4 w-4" />

                                <span>
                                    Dominant genre:
                                </span>

                                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                    {topGenre}
                                </span>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3">

                            <StatCard
                                icon={
                                    <Clapperboard className="h-4 w-4" />
                                }
                                label="Movies Viewed"
                                value={
                                    dna.totalMovieViews || 0
                                }
                            />

                            <StatCard
                                icon={
                                    <Heart className="h-4 w-4" />
                                }
                                label="Favorites"
                                value={
                                    dna.totalFavorites || 0
                                }
                            />

                            <StatCard
                                icon={
                                    <Ticket className="h-4 w-4" />
                                }
                                label="Bookings"
                                value={
                                    dna.totalBookings || 0
                                }
                            />

                            <StatCard
                                icon={
                                    <Star className="h-4 w-4" />
                                }
                                label="Avg Rating"
                                value={
                                    Number(
                                        dna.averageRating || 0
                                    ).toFixed(1)
                                }
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-fuchsia-500/10 bg-fuchsia-500/[0.04] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-fuchsia-500" />

                            <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                Your DNA evolves as you watch,
                                favorite and discover movies.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/genz-ai")
                            }
                            className="text-left text-xs font-semibold text-fuchsia-500 transition hover:text-fuchsia-400 sm:text-right"
                        >
                            Find movies for my DNA →
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

function StatCard({
    icon,
    label,
    value,
}) {
    return (
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex items-center gap-2 text-zinc-500">
                {icon}

                <span className="text-xs font-medium">
                    {label}
                </span>
            </div>

            <p className="mt-3 text-2xl font-bold text-zinc-950 dark:text-white">
                {value}
            </p>
        </div>
    );
}