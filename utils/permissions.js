import { Permission } from "../database/config.js";

export const adminOnly = async (req, res, next) => {
    if (req.session.role == 'admin') { next(); }
    else { res.redirect('/0/dashboard'); }
}

export const sessionCheck = async (req, res, next) => {
    if (req.session.username) { next(); }
    else { res.redirect('/login'); }
}


export const permissionCheck = async (req, res, next) => {

}