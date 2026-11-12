const categoryService = require("../../services/admin/categoryService");
const s3Service = require("../../services/admin/s3Service");

// ==========================================
// DISPLAY ADD CATEGORY PAGE
// ==========================================

const getAddCategory = (req, res) => {
    try {
        return res.render("admin/addCategory");
    } catch (error) {
        console.error("Add Category Page Error:", error);
        return res.status(500).send("Unable to load Add Category page.");
    }
};


// ==========================================
// DISPLAY CATEGORY MANAGEMENT PAGE
// ==========================================

const getCategories = async (req, res) => {
    try {
        const result = await categoryService.getCategories(req.query);

        const stats = await categoryService.getCategoryStats();

        // Generate signed S3 URLs for category images
        // Temporary event count until Event model is connected
        const categories = await Promise.all(
            result.categories.map(async (category) => {
                let imageUrl = null;

                if (category.image) {
                    imageUrl = await s3Service.getCategoryImageUrl(
                        category.image
                    );
                }

                return {
                    ...category,
                    imageUrl,
                    eventCount: 0
                };
            })
        );

        return res.render("admin/categories", {
            categories,

            totalCategories: stats.totalCategories,
            activeCategories: stats.activeCategories,
            inactiveCategories: stats.inactiveCategories,
            totalLinkedEvents: 0,

            currentPage: result.currentPage,
            totalPages: result.totalPages,
            search: result.search,
            status: result.status,
            sort: result.sort,
            limit: result.limit,

            successMessage: req.query.success || null,
            errorMessage: req.query.error || null
        });

    } catch (error) {
        console.error("Get Categories Error:", error);
        return res.status(500).send("Unable to load categories.");
    }
};


// ==========================================
// VIEW SINGLE CATEGORY
// ==========================================

const getCategory = async (req, res) => {
    try {
        const category = await categoryService.getCategoryById(
            req.params.id
        );

        return res.json({
            success: true,
            category
        });

    } catch (error) {
        console.error("Get Category Error:", error);

        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};


// ==========================================
// ADD CATEGORY
// ==========================================

const addCategory = async (req, res) => {
    try {

        // Pass form data and uploaded image to the service
        await categoryService.addCategory(
            req.body,
            req.file
        );

        return res.redirect(
            "/admin/categories?success=Category added successfully"
        );

    } catch (error) {
        console.error("Add Category Error:", error);

        return res.redirect(
            `/admin/categories?error=${encodeURIComponent(error.message)}`
        );
    }
};


// ==========================================
// UPDATE CATEGORY
// ==========================================

const updateCategory = async (req, res) => {
    try {

        // Pass form data and replacement image to the service
        await categoryService.updateCategory(
            req.params.id,
            req.body,
            req.file
        );

        return res.redirect(
            "/admin/categories?success=Category updated successfully"
        );

    } catch (error) {
        console.error("Update Category Error:", error);

        return res.redirect(
            `/admin/categories?error=${encodeURIComponent(error.message)}`
        );
    }
};


// ==========================================
// DELETE CATEGORY
// ==========================================

const deleteCategory = async (req, res) => {
    try {
        await categoryService.deleteCategory(req.params.id);

        return res.redirect(
            "/admin/categories?success=Category deleted successfully"
        );

    } catch (error) {
        console.error("Delete Category Error:", error);

        return res.redirect(
            `/admin/categories?error=${encodeURIComponent(error.message)}`
        );
    }
};


// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {
    getAddCategory,
    getCategories,
    getCategory,
    addCategory,
    updateCategory,
    deleteCategory
};