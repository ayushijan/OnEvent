const eventService = require("../../services/user/eventService");
const s3Service = require("../../services/admin/s3Service");
const Category = require("../../models/Category");

const getEvents = async (req, res) => {
    try {
        const [result, categories] = await Promise.all([
            eventService.getEvents(req.query),

            Category.find({
                status: "active",
                isDeleted: false
            })
                .sort({ name: 1 })
                .lean()
        ]);

        const events = await Promise.all(
            result.events.map(async (event) => {
                let imageUrl = null;

                if (event.image) {
                    imageUrl = await s3Service.getEventImageUrl(event.image);
                }

                return {
                    ...event,
                    imageUrl
                };
            })
        );

        return res.render("user/events", {
            ...result,
            events,
            categories
        });

    } catch (error) {
        console.error("Customer Event Listing Error:", error);

        return res.status(500).send(
            error.message || "Unable to load events."
        );
    }
};


const getEventDetails = async (req, res, next) => {
    try {
        const event = await eventService.getEventById(req.params.id);

        let imageUrl = null;
        if (event.image) {
            imageUrl = await s3Service.getEventImageUrl(event.image);
        }

        return res.render("user/eventDetails", {
            event,
            imageUrl
        });
    } catch (error) {
        if (error.statusCode === 404) {
            return res.status(404).render("user/eventNotFound", {
                message: error.message
            });
        }

        return next(error);
    }
};


const getTicketSelection = async (req, res, next) => {
    try {
        const event = await eventService.getEventById(req.params.id);
        let imageUrl = null;

        if (event.image) {
            imageUrl = await s3Service.getEventImageUrl(event.image);
        }

        return res.render("user/ticketSelection", {
            event,
            imageUrl,
            maxSelectable: Math.min(10, event.availableTickets)
        });
    } catch (error) {
        if (error.statusCode === 404) {
            return res.status(404).render("user/eventNotFound", {
                message: error.message
            });
        }
        return next(error);
    }
};

const getBookingSummary = async (req, res, next) => {
    try {
        const summary = await eventService.getBookingSummary(
            req.params.id,
            req.query.quantity
        );

        let imageUrl = null;
        if (summary.event.image) {
            imageUrl = await s3Service.getEventImageUrl(summary.event.image);
        }

        return res.render("user/bookingSummary", {
            ...summary,
            imageUrl
        });
    } catch (error) {
        if (error.statusCode === 404) {
            return res.status(404).render("user/eventNotFound", {
                message: error.message
            });
        }

        if (error.statusCode === 400) {
            return res.status(400).send(error.message);
        }

        return next(error);
    }
};

module.exports = {
    getEvents,
    getEventDetails,
    getTicketSelection,
    getBookingSummary
};