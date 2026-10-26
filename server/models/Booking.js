import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        // Clerk user ID
        user: {
            type: String,
            required: true,
        },

        // Show document ID
        show: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Show",
            required: true,
        },

        // Total booking amount
        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        // Seats booked by the user
        bookedSeats: {
            type: [String],
            required: true,
            validate: {
                validator: function (seats) {
                    return (
                        Array.isArray(seats) &&
                        seats.length > 0
                    );
                },
                message:
                    "At least one seat is required.",
            },
        },

        // Stripe payment status
        isPaid: {
            type: Boolean,
            default: false,
        },

        // Stripe Checkout URL
        paymentLink: {
            type: String,
            default: "",
        },

        // Current booking status
        status: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "cancelled",
                "expired",
            ],
            default: "pending",
        },

        // Stripe Checkout Session ID
        stripeSessionId: {
            type: String,
            default: "",
        },

        // Payment completion time
        paidAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const Booking = mongoose.model(
    "Booking",
    bookingSchema
);

export default Booking;