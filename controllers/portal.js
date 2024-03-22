
export const Portal = (req, res) => {

    if (!req.session.user) {
        res.redirect("/login");
        return;
    }

    res.render("portal", {
        name: req.session.user,
        role: req.session.role,
        avatar: req.session.avatar,
    });

}

