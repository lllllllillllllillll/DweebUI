const User = require('../database/UserModel');

exports.Account = async function(req, res) {
    if (req.session.user) {
        // Get the user.
        let user = await User.findOne({ where: { UUID: req.session.UUID }});
        // Render the home page
        res.render("pages/account", {
            first_name: user.first_name,
            last_name: user.last_name,
            name: user.first_name + ' ' + user.last_name,
            id: user.id,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            isLoggedIn: true
        });
    } else {
        // Redirect to the login page
        res.redirect("/login");
    }
}
