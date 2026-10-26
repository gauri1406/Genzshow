import express from "express";

import {
    getNowPlayingMovies,
    addShow,
    getShows,
    getShow,
} from "../controllers/showController.js";

const showRouter =
    express.Router();


// ============================================================
// TMDB NOW PLAYING
// IMPORTANT:
// Keep this BEFORE /:movieId
// ============================================================

showRouter.get(
    "/now-playing",
    getNowPlayingMovies
);


// ============================================================
// GET ALL SHOWS
// ============================================================

showRouter.get(
    "/",
    getShows
);


// ============================================================
// GET MOVIE SHOWS
// ============================================================

showRouter.get(
    "/:movieId",
    getShow
);


// ============================================================
// ADD SHOW
// ============================================================

showRouter.post(
    "/add",
    addShow
);


export default showRouter;