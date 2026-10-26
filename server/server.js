import "dotenv/config"; // FIX: load .env before other imports use process.env

import express from "express";
import cors from "cors";

import { clerkMiddleware } from "@clerk/express";

import connectDB from "./configs/db.js";

import showRouter from "./routes/showRoutes.js";
import userRouter from "./routes/userRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import theatreRouter from "./routes/theatreRoutes.js";
import recommendationRouter from "./routes/recommendationRoutes.js";
import movieDNARouter from "./routes/movieDNARoutes.js";


const app = express();

const PORT =
    process.env.PORT || 3000;


/* =====================================================
   DATABASE
===================================================== */

connectDB();


/* =====================================================
   CORS
===================================================== */

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ],

        credentials: true,

        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS",
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization",
        ],
    })
);


/* =====================================================
   BODY PARSER
===================================================== */

app.use(
    express.json()
);

app.use(
    express.urlencoded({
        extended: true,
    })
);


/* =====================================================
   CLERK
===================================================== */

app.use(
    clerkMiddleware()
);


/* =====================================================
   HEALTH CHECK
===================================================== */

app.get(
    "/",
    (req, res) => {
        res.json({
            success: true,
            message:
                "GenZShow server is running",
        });
    }
);


/* =====================================================
   API ROUTES
===================================================== */

app.use(
    "/api/show",
    showRouter
);

app.use(
    "/api/user",
    userRouter
);

app.use(
    "/api/admin",
    adminRouter
);

app.use(
    "/api/booking",
    bookingRouter
);

app.use(
    "/api/theatre",
    theatreRouter
);

app.use(
    "/api/recommendation",
    recommendationRouter
);

app.use(
    "/api/movie-dna",
    movieDNARouter
);


/* =====================================================
   404
===================================================== */

app.use(
    (req, res) => {
        res.status(404).json({
            success: false,
            message:
                `Route not found: ${req.method} ${req.originalUrl}`,
        });
    }
);


/* =====================================================
   ERROR HANDLER
===================================================== */

app.use(
    (error, req, res, next) => {

        console.error(
            "SERVER ERROR:",
            error
        );

        res.status(
            error?.status || 500
        ).json({
            success: false,
            message:
                error?.message ||
                "Internal server error",
        });
    }
);


/* =====================================================
   START SERVER
===================================================== */

app.listen(
    PORT,
    () => {
        console.log(
            `GenZShow server running on http://localhost:${PORT}`
        );
    }
);