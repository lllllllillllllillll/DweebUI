const User = require('../database/UserModel');


exports.Dashboard = async function (req, res) {

    if (req.session.role == "admin") {

        // get user data with matching UUID from sqlite database
        let user = await User.findOne({ where: { UUID: req.session.UUID } });

        // Render the home page
        res.render("pages/dashboard", {
            name: user.first_name + ' ' + user.last_name,
            role: user.role,
            avatar: user.avatar,
            isLoggedIn: true,
            site_list: req.app.locals.site_list,
        });
    } else {
        // Redirect to the login page
        res.redirect("/login");
    }
}