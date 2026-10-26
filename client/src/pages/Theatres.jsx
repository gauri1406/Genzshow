import React, { useEffect, useMemo, useState } from "react";

import {
    MapPin,
    Search,
    Navigation,
    ChevronDown,
    SlidersHorizontal,
    Ticket,
    Heart,
    X,
    Armchair,
    MonitorPlay,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useAppContext } from "../context/AppContext";

import Loading from "../components/Loading";

import toast from "react-hot-toast";


const Theatres = () => {

    const navigate = useNavigate();

    const { axios } = useAppContext();


    const [theatres, setTheatres] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [location, setLocation] =
        useState("All Cities");

    const [sort, setSort] =
        useState("Recommended");

    const [showFilters, setShowFilters] =
        useState(false);

    const [selectedType, setSelectedType] =
        useState("All");

    const [selectedChain, setSelectedChain] =
        useState("All Chains");


    // --------------------------------------------------
    // FETCH THEATRES
    // --------------------------------------------------

    const fetchTheatres = async () => {

        try {

            setLoading(true);

            console.log("=================================");
            console.log("FETCHING THEATRES");
            console.log("=================================");

            const response =
                await axios.get("/api/theatre");

            console.log(
                "THEATRE API RESPONSE:",
                response.data
            );

            if (response.data.success) {

                const theatreData =
                    response.data.theatres || [];

                console.log(
                    "THEATRES RECEIVED:",
                    theatreData.length
                );

                console.log(
                    "FIRST THEATRE:",
                    theatreData[0]
                );

                setTheatres(theatreData);

            } else {

                toast.error(
                    response.data.message ||
                    "Failed to load theatres"
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
                "Unable to load theatres"
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        fetchTheatres();

    }, []);


    // --------------------------------------------------
    // CITIES
    // --------------------------------------------------

    const cities = useMemo(() => {

        const citySet = new Set();

        theatres.forEach((theatre) => {

            if (theatre.city) {

                citySet.add(
                    theatre.city.trim()
                );

            }

        });

        return [
            "All Cities",
            ...Array.from(citySet).sort(),
        ];

    }, [theatres]);


    // --------------------------------------------------
    // THEATRE CHAINS
    // --------------------------------------------------

    const chains = useMemo(() => {

        const chainSet = new Set();

        theatres.forEach((theatre) => {

            if (
                theatre.theatreChain &&
                theatre.theatreChain.trim()
            ) {

                chainSet.add(
                    theatre.theatreChain.trim()
                );

            }

        });

        return [
            "All Chains",
            ...Array.from(chainSet).sort(),
        ];

    }, [theatres]);


    // --------------------------------------------------
    // FILTER + SORT
    // --------------------------------------------------

    const filteredTheatres = useMemo(() => {

        let result = [...theatres];

        const searchValue =
            search.trim().toLowerCase();


        if (searchValue) {

            result = result.filter((theatre) => {

                const name =
                    theatre.name?.toLowerCase() || "";

                const city =
                    theatre.city?.toLowerCase() || "";

                const chain =
                    theatre.theatreChain
                        ?.toLowerCase() || "";

                return (
                    name.includes(searchValue) ||
                    city.includes(searchValue) ||
                    chain.includes(searchValue)
                );

            });

        }


        if (location !== "All Cities") {

            result = result.filter(
                (theatre) =>
                    theatre.city?.toLowerCase() ===
                    location.toLowerCase()
            );

        }


        if (selectedType !== "All") {

            result = result.filter(
                (theatre) =>
                    theatre.type === selectedType
            );

        }


        if (selectedChain !== "All Chains") {

            result = result.filter(
                (theatre) =>
                    theatre.theatreChain ===
                    selectedChain
            );

        }


        // Sorting

        if (sort === "Name") {

            result.sort((a, b) =>
                (a.name || "").localeCompare(
                    b.name || ""
                )
            );

        }


        if (sort === "City") {

            result.sort((a, b) =>
                (a.city || "").localeCompare(
                    b.city || ""
                )
            );

        }


        if (sort === "Screens") {

            result.sort(
                (a, b) =>
                    (b.screens || 0) -
                    (a.screens || 0)
            );

        }


        if (sort === "Ticket Price") {

            result.sort(
                (a, b) =>
                    (a.averageTicketPrice || 0) -
                    (b.averageTicketPrice || 0)
            );

        }


        return result;

    }, [
        theatres,
        search,
        location,
        selectedType,
        selectedChain,
        sort,
    ]);


    // --------------------------------------------------
    // DIRECTIONS
    // --------------------------------------------------

    const openDirections = (theatre) => {

        const lat =
            theatre?.location?.lat;

        const lon =
            theatre?.location?.lon;


        if (
            typeof lat === "number" &&
            typeof lon === "number"
        ) {

            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`,
                "_blank"
            );

        } else {

            const query =
                encodeURIComponent(
                    `${theatre.name}, ${theatre.city}`
                );

            window.open(
                `https://www.google.com/maps/search/?api=1&query=${query}`,
                "_blank"
            );

        }

    };


    // --------------------------------------------------
    // VIEW SHOWS
    // --------------------------------------------------

    const handleViewShows = (theatre) => {

        console.log(
            "VIEW SHOWS THEATRE:",
            theatre
        );

        console.log(
            "THEATRE ID:",
            theatre?._id
        );


        if (!theatre?._id) {

            toast.error(
                "Theatre ID is missing"
            );

            return;

        }


        navigate(
            `/theatres/${theatre._id}`
        );

    };


    // --------------------------------------------------
    // CLEAR FILTERS
    // --------------------------------------------------

    const clearFilters = () => {

        setSearch("");

        setLocation("All Cities");

        setSelectedType("All");

        setSelectedChain("All Chains");

        setSort("Recommended");

    };


    // --------------------------------------------------
    // LOADING
    // --------------------------------------------------

    if (loading) {

        return <Loading />;

    }


    // --------------------------------------------------
    // PAGE
    // --------------------------------------------------

    return (

        <div className="
            min-h-screen
            bg-[#09090b]
            text-white
        ">


            {/* HEADER */}

            <section className="
                relative
                overflow-hidden
                border-b
                border-white/10
            ">

                <div className="
                    absolute
                    inset-0
                    bg-gradient-to-br
                    from-red-500/10
                    via-transparent
                    to-pink-500/10
                " />


                <div className="
                    relative
                    mx-auto
                    max-w-7xl
                    px-6
                    pb-12
                    pt-32
                    md:px-10
                ">

                    <div className="
                        max-w-3xl
                    ">

                        <div className="
                            mb-4
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            border
                            border-red-500/20
                            bg-red-500/10
                            px-4
                            py-2
                            text-xs
                            font-medium
                            text-red-400
                        ">

                            <MapPin size={14} />

                            Discover Cinemas

                        </div>


                        <h1 className="
                            text-4xl
                            font-bold
                            tracking-tight
                            md:text-5xl
                        ">

                            Find your

                            <span className="
                                ml-2
                                bg-gradient-to-r
                                from-red-400
                                to-pink-500
                                bg-clip-text
                                text-transparent
                            ">
                                theatre
                            </span>

                        </h1>


                        <p className="
                            mt-4
                            max-w-2xl
                            text-sm
                            leading-6
                            text-zinc-400
                            md:text-base
                        ">

                            Explore cinemas and theatres
                            across cities, check available
                            screens, ticket prices and
                            theatre details.

                        </p>

                    </div>

                </div>

            </section>


            {/* MAIN */}

            <main className="
                mx-auto
                max-w-7xl
                px-6
                py-8
                md:px-10
            ">


                {/* SEARCH + FILTER */}

                <div className="
                    flex
                    flex-col
                    gap-4
                    lg:flex-row
                ">


                    {/* SEARCH */}

                    <div className="
                        relative
                        flex-1
                    ">

                        <Search
                            size={19}
                            className="
                                absolute
                                left-4
                                top-1/2
                                -translate-y-1/2
                                text-zinc-500
                            "
                        />


                        <input
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="
                                Search theatre, city or cinema chain...
                            "
                            className="
                                w-full
                                rounded-2xl
                                border
                                border-white/10
                                bg-white/[0.04]
                                py-4
                                pl-12
                                pr-4
                                text-sm
                                outline-none
                                transition
                                placeholder:text-zinc-600
                                focus:border-red-500/50
                            "
                        />

                    </div>


                    {/* CITY */}

                    <div className="
                        relative
                    ">

                        <select
                            value={location}
                            onChange={(e) =>
                                setLocation(
                                    e.target.value
                                )
                            }
                            className="
                                w-full
                                appearance-none
                                rounded-2xl
                                border
                                border-white/10
                                bg-white/[0.04]
                                px-5
                                py-4
                                pr-12
                                text-sm
                                outline-none
                                focus:border-red-500/50
                                lg:w-56
                            "
                        >

                            {cities.map((city) => (

                                <option
                                    key={city}
                                    value={city}
                                    className="
                                        bg-zinc-900
                                    "
                                >
                                    {city}
                                </option>

                            ))}

                        </select>


                        <ChevronDown
                            size={17}
                            className="
                                pointer-events-none
                                absolute
                                right-4
                                top-1/2
                                -translate-y-1/2
                                text-zinc-500
                            "
                        />

                    </div>


                    {/* FILTER BUTTON */}

                    <button
                        onClick={() =>
                            setShowFilters(
                                !showFilters
                            )
                        }
                        className="
                            flex
                            items-center
                            justify-center
                            gap-2
                            rounded-2xl
                            border
                            border-white/10
                            bg-white/[0.04]
                            px-5
                            py-4
                            text-sm
                            transition
                            hover:bg-white/[0.08]
                        "
                    >

                        <SlidersHorizontal
                            size={17}
                        />

                        Filters

                    </button>


                    {/* SORT */}

                    <div className="
                        relative
                    ">

                        <select
                            value={sort}
                            onChange={(e) =>
                                setSort(
                                    e.target.value
                                )
                            }
                            className="
                                w-full
                                appearance-none
                                rounded-2xl
                                border
                                border-white/10
                                bg-white/[0.04]
                                px-5
                                py-4
                                pr-12
                                text-sm
                                outline-none
                                focus:border-red-500/50
                                lg:w-48
                            "
                        >

                            <option
                                className="bg-zinc-900"
                                value="Recommended"
                            >
                                Recommended
                            </option>

                            <option
                                className="bg-zinc-900"
                                value="Name"
                            >
                                Name
                            </option>

                            <option
                                className="bg-zinc-900"
                                value="City"
                            >
                                City
                            </option>

                            <option
                                className="bg-zinc-900"
                                value="Screens"
                            >
                                Most Screens
                            </option>

                            <option
                                className="bg-zinc-900"
                                value="Ticket Price"
                            >
                                Lowest Ticket Price
                            </option>

                        </select>


                        <ChevronDown
                            size={17}
                            className="
                                pointer-events-none
                                absolute
                                right-4
                                top-1/2
                                -translate-y-1/2
                                text-zinc-500
                            "
                        />

                    </div>

                </div>


                {/* FILTER PANEL */}

                {showFilters && (

                    <div className="
                        mt-4
                        rounded-2xl
                        border
                        border-white/10
                        bg-white/[0.03]
                        p-5
                    ">

                        <div className="
                            flex
                            items-center
                            justify-between
                        ">

                            <div>

                                <h3 className="
                                    font-semibold
                                ">
                                    Filters
                                </h3>

                                <p className="
                                    mt-1
                                    text-xs
                                    text-zinc-500
                                ">
                                    Refine theatres using
                                    available database
                                    information.
                                </p>

                            </div>


                            <button
                                onClick={() =>
                                    setShowFilters(false)
                                }
                                className="
                                    rounded-lg
                                    p-2
                                    hover:bg-white/10
                                "
                            >

                                <X size={18} />

                            </button>

                        </div>


                        <div className="
                            mt-5
                            grid
                            gap-5
                            md:grid-cols-2
                        ">


                            {/* TYPE */}

                            <div>

                                <p className="
                                    mb-3
                                    text-sm
                                    font-medium
                                    text-zinc-300
                                ">
                                    Theatre Type
                                </p>


                                <div className="
                                    flex
                                    flex-wrap
                                    gap-2
                                ">

                                    {[
                                        "All",
                                        "Multiplex",
                                        "Single Screen",
                                    ].map((type) => (

                                        <button
                                            key={type}
                                            onClick={() =>
                                                setSelectedType(
                                                    type
                                                )
                                            }
                                            className={`
                                                rounded-xl
                                                px-4
                                                py-2
                                                text-xs
                                                font-medium
                                                transition
                                                ${
                                                    selectedType === type
                                                        ? "bg-red-500 text-white"
                                                        : "bg-white/[0.05] text-zinc-400 hover:bg-white/[0.1]"
                                                }
                                            `}
                                        >
                                            {type}
                                        </button>

                                    ))}

                                </div>

                            </div>


                            {/* CHAIN */}

                            <div>

                                <p className="
                                    mb-3
                                    text-sm
                                    font-medium
                                    text-zinc-300
                                ">
                                    Cinema Chain
                                </p>


                                <div className="
                                    flex
                                    flex-wrap
                                    gap-2
                                ">

                                    {chains
                                        .slice(0, 12)
                                        .map((chain) => (

                                            <button
                                                key={chain}
                                                onClick={() =>
                                                    setSelectedChain(
                                                        chain
                                                    )
                                                }
                                                className={`
                                                    rounded-xl
                                                    px-4
                                                    py-2
                                                    text-xs
                                                    font-medium
                                                    transition
                                                    ${
                                                        selectedChain === chain
                                                            ? "bg-red-500 text-white"
                                                            : "bg-white/[0.05] text-zinc-400 hover:bg-white/[0.1]"
                                                    }
                                                `}
                                            >
                                                {chain}
                                            </button>

                                        ))}

                                </div>

                            </div>

                        </div>

                    </div>

                )}


                {/* RESULT HEADER */}

                <div className="
                    mt-10
                    flex
                    flex-col
                    justify-between
                    gap-4
                    sm:flex-row
                    sm:items-center
                ">

                    <div>

                        <h2 className="
                            text-xl
                            font-semibold
                        ">
                            Theatres
                        </h2>

                        <p className="
                            mt-1
                            text-sm
                            text-zinc-500
                        ">
                            {filteredTheatres.length}
                            {" "}
                            theatres found
                        </p>

                    </div>


                    {(search ||
                        location !== "All Cities" ||
                        selectedType !== "All" ||
                        selectedChain !== "All Chains") && (

                        <button
                            onClick={clearFilters}
                            className="
                                flex
                                items-center
                                gap-2
                                self-start
                                rounded-xl
                                border
                                border-white/10
                                px-4
                                py-2
                                text-xs
                                text-zinc-400
                                transition
                                hover:bg-white/[0.05]
                            "
                        >

                            <X size={14} />

                            Clear filters

                        </button>

                    )}

                </div>


                {/* THEATRE GRID */}

                <div className="
                    mt-6
                    grid
                    gap-5
                ">

                    {filteredTheatres.map(
                        (theatre) => (

                            <article
                                key={theatre._id}
                                className="
                                    group
                                    overflow-hidden
                                    rounded-3xl
                                    border
                                    border-white/10
                                    bg-white/[0.025]
                                    transition
                                    hover:border-red-500/30
                                    hover:bg-white/[0.04]
                                "
                            >

                                <div className="
                                    p-5
                                    md:p-6
                                ">


                                    {/* TOP */}

                                    <div className="
                                        flex
                                        flex-col
                                        gap-5
                                        md:flex-row
                                        md:items-start
                                        md:justify-between
                                    ">

                                        <div className="
                                            flex
                                            gap-4
                                        ">


                                            {/* ICON */}

                                            <div className="
                                                flex
                                                h-14
                                                w-14
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-2xl
                                                bg-gradient-to-br
                                                from-red-500/20
                                                to-pink-500/10
                                                text-red-400
                                            ">

                                                <MonitorPlay
                                                    size={25}
                                                />

                                            </div>


                                            {/* INFO */}

                                            <div>

                                                <div className="
                                                    flex
                                                    flex-wrap
                                                    items-center
                                                    gap-2
                                                ">

                                                    <h3 className="
                                                        text-lg
                                                        font-semibold
                                                    ">
                                                        {theatre.name}
                                                    </h3>


                                                    {theatre.theatreChain && (

                                                        <span className="
                                                            rounded-full
                                                            border
                                                            border-white/10
                                                            bg-white/[0.05]
                                                            px-2.5
                                                            py-1
                                                            text-[10px]
                                                            font-medium
                                                            text-zinc-400
                                                        ">
                                                            {
                                                                theatre.theatreChain
                                                            }
                                                        </span>

                                                    )}

                                                </div>


                                                <div className="
                                                    mt-2
                                                    flex
                                                    flex-wrap
                                                    items-center
                                                    gap-x-4
                                                    gap-y-2
                                                    text-sm
                                                    text-zinc-500
                                                ">

                                                    <span className="
                                                        flex
                                                        items-center
                                                        gap-1.5
                                                    ">

                                                        <MapPin
                                                            size={14}
                                                        />

                                                        {theatre.city}

                                                    </span>


                                                    <span className="
                                                        flex
                                                        items-center
                                                        gap-1.5
                                                    ">

                                                        <Armchair
                                                            size={14}
                                                        />

                                                        {
                                                            theatre.totalSeats ||
                                                            0
                                                        }

                                                        {" "}
                                                        seats

                                                    </span>

                                                </div>

                                            </div>

                                        </div>


                                        {/* TYPE */}

                                        <div className="
                                            flex
                                            items-center
                                            gap-2
                                        ">

                                            <span className="
                                                rounded-full
                                                bg-white/[0.05]
                                                px-3
                                                py-1.5
                                                text-xs
                                                text-zinc-400
                                            ">
                                                {
                                                    theatre.type ||
                                                    "Multiplex"
                                                }
                                            </span>


                                            <button
                                                className="
                                                    rounded-xl
                                                    border
                                                    border-white/10
                                                    p-2.5
                                                    text-zinc-500
                                                    transition
                                                    hover:border-red-500/30
                                                    hover:text-red-400
                                                "
                                                title="
                                                    Add to favourites
                                                "
                                            >

                                                <Heart
                                                    size={17}
                                                />

                                            </button>

                                        </div>

                                    </div>


                                    {/* DETAILS */}

                                    <div className="
                                        mt-6
                                        grid
                                        grid-cols-2
                                        gap-3
                                        md:grid-cols-4
                                    ">


                                        <div className="
                                            rounded-2xl
                                            bg-white/[0.035]
                                            p-4
                                        ">

                                            <p className="
                                                text-xs
                                                text-zinc-600
                                            ">
                                                Screens
                                            </p>

                                            <p className="
                                                mt-1
                                                text-lg
                                                font-semibold
                                            ">
                                                {
                                                    theatre.screens ||
                                                    0
                                                }
                                            </p>

                                        </div>


                                        <div className="
                                            rounded-2xl
                                            bg-white/[0.035]
                                            p-4
                                        ">

                                            <p className="
                                                text-xs
                                                text-zinc-600
                                            ">
                                                Seats
                                            </p>

                                            <p className="
                                                mt-1
                                                text-lg
                                                font-semibold
                                            ">
                                                {
                                                    theatre.totalSeats ||
                                                    0
                                                }
                                            </p>

                                        </div>


                                        <div className="
                                            rounded-2xl
                                            bg-white/[0.035]
                                            p-4
                                        ">

                                            <p className="
                                                text-xs
                                                text-zinc-600
                                            ">
                                                Avg. Ticket
                                            </p>

                                            <p className="
                                                mt-1
                                                text-lg
                                                font-semibold
                                            ">
                                                {
                                                    theatre.averageTicketPrice
                                                        ? `₹${Math.round(
                                                            theatre.averageTicketPrice
                                                        )}`
                                                        : "—"
                                                }
                                            </p>

                                        </div>


                                        <div className="
                                            rounded-2xl
                                            bg-white/[0.035]
                                            p-4
                                        ">

                                            <p className="
                                                text-xs
                                                text-zinc-600
                                            ">
                                                Location
                                            </p>

                                            <p className="
                                                mt-1
                                                truncate
                                                text-sm
                                                font-semibold
                                            ">
                                                {
                                                    theatre.city ||
                                                    "—"
                                                }
                                            </p>

                                        </div>

                                    </div>


                                    {/* ACTIONS */}

                                    <div className="
                                        mt-5
                                        flex
                                        flex-col
                                        gap-3
                                        sm:flex-row
                                    ">

                                        <button
                                            onClick={() =>
                                                openDirections(
                                                    theatre
                                                )
                                            }
                                            className="
                                                flex
                                                items-center
                                                justify-center
                                                gap-2
                                                rounded-xl
                                                border
                                                border-white/10
                                                px-5
                                                py-3
                                                text-sm
                                                font-medium
                                                text-zinc-300
                                                transition
                                                hover:bg-white/[0.05]
                                            "
                                        >

                                            <Navigation
                                                size={16}
                                            />

                                            Directions

                                        </button>


                                        <button
                                            onClick={() =>
                                                handleViewShows(
                                                    theatre
                                                )
                                            }
                                            className="
                                                flex
                                                flex-1
                                                items-center
                                                justify-center
                                                gap-2
                                                rounded-xl
                                                bg-red-500
                                                py-3
                                                text-sm
                                                font-semibold
                                                transition
                                                hover:bg-red-600
                                            "
                                        >

                                            <Ticket
                                                size={17}
                                            />

                                            View Shows

                                        </button>

                                    </div>

                                </div>

                            </article>

                        )
                    )}

                </div>


                {/* EMPTY STATE */}

                {filteredTheatres.length === 0 && (

                    <div className="
                        flex
                        min-h-[300px]
                        flex-col
                        items-center
                        justify-center
                        text-center
                    ">

                        <div className="
                            mb-4
                            rounded-full
                            bg-white/[0.05]
                            p-5
                        ">

                            <Search
                                size={30}
                                className="
                                    text-zinc-500
                                "
                            />

                        </div>


                        <h3 className="
                            text-lg
                            font-semibold
                        ">
                            No theatres found
                        </h3>


                        <p className="
                            mt-2
                            max-w-md
                            text-sm
                            text-zinc-500
                        ">
                            Try changing your search
                            or removing some filters.
                        </p>


                        <button
                            onClick={clearFilters}
                            className="
                                mt-5
                                rounded-xl
                                bg-red-500
                                px-5
                                py-3
                                text-sm
                                font-semibold
                                hover:bg-red-600
                            "
                        >
                            Clear Filters
                        </button>

                    </div>

                )}

            </main>

        </div>

    );

};


export default Theatres;