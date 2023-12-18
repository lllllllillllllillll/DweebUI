const User = require('../database/UserModel.js');
const Server = require('../database/ServerSettings.js');

exports.Settings = async function(req, res) {

    // Render the home page
    res.render("pages/settings", {
        name: req.session.user,
        role: req.session.role,
        avatar: req.session.avatar,
        isLoggedIn: true
    });

}