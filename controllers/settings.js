const User = require('../database/UserModel.js');

exports.Settings = async function(req, res) {
    if (req.session.role == "admin") {
        // Get the user.
        let user = await User.findOne({ where: { UUID: req.session.UUID }});

        

        // Render the home page
        res.render("pages/settings", {
            name: user.first_name + ' ' + user.last_name,
            role: user.role,
            avatar: user.avatar,
            isLoggedIn: true
        });
    } else {
        // Redirect to the login page
        res.redirect("/login");
    }
}