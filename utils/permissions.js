import { Permission, User, Syslog } from "../db/config.js";
import { readFileSync } from 'fs';
import { Capitalize } from '../utils/system.js';


export const adminOnly = async (req, res, next) => {
    let path = req.path;
    // console.log(`\x1b[90m ${req.session.username} ${path} \x1b[0m`);
    if (req.session.role == 'admin') { next(); return; }
    console.log(`User ${req.session.username} does not have permission to access ${path}`);
    res.redirect('/dashboard');
    return;
}


export const sessionCheck = async (req, res, next) => {
    if (req.session.userID) { next(); }
    else { res.redirect('/login'); }
}


export const permissionCheck = async (req, res, next) => {
    if (req.session.role == 'admin') { next(); return; }

    let path = req.path;
    let containerID = req.params.containerid;
    let action = req.params.action;
    let AltIDState = 'a' + containerID + 'State';

    const userAction = ['start', 'stop', 'pause', 'restart', 'uninstall', 'upgrade', 'edit', 'logs', 'view'];
    const userPaths = ['/card_list', '/update_card', 'hide', 'reset', 'alert', '/sse', `/update_card/${containerID}` ];

    if (userAction.includes(action)) {
        let permission = await Permission.findOne({ where: { containerID: containerID, userID: req.session.userID }, attributes: [`${action}`] });
        if (permission) { 
            if (permission[action] == true) {
                // console.log(`User ${req.session.username} has permission for ${path}`);
                await Syslog.create({ username: req.session.username, uniqueID: req.session.userID, event: "User Action", message: `User ${req.session.username} has permission to ${action} ${containerID}`, ip: req.socket.remoteAddress });
                next();
                return;
            }
            else {
                console.log(`User ${req.session.username} does NOT have permission for ${path}`);
                await Syslog.create({ username: req.session.username, uniqueID: req.session.userID, event: "User Action", message: `User ${req.session.username} does not have permission to ${action} ${containerID}`, ip: req.socket.remoteAddress });
                let denied =`<div class="text-yellow d-inline-flex align-items-center lh-1 ms-auto" id="${AltIDState}">
                                <svg xmlns="http://www.w3.org/2000/svg" class="icon-tabler icon-tabler-point-filled" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"> <path stroke="none" d="M0 0h24v24H0z" fill="none"></path> <path d="M12 7a5 5 0 1 1 -4.995 5.217l-.005 -.217l.005 -.217a5 5 0 0 1 4.995 -4.783z" stroke-width="0" fill="currentColor"></path></svg>
                                <strong>Denied</strong>
                            </div>`;
                res.send(denied);
                return;
            }
        }
    } else if (userPaths.includes(path)) {
        // console.log(`User ${req.session.username} has permission for ${path}`);
        next();
        return;
    } else {
        console.log(`User ${req.session.username} does NOT have permission for ${path}`);
    }
}