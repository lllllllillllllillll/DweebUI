import { docker } from '../app.js';

export const Volumes = (req, res) => {
    res.render("volumes", {
        name: req.session.user,
        role: req.session.role,
        avatar: req.session.avatar,
    });
}