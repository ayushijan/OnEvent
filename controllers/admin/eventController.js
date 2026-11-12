const eventService = require("../../services/admin/eventService");
const Category = require("../../models/Category");
const s3Service = require("../../services/admin/s3Service");

// Add Event page
const getAddEvent = async (req, res) => {
    try {
        const categories = await Category.find({
            status: "active",
            isDeleted: false
        })
            .sort({ name: 1 })
            .lean();

        return res.render("admin/addEvent", {
            categories
        });
    } catch (error) {
        console.error("Get Add Event Error:", error);

        return res.redirect(
            "/admin/events?error=" +
            encodeURIComponent("Unable to load the Add Event page.")
        );
    }
};

// Events listing page
const getEvents = async (req, res) => {
    try {
        const [result, stats, categories] = await Promise.all([
            eventService.getEvents(req.query),
            eventService.getEventStats(),
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

                const revenue =
                    eventService.calculateEventRevenue(event);

                return {
                    ...event,
                    imageUrl,
                    projectedRevenue: revenue.projectedRevenue,
                    actualRevenue: revenue.actualRevenue
                };
            })
        );

        return res.render("admin/events", {
            events,
            categories,

            totalEvents: stats.totalEvents,
            activeEvents: stats.activeEvents,
            draftEvents: stats.draftEvents,
            completedEvents: stats.completedEvents,

            currentPage: result.currentPage,
            totalPages: result.totalPages,
            totalEventsFiltered: result.totalEvents,

            search: result.search,
            status: result.status,
            category: result.category,
            sort: result.sort,
            limit: result.limit,

            successMessage: req.query.success || null,
            errorMessage: req.query.error || null
        });
    } catch (error) {
        console.error("Get Events Error:", error);

        return res.status(500).send("Unable to load events.");
    }
};

// Get one event
// Get one event - Admin View
// Get one event - Admin View
const getEvent = async (req, res) => {
    try {
        const event = await eventService.getEventById(req.params.id);

        let imageUrl = null;

        if (event.image) {
            imageUrl = await s3Service.getEventImageUrl(event.image);
        }

        const revenue = eventService.calculateEventRevenue(event);

        return res.render("admin/viewEvent", {
            event: event.toObject(),
            imageUrl,
            projectedRevenue: revenue.projectedRevenue,
            actualRevenue: revenue.actualRevenue
        });

    } catch (error) {
        console.error("Get Event Error:", error);

        return res.redirect(
            "/admin/events?error=" +
            encodeURIComponent(error.message)
        );
    }
};

// Add event
const addEvent = async (req, res) => {
    try {
        await eventService.addEvent(req.body, req.file);

        return res.redirect(
            "/admin/events?success=" +
            encodeURIComponent("Event created successfully.")
        );
    } catch (error) {
        console.error("Add Event Error:", error);

        return res.redirect(
            "/admin/events/new?error=" +
            encodeURIComponent(error.message)
        );
    }
};

// Update event
const updateEvent = async (req, res) => {
    try {
        await eventService.updateEvent(
            req.params.id,
            req.body,
            req.file
        );

        return res.redirect(
            "/admin/events?success=" +
            encodeURIComponent("Event updated successfully.")
        );
    } catch (error) {
        console.error("Update Event Error:", error);

        return res.redirect(
            "/admin/events?error=" +
            encodeURIComponent(error.message)
        );
    }
};

// Delete event
const deleteEvent = async (req, res) => {
    try {
        await eventService.deleteEvent(req.params.id);

        return res.redirect(
            "/admin/events?success=" +
            encodeURIComponent("Event deleted successfully.")
        );
    } catch (error) {
        console.error("Delete Event Error:", error);

        return res.redirect(
            "/admin/events?error=" +
            encodeURIComponent(error.message)
        );
    }
};

// Edit Event page
const getEditEvent = async (req, res) => {
    try {
        const event = await eventService.getEventById(req.params.id);

        const categories = await Category.find({
            status: "active",
            isDeleted: false
        })
        .sort({ name: 1 })
        .lean();

        let imageUrl = null;

        if (event.image) {
            imageUrl = await s3Service.getEventImageUrl(event.image);
        }

        const revenue = eventService.calculateEventRevenue(event);

        return res.render("admin/editEvent", {
            event,
            categories,
            imageUrl,
            projectedRevenue: revenue.projectedRevenue,
            actualRevenue: revenue.actualRevenue,
            errorMessage: req.query.error || null
        });

    } catch (error) {
        console.error("Get Edit Event Error:", error);

        return res.redirect(
            "/admin/events?error=" +
            encodeURIComponent(error.message)
        );
    }
};

module.exports = {
    getAddEvent,
    getEvents,
    getEvent,
    getEditEvent,
    addEvent,
    updateEvent,
    deleteEvent
};