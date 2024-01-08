
export const Settings = (req, res) => {

    res.render("settings", {
        name: req.session.user,
        role: req.session.role,
        avatar: req.session.avatar,
    });
}