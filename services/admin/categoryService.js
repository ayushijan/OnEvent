const Category = require("../../models/Category");
const Event = require("../../models/Event");
const mongoose = require("mongoose");
const s3Service = require("./s3Service");


// ==========================================
// GENERATE URL-FRIENDLY SLUG
// ==========================================

const generateSlug = (name) => {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
};


// ==========================================
// CHECK DUPLICATE CATEGORY
// ==========================================

const checkDuplicateCategory = async (name, excludeId = null) => {

    const slug = generateSlug(name);

    const filter = {
        slug,
        isDeleted: false
    };

    if (excludeId) {
        filter._id = { $ne: excludeId };
    }

    return await Category.findOne(filter);
};


// ==========================================
// ADD CATEGORY
// ==========================================

const addCategory = async (data, imageFile = null) => {

    const name = String(data.name || "").trim();
    const description = String(data.description || "").trim();

    if (!name) {
        throw new Error("Category name is required.");
    }

    if (name.length > 50) {
        throw new Error("Category name cannot exceed 50 characters.");
    }

    if (description.length > 500) {
        throw new Error("Description cannot exceed 500 characters.");
    }

    const slug = generateSlug(name);

    const existingCategory = await checkDuplicateCategory(name);

    if (existingCategory) {
        throw new Error("Category already exists.");
    }

    // Upload image to Amazon S3
    let imageKey = null;

    if (imageFile) {
        const uploadedImage = await s3Service.uploadCategoryImage(imageFile);
        imageKey = uploadedImage.key;
    }

    const category = new Category({
        name,
        slug,
        description,
        image: imageKey,
        status: data.status === "inactive" ? "inactive" : "active"
    });

    return await category.save();
};


// ==========================================
// GET ALL CATEGORIES
// Search + Filter + Sort + Pagination
// ==========================================

const getCategories = async (query) => {

    const search = String(query.search || "").trim();

    const status = ["active", "inactive"].includes(query.status)
        ? query.status
        : "all";

    const sort = ["newest", "oldest", "az", "za"].includes(query.sort)
        ? query.sort
        : "newest";

    const page = Math.max(1, parseInt(query.page, 10) || 1);

    const limit = Math.min(
        50,
        Math.max(1, parseInt(query.limit, 10) || 10)
    );

    const filter = {
        isDeleted: false
    };

    // Status filter
    if (status !== "all") {
        filter.status = status;
    }

    // Backend search
    if (search) {

        const escapedSearch = search.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

        filter.$or = [
            {
                name: {
                    $regex: escapedSearch,
                    $options: "i"
                }
            },
            {
                description: {
                    $regex: escapedSearch,
                    $options: "i"
                }
            },
            {
                slug: {
                    $regex: escapedSearch,
                    $options: "i"
                }
            }
        ];
    }

    // Sorting
    const sortOptions = {
        newest: { createdAt: -1 },
        oldest: { createdAt: 1 },
        az: { name: 1 },
        za: { name: -1 }
    };

    const totalCategories = await Category.countDocuments(filter);

    const totalPages = Math.ceil(totalCategories / limit);

    const currentPage = Math.min(page, Math.max(totalPages, 1));

    // Fetch categories
    const categories = await Category.find(filter)
        .sort(sortOptions[sort])
        .skip((currentPage - 1) * limit)
        .limit(limit)
        .lean();


    // ==========================================
    // GET LINKED EVENT COUNTS
    // ==========================================

    const categoryIds = categories.map(category => category._id);

    const eventCounts = await Event.aggregate([
        {
            $match: {
                categoryId: { $in: categoryIds },
                isDeleted: false
            }
        },
        {
            $group: {
                _id: "$categoryId",
                count: { $sum: 1 }
            }
        }
    ]);

    // Create event count map
    const eventCountMap = new Map(
        eventCounts.map(item => [
            item._id.toString(),
            item.count
        ])
    );

    // Attach linked event count to each category
    const categoriesWithEventCount = categories.map(category => ({
        ...category,
        linkedEvents: eventCountMap.get(category._id.toString()) || 0
    }));


    // ==========================================
    // RETURN RESULTS
    // ==========================================

    return {
        categories: categoriesWithEventCount,
        currentPage,
        totalPages,
        totalCategories,
        search,
        status,
        sort,
        limit
    };
};


// ==========================================
// GET SINGLE CATEGORY
// ==========================================

const getCategoryById = async (id) => {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid category ID.");
    }

    const category = await Category.findOne({
        _id: id,
        isDeleted: false
    });

    if (!category) {
        throw new Error("Category not found.");
    }

    return category;
};


// ==========================================
// UPDATE CATEGORY
// ==========================================

const updateCategory = async (id, data, imageFile = null) => {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid category ID.");
    }

    const category = await Category.findOne({
        _id: id,
        isDeleted: false
    });

    if (!category) {
        throw new Error("Category not found.");
    }

    const name = String(data.name || "").trim();
    const description = String(data.description || "").trim();

    if (!name) {
        throw new Error("Category name is required.");
    }

    if (name.length > 50) {
        throw new Error("Category name cannot exceed 50 characters.");
    }

    if (description.length > 500) {
        throw new Error("Description cannot exceed 500 characters.");
    }

    const existingCategory = await checkDuplicateCategory(name, id);

    if (existingCategory) {
        throw new Error("Another category with this name already exists.");
    }

    category.name = name;
    category.slug = generateSlug(name);
    category.description = description;

    category.status = data.status === "inactive"
        ? "inactive"
        : "active";

    // Upload replacement image to S3 if provided
    if (imageFile) {
        const uploadedImage = await s3Service.uploadCategoryImage(imageFile);
        category.image = uploadedImage.key;
    }

    return await category.save();
};


// ==========================================
// SOFT DELETE CATEGORY
// ==========================================

const deleteCategory = async (id) => {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid category ID.");
    }

    const category = await Category.findOne({
        _id: id,
        isDeleted: false
    });

    if (!category) {
        throw new Error("Category not found.");
    }

    category.isDeleted = true;

    try {

        return await category.save();

    } catch (error) {

        if (error.code === 11000) {
            throw new Error("A category with this name already exists.");
        }

        throw error;
    }
};


// ==========================================
// GET CATEGORY STATISTICS
// ==========================================

const getCategoryStats = async () => {

    const totalCategories = await Category.countDocuments({
        isDeleted: false
    });

    const activeCategories = await Category.countDocuments({
        isDeleted: false,
        status: "active"
    });

    const inactiveCategories = await Category.countDocuments({
        isDeleted: false,
        status: "inactive"
    });

    // Count all non-deleted events
    const linkedEvents = await Event.countDocuments({
        isDeleted: false
    });

    return {
        totalCategories,
        activeCategories,
        inactiveCategories,
        linkedEvents
    };
};


// ==========================================
// EXPORT FUNCTIONS
// ==========================================

module.exports = {
    addCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    getCategoryStats,
    generateSlug
};