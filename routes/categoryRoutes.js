const express = require("express");

const router = express.Router();

const categoryController = require("../controllers/admin/categoryController");
const categoryUpload = require("../middleware/categoryUpload");

// ==========================================
// ADD CATEGORY PAGE
// ==========================================

router.get(
    "/categories/new",
    categoryController.getAddCategory
);

// ==========================================
// CATEGORY MANAGEMENT
// ==========================================

router.get(
    "/categories",
    categoryController.getCategories
);

// ==========================================
// VIEW SINGLE CATEGORY
// ==========================================

router.get(
    "/categories/:id",
    categoryController.getCategory
);

// ==========================================
// ADD CATEGORY WITH IMAGE UPLOAD
// ==========================================

router.post(
    "/categories/add",
    categoryUpload.single("image"),
    categoryController.addCategory
);

// ==========================================
// UPDATE CATEGORY
// ==========================================

router.post(
    "/categories/edit/:id",
    categoryUpload.single("image"),
    categoryController.updateCategory
);

// ==========================================
// DELETE CATEGORY
// ==========================================

router.post(
    "/categories/delete/:id",
    categoryController.deleteCategory
);

module.exports = router;