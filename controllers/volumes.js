const User = require('../database/UserModel');

exports.Volumes = async function(req, res) {



    // Render the home page
    res.render("pages/volumes", {
        name: req.session.user,
        role: req.session.role,
        avatar: req.session.avatar,
        isLoggedIn: true,
    });

}