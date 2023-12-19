

exports.Images = async function(req, res) {
    
    
    // Render the home page
    res.render("pages/images", {
        name: req.session.user,
        role: req.session.role,
        avatar: req.session.avatar,
        isLoggedIn: true,
    });

}