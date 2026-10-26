import mongoose from "mongoose";

const theatreSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        city: {
            type: String,
            required: true,
            trim: true
        },

        type: {
            type: String,
            enum: ["Multiplex", "Single Screen"],
            default: "Multiplex"
        },

        theatreChain: {
            type: String,
            default: ""
        },

        totalSeats: {
            type: Number,
            default: 0
        },

        screens: {
            type: Number,
            default: 1
        },

        averageTicketPrice: {
            type: Number,
            default: 0
        },

        location: {
            lat: {
                type: Number,
                default: null
            },

            lon: {
                type: Number,
                default: null
            }
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const Theatre = mongoose.model("Theatre", theatreSchema);

export default Theatre;