import Theatre from "../models/Theatre.js";
import Show from "../models/Show.js";

export const getTheatres = async (req, res) => {
    try {
        const { city, search } = req.query;

        const filter = {};

        if (city) {
            filter.city = {
                $regex: city,
                $options: "i",
            };
        }

        if (search) {
            filter.name = {
                $regex: search,
                $options: "i",
            };
        }

        const theatres = await Theatre.find(filter)
            .sort({
                city: 1,
                name: 1,
            })
            .lean();

        res.json({
            success: true,
            count: theatres.length,
            theatres,
        });
    } catch (error) {
        console.error("GET THEATRES ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


export const getTheatre = async (req, res) => {
    try {
        const { id } = req.params;

        const theatre = await Theatre.findById(id).lean();

        if (!theatre) {
            return res.status(404).json({
                success: false,
                message: "Theatre not found",
            });
        }

        res.json({
            success: true,
            theatre,
        });
    } catch (error) {
        console.error("GET THEATRE ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


export const getTheatreShows = async (req, res) => {
    try {
        const { id } = req.params;

        console.log("=================================");
        console.log("THEATRE SHOWS REQUEST");
        console.log("THEATRE ID:", id);
        console.log("=================================");

        // 1. Check theatre
        const theatre = await Theatre.findById(id).lean();

        console.log("THEATRE FOUND:", !!theatre);

        if (!theatre) {
            return res.status(404).json({
                success: false,
                message: "Theatre not found",
            });
        }

        // 2. Find shows
        const shows = await Show.find({
            theatre: id,
        })
            .populate("movie")
            .populate("theatre")
            .sort({
                showDateTime: 1,
            })
            .lean();

        console.log("SHOWS FOUND:", shows.length);

        res.json({
            success: true,
            theatre,
            count: shows.length,
            shows,
        });

    } catch (error) {
        console.error("=================================");
        console.error("GET THEATRE SHOWS ERROR");
        console.error(error);
        console.error("MESSAGE:", error.message);
        console.error("STACK:", error.stack);
        console.error("=================================");

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};