import { clerkClient } from "@clerk/express";

import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";

// ============================================================
// GET USER BOOKINGS
// ============================================================

export const getUserBookings = async (
    req,
    res
) => {
    try {
        const { userId } =
            req.auth();

        if (!userId) {
            return res.status(401).json({
                success: false,
                message:
                    "Please login to continue.",
            });
        }

        const bookings =
            await Booking.find({
                user: userId,
            })
                .populate({
                    path: "show",
                    populate: [
                        {
                            path: "movie",
                            model: "Movie",
                        },
                        {
                            path: "theatre",
                            model: "Theatre",
                        },
                    ],
                })
                .sort({
                    createdAt: -1,
                });

        return res.json({
            success: true,
            bookings,
        });
    } catch (error) {
        console.error(
            "GET USER BOOKINGS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to get bookings.",
        });
    }
};

// ============================================================
// UPDATE FAVORITE MOVIE
// ============================================================

export const updateFavorite = async (
    req,
    res
) => {
    try {
        const {
            movieId,
        } = req.body;

        const { userId } =
            req.auth();

        if (!userId) {
            return res.status(401).json({
                success: false,
                message:
                    "Please login to continue.",
            });
        }

        if (!movieId) {
            return res.status(400).json({
                success: false,
                message:
                    "Movie ID is required.",
            });
        }

        const user =
            await clerkClient.users.getUser(
                userId
            );

        const currentFavorites =
            Array.isArray(
                user.privateMetadata
                    ?.favorites
            )
                ? user.privateMetadata
                    .favorites
                : [];

        let favorites;

        if (
            currentFavorites.includes(
                movieId
            )
        ) {
            // Remove movie
            favorites =
                currentFavorites.filter(
                    (item) =>
                        item !== movieId
                );
        } else {
            // Add movie
            favorites = [
                ...currentFavorites,
                movieId,
            ];
        }

        await clerkClient.users.updateUserMetadata(
            userId,
            {
                privateMetadata: {
                    ...user.privateMetadata,

                    favorites,
                },
            }
        );

        return res.json({
            success: true,
            message:
                "Favorite movies updated.",
            favorites,
        });
    } catch (error) {
        console.error(
            "UPDATE FAVORITE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to update favorites.",
        });
    }
};

// ============================================================
// GET FAVORITE MOVIES
// ============================================================

export const getFavorites = async (
    req,
    res
) => {
    try {
        const { userId } =
            req.auth();

        if (!userId) {
            return res.status(401).json({
                success: false,
                message:
                    "Please login to continue.",
            });
        }

        const user =
            await clerkClient.users.getUser(
                userId
            );

        const favorites =
            Array.isArray(
                user.privateMetadata
                    ?.favorites
            )
                ? user.privateMetadata
                    .favorites
                : [];

        if (
            favorites.length === 0
        ) {
            return res.json({
                success: true,
                movies: [],
            });
        }

        const movies =
            await Movie.find({
                _id: {
                    $in: favorites,
                },
            });

        return res.json({
            success: true,
            movies,
        });
    } catch (error) {
        console.error(
            "GET FAVORITES ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to get favorite movies.",
        });
    }
};