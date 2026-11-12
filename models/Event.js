const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
    {
        eventId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        slug: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },

        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000
        },

        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },

        image: {
            type: String,
            default: null
        },

        eventDate: {
            type: Date,
            required: true
        },

        startTime: {
            type: String,
            required: true
        },

        endTime: {
            type: String,
            required: true
        },

        venue: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150
        },

        location: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150
        },

        ticketPrice: {
            type: Number,
            required: true,
            min: 0
        },

        totalTickets: {
            type: Number,
            required: true,
            min: 1
        },

        ticketsSold: {
            type: Number,
            default: 0,
            min: 0
        },

        availableTickets: {
            type: Number,
            required: true,
            min: 0
        },

        status: {
            type: String,
            enum: [
                "draft",
                "scheduled",
                "live",
                "completed"
            ],
            default: "draft"
        },

        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);


// ==========================================
// INDEXES
// ==========================================

eventSchema.index(
    { slug: 1 },
    {
        unique: true,
        partialFilterExpression: {
            isDeleted: false
        }
    }
);

eventSchema.index({ categoryId: 1, status: 1 });

eventSchema.index({ eventDate: 1 });

eventSchema.index({ status: 1, isDeleted: 1 });

eventSchema.index({ isDeleted: 1 });


const Event = mongoose.model("Event", eventSchema);

module.exports = Event;