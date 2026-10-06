const User = require("../../models/User");


const dashboard = async (req, res) => {

    try {

        const search = req.query.search || "";

        const page = parseInt(req.query.page) || 1;

        const limit = 5;

        const skip = (page - 1) * limit;


        const filter = {
            role: "user"
        };


        if (search.trim() !== "") {

            filter.$or = [

                {
                    name: {
                        $regex: search.trim(),
                        $options: "i"
                    }
                },

                {
                    email: {
                        $regex: search.trim(),
                        $options: "i"
                    }
                }

            ];

        }


        const totalUsers = await User.countDocuments(filter);


        const totalPages = Math.ceil(
            totalUsers / limit
        );


        const users = await User.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);


        res.render("admin/dashboard", {

            users: users,

            search: search,

            currentPage: page,

            totalPages: totalPages

        });


    } catch (error) {

        res.status(500).send(error.message);

    }

};


module.exports = {
    dashboard
};