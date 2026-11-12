const mongoose = require("mongoose");

const Event = require("../../models/Event");
const Category = require("../../models/Category");

const getEvents = async (query = {}) => {
    const search =
        typeof query.search === "string"
            ? query.search.trim()
            : "";

    const category =
        typeof query.category === "string"
            ? query.category
            : "all";

    const sort = ["price-low", "price-high", "az", "za"].includes(query.sort)
        ? query.sort
        : "az";

    const minPrice =
        query.minPrice !== undefined && query.minPrice !== ""
            ? Number(query.minPrice)
            : null;

    const maxPrice =
        query.maxPrice !== undefined && query.maxPrice !== ""
            ? Number(query.maxPrice)
            : null;

    const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
    const limit = 9;

    const filter = {
        isDeleted: false,
        status: "live",
        availableTickets: { $gt: 0 }
    };

    // SEARCH
    if (search) {
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const searchRegex = new RegExp(escapedSearch, "i");

        filter.$or = [
            { title: searchRegex },
            { description: searchRegex },
            { venue: searchRegex },
            { location: searchRegex }
        ];
    }

    // ACTIVE CATEGORIES
    const activeCategories = await Category.find({
        status: "active",
        isDeleted: false
    }).select("_id").lean();

    const activeCategoryIds = activeCategories.map(item => item._id);

    filter.categoryId = { $in: activeCategoryIds };

    // CATEGORY FILTER
    if (category !== "all") {
        if (!mongoose.Types.ObjectId.isValid(category)) {
            throw new Error("Invalid category selected.");
        }

        filter.categoryId = new mongoose.Types.ObjectId(category);
        filter.categoryId = {
            $eq: new mongoose.Types.ObjectId(category),
            $in: activeCategoryIds
        };
    }

    // PRICE VALIDATION
    if (minPrice !== null && (!Number.isFinite(minPrice) || minPrice < 0)) {
        throw new Error("Invalid minimum price.");
    }

    if (maxPrice !== null && (!Number.isFinite(maxPrice) || maxPrice < 0)) {
        throw new Error("Invalid maximum price.");
    }

    if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
        throw new Error("Minimum price cannot exceed maximum price.");
    }

    // PRICE FILTER
    if (minPrice !== null || maxPrice !== null) {
        filter.ticketPrice = {};

        if (minPrice !== null) {
            filter.ticketPrice.$gte = minPrice;
        }

        if (maxPrice !== null) {
            filter.ticketPrice.$lte = maxPrice;
        }
    }

    // SORTING
    let sortOption;

    switch (sort) {
        case "price-low":
            sortOption = { ticketPrice: 1, _id: 1 };
            break;

        case "price-high":
            sortOption = { ticketPrice: -1, _id: -1 };
            break;

        case "za":
            sortOption = { title: -1, _id: -1 };
            break;

        default:
            sortOption = { title: 1, _id: 1 };
    }

    // PAGINATION
    const totalEvents = await Event.countDocuments(filter);
    const totalPages = Math.ceil(totalEvents / limit);

    const currentPage = Math.min(page, Math.max(totalPages, 1));

    const events = await Event.find(filter)
        .populate("categoryId", "name")
        .sort(sortOption)
        .skip((currentPage - 1) * limit)
        .limit(limit)
        .lean();

    return {
        events,
        search,
        category,
        sort,
        minPrice: minPrice ?? "",
        maxPrice: maxPrice ?? "",
        currentPage,
        totalPages,
        totalEvents,
        limit
    };
};


// Get a single event for the user-facing Event Details page.
const getEventById = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error("Event not found.");
        error.statusCode = 404;
        throw error;
    }

    const event = await Event.findOne({
        _id: id,
        isDeleted: false,
        status: "live"
    })
        .populate("categoryId", "name")
        .lean();

    if (!event) {
        const error = new Error("This event is unavailable or no longer published.");
        error.statusCode = 404;
        throw error;
    }

    return event;
};

// Validate the selected quantity and prepare a read-only booking summary.
// Tickets are not reserved or deducted at this stage.
const getBookingSummary = async (eventId, rawQuantity) => {
    const event = await getEventById(eventId);
    const quantity = Number(rawQuantity);

    if (!Number.isInteger(quantity) || quantity < 1) {
        const error = new Error("Please select at least one ticket.");
        error.statusCode = 400;
        throw error;
    }

    const maxPerBooking = 10;
    if (quantity > maxPerBooking) {
        const error = new Error(`You can select a maximum of ${maxPerBooking} tickets per booking.`);
        error.statusCode = 400;
        throw error;
    }

    if (quantity > event.availableTickets) {
        const error = new Error("The selected ticket quantity is no longer available.");
        error.statusCode = 400;
        throw error;
    }

    const ticketPrice = Number(event.ticketPrice);
    return {
        event,
        quantity,
        ticketPrice,
        totalAmount: ticketPrice * quantity
    };
};

module.exports = { getEvents, getEventById, getBookingSummary };