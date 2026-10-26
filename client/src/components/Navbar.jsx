import React, {
    useState,
} from "react";

import {
    Link,
    useNavigate,
    useLocation,
} from "react-router-dom";

import {
    MenuIcon,
    SearchIcon,
    TicketPlus,
    XIcon,
} from "lucide-react";

import {
    useClerk,
    UserButton,
    useUser,
} from "@clerk/clerk-react";

import {
    useAppContext,
} from "../context/AppContext";


const Navbar = () => {

    const [
        isOpen,
        setIsOpen,
    ] = useState(false);

    const {
        user,
    } = useUser();

    const {
        openSignIn,
    } = useClerk();

    const navigate =
        useNavigate();

    const location =
        useLocation();

    const {
        favoriteMovies = [],
    } = useAppContext();


    // =========================================================
    // CLOSE MOBILE MENU
    // =========================================================

    const closeMenu = () => {

        window.scrollTo(
            0,
            0
        );

        setIsOpen(false);

    };


    // =========================================================
    // ACTIVE ROUTE
    // =========================================================

    const isActive = (
        path
    ) => {

        if (
            path === "/"
        ) {
            return (
                location.pathname ===
                "/"
            );
        }

        return location.pathname.startsWith(
            path
        );

    };


    // =========================================================
    // NAV LINK STYLE
    // =========================================================

    const navLinkClass = (
        path
    ) => {

        const active =
            isActive(path);

        return `
            relative
            transition-all
            duration-300
            ${
                active
                    ? "text-white"
                    : "text-zinc-400 hover:text-white"
            }
        `;

    };


    return (

        <header
            className="
                fixed
                left-0
                top-0
                z-50
                w-full
                px-6
                py-5
                md:px-16
                lg:px-36
            "
        >

            <div
                className="
                    flex
                    items-center
                    justify-between
                "
            >

                {/* =================================================
                    GENZSHOW WRITTEN LOGO
                ================================================= */}

                <Link
                    to="/"
                    className="
                        relative
                        z-[60]
                        max-md:flex-1
                    "
                    onClick={
                        closeMenu
                    }
                >

                    <span
                        className="
                            text-2xl
                            font-extrabold
                            tracking-tight
                            text-red-500
                            transition
                            hover:text-red-400
                            md:text-3xl
                        "
                    >
                        GenZShow
                    </span>

                </Link>


                {/* =================================================
                    NAVIGATION
                ================================================= */}

                <nav
                    className={`
                        z-50
                        flex
                        flex-col
                        items-center
                        gap-8
                        overflow-hidden
                        bg-black/80
                        py-3
                        backdrop-blur-xl
                        transition-[width]
                        duration-300

                        md:flex-row
                        md:border
                        md:border-white/10
                        md:rounded-full
                        md:bg-white/[0.06]
                        md:px-8

                        max-md:absolute
                        max-md:left-0
                        max-md:top-0
                        max-md:h-screen
                        max-md:justify-center
                        max-md:text-lg
                        max-md:font-medium

                        ${
                            isOpen
                                ? "max-md:w-full"
                                : "max-md:w-0"
                        }
                    `}
                >

                    {/* =================================================
                        MOBILE CLOSE BUTTON
                    ================================================= */}

                    <XIcon
                        className="
                            absolute
                            right-6
                            top-6
                            h-6
                            w-6
                            cursor-pointer
                            text-zinc-400
                            transition
                            hover:text-white
                            md:hidden
                        "
                        onClick={() =>
                            setIsOpen(
                                false
                            )
                        }
                    />


                    {/* =================================================
                        HOME
                    ================================================= */}

                    <Link
                        to="/"
                        onClick={
                            closeMenu
                        }
                        className={`
                            ${navLinkClass(
                                "/"
                            )}
                        `}
                    >

                        Home

                        {isActive(
                            "/"
                        ) && (

                            <span
                                className="
                                    absolute
                                    -bottom-2
                                    left-1/2
                                    h-1
                                    w-1
                                    -translate-x-1/2
                                    rounded-full
                                    bg-red-500
                                    shadow-[0_0_10px_rgba(239,68,68,0.8)]
                                "
                            />

                        )}

                    </Link>


                    {/* =================================================
                        MOVIES
                    ================================================= */}

                    <Link
                        to="/movies"
                        onClick={
                            closeMenu
                        }
                        className={`
                            ${navLinkClass(
                                "/movies"
                            )}
                        `}
                    >

                        Movies

                        {isActive(
                            "/movies"
                        ) && (

                            <span
                                className="
                                    absolute
                                    -bottom-2
                                    left-1/2
                                    h-1
                                    w-1
                                    -translate-x-1/2
                                    rounded-full
                                    bg-red-500
                                    shadow-[0_0_10px_rgba(239,68,68,0.8)]
                                "
                            />

                        )}

                    </Link>


                    {/* =================================================
                        GENZ AI
                    ================================================= */}

                    <Link
                        to="/genz-ai"
                        onClick={
                            closeMenu
                        }
                        className={`
                            ${navLinkClass(
                                "/genz-ai"
                            )}
                        `}
                    >

                        <span className="flex items-center gap-1.5">

                            GenZ AI

                            <span
                                className="
                                    rounded-full
                                    border
                                    border-red-500/20
                                    bg-red-500/10
                                    px-1.5
                                    py-0.5
                                    text-[7px]
                                    font-bold
                                    uppercase
                                    tracking-wider
                                    text-red-400
                                "
                            >
                                AI
                            </span>

                        </span>

                        {isActive(
                            "/genz-ai"
                        ) && (

                            <span
                                className="
                                    absolute
                                    -bottom-2
                                    left-1/2
                                    h-1
                                    w-1
                                    -translate-x-1/2
                                    rounded-full
                                    bg-red-500
                                    shadow-[0_0_10px_rgba(239,68,68,0.8)]
                                "
                            />

                        )}

                    </Link>


                    {/* =================================================
                        THEATRES
                    ================================================= */}

                    <Link
                        to="/theatres"
                        onClick={
                            closeMenu
                        }
                        className={`
                            ${navLinkClass(
                                "/theatres"
                            )}
                        `}
                    >

                        Theatres

                        {isActive(
                            "/theatres"
                        ) && (

                            <span
                                className="
                                    absolute
                                    -bottom-2
                                    left-1/2
                                    h-1
                                    w-1
                                    -translate-x-1/2
                                    rounded-full
                                    bg-red-500
                                    shadow-[0_0_10px_rgba(239,68,68,0.8)]
                                "
                            />

                        )}

                    </Link>


                    {/* =================================================
                        RELEASES
                    ================================================= */}

                    <Link
                        to="/releases"
                        onClick={
                            closeMenu
                        }
                        className={`
                            relative
                            ${navLinkClass(
                                "/releases"
                            )}
                        `}
                    >

                        <span
                            className="
                                flex
                                items-center
                                gap-1.5
                            "
                        >

                            Releases

                            <span
                                className="
                                    rounded-full
                                    border
                                    border-red-500/20
                                    bg-red-500/10
                                    px-1.5
                                    py-0.5
                                    text-[7px]
                                    font-bold
                                    uppercase
                                    tracking-wider
                                    text-red-400
                                "
                            >
                                New
                            </span>

                        </span>


                        {isActive(
                            "/releases"
                        ) && (

                            <span
                                className="
                                    absolute
                                    -bottom-2
                                    left-1/2
                                    h-1
                                    w-1
                                    -translate-x-1/2
                                    rounded-full
                                    bg-red-500
                                    shadow-[0_0_10px_rgba(239,68,68,0.8)]
                                "
                            />

                        )}

                    </Link>


                    {/* =================================================
                        FAVORITES
                    ================================================= */}

                    {favoriteMovies.length >
                        0 && (

                        <Link
                            to="/favorite"
                            onClick={
                                closeMenu
                            }
                            className={`
                                ${navLinkClass(
                                    "/favorite"
                                )}
                            `}
                        >

                            Favorites

                            {isActive(
                                "/favorite"
                            ) && (

                                <span
                                    className="
                                        absolute
                                        -bottom-2
                                        left-1/2
                                        h-1
                                        w-1
                                        -translate-x-1/2
                                        rounded-full
                                        bg-red-500
                                        shadow-[0_0_10px_rgba(239,68,68,0.8)]
                                    "
                                />

                            )}

                        </Link>

                    )}

                </nav>


                {/* =================================================
                    RIGHT SIDE
                ================================================= */}

                <div
                    className="
                        flex
                        items-center
                        gap-5
                        md:gap-8
                    "
                >

                    {/* =================================================
                        SEARCH
                    ================================================= */}

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/movies"
                            )
                        }
                        className="
                            hidden
                            cursor-pointer
                            text-zinc-300
                            transition
                            hover:text-white
                            md:block
                        "
                        aria-label="Search movies"
                    >

                        <SearchIcon
                            className="
                                h-6
                                w-6
                            "
                        />

                    </button>


                    {/* =================================================
                        AUTH
                    ================================================= */}

                    {!user ? (

                        <button
                            type="button"
                            onClick={
                                openSignIn
                            }
                            className="
                                rounded-full
                                bg-red-500
                                px-4
                                py-1.5
                                font-medium
                                text-white
                                transition
                                hover:bg-red-400
                                sm:px-7
                                sm:py-2
                            "
                        >
                            Login
                        </button>

                    ) : (

                        <UserButton>

                            <UserButton.MenuItems>

                                <UserButton.Action
                                    label="My Bookings"
                                    labelIcon={
                                        <TicketPlus
                                            width={
                                                15
                                            }
                                        />
                                    }
                                    onClick={() =>
                                        navigate(
                                            "/my-bookings"
                                        )
                                    }
                                />

                            </UserButton.MenuItems>

                        </UserButton>

                    )}

                </div>


                {/* =================================================
                    MOBILE MENU BUTTON
                ================================================= */}

                <button
                    type="button"
                    className="
                        ml-4
                        text-white
                        md:hidden
                    "
                    onClick={() =>
                        setIsOpen(
                            !isOpen
                        )
                    }
                    aria-label="Toggle menu"
                >

                    {isOpen ? (

                        <XIcon
                            className="
                                h-7
                                w-7
                            "
                        />

                    ) : (

                        <MenuIcon
                            className="
                                h-8
                                w-8
                            "
                        />

                    )}

                </button>

            </div>

        </header>

    );

};


export default Navbar;