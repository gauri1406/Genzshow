import express from "express";

import {
    getAIRecommendationsController,
} from "../controllers/recommendationController.js";


const recommendationRouter =
    express.Router();


recommendationRouter.post(
    "/ai",
    getAIRecommendationsController
);


export default recommendationRouter;