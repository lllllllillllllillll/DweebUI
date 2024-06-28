import { Permission } from '../database/models.js';

export const adminOnly = async (req, res, next) => {
    if (req.session.role == 'admin') { next(); }
    else { res.redirect('/dashboard'); }
}

export const sessionCheck = async (req, res, next) => {
    if (req.session.user) { next(); }
    else { res.redirect('/login'); }
}

export const permissionCheck = async (req, res, next) => {
    if (req.session.role == 'admin') { next(); return; }
    let user = req.session.user;
    let action = req.path.split("/")[2];
    let trigger = req.header('hx-trigger-name');
    const userAction = ['start', 'stop', 'restart', 'pause', 'uninstall', 'upgrade', 'edit', 'logs', 'view'];
    const userPaths = ['card', 'updates', 'hide', 'reset', 'alert'];
    if (userAction.includes(action)) {
        let permission = await Permission.findOne({ where: { containerName: trigger, user: user }, attributes: [`${action}`] });
        if (permission) { 
            if (permission[action] == true) {
                console.log(`User ${user} has permission to ${action} ${trigger}`);
                next();
                return;
            }
            else {
                console.log(`User ${user} does not have permission to ${action} ${trigger}`);
            }
        }
    } else if (userPaths.includes(action)) {
        next();
        return;
    }
}