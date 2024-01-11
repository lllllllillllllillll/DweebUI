
export const Portal = (req, res) => {


    res.render("portal", {
        name: req.session.user,
        role: req.session.role,
        avatar: req.session.avatar,
    });

}

