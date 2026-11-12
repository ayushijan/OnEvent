require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("./config/passport");

// User session middleware
const userSession = require("./middleware/userSession");

const app = express();

// =====================================
// IMPORT ROUTES
// =====================================

const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const eventRoutes = require("./routes/eventRoutes");

// =====================================
// VALIDATE ENVIRONMENT VARIABLES
// =====================================

if (!process.env.SESSION_SECRET) {
    throw new Error(
        "SESSION_SECRET is missing from your .env file."
    );
}

// =====================================
// BODY PARSING
// =====================================

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// =====================================
// VIEW ENGINE
// =====================================

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

// =====================================
// STATIC FILES
// =====================================

app.use(express.static(path.join(__dirname, "public")));

app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

// =====================================
// SESSION CONFIGURATION
// =====================================

app.use(
    session({
        name: "onevent.sid",

        secret: process.env.SESSION_SECRET,

        resave: false,

        saveUninitialized: false,

        cookie: {
            httpOnly: true,

            secure: process.env.NODE_ENV === "production",

            sameSite: "lax",

            path: "/",

            maxAge: 1000 * 60 * 60 * 24
        }
    })
);

// =====================================
// PASSPORT AUTHENTICATION
// =====================================

app.use(passport.initialize());

app.use(passport.session());

// =====================================
// USER SESSION MIDDLEWARE
// =====================================

app.use(userSession);

// =====================================
// APPLICATION ROUTES
// =====================================

// User routes
app.use("/", userRoutes);

// Admin routes
app.use("/", adminRoutes);

// Category management routes
app.use("/admin", categoryRoutes);

// Event management routes
app.use("/admin", eventRoutes);

// =====================================
// 404 HANDLER
// =====================================

app.use((req, res) => {
    res.status(404).send("Page not found.");
});

// =====================================
// ERROR HANDLER
// =====================================

app.use((err, req, res, next) => {
    console.error("Application error:", err);

    if (res.headersSent) {
        return next(err);
    }

    res.status(err.statusCode || 500).send(
        process.env.NODE_ENV === "production"
            ? "Something went wrong. Please try again."
            : err.message
    );
});

// =====================================
// EXPORT APP
// =====================================

module.exports = app;