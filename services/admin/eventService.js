const mongoose = require("mongoose");
const crypto = require("crypto");

const Event = require("../../models/Event");
const Category = require("../../models/Category");
const s3Service = require("./s3Service");

// Generate a unique event ID
const generateEventId = async () => {
    let eventId;
    let exists = true;

    while (exists) {
        eventId = `EVT-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
        exists = await Event.findOne({ eventId });
    }

    return eventId;
};

// Generate URL-friendly slug
const generateSlug = (title) => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
};

// Check duplicate event title
const checkDuplicateEvent = async (slug, excludeId = null) => {
    const filter = {
        slug,
        isDeleted: false
    };

    if (excludeId) {
        filter._id = { $ne: excludeId };
    }

    return Event.findOne(filter);
};

// Validate event data
const validateEventData = async (data, allowPastDate = false) => {
    const {
        title,
        description,
        categoryId,
        eventDate,
        startTime,
        endTime,
        venue,
        location,
        ticketPrice,
        totalTickets,
        status
    } = data;

    if (!title || title.trim().length === 0) {
        throw new Error("Event title is required.");
    }

    if (title.length > 100) {
        throw new Error("Event title cannot exceed 100 characters.");
    }

    if (!description || description.trim().length === 0) {
        throw new Error("Event description is required.");
    }

    if (description.length > 2000) {
        throw new Error("Description cannot exceed 2000 characters.");
    }

    if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
        throw new Error("Please select a valid category.");
    }

    const category = await Category.findOne({
        _id: categoryId,
        status: "active",
        isDeleted: false
    });

    if (!category) {
        throw new Error("Selected category is unavailable.");
    }

    if (!eventDate || Number.isNaN(new Date(eventDate).getTime())) {
        throw new Error("Please select a valid event date.");
    }

    if (!allowPastDate) {
        const selectedDate = new Date(eventDate);
        const today = new Date();

        selectedDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            throw new Error("Event date cannot be in the past.");
        }
    }

    if (!startTime || !endTime) {
        throw new Error("Start time and end time are required.");
    }

    if (endTime <= startTime) {
        throw new Error("End time must be after start time.");
    }

    if (!venue || venue.trim().length === 0) {
        throw new Error("Venue is required.");
    }

    if (venue.length > 150) {
        throw new Error("Venue cannot exceed 150 characters.");
    }

    if (!location || location.trim().length === 0) {
        throw new Error("City/location is required.");
    }

    if (location.length > 150) {
        throw new Error("Location cannot exceed 150 characters.");
    }

    if (
        ticketPrice === undefined ||
        ticketPrice === "" ||
        !Number.isFinite(Number(ticketPrice)) ||
        Number(ticketPrice) < 0
    ) {
        throw new Error("Please enter a valid ticket price.");
    }

    if (
        totalTickets === undefined ||
        totalTickets === "" ||
        !Number.isInteger(Number(totalTickets)) ||
        Number(totalTickets) < 1
    ) {
        throw new Error("Total ticket capacity must be at least 1.");
    }

    const allowedStatuses = ["draft", "scheduled", "live", "completed"];

    if (status && !allowedStatuses.includes(status)) {
        throw new Error("Invalid event status.");
    }

    return true;
};

// Add event
const addEvent = async (data, file) => {
    await validateEventData(data);

    const slug = generateSlug(data.title);

    const duplicate = await checkDuplicateEvent(slug);

    if (duplicate) {
        throw new Error("An event with this title already exists.");
    }

    const eventId = await generateEventId();

    let imageKey = null;

    if (file) {
        const uploadedImage = await s3Service.uploadEventImage(file);
        imageKey = uploadedImage.key;
    }

    const event = new Event({
        eventId,
        title: data.title.trim(),
        slug,
        description: data.description.trim(),
        categoryId: data.categoryId,
        image: imageKey,
        eventDate: new Date(data.eventDate),
        startTime: data.startTime,
        endTime: data.endTime,
        venue: data.venue.trim(),
        location: data.location.trim(),
        ticketPrice: Number(data.ticketPrice),
        totalTickets: Number(data.totalTickets),
        ticketsSold: 0,
        availableTickets: Number(data.totalTickets),
        status: data.status || "draft"
    });

    await event.save();

    return event;
};

// Get events with search, category, status, sorting and pagination
const getEvents = async (query = {}) => {
    const {
        search = "",
        status = "all",
        category = "all",
        sort = "newest",
        page = 1,
        limit = 10
    } = query;

    const currentPage = Math.max(1, Number(page) || 1);
    const perPage = Math.min(100, Math.max(1, Number(limit) || 10));

    const filter = {
        isDeleted: false
    };

    // Search filter
    if (search.trim()) {
        const searchRegex = new RegExp(
            search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            "i"
        );

        filter.$or = [
            { title: searchRegex },
            { description: searchRegex },
            { venue: searchRegex },
            { location: searchRegex },
            { slug: searchRegex },
            { eventId: searchRegex }
        ];
    }

    // Category filter
    if (category && category !== "all") {
        if (!mongoose.Types.ObjectId.isValid(category)) {
            throw new Error("Invalid category selected.");
        }

        filter.categoryId = category;
    }

    // Status filter
    if (status && status !== "all") {
        filter.status = status;
    }

    // Sorting
    let sortOption = { createdAt: -1 };

    if (sort === "oldest") {
        sortOption = { createdAt: 1 };
    } else if (sort === "az") {
        sortOption = { title: 1 };
    } else if (sort === "za") {
        sortOption = { title: -1 };
    }

    const totalEvents = await Event.countDocuments(filter);

    const totalPages = Math.ceil(totalEvents / perPage);

    const events = await Event.find(filter)
        .populate("categoryId", "name")
        .sort(sortOption)
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .lean();

    return {
        events,
        totalEvents,
        currentPage,
        totalPages,
        search,
        status,
        category,
        sort,
        limit: perPage
    };
};

// Get one event
const getEventById = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid event ID.");
    }

    const event = await Event.findOne({
        _id: id,
        isDeleted: false
    }).populate("categoryId", "name");

    if (!event) {
        throw new Error("Event not found.");
    }

    return event;
};

// Update event
const updateEvent = async (id, data, file) => {
    const event = await getEventById(id);

    await validateEventData(data, data.status === "completed");

    const slug = generateSlug(data.title);

    const duplicate = await checkDuplicateEvent(slug, id);

    if (duplicate) {
        throw new Error("Another event with this title already exists.");
    }

    const newCapacity = Number(data.totalTickets);

    if (newCapacity < event.ticketsSold) {
        throw new Error(
            "Total ticket capacity cannot be less than tickets already sold."
        );
    }

    event.title = data.title.trim();
    event.slug = slug;
    event.description = data.description.trim();
    event.categoryId = data.categoryId;
    event.eventDate = new Date(data.eventDate);
    event.startTime = data.startTime;
    event.endTime = data.endTime;
    event.venue = data.venue.trim();
    event.location = data.location.trim();
    event.ticketPrice = Number(data.ticketPrice);
    event.totalTickets = newCapacity;
    event.availableTickets = newCapacity - event.ticketsSold;
    event.status = data.status || event.status;

    if (file) {
        const uploadedImage = await s3Service.uploadEventImage(file);
        event.image = uploadedImage.key;
    }

    await event.save();

    return event;
};

// Soft-delete event
const deleteEvent = async (id) => {
    const event = await getEventById(id);

    event.isDeleted = true;

    await event.save();

    return event;
};

// Event statistics
const getEventStats = async () => {
    const [totalEvents, activeEvents, draftEvents, completedEvents] =
        await Promise.all([
            Event.countDocuments({ isDeleted: false }),

            Event.countDocuments({
                isDeleted: false,
                status: "live"
            }),

            Event.countDocuments({
                isDeleted: false,
                status: { $in: ["draft", "scheduled"] }
            }),

            Event.countDocuments({
                isDeleted: false,
                status: "completed"
            })
        ]);

    return {
        totalEvents,
        activeEvents,
        draftEvents,
        completedEvents
    };
};

// Calculate revenue
const calculateEventRevenue = (event) => {
    const projectedRevenue =
        Number(event.ticketPrice) * Number(event.totalTickets);

    const actualRevenue =
        Number(event.ticketPrice) * Number(event.ticketsSold);

    return {
        projectedRevenue,
        actualRevenue
    };
};

module.exports = {
    generateEventId,
    generateSlug,
    addEvent,
    getEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    getEventStats,
    calculateEventRevenue
};