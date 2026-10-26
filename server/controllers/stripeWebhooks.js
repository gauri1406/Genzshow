import Stripe from "stripe";

import Booking from "../models/Booking.js";

import { inngest } from "../inngest/index.js";

const stripe = new Stripe(
    process.env.STRIPE_SECRET_KEY
);

// ============================================================
// STRIPE WEBHOOK
// ============================================================

export const stripeWebhooks = async (
    request,
    response
) => {
    const signature =
        request.headers[
            "stripe-signature"
        ];

    if (!signature) {
        return response.status(400).send(
            "Stripe signature missing."
        );
    }

    if (
        !process.env
            .STRIPE_WEBHOOK_SECRET
    ) {
        console.error(
            "STRIPE_WEBHOOK_SECRET is missing."
        );

        return response.status(500).send(
            "Stripe webhook is not configured."
        );
    }

    let event;

    // ========================================================
    // VERIFY STRIPE EVENT
    // ========================================================

    try {
        event =
            stripe.webhooks.constructEvent(
                request.body,
                signature,
                process.env
                    .STRIPE_WEBHOOK_SECRET
            );
    } catch (error) {
        console.error(
            "STRIPE SIGNATURE ERROR:",
            error.message
        );

        return response.status(400).send(
            `Webhook Error: ${error.message}`
        );
    }

    // ========================================================
    // PROCESS EVENT
    // ========================================================

    try {
        switch (event.type) {

            // ------------------------------------------------
            // CHECKOUT COMPLETED
            // ------------------------------------------------

            case "checkout.session.completed": {
                const session =
                    event.data.object;

                const bookingId =
                    session.metadata
                        ?.bookingId;

                if (!bookingId) {
                    console.error(
                        "No bookingId found in Stripe session."
                    );

                    break;
                }

                const booking =
                    await Booking.findById(
                        bookingId
                    );

                if (!booking) {
                    console.error(
                        "Booking not found:",
                        bookingId
                    );

                    break;
                }

                // Save Stripe session
                booking.stripeSessionId =
                    session.id;

                await booking.save();

                // ------------------------------------------------
                // Stripe confirms payment
                // ------------------------------------------------

                if (
                    session.payment_status ===
                    "paid"
                ) {
                    await inngest.send({
                        name:
                            "app/payment.success",

                        data: {
                            bookingId:
                                booking._id.toString(),

                            stripeSessionId:
                                session.id,
                        },
                    });
                }

                break;
            }

            // ------------------------------------------------
            // ASYNC PAYMENT SUCCESS
            // ------------------------------------------------

            case "checkout.session.async_payment_succeeded": {
                const session =
                    event.data.object;

                const bookingId =
                    session.metadata
                        ?.bookingId;

                if (!bookingId) {
                    break;
                }

                await inngest.send({
                    name:
                        "app/payment.success",

                    data: {
                        bookingId,

                        stripeSessionId:
                            session.id,
                    },
                });

                break;
            }

            // ------------------------------------------------
            // ASYNC PAYMENT FAILED
            // ------------------------------------------------

            case "checkout.session.async_payment_failed": {
                const session =
                    event.data.object;

                const bookingId =
                    session.metadata
                        ?.bookingId;

                if (!bookingId) {
                    break;
                }

                const booking =
                    await Booking.findById(
                        bookingId
                    );

                if (
                    booking &&
                    !booking.isPaid
                ) {
                    booking.status =
                        "cancelled";

                    await booking.save();
                }

                break;
            }

            // ------------------------------------------------
            // PAYMENT INTENT SUCCESS
            // ------------------------------------------------
            // Kept for compatibility with
            // your previous implementation.
            // ------------------------------------------------

            case "payment_intent.succeeded": {
                const paymentIntent =
                    event.data.object;

                const sessionList =
                    await stripe.checkout.sessions.list(
                        {
                            payment_intent:
                                paymentIntent.id,
                            limit: 1,
                        }
                    );

                const session =
                    sessionList.data[0];

                if (!session) {
                    console.error(
                        "Stripe checkout session not found."
                    );

                    break;
                }

                const bookingId =
                    session.metadata
                        ?.bookingId;

                if (!bookingId) {
                    console.error(
                        "No bookingId found for payment intent."
                    );

                    break;
                }

                await inngest.send({
                    name:
                        "app/payment.success",

                    data: {
                        bookingId,

                        stripeSessionId:
                            session.id,
                    },
                });

                break;
            }

            default:
                console.log(
                    "Unhandled Stripe event:",
                    event.type
                );
        }

        return response.json({
            received: true,
        });

    } catch (error) {
        console.error(
            "STRIPE WEBHOOK PROCESSING ERROR:",
            error
        );

        return response.status(500).send(
            "Internal Server Error"
        );
    }
};