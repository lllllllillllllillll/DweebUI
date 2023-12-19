const User = require('../database/UserModel');

exports.Networks = async function(req, res) {

    
    // Render the home page
    res.render("pages/users", {
        name: req.session.user,
        role: req.session.role,
        avatar: req.session.avatar,
        isLoggedIn: true,
    });

}