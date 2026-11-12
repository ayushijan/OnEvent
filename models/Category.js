const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50
        },

        slug: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },

        description: {
            type: String,
            trim: true,
            maxlength: 500,
            default: ""
        },

        image: {
            type: String,
            default: null
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
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

// Search and filtering indexes
categorySchema.index({ name: 1 });
categorySchema.index({ status: 1, isDeleted: 1 });
categorySchema.index({ createdAt: -1 });

// Prevent duplicate active category slugs
categorySchema.index(
    { slug: 1 },
    {
        unique: true,
        partialFilterExpression: { isDeleted: false }
    }
);

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;