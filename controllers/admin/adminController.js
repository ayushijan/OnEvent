const User = require("../../models/User");
const Event = require("../../models/Event");

const dashboard = async (req, res) => {
    try {
        const [totalUsers, totalEvents] = await Promise.all([
            User.countDocuments({ role: "user" }),
            Event.countDocuments()
        ]);

        return res.render("admin/dashboard", {
            totalUsers,
            totalEvents,
            totalBookings: 0,
            totalRevenue: 0,
            recentActivities: []
        });

    } catch (error) {
        console.error("Admin dashboard error:", error);

        return res.status(500).send(
            "Unable to load the admin dashboard."
        );
    }
};

module.exports = {
    dashboard
};