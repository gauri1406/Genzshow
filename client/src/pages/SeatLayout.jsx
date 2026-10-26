import React, {
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
    useParams,
    useSearchParams,
} from "react-router-dom";

import {
    assets,
} from "../assets/assets";

import Loading from "../components/Loading";

import {
    ArrowRightIcon,
    ClockIcon,
    MapPin,
    CalendarDays,
} from "lucide-react";

import isoTimeFormat from "../lib/isoTimeFormat";

import BlurCircle from "../components/BlurCircle";

import toast from "react-hot-toast";

import {
    useAppContext,
} from "../context/AppContext";


const SeatLayout = () => {

    /* =========================================
       SEAT GROUPS
    ========================================= */

    const groupRows = [
        ["A", "B"],
        ["C", "D"],
        ["E", "F"],
        ["G", "H"],
        ["I", "J"],
    ];


    /* =========================================
       ROUTER
    ========================================= */

    const {
        id,
        date,
    } = useParams();

    const [
        searchParams,
    ] = useSearchParams();

    const navigate = useNavigate();


    /* =========================================
       QUERY PARAMETERS
       
       TheatreDetails sends:
       
       ?showId=XXXX&theatreId=XXXX
    ========================================= */

    const showId =
        searchParams.get("showId");

    const theatreId =
        searchParams.get("theatreId");


    /* =========================================
       CONTEXT
    ========================================= */

    const {
        axios,
        getToken,
        user,
        image_base_url,
    } = useAppContext();


    /* =========================================
       STATE
    ========================================= */

    const [
        movieShow,
        setMovieShow,
    ] = useState(null);

    const [
        theatre,
        setTheatre,
    ] = useState(null);

    const [
        selectedSeats,
        setSelectedSeats,
    ] = useState([]);

    const [
        selectedTime,
        setSelectedTime,
    ] = useState(null);

    const [
        occupiedSeats,
        setOccupiedSeats,
    ] = useState([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        loadingSeats,
        setLoadingSeats,
    ] = useState(false);


    /* =========================================
       FETCH SHOW + THEATRE
    ========================================= */

    const getShowData = async () => {

        try {

            setLoading(true);

            console.log(
                "================================="
            );

            console.log(
                "SEAT LAYOUT INITIALIZATION"
            );

            console.log(
                "MOVIE ID:",
                id
            );

            console.log(
                "DATE:",
                date
            );

            console.log(
                "SHOW ID:",
                showId
            );

            console.log(
                "THEATRE ID:",
                theatreId
            );

            console.log(
                "================================="
            );


            /* ---------------------------------
               Validate exact show
            --------------------------------- */

            if (!showId) {

                toast.error(
                    "Show information is missing"
                );

                return;
            }


            /* ---------------------------------
               Get movie shows
            --------------------------------- */

            const {
                data,
            } = await axios.get(
                `/api/show/${id}`,
                {
                    params: {
                        theatreId,
                    },
                }
            );


            console.log(
                "SHOW API RESPONSE:",
                data
            );


            if (!data.success) {

                toast.error(
                    data.message ||
                    "Failed to load show"
                );

                return;
            }


            setMovieShow(data);


            /* ---------------------------------
               Find exact show
            --------------------------------- */

            const dateShows =
                data.dateTime?.[date] || [];


            console.log(
                "SHOWS FOR DATE:",
                dateShows
            );


            const exactShow =
                dateShows.find(
                    (item) =>
                        String(
                            item.showId
                        ) === String(showId)
                );


            console.log(
                "EXACT SHOW:",
                exactShow
            );


            if (!exactShow) {

                toast.error(
                    "This show is no longer available"
                );

                return;
            }


            setSelectedTime(
                exactShow
            );


            /* ---------------------------------
               Get theatre
            --------------------------------- */

            if (theatreId) {

                const theatreResponse =
                    await axios.get(
                        `/api/theatre/${theatreId}`
                    );


                console.log(
                    "THEATRE RESPONSE:",
                    theatreResponse.data
                );


                if (
                    theatreResponse.data.success
                ) {

                    setTheatre(
                        theatreResponse.data.theatre
                    );

                }

            }

        } catch (error) {

            console.error(
                "SEAT LAYOUT ERROR:",
                error
            );

            console.error(
                "SERVER RESPONSE:",
                error.response?.data
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to load show"
            );

        } finally {

            setLoading(false);

        }

    };


    /* =========================================
       FETCH OCCUPIED SEATS
    ========================================= */

    const getOccupiedSeats = async (
        currentShowId
    ) => {

        try {

            setLoadingSeats(true);

            console.log(
                "FETCHING OCCUPIED SEATS"
            );

            console.log(
                "SHOW ID:",
                currentShowId
            );


            const {
                data,
            } = await axios.get(
                `/api/booking/seats/${currentShowId}`
            );


            console.log(
                "SEATS RESPONSE:",
                data
            );


            if (data.success) {

                setOccupiedSeats(
                    data.occupiedSeats || []
                );

            } else {

                toast.error(
                    data.message ||
                    "Failed to load seats"
                );

            }

        } catch (error) {

            console.error(
                "OCCUPIED SEATS ERROR:",
                error
            );

            console.error(
                "SERVER RESPONSE:",
                error.response?.data
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to load seats"
            );

        } finally {

            setLoadingSeats(false);

        }

    };


    /* =========================================
       INITIAL LOAD
    ========================================= */

    useEffect(() => {

        getShowData();

    }, [
        id,
        date,
        showId,
        theatreId,
    ]);


    /* =========================================
       LOAD OCCUPIED SEATS
    ========================================= */

    useEffect(() => {

        if (selectedTime?.showId) {

            getOccupiedSeats(
                selectedTime.showId
            );

        }

    }, [
        selectedTime,
    ]);


    /* =========================================
       SEAT CLICK
    ========================================= */

    const handleSeatClick = (
        seatId
    ) => {

        /* ---------------------------------
           Make sure exact show exists
        --------------------------------- */

        if (!selectedTime) {

            toast.error(
                "Please select a showtime first"
            );

            return;
        }


        /* ---------------------------------
           Already occupied
        --------------------------------- */

        if (
            occupiedSeats.includes(
                seatId
            )
        ) {

            toast.error(
                "This seat is already booked"
            );

            return;
        }


        /* ---------------------------------
           Maximum 5 seats
        --------------------------------- */

        if (
            !selectedSeats.includes(
                seatId
            ) &&
            selectedSeats.length >= 5
        ) {

            toast.error(
                "You can only select 5 seats"
            );

            return;
        }


        /* ---------------------------------
           Toggle seat
        --------------------------------- */

        setSelectedSeats(
            (previousSeats) =>
                previousSeats.includes(
                    seatId
                )
                    ? previousSeats.filter(
                        (seat) =>
                            seat !== seatId
                    )
                    : [
                        ...previousSeats,
                        seatId,
                    ]
        );

    };


    /* =========================================
       RENDER SEATS
    ========================================= */

    const renderSeats = (
        row,
        count = 9
    ) => (

        <div
            key={row}
            className="
                flex
                gap-2
                mt-2
            "
        >

            <div
                className="
                    flex
                    flex-wrap
                    items-center
                    justify-center
                    gap-2
                "
            >

                {Array.from(
                    {
                        length: count,
                    },
                    (_, index) => {

                        const seatId =
                            `${row}${index + 1}`;

                        const isSelected =
                            selectedSeats.includes(
                                seatId
                            );

                        const isOccupied =
                            occupiedSeats.includes(
                                seatId
                            );


                        return (

                            <button
                                key={seatId}
                                type="button"
                                disabled={
                                    isOccupied ||
                                    loadingSeats
                                }
                                onClick={() =>
                                    handleSeatClick(
                                        seatId
                                    )
                                }
                                className={`
                                    h-8
                                    w-8
                                    rounded
                                    border
                                    text-[10px]
                                    transition
                                    ${
                                        isOccupied
                                            ? `
                                                border-gray-700
                                                bg-gray-700
                                                text-gray-500
                                                cursor-not-allowed
                                            `
                                            : isSelected
                                                ? `
                                                    bg-primary
                                                    border-primary
                                                    text-white
                                                `
                                                : `
                                                    border-primary/60
                                                    text-gray-300
                                                    hover:bg-primary/20
                                                    cursor-pointer
                                                `
                                    }
                                `}
                            >

                                {seatId}

                            </button>

                        );

                    }
                )}

            </div>

        </div>

    );


    /* =========================================
       BOOK TICKETS
    ========================================= */

    const bookTickets = async () => {

        try {

            /* ---------------------------------
               Login check
            --------------------------------- */

            if (!user) {

                toast.error(
                    "Please login to proceed"
                );

                return;
            }


            /* ---------------------------------
               Exact show check
            --------------------------------- */

            if (!selectedTime?.showId) {

                toast.error(
                    "Please select a showtime"
                );

                return;
            }


            /* ---------------------------------
               Seat check
            --------------------------------- */

            if (
                selectedSeats.length === 0
            ) {

                toast.error(
                    "Please select at least one seat"
                );

                return;
            }


            /* ---------------------------------
               Maximum seats
            --------------------------------- */

            if (
                selectedSeats.length > 5
            ) {

                toast.error(
                    "You can only select 5 seats"
                );

                return;
            }


            console.log(
                "================================="
            );

            console.log(
                "CREATING BOOKING"
            );

            console.log(
                "SHOW ID:",
                selectedTime.showId
            );

            console.log(
                "THEATRE ID:",
                theatreId
            );

            console.log(
                "SELECTED SEATS:",
                selectedSeats
            );

            console.log(
                "================================="
            );


            /* ---------------------------------
               Create booking
            --------------------------------- */

            const token =
                await getToken();


            const {
                data,
            } = await axios.post(
                "/api/booking/create",
                {
                    showId:
                        selectedTime.showId,

                    selectedSeats,
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );


            console.log(
                "BOOKING RESPONSE:",
                data
            );


            if (data.success) {

                window.location.href =
                    data.url;

            } else {

                toast.error(
                    data.message ||
                    "Booking failed"
                );

            }

        } catch (error) {

            console.error(
                "BOOKING ERROR:",
                error
            );

            console.error(
                "SERVER RESPONSE:",
                error.response?.data
            );

            toast.error(
                error.response?.data?.message ||
                error.message ||
                "Booking failed"
            );

        }

    };


    /* =========================================
       LOADING
    ========================================= */

    if (loading) {

        return <Loading />;

    }


    /* =========================================
       INVALID SHOW
    ========================================= */

    if (
        !movieShow ||
        !selectedTime
    ) {

        return (

            <div
                className="
                    min-h-screen
                    flex
                    flex-col
                    items-center
                    justify-center
                    text-center
                    px-6
                "
            >

                <h1
                    className="
                        text-2xl
                        font-semibold
                    "
                >
                    Show Not Found
                </h1>

                <p
                    className="
                        text-gray-500
                        mt-2
                    "
                >
                    This show may no longer
                    be available.
                </p>

                <button
                    onClick={() =>
                        navigate(
                            theatreId
                                ? `/theatres/${theatreId}`
                                : "/theatres"
                        )
                    }
                    className="
                        mt-6
                        bg-primary
                        px-6
                        py-3
                        rounded-full
                        font-medium
                    "
                >
                    Back to Theatre
                </button>

            </div>

        );

    }


    /* =========================================
       MOVIE
    ========================================= */

    const movie =
        movieShow.movie;


    /* =========================================
       MAIN UI
    ========================================= */

    return (

        <div
            className="
                min-h-screen
                flex
                flex-col
                md:flex-row
                px-6
                md:px-16
                lg:px-40
                py-30
                md:pt-50
                gap-8
            "
        >

            {/* =================================
                LEFT SIDEBAR
            ================================= */}

            <div
                className="
                    w-full
                    md:w-72
                    bg-primary/10
                    border
                    border-primary/20
                    rounded-lg
                    py-7
                    h-max
                    md:sticky
                    md:top-30
                "
            >

                {/* MOVIE INFO */}

                <div
                    className="
                        px-6
                        pb-6
                        border-b
                        border-primary/10
                    "
                >

                    {movie?.poster_path && (

                        <img
                            src={
                                image_base_url +
                                movie.poster_path
                            }
                            alt={
                                movie.title ||
                                "Movie"
                            }
                            className="
                                w-20
                                h-28
                                rounded-lg
                                object-cover
                                mb-4
                            "
                        />

                    )}

                    <h2
                        className="
                            text-lg
                            font-semibold
                        "
                    >
                        {movie?.title ||
                            "Movie"}
                    </h2>

                </div>


                {/* THEATRE INFO */}

                {theatre && (

                    <div
                        className="
                            px-6
                            py-5
                            border-b
                            border-primary/10
                        "
                    >

                        <div
                            className="
                                flex
                                items-start
                                gap-2
                            "
                        >

                            <MapPin
                                className="
                                    w-4
                                    h-4
                                    text-primary
                                    mt-1
                                    shrink-0
                                "
                            />

                            <div>

                                <p
                                    className="
                                        text-sm
                                        font-medium
                                    "
                                >
                                    {theatre.name}
                                </p>

                                <p
                                    className="
                                        text-xs
                                        text-gray-500
                                        mt-1
                                    "
                                >
                                    {theatre.city}
                                </p>

                            </div>

                        </div>

                    </div>

                )}


                {/* DATE */}

                <div
                    className="
                        px-6
                        py-5
                        border-b
                        border-primary/10
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-2
                        "
                    >

                        <CalendarDays
                            className="
                                w-4
                                h-4
                                text-primary
                            "
                        />

                        <p
                            className="
                                text-sm
                                font-medium
                            "
                        >
                            {new Date(
                                `${date}T00:00:00`
                            ).toLocaleDateString(
                                "en-IN",
                                {
                                    weekday:
                                        "short",

                                    day:
                                        "numeric",

                                    month:
                                        "short",

                                    year:
                                        "numeric",
                                }
                            )}
                        </p>

                    </div>

                </div>


                {/* AVAILABLE TIMINGS */}

                <div
                    className="
                        pt-5
                    "
                >

                    <p
                        className="
                            text-lg
                            font-semibold
                            px-6
                        "
                    >
                        Available Timings
                    </p>


                    <div
                        className="
                            mt-5
                            space-y-1
                        "
                    >

                        {(movieShow.dateTime?.[date] ||
                            []).map(
                            (item) => {

                                const isCurrent =
                                    String(
                                        item.showId
                                    ) ===
                                    String(
                                        showId
                                    );


                                return (

                                    <div
                                        key={
                                            item.showId
                                        }
                                        onClick={() => {

                                            if (
                                                isCurrent
                                            ) {
                                                return;
                                            }

                                            navigate(
                                                `/movies/${id}/${date}?showId=${item.showId}&theatreId=${theatreId}`
                                            );

                                        }}
                                        className={`
                                            flex
                                            items-center
                                            gap-2
                                            px-6
                                            py-2
                                            w-full
                                            cursor-pointer
                                            transition
                                            ${
                                                isCurrent
                                                    ? `
                                                        bg-primary
                                                        text-white
                                                    `
                                                    : `
                                                        hover:bg-primary/20
                                                    `
                                            }
                                        `}
                                    >

                                        <ClockIcon
                                            className="
                                                w-4
                                                h-4
                                            "
                                        />

                                        <p
                                            className="
                                                text-sm
                                            "
                                        >
                                            {isoTimeFormat(
                                                item.time
                                            )}
                                        </p>

                                    </div>

                                );

                            }
                        )}

                    </div>

                </div>

            </div>


            {/* =================================
                SEAT AREA
            ================================= */}

            <div
                className="
                    relative
                    flex-1
                    flex
                    flex-col
                    items-center
                    max-md:mt-8
                "
            >

                <BlurCircle
                    top="-100px"
                    left="-100px"
                />

                <BlurCircle
                    bottom="0"
                    right="0"
                />


                {/* TITLE */}

                <h1
                    className="
                        text-2xl
                        font-semibold
                        mb-4
                    "
                >
                    Select your seat
                </h1>


                {/* SCREEN */}

                <img
                    src={assets.screenImage}
                    alt="screen"
                />

                <p
                    className="
                        text-gray-400
                        text-sm
                        mb-6
                    "
                >
                    SCREEN SIDE
                </p>


                {/* SEAT LEGEND */}

                <div
                    className="
                        flex
                        items-center
                        justify-center
                        gap-6
                        text-xs
                        text-gray-400
                        mb-4
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-2
                        "
                    >

                        <div
                            className="
                                w-4
                                h-4
                                border
                                border-primary/60
                                rounded
                            "
                        />

                        Available

                    </div>


                    <div
                        className="
                            flex
                            items-center
                            gap-2
                        "
                    >

                        <div
                            className="
                                w-4
                                h-4
                                bg-primary
                                rounded
                            "
                        />

                        Selected

                    </div>


                    <div
                        className="
                            flex
                            items-center
                            gap-2
                        "
                    >

                        <div
                            className="
                                w-4
                                h-4
                                bg-gray-700
                                rounded
                            "
                        />

                        Booked

                    </div>

                </div>


                {/* SEATS */}

                <div
                    className="
                        flex
                        flex-col
                        items-center
                        mt-10
                        text-xs
                        text-gray-300
                    "
                >

                    {/* FIRST GROUP */}

                    <div
                        className="
                            grid
                            grid-cols-2
                            md:grid-cols-1
                            gap-8
                            md:gap-2
                            mb-6
                        "
                    >

                        {groupRows[0].map(
                            (row) =>
                                renderSeats(row)
                        )}

                    </div>


                    {/* REMAINING GROUPS */}

                    <div
                        className="
                            grid
                            grid-cols-2
                            gap-11
                        "
                    >

                        {groupRows
                            .slice(1)
                            .map(
                                (
                                    group,
                                    index
                                ) => (

                                    <div
                                        key={index}
                                    >

                                        {group.map(
                                            (row) =>
                                                renderSeats(
                                                    row
                                                )
                                        )}

                                    </div>

                                )
                            )}

                    </div>

                </div>


                {/* SELECTED SEATS */}

                {selectedSeats.length > 0 && (

                    <div
                        className="
                            mt-8
                            text-center
                        "
                    >

                        <p
                            className="
                                text-sm
                                text-gray-400
                            "
                        >
                            Selected Seats
                        </p>

                        <p
                            className="
                                text-primary
                                font-semibold
                                mt-1
                            "
                        >
                            {selectedSeats.join(
                                ", "
                            )}
                        </p>

                    </div>

                )}


                {/* CHECKOUT */}

                <button
                    onClick={bookTickets}
                    disabled={
                        !selectedSeats.length ||
                        loadingSeats
                    }
                    className="
                        flex
                        items-center
                        gap-1
                        mt-12
                        px-10
                        py-3
                        text-sm
                        bg-primary
                        hover:bg-primary-dull
                        transition
                        rounded-full
                        font-medium
                        cursor-pointer
                        active:scale-95
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                    "
                >

                    {loadingSeats
                        ? "Loading Seats..."
                        : "Proceed to Checkout"}

                    <ArrowRightIcon
                        strokeWidth={3}
                        className="
                            w-4
                            h-4
                        "
                    />

                </button>

            </div>

        </div>

    );

};


export default SeatLayout;