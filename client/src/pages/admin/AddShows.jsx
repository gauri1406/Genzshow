import React, { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import {
    CheckIcon,
    DeleteIcon,
    StarIcon,
    MapPin,
} from "lucide-react";
import { kConverter } from "../../lib/kConverter";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const AddShows = () => {
    const {
        axios,
        getToken,
        user,
        image_base_url,
    } = useAppContext();

    const currency = import.meta.env.VITE_CURRENCY;

    const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
    const [theatres, setTheatres] = useState([]);

    const [selectedMovie, setSelectedMovie] = useState(null);
    const [selectedTheatre, setSelectedTheatre] = useState("");

    const [dateTimeSelection, setDateTimeSelection] = useState({});
    const [dateTimeInput, setDateTimeInput] = useState("");
    const [showPrice, setShowPrice] = useState("");

    const [loadingMovies, setLoadingMovies] = useState(true);
    const [loadingTheatres, setLoadingTheatres] = useState(true);
    const [addingShow, setAddingShow] = useState(false);

    // =========================================================
    // FETCH NOW PLAYING MOVIES
    // =========================================================

    const fetchNowPlayingMovies = async () => {
        try {
            setLoadingMovies(true);

            const token = await getToken();

            const { data } = await axios.get(
                "/api/show/now-playing",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (data.success) {
                setNowPlayingMovies(data.movies || []);
            } else {
                toast.error(
                    data.message || "Failed to fetch movies"
                );
            }
        } catch (error) {
            console.error(
                "FETCH MOVIES ERROR:",
                error
            );

            console.error(
                "SERVER RESPONSE:",
                error.response?.data
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to fetch movies"
            );
        } finally {
            setLoadingMovies(false);
        }
    };

    // =========================================================
    // FETCH THEATRES FROM MONGODB
    // =========================================================

    const fetchTheatres = async () => {
        try {
            setLoadingTheatres(true);

            const { data } = await axios.get(
                "/api/theatre"
            );

            console.log(
                "THEATRES RESPONSE:",
                data
            );

            if (data.success) {
                setTheatres(data.theatres || []);
            } else {
                toast.error(
                    data.message ||
                    "Failed to fetch theatres"
                );
            }
        } catch (error) {
            console.error(
                "FETCH THEATRES ERROR:",
                error
            );

            console.error(
                "SERVER RESPONSE:",
                error.response?.data
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to fetch theatres"
            );
        } finally {
            setLoadingTheatres(false);
        }
    };

    // =========================================================
    // ADD DATE AND TIME
    // =========================================================

    const handleDateTimeAdd = () => {
        if (!dateTimeInput) {
            toast.error(
                "Please select date and time"
            );
            return;
        }

        const [date, time] =
            dateTimeInput.split("T");

        if (!date || !time) {
            toast.error(
                "Invalid date and time"
            );
            return;
        }

        setDateTimeSelection((prev) => {
            const times =
                prev[date] || [];

            if (times.includes(time)) {
                toast.error(
                    "This time is already selected"
                );

                return prev;
            }

            return {
                ...prev,
                [date]: [
                    ...times,
                    time,
                ],
            };
        });

        setDateTimeInput("");
    };

    // =========================================================
    // REMOVE SELECTED TIME
    // =========================================================

    const handleRemoveTime = (
        date,
        time
    ) => {
        setDateTimeSelection((prev) => {
            const filteredTimes =
                prev[date].filter(
                    (selectedTime) =>
                        selectedTime !== time
                );

            if (
                filteredTimes.length === 0
            ) {
                const {
                    [date]: removedDate,
                    ...rest
                } = prev;

                return rest;
            }

            return {
                ...prev,
                [date]:
                    filteredTimes,
            };
        });
    };

    // =========================================================
    // ADD SHOW
    // =========================================================

    const handleSubmit = async () => {
        try {
            // -------------------------
            // VALIDATION
            // -------------------------

            if (!selectedMovie) {
                toast.error(
                    "Please select a movie"
                );
                return;
            }

            if (!selectedTheatre) {
                toast.error(
                    "Please select a theatre"
                );
                return;
            }

            if (
                Object.keys(
                    dateTimeSelection
                ).length === 0
            ) {
                toast.error(
                    "Please select at least one date and time"
                );
                return;
            }

            if (
                !showPrice ||
                Number(showPrice) <= 0
            ) {
                toast.error(
                    "Please enter a valid show price"
                );
                return;
            }

            setAddingShow(true);

            // -------------------------
            // FORMAT SHOW INPUT
            // -------------------------

            const showsInput =
                Object.entries(
                    dateTimeSelection
                ).map(
                    ([date, times]) => ({
                        date,
                        time: times,
                    })
                );

            // -------------------------
            // FINAL PAYLOAD
            // -------------------------

            const payload = {
                movieId:
                    selectedMovie,

                theatreId:
                    selectedTheatre,

                showsInput,

                showPrice:
                    Number(showPrice),
            };

            console.log(
                "ADD SHOW PAYLOAD:",
                payload
            );

            // -------------------------
            // GET CLERK TOKEN
            // -------------------------

            const token =
                await getToken();

            if (!token) {
                toast.error(
                    "Authentication token not found"
                );

                return;
            }

            // -------------------------
            // SEND TO BACKEND
            // -------------------------

            const { data } =
                await axios.post(
                    "/api/show/add",
                    payload,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );

            console.log(
                "ADD SHOW RESPONSE:",
                data
            );

            // -------------------------
            // SUCCESS
            // -------------------------

            if (data.success) {
                toast.success(
                    data.message ||
                    "Show added successfully"
                );

                // Clear form
                setSelectedMovie(null);
                setSelectedTheatre("");
                setDateTimeSelection({});
                setDateTimeInput("");
                setShowPrice("");
            } else {
                toast.error(
                    data.message ||
                    "Failed to add show"
                );
            }
        } catch (error) {
            console.error(
                "ADD SHOW ERROR:",
                error
            );

            console.error(
                "STATUS:",
                error.response?.status
            );

            console.error(
                "SERVER RESPONSE:",
                error.response?.data
            );

            toast.error(
                error.response?.data?.message ||
                "An error occurred while adding the show"
            );
        } finally {
            setAddingShow(false);
        }
    };

    // =========================================================
    // FETCH DATA
    // =========================================================

    useEffect(() => {
        if (user) {
            fetchNowPlayingMovies();
            fetchTheatres();
        }
    }, [user]);

    // =========================================================
    // LOADING
    // =========================================================

    if (
        loadingMovies ||
        loadingTheatres
    ) {
        return <Loading />;
    }

    // =========================================================
    // UI
    // =========================================================

    return (
        <>
            <Title
                text1="Add"
                text2="Shows"
            />

            {/* =================================================
                THEATRE SELECTION
            ================================================= */}

            <div className="mt-10">
                <p className="text-lg font-medium mb-3">
                    Select Theatre
                </p>

                <div className="max-w-xl">
                    <div className="
                        flex
                        items-center
                        gap-3
                        border
                        border-gray-600
                        rounded-lg
                        px-4
                        py-3
                        bg-gray-900/40
                    ">
                        <MapPin
                            className="
                                w-5
                                h-5
                                text-primary
                                shrink-0
                            "
                        />

                        <select
                            value={
                                selectedTheatre
                            }
                            onChange={(e) =>
                                setSelectedTheatre(
                                    e.target.value
                                )
                            }
                            className="
                                w-full
                                bg-transparent
                                outline-none
                                text-white
                                cursor-pointer
                            "
                        >
                            <option
                                value=""
                                className="bg-gray-900"
                            >
                                Select a theatre
                            </option>

                            {theatres.map(
                                (theatre) => (
                                    <option
                                        key={
                                            theatre._id
                                        }
                                        value={
                                            theatre._id
                                        }
                                        className="bg-gray-900"
                                    >
                                        {theatre.name}
                                        {" — "}
                                        {theatre.city}
                                        {" — "}
                                        {theatre.theatreChain ||
                                            theatre.type}
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    {theatres.length === 0 && (
                        <p className="
                            text-sm
                            text-red-400
                            mt-2
                        ">
                            No theatres found in
                            MongoDB.
                        </p>
                    )}

                    {selectedTheatre && (
                        <div className="
                            mt-3
                            border
                            border-primary/30
                            bg-primary/5
                            rounded-lg
                            p-3
                            text-sm
                        ">
                            {(() => {
                                const theatre =
                                    theatres.find(
                                        (item) =>
                                            item._id ===
                                            selectedTheatre
                                    );

                                if (!theatre) {
                                    return null;
                                }

                                return (
                                    <>
                                        <p className="
                                            font-medium
                                            text-white
                                        ">
                                            {theatre.name}
                                        </p>

                                        <p className="
                                            text-gray-400
                                            mt-1
                                        ">
                                            {theatre.city}
                                            {" • "}
                                            {theatre.type}
                                            {" • "}
                                            {theatre.screens}
                                            {" screens"}
                                        </p>

                                        {theatre.theatreChain && (
                                            <p className="
                                                text-gray-500
                                                mt-1
                                            ">
                                                {
                                                    theatre.theatreChain
                                                }
                                            </p>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    )}
                </div>
            </div>

            {/* =================================================
                NOW PLAYING MOVIES
            ================================================= */}

            <p className="
                mt-10
                text-lg
                font-medium
            ">
                Now Playing Movies
            </p>

            <div className="
                overflow-x-auto
                pb-4
            ">
                <div className="
                    group
                    flex
                    flex-wrap
                    gap-4
                    mt-4
                    w-max
                ">
                    {nowPlayingMovies.map(
                        (movie) => (
                            <div
                                key={movie.id}
                                className="
                                    relative
                                    max-w-40
                                    cursor-pointer
                                    group-hover:not-hover:opacity-40
                                    hover:-translate-y-1
                                    transition
                                    duration-300
                                "
                                onClick={() =>
                                    setSelectedMovie(
                                        movie.id
                                    )
                                }
                            >
                                {/* Movie Image */}

                                <div className="
                                    relative
                                    rounded-lg
                                    overflow-hidden
                                ">
                                    <img
                                        src={
                                            image_base_url +
                                            movie.poster_path
                                        }
                                        alt={
                                            movie.title
                                        }
                                        className="
                                            w-full
                                            object-cover
                                            brightness-90
                                        "
                                    />

                                    {/* Rating */}

                                    <div className="
                                        text-sm
                                        flex
                                        items-center
                                        justify-between
                                        p-2
                                        bg-black/70
                                        w-full
                                        absolute
                                        bottom-0
                                        left-0
                                    ">
                                        <p className="
                                            flex
                                            items-center
                                            gap-1
                                            text-gray-400
                                        ">
                                            <StarIcon
                                                className="
                                                    w-4
                                                    h-4
                                                    text-primary
                                                    fill-primary
                                                "
                                            />

                                            {movie.vote_average?.toFixed(
                                                1
                                            )}
                                        </p>

                                        <p className="
                                            text-gray-300
                                        ">
                                            {kConverter(
                                                movie.vote_count
                                            )}{" "}
                                            Votes
                                        </p>
                                    </div>
                                </div>

                                {/* Selected */}

                                {selectedMovie ===
                                    movie.id && (
                                    <div className="
                                        absolute
                                        top-2
                                        right-2
                                        flex
                                        items-center
                                        justify-center
                                        bg-primary
                                        h-6
                                        w-6
                                        rounded
                                    ">
                                        <CheckIcon
                                            className="
                                                w-4
                                                h-4
                                                text-white
                                            "
                                            strokeWidth={
                                                2.5
                                            }
                                        />
                                    </div>
                                )}

                                <p className="
                                    font-medium
                                    truncate
                                ">
                                    {movie.title}
                                </p>

                                <p className="
                                    text-gray-400
                                    text-sm
                                ">
                                    {movie.release_date}
                                </p>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* =================================================
                SHOW PRICE
            ================================================= */}

            <div className="mt-8">
                <label className="
                    block
                    text-sm
                    font-medium
                    mb-2
                ">
                    Show Price
                </label>

                <div className="
                    inline-flex
                    items-center
                    gap-2
                    border
                    border-gray-600
                    px-3
                    py-2
                    rounded-md
                ">
                    <p className="
                        text-gray-400
                        text-sm
                    ">
                        {currency}
                    </p>

                    <input
                        min="0"
                        type="number"
                        value={showPrice}
                        onChange={(e) =>
                            setShowPrice(
                                e.target.value
                            )
                        }
                        placeholder="Enter show price"
                        className="
                            outline-none
                            bg-transparent
                        "
                    />
                </div>
            </div>

            {/* =================================================
                DATE & TIME
            ================================================= */}

            <div className="mt-6">
                <label className="
                    block
                    text-sm
                    font-medium
                    mb-2
                ">
                    Select Date and Time
                </label>

                <div className="
                    inline-flex
                    gap-5
                    border
                    border-gray-600
                    p-1
                    pl-3
                    rounded-lg
                ">
                    <input
                        type="datetime-local"
                        value={
                            dateTimeInput
                        }
                        onChange={(e) =>
                            setDateTimeInput(
                                e.target.value
                            )
                        }
                        className="
                            outline-none
                            rounded-md
                            bg-transparent
                        "
                    />

                    <button
                        type="button"
                        onClick={
                            handleDateTimeAdd
                        }
                        className="
                            bg-primary/80
                            text-white
                            px-3
                            py-2
                            text-sm
                            rounded-lg
                            hover:bg-primary
                            cursor-pointer
                        "
                    >
                        Add Time
                    </button>
                </div>
            </div>

            {/* =================================================
                SELECTED DATE TIME
            ================================================= */}

            {Object.keys(
                dateTimeSelection
            ).length > 0 && (
                <div className="mt-6">
                    <h2 className="mb-2">
                        Selected Date-Time
                    </h2>

                    <ul className="space-y-3">
                        {Object.entries(
                            dateTimeSelection
                        ).map(
                            ([
                                date,
                                times,
                            ]) => (
                                <li
                                    key={date}
                                >
                                    <div className="
                                        font-medium
                                    ">
                                        {date}
                                    </div>

                                    <div className="
                                        flex
                                        flex-wrap
                                        gap-2
                                        mt-1
                                        text-sm
                                    ">
                                        {times.map(
                                            (
                                                time
                                            ) => (
                                                <div
                                                    key={
                                                        time
                                                    }
                                                    className="
                                                        border
                                                        border-primary
                                                        px-2
                                                        py-1
                                                        flex
                                                        items-center
                                                        rounded
                                                    "
                                                >
                                                    <span>
                                                        {
                                                            time
                                                        }
                                                    </span>

                                                    <DeleteIcon
                                                        onClick={() =>
                                                            handleRemoveTime(
                                                                date,
                                                                time
                                                            )
                                                        }
                                                        width={
                                                            15
                                                        }
                                                        className="
                                                            ml-2
                                                            text-red-500
                                                            hover:text-red-700
                                                            cursor-pointer
                                                        "
                                                    />
                                                </div>
                                            )
                                        )}
                                    </div>
                                </li>
                            )
                        )}
                    </ul>
                </div>
            )}

            {/* =================================================
                ADD SHOW BUTTON
            ================================================= */}

            <button
                type="button"
                onClick={
                    handleSubmit
                }
                disabled={
                    addingShow
                }
                className={`
                    bg-primary
                    text-white
                    px-8
                    py-2
                    mt-6
                    rounded
                    hover:bg-primary/90
                    transition-all
                    ${
                        addingShow
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                    }
                `}
            >
                {addingShow
                    ? "Adding..."
                    : "Add Show"}
            </button>
        </>
    );
};

export default AddShows;