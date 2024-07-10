import { Permission } from '../database/models.js';

export const adminOnly = async (req, res, next) => {
    if (req.session.role == 'admin') { next(); }
    else { res.redirect('/dashboard'); }
}

export const sessionCheck = async (req, res, next) => {
    if (req.session.username) { next(); }
    else { res.redirect('/login'); }
}

export const permissionCheck = async (req, res, next) => {
    if (req.session.role == 'admin') { next(); return; }
    let username = req.session.username;
    let action = req.path.split("/")[2];
    let container_id = req.header('hx-trigger-name');
    const userAction = ['start', 'stop', 'restart', 'pause', 'uninstall', 'upgrade', 'edit', 'logs', 'view'];
    const userPaths = ['card', 'updates', 'hide', 'reset', 'alert'];
    if (userAction.includes(action)) {
        let permission = await Permission.findOne({ where: { containerID: container_id, userID: req.session.userID }, attributes: [`${action}`] });
        if (permission) { 
            if (permission[action] == true) {
                console.log(`User ${username} has permission to ${action} ${trigger}`);
                next();
                return;
            }
            else {
                console.log(`User ${username} does not have permission to ${action} ${trigger}`);
            }
        }
    } else if (userPaths.includes(action)) {
        next();
        return;
    }
}