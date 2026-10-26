import { Inngest } from "inngest";

import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";

import sendEmail from "../configs/nodeMailer.js";

// ============================================================
// INNGEST CLIENT
// ============================================================

export const inngest = new Inngest({
    id: "movie-ticket-booking",
});

// ============================================================
// SYNC USER CREATION
// ============================================================

const syncUserCreation = inngest.createFunction(
    {
        id: "sync-user-from-clerk",
        triggers: {
            event: "clerk/user.created",
        },
    },

    async ({ event }) => {
        try {
            const {
                id,
                first_name,
                last_name,
                email_addresses,
                image_url,
            } = event.data;

            const userData = {
                _id: id,

                email:
                    email_addresses?.[0]
                        ?.email_address || "",

                name:
                    `${first_name || ""} ${
                        last_name || ""
                    }`.trim(),

                image:
                    image_url || "",
            };

            const existingUser =
                await User.findById(id);

            if (existingUser) {
                return {
                    success: true,
                    message:
                        "User already exists.",
                };
            }

            await User.create(
                userData
            );

            return {
                success: true,
                message:
                    "User created.",
            };
        } catch (error) {
            console.error(
                "SYNC USER CREATION ERROR:",
                error
            );

            throw error;
        }
    }
);

// ============================================================
// SYNC USER DELETION
// ============================================================

const syncUserDeletion = inngest.createFunction(
    {
        id: "delete-user-with-clerk",
        triggers: {
            event: "clerk/user.deleted",
        },
    },

    async ({ event }) => {
        try {
            const { id } =
                event.data;

            await User.findByIdAndDelete(
                id
            );

            return {
                success: true,
                message:
                    "User deleted.",
            };
        } catch (error) {
            console.error(
                "SYNC USER DELETION ERROR:",
                error
            );

            throw error;
        }
    }
);

// ============================================================
// SYNC USER UPDATE
// ============================================================

const syncUserUpdation = inngest.createFunction(
    {
        id: "update-user-from-clerk",
        triggers: {
            event: "clerk/user.updated",
        },
    },

    async ({ event }) => {
        try {
            const {
                id,
                first_name,
                last_name,
                email_addresses,
                image_url,
            } = event.data;

            const userData = {
                email:
                    email_addresses?.[0]
                        ?.email_address || "",

                name:
                    `${first_name || ""} ${
                        last_name || ""
                    }`.trim(),

                image:
                    image_url || "",
            };

            await User.findByIdAndUpdate(
                id,
                userData,
                {
                    new: true,
                }
            );

            return {
                success: true,
                message:
                    "User updated.",
            };
        } catch (error) {
            console.error(
                "SYNC USER UPDATE ERROR:",
                error
            );

            throw error;
        }
    }
);

// ============================================================
// RELEASE UNPAID BOOKING
// ============================================================

const releaseSeatsAndDeleteBooking =
    inngest.createFunction(
        {
            id:
                "release-seats-expired-booking",

            triggers: {
                event:
                    "app/checkpayment",
            },
        },

        async ({
            event,
            step,
        }) => {
            const bookingId =
                event.data.bookingId;

            if (!bookingId) {
                return {
                    success: false,
                    message:
                        "Booking ID missing.",
                };
            }

            // --------------------------------------------------
            // Wait 10 minutes for payment
            // --------------------------------------------------

            await step.sleep(
                "wait-for-payment",
                "10m"
            );

            // --------------------------------------------------
            // Check payment
            // --------------------------------------------------

            return await step.run(
                "check-payment-status",
                async () => {
                    const booking =
                        await Booking.findById(
                            bookingId
                        );

                    // Booking no longer exists
                    if (!booking) {
                        return {
                            success: true,
                            message:
                                "Booking no longer exists.",
                        };
                    }

                    // Payment already completed
                    if (
                        booking.isPaid ===
                        true
                    ) {
                        return {
                            success: true,
                            message:
                                "Booking already paid.",
                        };
                    }

                    const show =
                        await Show.findById(
                            booking.show
                        );

                    // --------------------------------------------------
                    // Show doesn't exist
                    // --------------------------------------------------

                    if (!show) {
                        booking.status =
                            "cancelled";

                        await booking.save();

                        return {
                            success: false,
                            message:
                                "Show not found.",
                        };
                    }

                    // --------------------------------------------------
                    // Release seats
                    // --------------------------------------------------

                    const occupiedSeats =
                        show.occupiedSeats ||
                        {};

                    booking.bookedSeats.forEach(
                        (seat) => {
                            /*
                             * Only delete the seat if it still belongs
                             * to this booking's user.
                             *
                             * This prevents accidentally removing
                             * another user's reservation.
                             */

                            if (
                                occupiedSeats[
                                    seat
                                ] ===
                                booking.user
                            ) {
                                delete occupiedSeats[
                                    seat
                                ];
                            }
                        }
                    );

                    show.occupiedSeats =
                        occupiedSeats;

                    show.markModified(
                        "occupiedSeats"
                    );

                    await show.save();

                    // --------------------------------------------------
                    // Mark booking expired
                    // --------------------------------------------------

                    booking.status =
                        "expired";

                    await booking.save();

                    return {
                        success: true,
                        message:
                            "Payment expired. Seats released.",
                    };
                }
            );
        }
    );

// ============================================================
// BOOKING PAYMENT SUCCESS
// ============================================================

const confirmBookingPayment =
    inngest.createFunction(
        {
            id:
                "confirm-booking-payment",

            triggers: {
                event:
                    "app/payment.success",
            },
        },

        async ({
            event,
            step,
        }) => {
            const bookingId =
                event.data.bookingId;

            if (!bookingId) {
                return {
                    success: false,
                    message:
                        "Booking ID missing.",
                };
            }

            return await step.run(
                "confirm-booking",
                async () => {
                    const booking =
                        await Booking.findById(
                            bookingId
                        );

                    if (!booking) {
                        return {
                            success: false,
                            message:
                                "Booking not found.",
                        };
                    }

                    booking.isPaid =
                        true;

                    booking.status =
                        "confirmed";

                    booking.paidAt =
                        new Date();

                    await booking.save();

                    // Send confirmation email
                    await inngest.send({
                        name:
                            "app/show.booked",

                        data: {
                            bookingId:
                                booking._id.toString(),
                        },
                    });

                    return {
                        success: true,
                        message:
                            "Booking confirmed.",
                    };
                }
            );
        }
    );

// ============================================================
// SEND BOOKING CONFIRMATION EMAIL
// ============================================================

const sendBookingConfirmationEmail =
    inngest.createFunction(
        {
            id:
                "send-booking-confirmation-email",

            triggers: {
                event:
                    "app/show.booked",
            },
        },

        async ({ event }) => {
            try {
                const {
                    bookingId,
                } = event.data;

                const booking =
                    await Booking.findById(
                        bookingId
                    )
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
                        .populate("user");

                if (!booking) {
                    return {
                        success: false,
                        message:
                            "Booking not found.",
                    };
                }

                if (!booking.user) {
                    return {
                        success: false,
                        message:
                            "User not found.",
                    };
                }

                if (!booking.show) {
                    return {
                        success: false,
                        message:
                            "Show not found.",
                    };
                }

                if (!booking.show.movie) {
                    return {
                        success: false,
                        message:
                            "Movie not found.",
                    };
                }

                const movieTitle =
                    booking.show.movie
                        .title ||
                    "Movie";

                const theatreName =
                    booking.show.theatre
                        ?.name ||
                    "Theatre";

                const showDate =
                    new Date(
                        booking.show
                            .showDateTime
                    );

                const formattedDate =
                    showDate.toLocaleDateString(
                        "en-IN",
                        {
                            timeZone:
                                "Asia/Kolkata",
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                        }
                    );

                const formattedTime =
                    showDate.toLocaleTimeString(
                        "en-IN",
                        {
                            timeZone:
                                "Asia/Kolkata",
                            hour: "2-digit",
                            minute: "2-digit",
                        }
                    );

                const seats =
                    booking.bookedSeats.join(
                        ", "
                    );

                await sendEmail({
                    to:
                        booking.user.email,

                    subject:
                        `Booking Confirmed - ${movieTitle}`,

                    body: `
                        <div
                            style="
                                font-family: Arial, sans-serif;
                                line-height: 1.6;
                                max-width: 600px;
                                margin: auto;
                                padding: 24px;
                                background: #ffffff;
                            "
                        >

                            <h1
                                style="
                                    color: #F84565;
                                    margin-bottom: 8px;
                                "
                            >
                                GenzShow
                            </h1>

                            <h2>
                                Booking Confirmed 🎬
                            </h2>

                            <p>
                                Hi
                                <strong>
                                    ${booking.user.name || "there"}
                                </strong>,
                            </p>

                            <p>
                                Your movie ticket booking
                                has been successfully confirmed.
                            </p>

                            <hr />

                            <h3
                                style="
                                    color: #F84565;
                                "
                            >
                                ${movieTitle}
                            </h3>

                            <p>
                                <strong>Theatre:</strong>
                                ${theatreName}
                            </p>

                            <p>
                                <strong>Date:</strong>
                                ${formattedDate}
                            </p>

                            <p>
                                <strong>Time:</strong>
                                ${formattedTime}
                            </p>

                            <p>
                                <strong>Seats:</strong>
                                ${seats}
                            </p>

                            <p>
                                <strong>Total:</strong>
                                ₹${booking.amount}
                            </p>

                            <hr />

                            <p>
                                Please keep this email
                                for your booking reference.
                            </p>

                            <p>
                                Enjoy the show! 🍿
                            </p>

                            <p>
                                Thanks for booking with
                                <strong>
                                    GenzShow
                                </strong>.
                            </p>

                        </div>
                    `,
                });

                return {
                    success: true,
                    message:
                        "Booking confirmation email sent.",
                };
            } catch (error) {
                console.error(
                    "BOOKING EMAIL ERROR:",
                    error
                );

                throw error;
            }
        }
    );

// ============================================================
// SEND SHOW REMINDERS
// ============================================================

const sendShowReminders =
    inngest.createFunction(
        {
            id:
                "send-show-reminders",

            triggers: {
                cron:
                    "0 */8 * * *",
            },
        },

        async ({ step }) => {
            const now =
                new Date();

            const in8Hours =
                new Date(
                    now.getTime() +
                        8 *
                            60 *
                            60 *
                            1000
                );

            const windowStart =
                new Date(
                    in8Hours.getTime() -
                        10 *
                            60 *
                            1000
                );

            // --------------------------------------------------
            // Find upcoming shows
            // --------------------------------------------------

            const reminderTasks =
                await step.run(
                    "prepare-reminder-tasks",
                    async () => {
                        const shows =
                            await Show.find({
                                showDateTime: {
                                    $gte:
                                        windowStart,

                                    $lte:
                                        in8Hours,
                                },
                            })
                                .populate(
                                    "movie"
                                )
                                .populate(
                                    "theatre"
                                );

                        const tasks =
                            [];

                        for (
                            const show of shows
                        ) {
                            if (
                                !show.movie
                            ) {
                                continue;
                            }

                            const occupiedSeats =
                                show.occupiedSeats ||
                                {};

                            const userIds =
                                [
                                    ...new Set(
                                        Object.values(
                                            occupiedSeats
                                        )
                                    ),
                                ];

                            if (
                                userIds.length ===
                                0
                            ) {
                                continue;
                            }

                            const users =
                                await User.find(
                                    {
                                        _id: {
                                            $in:
                                                userIds,
                                        },
                                    }
                                ).select(
                                    "name email"
                                );

                            for (
                                const user of users
                            ) {
                                if (
                                    !user.email
                                ) {
                                    continue;
                                }

                                tasks.push({
                                    userEmail:
                                        user.email,

                                    userName:
                                        user.name,

                                    movieTitle:
                                        show.movie
                                            .title,

                                    theatreName:
                                        show.theatre
                                            ?.name ||
                                        "Theatre",

                                    showTime:
                                        show.showDateTime,
                                });
                            }
                        }

                        return tasks;
                    }
                );

            // --------------------------------------------------
            // No reminders
            // --------------------------------------------------

            if (
                reminderTasks.length ===
                0
            ) {
                return {
                    sent: 0,
                    message:
                        "No reminders to send.",
                };
            }

            // --------------------------------------------------
            // Send reminders
            // --------------------------------------------------

            const results =
                await step.run(
                    "send-all-reminders",
                    async () => {
                        return Promise.allSettled(
                            reminderTasks.map(
                                (
                                    task
                                ) =>
                                    sendEmail(
                                        {
                                            to:
                                                task.userEmail,

                                            subject:
                                                `Reminder: ${task.movieTitle} starts soon!`,

                                            body: `
                                                <div
                                                    style="
                                                        font-family: Arial, sans-serif;
                                                        padding: 20px;
                                                    "
                                                >

                                                    <h2>
                                                        Hello ${task.userName || "there"},
                                                    </h2>

                                                    <p>
                                                        This is a reminder
                                                        for your upcoming
                                                        movie.
                                                    </p>

                                                    <h3
                                                        style="
                                                            color: #F84565;
                                                        "
                                                    >
                                                        ${task.movieTitle}
                                                    </h3>

                                                    <p>
                                                        <strong>
                                                            Theatre:
                                                        </strong>
                                                        ${task.theatreName}
                                                    </p>

                                                    <p>
                                                        <strong>
                                                            Date:
                                                        </strong>
                                                        ${new Date(
                                                            task.showTime
                                                        ).toLocaleDateString(
                                                            "en-IN",
                                                            {
                                                                timeZone:
                                                                    "Asia/Kolkata",
                                                            }
                                                        )}
                                                    </p>

                                                    <p>
                                                        <strong>
                                                            Time:
                                                        </strong>
                                                        ${new Date(
                                                            task.showTime
                                                        ).toLocaleTimeString(
                                                            "en-IN",
                                                            {
                                                                timeZone:
                                                                    "Asia/Kolkata",
                                                            }
                                                        )}
                                                    </p>

                                                    <p>
                                                        Your show
                                                        starts in
                                                        approximately
                                                        8 hours.
                                                    </p>

                                                    <p>
                                                        Enjoy the show! 🍿
                                                    </p>

                                                    <p>
                                                        GenzShow Team
                                                    </p>

                                                </div>
                                            `,
                                        }
                                    )
                            )
                        );
                    }
                );

            const sent =
                results.filter(
                    (result) =>
                        result.status ===
                        "fulfilled"
                ).length;

            const failed =
                results.length -
                sent;

            return {
                sent,
                failed,
                message:
                    `Sent ${sent} reminder(s), ${failed} failed.`,
            };
        }
    );

// ============================================================
// SEND NEW SHOW NOTIFICATIONS
// ============================================================

const sendNewShowNotifications =
    inngest.createFunction(
        {
            id:
                "send-new-show-notifications",

            triggers: {
                event:
                    "app/show.added",
            },
        },

        async ({ event }) => {
            try {
                const {
                    movieTitle,
                } = event.data;

                if (!movieTitle) {
                    return {
                        success: false,
                        message:
                            "Movie title missing.",
                    };
                }

                const users =
                    await User.find(
                        {}
                    ).select(
                        "name email"
                    );

                let sent = 0;

                for (
                    const user of users
                ) {
                    if (!user.email) {
                        continue;
                    }

                    await sendEmail({
                        to:
                            user.email,

                        subject:
                            `🎬 New Show Added: ${movieTitle}`,

                        body: `
                            <div
                                style="
                                    font-family: Arial, sans-serif;
                                    padding: 20px;
                                "
                            >

                                <h2>
                                    Hi ${user.name || "there"},
                                </h2>

                                <p>
                                    A new movie show
                                    has been added
                                    to GenzShow.
                                </p>

                                <h3
                                    style="
                                        color: #F84565;
                                    "
                                >
                                    ${movieTitle}
                                </h3>

                                <p>
                                    Visit GenzShow
                                    to check the
                                    available shows
                                    and book your seats.
                                </p>

                                <p>
                                    GenzShow Team
                                </p>

                            </div>
                        `,
                    });

                    sent++;
                }

                return {
                    success: true,
                    sent,
                    message:
                        "New show notifications sent.",
                };
            } catch (error) {
                console.error(
                    "NEW SHOW NOTIFICATION ERROR:",
                    error
                );

                throw error;
            }
        }
    );

// ============================================================
// EXPORT INNGEST FUNCTIONS
// ============================================================

export const functions = [
    syncUserCreation,
    syncUserDeletion,
    syncUserUpdation,

    releaseSeatsAndDeleteBooking,
    confirmBookingPayment,

    sendBookingConfirmationEmail,

    sendShowReminders,
    sendNewShowNotifications,
];