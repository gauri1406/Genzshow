import fs from "fs";
import path from "path";
import csv from "csv-parser";
import mongoose from "mongoose";
import Theatre from "../models/Theatre.js";
import dotenv from "dotenv";

dotenv.config();

const filePath = path.resolve(
    process.cwd(),
    "../data/theatres.csv"
);

const theatres = [];

console.log("Reading CSV from:");
console.log(filePath);

fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
        const totalSeats = Number(row.total_seats) || 0;
        const screens = Number(row.no_screens) || 1;
        const ticketPrice =
            Number(row.average_ticket_price) ||
            Number(row.calculated_ticket_prices) ||
            0;

        const lat = Number(row.lat);
        const lon = Number(row.lon);

        // Ignore completely invalid theatre records
        if (!row.theatre_name || !row.city) {
            return;
        }

        theatres.push({
            name: row.theatre_name.trim(),

            city: row.city.trim(),

            type:
                row.type === "Single Screen"
                    ? "Single Screen"
                    : "Multiplex",

            theatreChain:
                row.theatre_chain?.trim() || "",

            totalSeats,

            screens,

            averageTicketPrice: ticketPrice,

            location: {
                lat: Number.isFinite(lat) ? lat : null,
                lon: Number.isFinite(lon) ? lon : null
            },

            isActive: true
        });
    })
    .on("end", async () => {
        try {
            console.log(`\nCSV loaded: ${theatres.length} theatres`);

            if (theatres.length === 0) {
                console.log("No valid theatres found.");
                process.exit(1);
            }

           await mongoose.connect(`${process.env.MONGODB_URI}/GenzShow`);

            console.log("MongoDB connected.");

            // Prevent duplicate import
            await Theatre.deleteMany({});

            console.log("Existing theatre data cleared.");

            const inserted =
                await Theatre.insertMany(theatres);

            console.log(
                `Successfully imported ${inserted.length} theatres.`
            );

            await mongoose.disconnect();

            console.log("MongoDB disconnected.");
            process.exit(0);

        } catch (error) {
            console.error(
                "IMPORT ERROR:",
                error
            );

            await mongoose.disconnect();

            process.exit(1);
        }
    })
    .on("error", (error) => {
        console.error(
            "CSV READ ERROR:",
            error
        );

        process.exit(1);
    });