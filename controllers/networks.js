import { docker } from '../app.js';


export const Networks = async function(req, res) {


    res.render("networks", {
        name: req.session.user,
        role: req.session.role,
        avatar: req.session.avatar,
    });

}