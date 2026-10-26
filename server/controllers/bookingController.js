import Stripe from "stripe";

import { inngest } from "../inngest/index.js";

import Booking from "../models/Booking.js";
import Show from "../models/Show.js";


// ============================================================
// STRIPE
// ============================================================

const stripe = new Stripe(
    process.env.STRIPE_SECRET_KEY || ""
);


// ============================================================
// CHECK SEAT AVAILABILITY
// ============================================================

const checkSeatsAvailability = async (
    showId,
    selectedSeats
) => {
    try {

        const showData =
            await Show.findById(
                showId
            );

        if (!showData) {
            return false;
        }

        const occupiedSeats =
            showData.occupiedSeats || {};

        const isAnySeatTaken =
            selectedSeats.some(
                (seat) =>
                    occupiedSeats[seat]
            );

        return !isAnySeatTaken;

    } catch (error) {

        console.error(
            "CHECK SEATS ERROR:",
            error.message
        );

        return false;
    }
};


// ============================================================
// CREATE BOOKING
// ============================================================

export const createBooking = async (
    req,
    res
) => {

    let booking = null;
    let showData = null;

    try {

        // ====================================================
        // AUTHENTICATION
        // ====================================================

        const {
            userId
        } = req.auth();

        if (!userId) {

            return res.status(401).json({
                success: false,
                message:
                    "Please login to continue."
            });

        }


        // ====================================================
        // REQUEST DATA
        // ====================================================

        const {
            showId,
            selectedSeats
        } = req.body;

        const {
            origin
        } = req.headers;


        // ====================================================
        // VALIDATE SHOW ID
        // ====================================================

        if (!showId) {

            return res.status(400).json({
                success: false,
                message:
                    "Show ID is required."
            });

        }


        // ====================================================
        // VALIDATE SEATS
        // ====================================================

        if (
            !Array.isArray(
                selectedSeats
            ) ||
            selectedSeats.length === 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Please select at least one seat."
            });

        }


        // ====================================================
        // MAXIMUM 5 SEATS
        // ====================================================

        if (
            selectedSeats.length > 5
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "You can only select 5 seats."
            });

        }


        // ====================================================
        // CHECK DUPLICATES
        // ====================================================

        const uniqueSeats = [
            ...new Set(
                selectedSeats
            )
        ];

        if (
            uniqueSeats.length !==
            selectedSeats.length
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Duplicate seats selected."
            });

        }


        // ====================================================
        // VALIDATE SEAT FORMAT
        // ====================================================
        //
        // Current layout:
        //
        // A1 - A9
        // B1 - B9
        // ...
        // J1 - J9
        //
        // ====================================================

        const validSeatPattern =
            /^[A-J](?:[1-9])$/;

        const invalidSeat =
            uniqueSeats.find(
                (seat) =>
                    typeof seat !==
                        "string" ||
                    !validSeatPattern.test(
                        seat
                    )
            );

        if (invalidSeat) {

            return res.status(400).json({
                success: false,
                message:
                    `Invalid seat: ${invalidSeat}`
            });

        }


        // ====================================================
        // GET EXACT SHOW
        // ====================================================

        showData =
            await Show.findById(
                showId
            )
                .populate("movie")
                .populate("theatre");


        if (!showData) {

            return res.status(404).json({
                success: false,
                message:
                    "Show not found."
            });

        }


        // ====================================================
        // CHECK SHOW DATE
        // ====================================================

        const showDateTime =
            new Date(
                showData.showDateTime
            );

        if (
            showDateTime <=
            new Date()
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "This show has already started or ended."
            });

        }


        // ====================================================
        // CHECK SHOW PRICE
        // ====================================================

        const showPrice =
            Number(
                showData.showPrice
            );

        if (
            !Number.isFinite(
                showPrice
            ) ||
            showPrice <= 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid show price."
            });

        }


        // ====================================================
        // CHECK SEAT AVAILABILITY
        // ====================================================

        const isAvailable =
            await checkSeatsAvailability(
                showId,
                uniqueSeats
            );

        if (!isAvailable) {

            return res.status(409).json({
                success: false,
                message:
                    "One or more selected seats are already booked."
            });

        }


        // ====================================================
        // CALCULATE TOTAL
        // ====================================================

        const totalAmount =
            showPrice *
            uniqueSeats.length;


        // ====================================================
        // CREATE BOOKING
        // ====================================================

        booking =
            await Booking.create({

                user:
                    userId,

                show:
                    showId,

                amount:
                    totalAmount,

                bookedSeats:
                    uniqueSeats,

                isPaid:
                    false,

                status:
                    "pending",

                paymentLink:
                    "",

                stripeSessionId:
                    "",

                paidAt:
                    null

            });


        // ====================================================
        // MARK SEATS AS OCCUPIED
        // ====================================================

        if (
            !showData.occupiedSeats
        ) {

            showData.occupiedSeats =
                {};

        }

        uniqueSeats.forEach(
            (seat) => {

                showData.occupiedSeats[
                    seat
                ] = userId;

            }
        );


        showData.markModified(
            "occupiedSeats"
        );


        await showData.save();


        // ====================================================
        // CHECK STRIPE CONFIG
        // ====================================================

        if (
            !process.env
                .STRIPE_SECRET_KEY
        ) {

            // Release seats
            uniqueSeats.forEach(
                (seat) => {
                    delete showData
                        .occupiedSeats[
                            seat
                        ];
                }
            );

            showData.markModified(
                "occupiedSeats"
            );

            await showData.save();

            await Booking.findByIdAndDelete(
                booking._id
            );

            return res.status(500).json({
                success: false,
                message:
                    "Stripe is not configured."
            });

        }


        // ====================================================
        // STRIPE CURRENCY
        // ====================================================
        //
        // IMPORTANT:
        //
        // Change this to "inr" if your
        // Stripe account/payment setup
        // is configured to accept INR.
        //
        // The amount below is converted
        // into the smallest currency unit.
        //
        // Example:
        //
        // ₹250 × 100 = 25000 paise
        //
        // ====================================================

        const stripeCurrency =
            "inr";


        const stripeAmount =
            Math.round(
                totalAmount * 100
            );


        // ====================================================
        // CREATE STRIPE CHECKOUT
        // ====================================================

        const lineItems = [

            {
                price_data: {

                    currency:
                        stripeCurrency,

                    product_data: {

                        name:
                            showData
                                .movie
                                ?.title ||
                            "Movie Ticket",

                        description:
                            showData
                                .theatre
                                ? `${showData.theatre.name} - Seats: ${uniqueSeats.join(", ")}`
                                : `Seats: ${uniqueSeats.join(", ")}`
                    },

                    unit_amount:
                        stripeAmount

                },

                quantity: 1
            }

        ];


        const session =
            await stripe
                .checkout
                .sessions
                .create({

                    success_url:
                        `${origin}/loading/my-bookings`,

                    cancel_url:
                        `${origin}/my-bookings`,

                    line_items:
                        lineItems,

                    mode:
                        "payment",

                    metadata: {

                        bookingId:
                            booking._id.toString()

                    },

                    expires_at:
                        Math.floor(
                            Date.now() /
                                1000
                        ) +
                        30 * 60

                });


        // ====================================================
        // SAVE STRIPE DETAILS
        // ====================================================

        booking.paymentLink =
            session.url || "";

        booking.stripeSessionId =
            session.id;

        await booking.save();


        // ====================================================
        // START PAYMENT CHECK
        // ====================================================

        await inngest.send({

            name:
                "app/checkpayment",

            data: {

                bookingId:
                    booking._id.toString()

            }

        });


        // ====================================================
        // RESPONSE
        // ====================================================

        return res.json({

            success:
                true,

            url:
                session.url,

            bookingId:
                booking._id,

            showId:
                showId,

            theatreId:
                showData
                    .theatre?._id,

            selectedSeats:
                uniqueSeats,

            amount:
                totalAmount

        });

    } catch (error) {

        console.error(
            "CREATE BOOKING ERROR:",
            error
        );


        // ====================================================
        // CLEANUP IF STRIPE/BOOKING CREATION FAILS
        // ====================================================

        try {

            if (
                booking?._id
            ) {

                await Booking.findByIdAndDelete(
                    booking._id
                );

            }


            if (
                showData &&
                Array.isArray(
                    booking?.bookedSeats
                )
            ) {

                booking.bookedSeats.forEach(
                    (seat) => {

                        if (
                            showData
                                .occupiedSeats
                                ?. [seat]
                        ) {

                            delete showData
                                .occupiedSeats[
                                    seat
                                ];

                        }

                    }
                );

                showData.markModified(
                    "occupiedSeats"
                );

                await showData.save();

            }

        } catch (
            cleanupError
        ) {

            console.error(
                "BOOKING CLEANUP ERROR:",
                cleanupError
            );

        }


        return res.status(500).json({

            success:
                false,

            message:
                error.message ||
                "Failed to create booking."

        });

    }

};


// ============================================================
// GET OCCUPIED SEATS
// ============================================================

export const getOccupiedSeats = async (
    req,
    res
) => {

    try {

        const {
            showId
        } = req.params;


        // ====================================================
        // VALIDATE SHOW ID
        // ====================================================

        if (!showId) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Show ID is required."

            });

        }


        // ====================================================
        // FIND SHOW
        // ====================================================

        const showData =
            await Show.findById(
                showId
            );


        if (!showData) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "Show not found."

            });

        }


        // ====================================================
        // GET OCCUPIED SEATS
        // ====================================================

        const occupiedSeats =
            Object.keys(
                showData
                    .occupiedSeats ||
                {}
            );


        // ====================================================
        // RESPONSE
        // ====================================================

        return res.json({

            success:
                true,

            showId:
                showData._id,

            theatreId:
                showData.theatre,

            occupiedSeats

        });

    } catch (error) {

        console.error(
            "GET OCCUPIED SEATS ERROR:",
            error
        );


        return res.status(500).json({

            success:
                false,

            message:
                error.message ||
                "Failed to get occupied seats."

        });

    }

};