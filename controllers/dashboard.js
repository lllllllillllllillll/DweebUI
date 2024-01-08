
export const Dashboard = (req, res) => {



    res.render("dashboard", {
        name: req.session.user,
        role: req.session.role,
        avatar: req.session.avatar,
    });

}

export const searchDashboard = (req, res) => {

    console.log(req.params);

    res.render("dashboard", {
        name: req.session.user,
        role: req.session.role,
        avatar: req.session.avatar,
    });

}