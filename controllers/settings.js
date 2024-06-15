
export const Settings = (req, res) => {

    res.render("settings", {
        name: req.session.user,
        role: req.session.role,
        avatar: req.session.user.charAt(0).toUpperCase(),
        alert: '',
    });
}


export const settingsAction = (req, res) => {
    let action = req.params.action;
    res.send('ok');
}