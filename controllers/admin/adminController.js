const User = require("../../models/User");

const dashboard = async (req, res) => {
try {
// Query parameters
const search =
typeof req.query.search === "string"
? req.query.search.trim()
: "";

    const status = ["all", "active", "blocked"].includes(
        req.query.status
    )
        ? req.query.status
        : "all";

    const sort = ["newest", "oldest", "az"].includes(
        req.query.sort
    )
        ? req.query.sort
        : "newest";

    const parsedPage = Number.parseInt(req.query.page, 10);

    let page =
        Number.isInteger(parsedPage) && parsedPage > 0
            ? parsedPage
            : 1;

    const limit = 5;

    // Base filter
    const filter = {
        role: "user"
    };

    // Status filter
    if (status === "active") {
        filter.status = "active";
    } else if (status === "blocked") {
        filter.status = "blocked";
    }

    // Search filter
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
                email: {
                    $regex: escapedSearch,
                    $options: "i"
                }
            }
        ];
    }

    // Sorting
    let sortOption;

    if (sort === "oldest") {
        sortOption = {
            createdAt: 1,
            _id: 1
        };
    } else if (sort === "az") {
        sortOption = {
            name: 1,
            _id: 1
        };
    } else {
        sortOption = {
            createdAt: -1,
            _id: -1
        };
    }

    // Dashboard statistics
    const [
        totalRegistered,
        activeAccounts,
        blockedAccounts
    ] = await Promise.all([
        User.countDocuments({ role: "user" }),
        User.countDocuments({
            role: "user",
            status: "active"
        }),
        User.countDocuments({
            role: "user",
            status: "blocked"
        })
    ]);

    // Pagination
    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    if (totalPages > 0 && page > totalPages) {
        page = totalPages;
    }

    if (totalPages === 0) {
        page = 1;
    }

    const skip = (page - 1) * limit;

    // Fetch only five users for the dashboard
    const users = await User.find(filter)
        .select("name email phone status createdAt")
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean();

    // Render dashboard
    return res.render("admin/dashboard", {
        users,
        search,
        status,
        sort,
        currentPage: page,
        totalPages,
        totalUsers,
        totalRegistered,
        activeAccounts,
        blockedAccounts,
        totalBookings: null
    });

} catch (error) {
    console.error("Admin dashboard error:", error);

    return res.status(500).send(
        "Unable to load the admin dashboard."
    );
}


};

// Export all users matching the current search and filters
const exportUsers = async (req, res) => {
try {
const search =
typeof req.query.search === "string"
? req.query.search.trim()
: "";

    const status = ["all", "active", "blocked"].includes(
        req.query.status
    )
        ? req.query.status
        : "all";

    const sort = ["newest", "oldest", "az"].includes(
        req.query.sort
    )
        ? req.query.sort
        : "newest";

    // Build the same filter used by the dashboard
    const filter = {
        role: "user"
    };

    if (status === "active") {
        filter.status = "active";
    } else if (status === "blocked") {
        filter.status = "blocked";
    }

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
                email: {
                    $regex: escapedSearch,
                    $options: "i"
                }
            }
        ];
    }

    // Apply the selected sorting
    let sortOption;

    if (sort === "oldest") {
        sortOption = { createdAt: 1, _id: 1 };
    } else if (sort === "az") {
        sortOption = { name: 1, _id: 1 };
    } else {
        sortOption = { createdAt: -1, _id: -1 };
    }

    // IMPORTANT: Do not use skip() or limit() here
    const users = await User.find(filter)
        .select("name email phone status createdAt")
        .sort(sortOption)
        .lean();

    // CSV escaping
    const escapeCSV = (value) => {
        const safeValue = String(value ?? "");

        // Prevent spreadsheet formula injection
        const safeForSpreadsheet = /^[\s]*[=+\-@]/.test(safeValue)
            ? "'" + safeValue
            : safeValue;

        return '"' + safeForSpreadsheet.replace(/"/g, '""') + '"';
    };

    const rows = [
        ["Name", "Email", "Phone", "Joined Date", "Status"],
        ...users.map((user) => [
            user.name || "",
            user.email || "",
            user.phone || "",
            user.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-GB")
                : "",
            user.status || ""
        ])
    ];

    const csv = rows
        .map((row) => row.map(escapeCSV).join(","))
        .join("\r\n");

    res.set({
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="onevent-users.csv"',
        "Cache-Control": "no-store, no-cache, must-revalidate, private"
    });

    return res.send("\uFEFF" + csv);

} catch (error) {
    console.error("Export users error:", error);

    return res.status(500).send(
        "Unable to export users report."
    );
}

};

module.exports = {
dashboard,
exportUsers
};
