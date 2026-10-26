import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    ArrowRight,
    CalendarDays,
    ChevronRight,
    Clock3,
    Film,
    Play,
    Search,
    Sparkles,
    Star,
    Ticket,
    X,
} from "lucide-react";

import {
    useNavigate,
} from "react-router-dom";

import {
    useAppContext,
} from "../context/AppContext";


// ============================================================
// GENRES
// ============================================================

const GENRES = [
    {
        id: "all",
        name: "All",
    },
    {
        id: 28,
        name: "Action",
    },
    {
        id: 12,
        name: "Adventure",
    },
    {
        id: 16,
        name: "Animation",
    },
    {
        id: 35,
        name: "Comedy",
    },
    {
        id: 80,
        name: "Crime",
    },
    {
        id: 18,
        name: "Drama",
    },
    {
        id: 27,
        name: "Horror",
    },
    {
        id: 10749,
        name: "Romance",
    },
    {
        id: 878,
        name: "Sci-Fi",
    },
    {
        id: 53,
        name: "Thriller",
    },
];


// ============================================================
// DATE FORMAT
// ============================================================

const formatDate = (
    date
) => {

    if (!date) {
        return "Coming Soon";
    }

    const parsedDate =
        new Date(date);

    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {
        return "Coming Soon";
    }

    return parsedDate.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric",
        }
    );
};


// ============================================================
// YEAR
// ============================================================

const getYear = (
    date
) => {

    if (!date) {
        return "";
    }

    const parsedDate =
        new Date(date);

    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {
        return "";
    }

    return parsedDate.getFullYear();

};


// ============================================================
// GENRE NAMES
// ============================================================

const getGenreNames = (
    movie
) => {

    if (
        !Array.isArray(
            movie?.genres
        )
    ) {

        return [];

    }


    return movie.genres
        .map(
            (genre) => {

                if (
                    typeof genre ===
                    "string"
                ) {

                    return genre;

                }

                return genre?.name;

            }
        )
        .filter(Boolean);

};


// ============================================================
// IMAGE URL
// ============================================================

const getImage = (
    movie,
    imageBaseUrl,
    type = "poster"
) => {

    const path =
        type === "backdrop"
            ? movie?.backdrop_path
            : movie?.poster_path;


    if (!path) {
        return null;
    }


    if (
        path.startsWith(
            "http"
        )
    ) {

        return path;

    }


    return `${imageBaseUrl}${path}`;

};


// ============================================================
// MOVIE CARD
// ============================================================

const MovieCard = ({
    movie,
    imageBaseUrl,
    navigate,
}) => {

    const poster =
        getImage(
            movie,
            imageBaseUrl,
            "poster"
        );


    const genres =
        getGenreNames(
            movie
        );


    return (

        <article
            className="
                group
                overflow-hidden
                rounded-2xl
                border
                border-white/10
                bg-white/[0.035]
                transition-all
                duration-500
                hover:-translate-y-2
                hover:border-red-500/30
                hover:bg-white/[0.055]
                hover:shadow-[0_20px_60px_rgba(239,68,68,0.14)]
            "
        >

            {/* POSTER */}

            <div
                className="
                    relative
                    aspect-[2/3]
                    overflow-hidden
                    bg-zinc-900
                "
            >

                {poster ? (

                    <img
                        src={poster}
                        alt={
                            movie.title ||
                            "Movie"
                        }
                        className="
                            h-full
                            w-full
                            object-cover
                            transition-transform
                            duration-700
                            group-hover:scale-110
                        "
                    />

                ) : (

                    <div
                        className="
                            flex
                            h-full
                            items-center
                            justify-center
                            bg-gradient-to-br
                            from-zinc-900
                            via-red-950/20
                            to-pink-950/20
                        "
                    >

                        <Film
                            size={42}
                            className="
                                text-zinc-700
                            "
                        />

                    </div>

                )}


                {/* IMAGE OVERLAY */}

                <div
                    className="
                        absolute
                        inset-0
                        bg-gradient-to-t
                        from-black
                        via-transparent
                        to-transparent
                    "
                />


                {/* NEW */}

                <div
                    className="
                        absolute
                        left-3
                        top-3
                        rounded-full
                        bg-red-500
                        px-3
                        py-1
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-wider
                        text-white
                        shadow-lg
                    "
                >
                    New
                </div>


                {/* RATING */}

                <div
                    className="
                        absolute
                        right-3
                        top-3
                        flex
                        items-center
                        gap-1
                        rounded-full
                        border
                        border-white/10
                        bg-black/70
                        px-2.5
                        py-1
                        text-[10px]
                        text-white
                        backdrop-blur-md
                    "
                >

                    <Star
                        size={11}
                        className="
                            fill-yellow-400
                            text-yellow-400
                        "
                    />

                    {Number(
                        movie.vote_average ||
                        0
                    ).toFixed(1)}

                </div>


                {/* PLAY BUTTON */}

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            `/movies/${movie.id || movie._id}`
                        )
                    }
                    className="
                        absolute
                        left-1/2
                        top-1/2
                        flex
                        h-12
                        w-12
                        -translate-x-1/2
                        -translate-y-1/2
                        scale-75
                        items-center
                        justify-center
                        rounded-full
                        bg-red-500
                        text-white
                        opacity-0
                        shadow-[0_0_35px_rgba(239,68,68,0.45)]
                        transition-all
                        duration-300
                        group-hover:scale-100
                        group-hover:opacity-100
                    "
                >

                    <Play
                        size={18}
                        fill="currentColor"
                        className="ml-0.5"
                    />

                </button>

            </div>


            {/* INFORMATION */}

            <div className="p-4">

                <div
                    className="
                        flex
                        items-start
                        justify-between
                        gap-3
                    "
                >

                    <h3
                        className="
                            line-clamp-1
                            text-sm
                            font-semibold
                            text-white
                        "
                    >
                        {
                            movie.title
                        }
                    </h3>


                    <span
                        className="
                            shrink-0
                            text-[10px]
                            text-zinc-600
                        "
                    >
                        {getYear(
                            movie.release_date
                        )}
                    </span>

                </div>


                <div
                    className="
                        mt-3
                        flex
                        min-h-[22px]
                        flex-wrap
                        gap-1.5
                    "
                >

                    {genres
                        .slice(0, 2)
                        .map(
                            (
                                genre
                            ) => (

                                <span
                                    key={
                                        genre
                                    }
                                    className="
                                        rounded-full
                                        bg-white/[0.06]
                                        px-2
                                        py-1
                                        text-[9px]
                                        text-zinc-400
                                    "
                                >
                                    {
                                        genre
                                    }
                                </span>

                            )
                        )}

                </div>


                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            `/movies/${movie.id || movie._id}`
                        )
                    }
                    className="
                        mt-4
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-white/10
                        bg-white/[0.035]
                        py-2.5
                        text-xs
                        font-medium
                        text-zinc-300
                        transition
                        hover:border-red-500/30
                        hover:bg-red-500/10
                        hover:text-white
                    "
                >

                    View Movie

                    <ArrowRight
                        size={13}
                    />

                </button>

            </div>

        </article>

    );

};


// ============================================================
// FEATURED MOVIE
// ============================================================

const FeaturedMovie = ({
    movie,
    imageBaseUrl,
    navigate,
}) => {

    if (!movie) {
        return null;
    }


    const backdrop =
        getImage(
            movie,
            imageBaseUrl,
            "backdrop"
        );


    const poster =
        getImage(
            movie,
            imageBaseUrl,
            "poster"
        );


    const genres =
        getGenreNames(
            movie
        );


    const movieId =
        movie.id ||
        movie._id;


    return (

        <section
            className="
                relative
                mx-auto
                max-w-7xl
                overflow-hidden
                rounded-[28px]
                border
                border-white/10
                bg-zinc-950
            "
        >

            {/* BACKDROP */}

            {backdrop && (

                <img
                    src={backdrop}
                    alt=""
                    className="
                        absolute
                        inset-0
                        h-full
                        w-full
                        object-cover
                        opacity-30
                    "
                />

            )}


            {/* OVERLAY */}

            <div
                className="
                    absolute
                    inset-0
                    bg-gradient-to-r
                    from-black
                    via-black/90
                    to-black/30
                "
            />

            <div
                className="
                    absolute
                    inset-0
                    bg-gradient-to-t
                    from-black
                    to-transparent
                "
            />


            {/* CONTENT */}

            <div
                className="
                    relative
                    grid
                    min-h-[500px]
                    items-center
                    gap-10
                    p-7
                    sm:p-10
                    lg:grid-cols-[1fr_260px]
                    lg:p-14
                "
            >

                {/* LEFT */}

                <div
                    className="
                        max-w-2xl
                    "
                >

                    <div
                        className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            border
                            border-red-500/20
                            bg-red-500/10
                            px-4
                            py-2
                            text-[9px]
                            font-bold
                            uppercase
                            tracking-[0.22em]
                            text-red-400
                        "
                    >

                        <Sparkles
                            size={12}
                        />

                        Drop of the Week

                    </div>


                    <h1
                        className="
                            mt-5
                            text-4xl
                            font-black
                            tracking-tight
                            text-white
                            sm:text-5xl
                            lg:text-6xl
                        "
                    >
                        {
                            movie.title
                        }
                    </h1>


                    {/* META */}

                    <div
                        className="
                            mt-5
                            flex
                            flex-wrap
                            items-center
                            gap-3
                            text-xs
                            text-zinc-300
                        "
                    >

                        <span
                            className="
                                flex
                                items-center
                                gap-1.5
                            "
                        >

                            <Star
                                size={14}
                                className="
                                    fill-yellow-400
                                    text-yellow-400
                                "
                            />

                            {Number(
                                movie.vote_average ||
                                0
                            ).toFixed(1)}

                        </span>


                        <span
                            className="text-zinc-600"
                        >
                            •
                        </span>


                        <span>
                            {
                                getYear(
                                    movie.release_date
                                )
                            }
                        </span>


                        {movie.runtime && (

                            <>

                                <span
                                    className="text-zinc-600"
                                >
                                    •
                                </span>

                                <span
                                    className="
                                        flex
                                        items-center
                                        gap-1.5
                                    "
                                >

                                    <Clock3
                                        size={13}
                                    />

                                    {
                                        movie.runtime
                                    }{" "}
                                    min

                                </span>

                            </>

                        )}

                    </div>


                    {/* GENRES */}

                    <div
                        className="
                            mt-4
                            flex
                            flex-wrap
                            gap-2
                        "
                    >

                        {genres
                            .slice(0, 4)
                            .map(
                                (
                                    genre
                                ) => (

                                    <span
                                        key={
                                            genre
                                        }
                                        className="
                                            rounded-full
                                            border
                                            border-white/10
                                            bg-white/[0.05]
                                            px-3
                                            py-1.5
                                            text-[10px]
                                            text-zinc-300
                                        "
                                    >
                                        {
                                            genre
                                        }
                                    </span>

                                )
                            )}

                    </div>


                    {/* OVERVIEW */}

                    <p
                        className="
                            mt-6
                            line-clamp-3
                            max-w-xl
                            text-sm
                            leading-7
                            text-zinc-400
                        "
                    >
                        {movie.overview ||
                            "Discover this latest cinematic experience with GENZSHOW."}
                    </p>


                    {/* BUTTON */}

                    <div
                        className="
                            mt-8
                            flex
                            flex-wrap
                            gap-3
                        "
                    >

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    `/movies/${movieId}`
                                )
                            }
                            className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-xl
                                bg-red-500
                                px-5
                                py-3
                                text-sm
                                font-semibold
                                text-white
                                shadow-[0_10px_35px_rgba(239,68,68,0.25)]
                                transition
                                hover:bg-red-400
                            "
                        >

                            <Ticket
                                size={17}
                            />

                            Explore Movie

                        </button>

                    </div>

                </div>


                {/* POSTER */}

                {poster && (

                    <div
                        className="
                            hidden
                            lg:block
                        "
                    >

                        <div
                            className="
                                overflow-hidden
                                rounded-2xl
                                border
                                border-white/10
                                shadow-2xl
                            "
                        >

                            <img
                                src={poster}
                                alt={
                                    movie.title
                                }
                                className="
                                    aspect-[2/3]
                                    w-full
                                    object-cover
                                "
                            />

                        </div>

                    </div>

                )}

            </div>

        </section>

    );

};


// ============================================================
// MAIN RELEASE PAGE
// ============================================================

const Releases = () => {

    const navigate =
        useNavigate();


    const {
        axios,
        image_base_url,
    } =
        useAppContext();


    const [
        movies,
        setMovies,
    ] = useState([]);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        error,
        setError,
    ] = useState("");


    const [
        search,
        setSearch,
    ] = useState("");


    const [
        activeGenre,
        setActiveGenre,
    ] = useState(
        "All"
    );


    // ========================================================
    // FETCH TMDB RELEASES
    // ========================================================

    useEffect(() => {

        let mounted =
            true;


        const fetchReleases =
            async () => {

                try {

                    setLoading(
                        true
                    );

                    setError("");


                    const response =
                        await axios.get(
                            "/api/show/now-playing"
                        );


                    if (
                        response.data
                            ?.success
                    ) {

                        if (
                            mounted
                        ) {

                            setMovies(
                                response.data
                                    .movies ||
                                []
                            );

                        }

                    } else {

                        if (
                            mounted
                        ) {

                            setMovies(
                                []
                            );

                            setError(
                                "Unable to load releases."
                            );

                        }

                    }

                } catch (
                    requestError
                ) {

                    console.error(
                        "RELEASES FETCH ERROR:",
                        requestError
                    );


                    if (
                        mounted
                    ) {

                        setMovies(
                            []
                        );

                        setError(
                            "Unable to load releases. Please check your server."
                        );

                    }

                } finally {

                    if (
                        mounted
                    ) {

                        setLoading(
                            false
                        );

                    }

                }

            };


        fetchReleases();


        return () => {

            mounted =
                false;

        };

    }, [axios]);


    // ========================================================
    // FILTER MOVIES
    // ========================================================

    const filteredMovies =
        useMemo(() => {

            return movies.filter(
                (movie) => {

                    const title =
                        (
                            movie?.title ||
                            ""
                        )
                            .toLowerCase();


                    const matchesSearch =
                        title.includes(
                            search
                                .trim()
                                .toLowerCase()
                        );


                    if (
                        !matchesSearch
                    ) {

                        return false;

                    }


                    if (
                        activeGenre ===
                        "All"
                    ) {

                        return true;

                    }


                    const genreId =
                        GENRES.find(
                            (genre) =>
                                genre.name ===
                                activeGenre
                        )?.id;


                    if (
                        !genreId ||
                        genreId ===
                            "all"
                    ) {

                        return true;

                    }


                    return (
                        movie?.genre_ids ||
                        []
                    ).includes(
                        genreId
                    );

                }
            );

        }, [
            movies,
            search,
            activeGenre,
        ]);


    // ========================================================
    // FEATURED
    // ========================================================

    const featuredMovie =
        filteredMovies[0] ||
        null;


    // ========================================================
    // MOVIE LIST
    // ========================================================

    const releaseMovies =
        filteredMovies.slice(
            1
        );


    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {

        return (

            <main
                className="
                    min-h-screen
                    bg-[#08080b]
                    px-5
                    pb-24
                    pt-28
                "
            >

                <div
                    className="
                        mx-auto
                        max-w-7xl
                    "
                >

                    <div
                        className="
                            h-10
                            w-64
                            animate-pulse
                            rounded-lg
                            bg-white/[0.06]
                        "
                    />

                    <div
                        className="
                            mt-4
                            h-5
                            w-96
                            max-w-full
                            animate-pulse
                            rounded
                            bg-white/[0.04]
                        "
                    />


                    <div
                        className="
                            mt-10
                            h-[500px]
                            animate-pulse
                            rounded-[28px]
                            bg-white/[0.04]
                        "
                    />

                </div>

            </main>

        );

    }


    // ========================================================
    // MAIN UI
    // ========================================================

    return (

        <main
            className="
                min-h-screen
                overflow-hidden
                bg-[#08080b]
                pb-24
                text-white
            "
        >

            {/* =================================================
                BACKGROUND GLOW
            ================================================= */}

            <div
                className="
                    pointer-events-none
                    fixed
                    inset-0
                    overflow-hidden
                "
            >

                <div
                    className="
                        absolute
                        -left-40
                        top-20
                        h-96
                        w-96
                        rounded-full
                        bg-red-600/10
                        blur-[120px]
                    "
                />

                <div
                    className="
                        absolute
                        -right-40
                        top-[40%]
                        h-96
                        w-96
                        rounded-full
                        bg-pink-600/10
                        blur-[120px]
                    "
                />

            </div>


            {/* =================================================
                HEADER
            ================================================= */}

            <section
                className="
                    relative
                    mx-auto
                    max-w-7xl
                    px-5
                    pb-10
                    pt-28
                    sm:px-8
                    lg:px-10
                "
            >

                <div
                    className="
                        flex
                        flex-col
                        gap-7
                        lg:flex-row
                        lg:items-end
                        lg:justify-between
                    "
                >

                    <div>

                        <div
                            className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-full
                                border
                                border-red-500/20
                                bg-red-500/10
                                px-3
                                py-1.5
                                text-[9px]
                                font-bold
                                uppercase
                                tracking-[0.2em]
                                text-red-400
                            "
                        >

                            <Sparkles
                                size={12}
                            />

                            Fresh Releases

                        </div>


                        <h1
                            className="
                                mt-4
                                text-4xl
                                font-black
                                tracking-tight
                                sm:text-5xl
                                lg:text-6xl
                            "
                        >

                            New{" "}

                            <span
                                className="
                                    bg-gradient-to-r
                                    from-red-400
                                    via-pink-500
                                    to-red-400
                                    bg-clip-text
                                    text-transparent
                                "
                            >
                                Releases
                            </span>

                        </h1>


                        <p
                            className="
                                mt-4
                                max-w-xl
                                text-sm
                                leading-6
                                text-zinc-500
                                sm:text-base
                            "
                        >
                            Discover the latest
                            movies hitting
                            cinemas and find
                            your next big-screen
                            experience.
                        </p>

                    </div>


                    {/* SEARCH */}

                    <div
                        className="
                            relative
                            w-full
                            lg:max-w-sm
                        "
                    >

                        <Search
                            size={17}
                            className="
                                absolute
                                left-4
                                top-1/2
                                -translate-y-1/2
                                text-zinc-500
                            "
                        />


                        <input
                            type="text"
                            value={
                                search
                            }
                            onChange={(
                                event
                            ) =>
                                setSearch(
                                    event
                                        .target
                                        .value
                                )
                            }
                            placeholder="Search new releases..."
                            className="
                                h-12
                                w-full
                                rounded-xl
                                border
                                border-white/10
                                bg-white/[0.04]
                                pl-11
                                pr-10
                                text-sm
                                text-white
                                outline-none
                                placeholder:text-zinc-600
                                transition
                                focus:border-red-500/40
                                focus:bg-white/[0.06]
                            "
                        />


                        {search && (

                            <button
                                type="button"
                                onClick={() =>
                                    setSearch(
                                        ""
                                    )
                                }
                                className="
                                    absolute
                                    right-3
                                    top-1/2
                                    -translate-y-1/2
                                    rounded-lg
                                    p-1.5
                                    text-zinc-500
                                    hover:bg-white/10
                                    hover:text-white
                                "
                            >

                                <X
                                    size={15}
                                />

                            </button>

                        )}

                    </div>

                </div>


                {/* =================================================
                    GENRE FILTERS
                ================================================= */}

                <div
                    className="
                        mt-8
                        flex
                        gap-2
                        overflow-x-auto
                        pb-1
                    "
                >

                    {GENRES.map(
                        (genre) => {

                            const active =
                                activeGenre ===
                                genre.name;


                            return (

                                <button
                                    key={
                                        genre.id
                                    }
                                    type="button"
                                    onClick={() =>
                                        setActiveGenre(
                                            genre.name
                                        )
                                    }
                                    className={`
                                        shrink-0
                                        rounded-full
                                        border
                                        px-4
                                        py-2
                                        text-xs
                                        font-medium
                                        transition-all
                                        ${
                                            active
                                                ? "border-red-500 bg-red-500 text-white"
                                                : "border-white/10 bg-white/[0.03] text-zinc-500 hover:border-white/20 hover:text-white"
                                        }
                                    `}
                                >
                                    {
                                        genre.name
                                    }
                                </button>

                            );

                        }
                    )}

                </div>

            </section>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div
                    className="
                        relative
                        mx-auto
                        max-w-7xl
                        px-5
                        sm:px-8
                        lg:px-10
                    "
                >

                    <div
                        className="
                            rounded-2xl
                            border
                            border-red-500/20
                            bg-red-500/10
                            p-5
                            text-sm
                            text-red-300
                        "
                    >
                        {error}
                    </div>

                </div>

            )}


            {/* =================================================
                FEATURED
            ================================================= */}

            {featuredMovie && (

                <section
                    className="
                        relative
                        px-5
                        sm:px-8
                        lg:px-10
                    "
                >

                    <FeaturedMovie
                        movie={
                            featuredMovie
                        }
                        imageBaseUrl={
                            image_base_url
                        }
                        navigate={
                            navigate
                        }
                    />

                </section>

            )}


            {/* =================================================
                RELEASE MOVIES
            ================================================= */}

            {releaseMovies.length >
                0 && (

                <section
                    className="
                        relative
                        mx-auto
                        mt-20
                        max-w-7xl
                        px-5
                        sm:px-8
                        lg:px-10
                    "
                >

                    <div
                        className="
                            mb-7
                            flex
                            items-end
                            justify-between
                        "
                    >

                        <div>

                            <p
                                className="
                                    text-[10px]
                                    font-bold
                                    uppercase
                                    tracking-[0.2em]
                                    text-red-400
                                "
                            >
                                Fresh from TMDB
                            </p>


                            <h2
                                className="
                                    mt-2
                                    text-2xl
                                    font-bold
                                    sm:text-3xl
                                "
                            >
                                Latest Releases
                            </h2>

                        </div>


                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/movies"
                                )
                            }
                            className="
                                hidden
                                items-center
                                gap-1
                                text-xs
                                text-zinc-500
                                transition
                                hover:text-white
                                sm:flex
                            "
                        >

                            All Movies

                            <ChevronRight
                                size={15}
                            />

                        </button>

                    </div>


                    <div
                        className="
                            grid
                            grid-cols-2
                            gap-4
                            sm:grid-cols-3
                            lg:grid-cols-4
                            xl:grid-cols-5
                        "
                    >

                        {releaseMovies
                            .map(
                                (
                                    movie
                                ) => (

                                    <MovieCard
                                        key={
                                            movie.id ||
                                            movie._id
                                        }
                                        movie={
                                            movie
                                        }
                                        imageBaseUrl={
                                            image_base_url
                                        }
                                        navigate={
                                            navigate
                                        }
                                    />

                                )
                            )}

                    </div>

                </section>

            )}


            {/* =================================================
                EMPTY
            ================================================= */}

            {!featuredMovie && (

                <section
                    className="
                        relative
                        mx-auto
                        flex
                        max-w-xl
                        flex-col
                        items-center
                        px-6
                        py-28
                        text-center
                    "
                >

                    <div
                        className="
                            flex
                            h-16
                            w-16
                            items-center
                            justify-center
                            rounded-2xl
                            border
                            border-red-500/20
                            bg-red-500/10
                        "
                    >

                        <Film
                            size={28}
                            className="
                                text-red-400
                            "
                        />

                    </div>


                    <h2
                        className="
                            mt-6
                            text-xl
                            font-bold
                        "
                    >
                        No movies found
                    </h2>


                    <p
                        className="
                            mt-2
                            text-sm
                            leading-6
                            text-zinc-500
                        "
                    >
                        Try another search
                        or choose a different
                        genre.
                    </p>


                    <button
                        type="button"
                        onClick={() => {

                            setSearch("");

                            setActiveGenre(
                                "All"
                            );

                        }}
                        className="
                            mt-6
                            rounded-xl
                            bg-red-500
                            px-5
                            py-2.5
                            text-xs
                            font-semibold
                            text-white
                            transition
                            hover:bg-red-400
                        "
                    >
                        Clear Filters
                    </button>

                </section>

            )}


            {/* =================================================
                BOTTOM CTA
            ================================================= */}

            {filteredMovies.length >
                0 && (

                <section
                    className="
                        relative
                        mx-auto
                        mt-24
                        max-w-7xl
                        px-5
                        sm:px-8
                        lg:px-10
                    "
                >

                    <div
                        className="
                            relative
                            overflow-hidden
                            rounded-3xl
                            border
                            border-red-500/15
                            bg-gradient-to-br
                            from-red-500/10
                            via-pink-500/[0.04]
                            to-transparent
                            p-8
                            sm:p-12
                        "
                    >

                        <div
                            className="
                                absolute
                                -right-20
                                -top-20
                                h-64
                                w-64
                                rounded-full
                                bg-red-500/10
                                blur-[80px]
                            "
                        />


                        <div
                            className="
                                relative
                                flex
                                flex-col
                                items-start
                                justify-between
                                gap-6
                                md:flex-row
                                md:items-center
                            "
                        >

                            <div>

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        text-red-400
                                    "
                                >

                                    <Ticket
                                        size={16}
                                    />

                                    <span
                                        className="
                                            text-[10px]
                                            font-bold
                                            uppercase
                                            tracking-[0.2em]
                                        "
                                    >
                                        Your next
                                        movie night
                                    </span>

                                </div>


                                <h2
                                    className="
                                        mt-3
                                        text-2xl
                                        font-bold
                                        sm:text-3xl
                                    "
                                >
                                    Ready for the
                                    big screen?
                                </h2>


                                <p
                                    className="
                                        mt-2
                                        max-w-lg
                                        text-sm
                                        text-zinc-500
                                    "
                                >
                                    Find your movie,
                                    choose a theatre,
                                    pick your seats
                                    and book your
                                    experience.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/movies"
                                    )
                                }
                                className="
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-xl
                                    bg-white
                                    px-5
                                    py-3
                                    text-sm
                                    font-semibold
                                    text-black
                                    transition
                                    hover:bg-zinc-200
                                "
                            >

                                Explore Movies

                                <ArrowRight
                                    size={16}
                                />

                            </button>

                        </div>

                    </div>

                </section>

            )}

        </main>

    );

};


export default Releases;