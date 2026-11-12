const express = require("express");

const router = express.Router();

const eventController = require("../controllers/admin/eventController");
const eventUpload = require("../middleware/eventUpload");

router.get("/events/new", eventController.getAddEvent);

router.get("/events", eventController.getEvents);

router.get("/events/:id", eventController.getEvent);

router.get("/events/edit/:id", eventController.getEditEvent);

router.post(
    "/events/add",
    eventUpload.single("image"),
    eventController.addEvent
);

router.post(
    "/events/edit/:id",
    eventUpload.single("image"),
    eventController.updateEvent
);

router.post(
    "/events/delete/:id",
    eventController.deleteEvent
);

module.exports = router;