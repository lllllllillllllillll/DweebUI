
export const Variables = (req, res) => {

    res.render("variables", {
        name: req.session.user,
        role: req.session.role,
        avatar: req.session.avatar,
    });
}