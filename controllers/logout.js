exports.Logout = function(req,res){
    // clear the session.
    req.session.destroy();
    // Redirect to the login page.
    res.redirect("/login");    
}