import express from "express";

import {
  getMovieDNA,
  updateMovieDNA,
} from "../controllers/movieDNAController.js";

const movieDNARouter =
  express.Router();

movieDNARouter.get(
  "/",
  getMovieDNA
);

movieDNARouter.post(
  "/update",
  updateMovieDNA
);

export default movieDNARouter;