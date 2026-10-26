import express from "express";

import {
    createBooking,
    getOccupiedSeats,
} from "../controllers/bookingController.js";

const bookingRouter = express.Router();

/*
|--------------------------------------------------------------------------
| CREATE BOOKING
|--------------------------------------------------------------------------
| POST /api/booking/create
|
| Creates a booking for the selected show and seats,
| then creates the Stripe checkout session.
|
*/
bookingRouter.post(
    "/create",
    createBooking
);

/*
|--------------------------------------------------------------------------
| GET OCCUPIED SEATS
|--------------------------------------------------------------------------
| GET /api/booking/seats/:showId
|
| Returns all seats already occupied for
| the specific show.
|
*/
bookingRouter.get(
    "/seats/:showId",
    getOccupiedSeats
);

export default bookingRouter;