import React from "react";

import {
    Route,
    Routes,
    useLocation,
} from "react-router-dom";

import {
    SignIn,
} from "@clerk/clerk-react";

import {
    Toaster,
} from "react-hot-toast";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Loading from "./components/Loading";

import Home from "./pages/Home";
import Movies from "./pages/Movies";
import MovieDetails from "./pages/MovieDetails";

import Theatres from "./pages/Theatres";
import TheatreDetails from "./pages/TheatreDetails";

import Releases from "./pages/Releases";
import ReleaseDetails from "./pages/ReleaseDetails";

import GenZAI from "./pages/GenZAI";
import MovieDNA from "./pages/MovieDNA";

import SeatLayout from "./pages/SeatLayout";
import MyBookings from "./pages/MyBookings";
import Favorite from "./pages/Favorite";

import Layout from "./pages/admin/Layout";
import Dashboard from "./pages/admin/Dashboard";
import AddShows from "./pages/admin/AddShows";
import ListShows from "./pages/admin/ListShows";
import ListBookings from "./pages/admin/ListBookings";

import {
    useAppContext,
} from "./context/AppContext";


const App = () => {

    const location =
        useLocation();

    const {
        user,
    } = useAppContext();


    const isAdminRoute =
        location.pathname.startsWith(
            "/admin"
        );


    return (
        <>

            {/* =====================================================
                TOAST NOTIFICATIONS
            ===================================================== */}

            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                }}
            />


            {/* =====================================================
                USER NAVBAR
            ===================================================== */}

            {!isAdminRoute && (
                <Navbar />
            )}


            {/* =====================================================
                APPLICATION ROUTES
            ===================================================== */}

            <Routes>


                {/* =================================================
                    HOME
                ================================================= */}

                <Route
                    path="/"
                    element={
                        <Home />
                    }
                />


                {/* =================================================
                    MOVIES
                ================================================= */}

                <Route
                    path="/movies"
                    element={
                        <Movies />
                    }
                />

                <Route
                    path="/movies/:id"
                    element={
                        <MovieDetails />
                    }
                />


                {/* =================================================
                    THEATRES
                ================================================= */}

                <Route
                    path="/theatres"
                    element={
                        <Theatres />
                    }
                />

                <Route
                    path="/theatres/:id"
                    element={
                        <TheatreDetails />
                    }
                />


                {/* =================================================
                    RELEASES
                ================================================= */}

                <Route
                    path="/releases"
                    element={
                        <Releases />
                    }
                />

                <Route
                    path="/releases/:id"
                    element={
                        <ReleaseDetails />
                    }
                />


                {/* =================================================
                    GENZ AI
                ================================================= */}

                <Route
                    path="/genz-ai"
                    element={
                        <GenZAI />
                    }
                />
                <Route
    path="/genz-dna"
    element={<MovieDNA />}
/>


                {/* =================================================
                    SEAT LAYOUT
                ================================================= */}

                <Route
                    path="/movies/:id/:date"
                    element={
                        <SeatLayout />
                    }
                />


                {/* =================================================
                    BOOKINGS
                ================================================= */}

                <Route
                    path="/my-bookings"
                    element={
                        <MyBookings />
                    }
                />


                {/* =================================================
                    FAVORITES
                ================================================= */}

                <Route
                    path="/favorite"
                    element={
                        <Favorite />
                    }
                />


                {/* =================================================
                    LOADING
                ================================================= */}

                <Route
                    path="/loading/:nextUrl"
                    element={
                        <Loading />
                    }
                />


                {/* =================================================
                    ADMIN
                ================================================= */}

                <Route
                    path="/admin/*"
                    element={
                        user ? (
                            <Layout />
                        ) : (
                            <div
                                className="
                                    flex
                                    min-h-screen
                                    items-center
                                    justify-center
                                    bg-black
                                "
                            >
                                <SignIn
                                    fallbackRedirectUrl="/admin"
                                />
                            </div>
                        )
                    }
                >

                    {/* ADMIN DASHBOARD */}

                    <Route
                        index
                        element={
                            <Dashboard />
                        }
                    />


                    {/* ADD SHOWS */}

                    <Route
                        path="add-shows"
                        element={
                            <AddShows />
                        }
                    />


                    {/* LIST SHOWS */}

                    <Route
                        path="list-shows"
                        element={
                            <ListShows />
                        }
                    />


                    {/* LIST BOOKINGS */}

                    <Route
                        path="list-bookings"
                        element={
                            <ListBookings />
                        }
                    />

                </Route>


                {/* =================================================
                    404
                ================================================= */}

                <Route
                    path="*"
                    element={
                        <div
                            className="
                                flex
                                min-h-screen
                                flex-col
                                items-center
                                justify-center
                                bg-[#09090b]
                                px-6
                                text-center
                                text-white
                            "
                        >

                            <h1
                                className="
                                    text-6xl
                                    font-bold
                                    text-red-500
                                "
                            >
                                404
                            </h1>

                            <h2
                                className="
                                    mt-4
                                    text-2xl
                                    font-semibold
                                "
                            >
                                Page Not Found
                            </h2>

                            <p
                                className="
                                    mt-2
                                    text-zinc-500
                                "
                            >
                                The page you're looking
                                for doesn't exist.
                            </p>

                        </div>
                    }
                />

            </Routes>


            {/* =====================================================
                FOOTER
            ===================================================== */}

            {!isAdminRoute && (
                <Footer />
            )}

        </>
    );
};


export default App;