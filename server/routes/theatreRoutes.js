import express from "express";

import {
    getTheatres,
    getTheatre,
    getTheatreShows,
} from "../controllers/theatreController.js";

const theatreRouter =
    express.Router();

theatreRouter.get(
    "/",
    getTheatres
);

theatreRouter.get(
    "/:id/shows",
    getTheatreShows
);

theatreRouter.get(
    "/:id",
    getTheatre
);

export default theatreRouter;