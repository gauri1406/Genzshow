import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    ArrowLeft,
    CalendarDays,
    Clock3,
    MapPin,
    MonitorPlay,
    Navigation,
    Ticket,
} from "lucide-react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import toast from "react-hot-toast";

import { useAppContext } from "../context/AppContext";
import Loading from "../components/Loading";

const TheatreDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        axios,
        image_base_url,
    } = useAppContext();

    const [theatre, setTheatre] = useState(null);
    const [shows, setShows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState("");

    // =========================================================
    // FETCH THEATRE + SHOWS
    // =========================================================

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                console.log("THEATRE ID:", id);

                // Fetch theatre
                const theatreResponse = await axios.get(
                    `/api/theatre/${id}`
                );

                console.log(
                    "THEATRE RESPONSE:",
                    theatreResponse.data
                );

                if (!theatreResponse.data.success) {
                    toast.error(
                        theatreResponse.data.message ||
                        "Theatre not found"
                    );

                    return;
                }

                setTheatre(
                    theatreResponse.data.theatre
                );

                // Fetch shows directly for this theatre
                const showsResponse = await axios.get(
                    `/api/theatre/${id}/shows`
                );

                console.log(
                    "THEATRE SHOWS RESPONSE:",
                    showsResponse.data
                );

                if (showsResponse.data.success) {
                    setShows(
                        showsResponse.data.shows || []
                    );
                }
            } catch (error) {
                console.error(
                    "THEATRE DETAILS ERROR:",
                    error
                );

                console.error(
                    "SERVER RESPONSE:",
                    error.response?.data
                );

                toast.error(
                    error.response?.data?.message ||
                    "Failed to load theatre"
                );
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    // =========================================================
    // AVAILABLE DATES
    // =========================================================

    const availableDates = useMemo(() => {
        return [
            ...new Set(
                shows.map(
                    (show) =>
                        new Date(show.showDateTime)
                            .toISOString()
                            .split("T")[0]
                )
            ),
        ].sort();
    }, [shows]);

    // =========================================================
    // SELECT FIRST DATE
    // =========================================================

    useEffect(() => {
        if (availableDates.length > 0) {
            setSelectedDate((current) => {
                if (
                    current &&
                    availableDates.includes(current)
                ) {
                    return current;
                }

                return availableDates[0];
            });
        }
    }, [availableDates]);

    // =========================================================
    // MOVIES FOR SELECTED DATE
    // =========================================================

    const moviesForDate = useMemo(() => {
        const selectedShows = shows.filter((show) => {
            const date = new Date(
                show.showDateTime
            )
                .toISOString()
                .split("T")[0];

            return date === selectedDate;
        });

        const grouped = {};

        selectedShows.forEach((show) => {
            if (!show.movie) {
                return;
            }

            const movieId = String(
                show.movie._id
            );

            if (!grouped[movieId]) {
                grouped[movieId] = {
                    movie: show.movie,
                    shows: [],
                };
            }

            grouped[movieId].shows.push(show);
        });

        return Object.values(grouped);
    }, [shows, selectedDate]);

    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (date) => {
        return new Date(
            `${date}T00:00:00`
        ).toLocaleDateString(
            "en-IN",
            {
                weekday: "short",
                day: "numeric",
                month: "short",
            }
        );
    };

    // =========================================================
    // FORMAT TIME
    // =========================================================

    const formatTime = (dateTime) => {
        return new Date(
            dateTime
        ).toLocaleTimeString(
            "en-IN",
            {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            }
        );
    };

    // =========================================================
    // DIRECTIONS
    // =========================================================

    const openDirections = () => {
        const lat = theatre?.location?.lat;
        const lon = theatre?.location?.lon;

        if (
            lat === null ||
            lat === undefined ||
            lon === null ||
            lon === undefined
        ) {
            toast.error(
                "Location coordinates unavailable"
            );

            return;
        }

        window.open(
            `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`,
            "_blank"
        );
    };

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return <Loading />;
    }

    // =========================================================
    // THEATRE NOT FOUND
    // =========================================================

    if (!theatre) {
        return (
            <div className="
                min-h-screen
                flex
                flex-col
                items-center
                justify-center
                text-center
                px-5
            ">
                <MapPin className="
                    w-12
                    h-12
                    text-primary
                " />

                <h1 className="
                    text-2xl
                    font-bold
                    mt-4
                ">
                    Theatre not found
                </h1>

                <button
                    onClick={() =>
                        navigate("/theatres")
                    }
                    className="
                        mt-6
                        bg-primary
                        px-6
                        py-2
                        rounded-lg
                    "
                >
                    Back to Theatres
                </button>
            </div>
        );
    }

    // =========================================================
    // MAIN UI
    // =========================================================

    return (
        <div className="
            min-h-screen
            px-4
            md:px-8
            lg:px-16
            py-8
        ">

            {/* BACK */}

            <button
                onClick={() =>
                    navigate("/theatres")
                }
                className="
                    flex
                    items-center
                    gap-2
                    text-gray-400
                    hover:text-white
                    transition
                    mb-7
                "
            >
                <ArrowLeft className="
                    w-5
                    h-5
                " />

                Back to Theatres
            </button>

            {/* =================================================
                THEATRE HEADER
            ================================================= */}

            <div className="
                border
                border-gray-700
                rounded-2xl
                p-6
                bg-gray-900/40
            ">
                <div className="
                    flex
                    flex-col
                    md:flex-row
                    md:items-center
                    md:justify-between
                    gap-5
                ">

                    <div>
                        <div className="
                            flex
                            items-center
                            gap-3
                        ">
                            <div className="
                                w-12
                                h-12
                                rounded-xl
                                bg-primary/15
                                flex
                                items-center
                                justify-center
                            ">
                                <MapPin className="
                                    w-6
                                    h-6
                                    text-primary
                                " />
                            </div>

                            <div>
                                <h1 className="
                                    text-2xl
                                    md:text-3xl
                                    font-bold
                                ">
                                    {theatre.name}
                                </h1>

                                {theatre.theatreChain && (
                                    <p className="
                                        text-gray-400
                                        mt-1
                                    ">
                                        {
                                            theatre.theatreChain
                                        }
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="
                            flex
                            flex-wrap
                            gap-4
                            mt-5
                            text-sm
                            text-gray-400
                        ">
                            <span>
                                📍 {theatre.city}
                            </span>

                            <span>
                                {theatre.type}
                            </span>

                            <span>
                                🎬 {theatre.screens} Screens
                            </span>

                            <span>
                                🎟 ₹
                                {theatre.averageTicketPrice}
                                {" "}avg.
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={openDirections}
                        className="
                            flex
                            items-center
                            justify-center
                            gap-2
                            border
                            border-gray-600
                            hover:border-primary
                            hover:text-primary
                            px-5
                            py-3
                            rounded-xl
                            transition
                        "
                    >
                        <Navigation className="
                            w-5
                            h-5
                        " />

                        Get Directions
                    </button>
                </div>
            </div>

            {/* =================================================
                MOVIES & SHOWTIMES
            ================================================= */}

            <div className="mt-10">

                <h2 className="
                    text-2xl
                    font-semibold
                ">
                    Movies & Showtimes
                </h2>

                <p className="
                    text-gray-500
                    text-sm
                    mt-1
                ">
                    Movies currently scheduled at
                    this theatre
                </p>

                {/* =================================================
                    DATES
                ================================================= */}

                {availableDates.length > 0 && (
                    <div className="
                        mt-6
                        flex
                        flex-wrap
                        items-center
                        gap-3
                    ">
                        <CalendarDays className="
                            w-5
                            h-5
                            text-primary
                        " />

                        {availableDates.map(
                            (date) => (
                                <button
                                    key={date}
                                    onClick={() =>
                                        setSelectedDate(
                                            date
                                        )
                                    }
                                    className={`
                                        px-5
                                        py-2.5
                                        rounded-lg
                                        border
                                        transition
                                        ${
                                            selectedDate === date
                                                ? "bg-primary border-primary text-white"
                                                : "border-gray-700 text-gray-400 hover:border-primary hover:text-white"
                                        }
                                    `}
                                >
                                    {formatDate(date)}
                                </button>
                            )
                        )}
                    </div>
                )}

                {/* =================================================
                    MOVIES
                ================================================= */}

                <div className="mt-7">

                    {moviesForDate.length > 0 ? (
                        <div className="space-y-5">

                            {moviesForDate.map(
                                ({
                                    movie,
                                    shows,
                                }) => (
                                    <div
                                        key={movie._id}
                                        className="
                                            border
                                            border-gray-700
                                            rounded-2xl
                                            p-5
                                            bg-gray-900/30
                                        "
                                    >
                                        <div className="
                                            flex
                                            flex-col
                                            sm:flex-row
                                            gap-5
                                        ">

                                            {/* POSTER */}

                                            <img
                                                src={
                                                    image_base_url +
                                                    movie.poster_path
                                                }
                                                alt={
                                                    movie.title
                                                }
                                                className="
                                                    w-24
                                                    h-36
                                                    rounded-lg
                                                    object-cover
                                                    shrink-0
                                                "
                                            />

                                            {/* INFO */}

                                            <div className="flex-1">

                                                <h3 className="
                                                    text-xl
                                                    font-semibold
                                                ">
                                                    {movie.title}
                                                </h3>

                                                <p className="
                                                    text-gray-500
                                                    text-sm
                                                    mt-1
                                                ">
                                                    {movie.release_date}
                                                </p>

                                                <div className="
                                                    flex
                                                    items-center
                                                    gap-2
                                                    text-gray-400
                                                    text-sm
                                                    mt-4
                                                ">
                                                    <Clock3 className="
                                                        w-4
                                                        h-4
                                                    " />

                                                    Showtimes
                                                </div>

                                                <div className="
                                                    flex
                                                    flex-wrap
                                                    gap-3
                                                    mt-3
                                                ">
                                                    {shows
                                                        .slice()
                                                        .sort(
                                                            (a, b) =>
                                                                new Date(
                                                                    a.showDateTime
                                                                ) -
                                                                new Date(
                                                                    b.showDateTime
                                                                )
                                                        )
                                                        .map(
                                                            (show) => (
                                                                <button
                                                                    key={
                                                                        show._id
                                                                    }
                                                                    onClick={() =>
                                                                        navigate(
                                                                            `/movies/${movie._id}/${selectedDate}?showId=${show._id}&theatreId=${id}`
                                                                        )
                                                                    }
                                                                    className="
                                                                        flex
                                                                        items-center
                                                                        gap-2
                                                                        border
                                                                        border-primary
                                                                        text-primary
                                                                        hover:bg-primary
                                                                        hover:text-white
                                                                        px-4
                                                                        py-2
                                                                        rounded-lg
                                                                        transition
                                                                    "
                                                                >
                                                                    <Clock3 className="
                                                                        w-4
                                                                        h-4
                                                                    " />

                                                                    {formatTime(
                                                                        show.showDateTime
                                                                    )}
                                                                </button>
                                                            )
                                                        )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}

                        </div>
                    ) : (
                        <div className="
                            border
                            border-dashed
                            border-gray-700
                            rounded-2xl
                            p-12
                            text-center
                        ">
                            <MonitorPlay className="
                                w-12
                                h-12
                                mx-auto
                                text-gray-600
                            " />

                            <h3 className="
                                text-lg
                                font-semibold
                                mt-4
                            ">
                                No shows available
                            </h3>

                            <p className="
                                text-gray-500
                                text-sm
                                mt-2
                            ">
                                No movie showtimes have
                                been added to this theatre
                                yet.
                            </p>

                            <p className="
                                text-gray-600
                                text-xs
                                mt-3
                            ">
                                Admin → Add Shows
                            </p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default TheatreDetails;