import { Permission, User, Syslog } from "../database/config.js";
import { readFileSync } from 'fs';
import { Capitalize } from '../utils/system.js';
import { trigger_docker_event } from "./docker.js";


export const adminOnly = async (req, res, next) => {
    let path = req.path;
    // console.log(`\x1b[90m ${req.session.username} ${path} \x1b[0m`);
    if (req.session.role == 'admin') { next(); return; }
    console.log(`User ${req.session.username} does not have permission to access ${path}`);
    res.redirect('/dashboard');
    return;
}


export const sessionCheck = async (req, res, next) => {
    let path = req.path;
    // if (path != '/server_metrics') { console.log(`\x1b[90m ${req.session.username} ${path} \x1b[0m`); }
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


export const permissionModal = async (req, res) => {
    let app_name = req.header('hx-trigger-name');
    let app_id = req.header('hx-trigger');
    let title = Capitalize(app_name);

    let users = await User.findAll({ attributes: ['username', 'userID'] });

    let modal_content =`<div class="modal-header">
                            <h5 class="modal-title">${title} Permissions</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body"><div class="accordion" id="accordion-example">`;

    for (let i = 0; i < users.length; i++) {
        if (users.length == 1) { modal_content += 'No other users.'; break; }
        // Skip the admin user.
        else if (i == 0) { continue; }
        let exists = await Permission.findOne({ where: {containerID: app_id, userID: users[i].userID}});
        if (!exists) { await Permission.create({ containerName: app_name, containerID: app_id, userID: users[i].userID, username: users[i].username}); }
        let permissions = await Permission.findOne({ where: {containerID: app_id, userID: users[i].userID}});
        let user_permissions = readFileSync('./views/partials/permissions.html', 'utf8');
        if (permissions.uninstall == true && permissions.edit == true && permissions.upgrade == true && permissions.start == true && permissions.stop == true && permissions.pause == true && permissions.restart == true && permissions.logs == true && permissions.view == true) { user_permissions = user_permissions.replace(/data-AllCheck/g, 'checked'); }
        if (permissions.uninstall == true) { user_permissions = user_permissions.replace(/data-UninstallCheck/g, 'checked'); }
        if (permissions.edit == true) { user_permissions = user_permissions.replace(/data-EditCheck/g, 'checked'); }
        if (permissions.upgrade == true) { user_permissions = user_permissions.replace(/data-UpgradeCheck/g, 'checked'); }
        if (permissions.start == true) { user_permissions = user_permissions.replace(/data-StartCheck/g, 'checked'); }
        if (permissions.stop == true) { user_permissions = user_permissions.replace(/data-StopCheck/g, 'checked'); }
        if (permissions.pause == true) { user_permissions = user_permissions.replace(/data-PauseCheck/g, 'checked'); }
        if (permissions.restart == true) { user_permissions = user_permissions.replace(/data-RestartCheck/g, 'checked'); }
        if (permissions.logs == true) { user_permissions = user_permissions.replace(/data-LogsCheck/g, 'checked'); }
        if (permissions.view == true) { user_permissions = user_permissions.replace(/data-ViewCheck/g, 'checked'); }
        user_permissions = user_permissions.replace(/Entry/g, i);
        user_permissions = user_permissions.replace(/Entry/g, i);
        user_permissions = user_permissions.replace(/Entry/g, i);
        user_permissions = user_permissions.replace(/container_id/g, app_id);
        user_permissions = user_permissions.replace(/container_name/g, app_name);
        user_permissions = user_permissions.replace(/user_id/g, users[i].userID);
        user_permissions = user_permissions.replace(/Username/g, users[i].username);
        modal_content += user_permissions;
    }
    modal_content += `</div></div>
                    <div class="modal-footer">
                        
                        <form id="reset_permissions" class="me-auto">
                            <input type="hidden" name="containerID" value="${app_id}">
                            <button type="button" class="btn btn-danger" data-bs-dismiss="modal" name="reset_permissions" id="submit" hx-post="/update_permissions" hx-confirm="Are you sure you want to reset permissions for this container?">Reset</button>
                        </form>

                        <button type="button" class="btn" data-bs-dismiss="modal">Close</button>
                    </div>`
    res.send(modal_content);
}


export const updatePermissions = async (req, res) => {
    let { containerID, containerName, userID, username, reset_permissions, select } = req.body;
    let button_id = req.header('hx-trigger');
    // Replaces the update button if it's been pressed.
    if (button_id == 'confirmed') { res.send('<button class="btn" type="button" id="submit" hx-post="/update_permissions" hx-swap="outerHTML">Update  </button>'); return; }
    // Reset all permissions for the container.
    if (reset_permissions == '') { await Permission.update({ uninstall: false, edit: false, upgrade: false, start: false, stop: false, pause: false, restart: false, logs: false, view: false }, { where: { containerID: containerID } }); trigger_docker_event(); return; }
    // Make sure req.body[select] is an array
    if (typeof req.body[select] == 'string') { req.body[select] = [req.body[select]]; }

    await Permission.update({ uninstall: false, edit: false, upgrade: false, start: false, stop: false, pause: false, restart: false, logs: false, view: false }, { where: { containerID: containerID, userID: userID } });
    if (req.body[select]) {
        for (let i = 0; i < req.body[select].length; i++) {
            let permissions = req.body[select][i];
            if (permissions == 'uninstall') { await Permission.update({ uninstall: true }, { where: {containerID: containerID, userID: userID}}); }  
            if (permissions == 'edit') { await Permission.update({ edit: true }, { where: {containerID: containerID, userID: userID}}); }   
            if (permissions == 'upgrade') { await Permission.update({ upgrade: true }, { where: {containerID: containerID, userID: userID}}); }   
            if (permissions == 'start') { await Permission.update({ start: true }, { where: {containerID: containerID, userID: userID}}); }   
            if (permissions == 'stop') { await Permission.update({ stop: true }, { where: {containerID: containerID, userID: userID}}); }   
            if (permissions == 'pause') { await Permission.update({ pause: true }, { where: {containerID: containerID, userID: userID}}); }   
            if (permissions == 'restart') { await Permission.update({ restart: true }, { where: {containerID: containerID, userID: userID}}); }   
            if (permissions == 'logs') { await Permission.update({ logs: true }, { where: {containerID: containerID, userID: userID}}); }
            if (permissions == 'view') { await Permission.update({ view: true }, { where: {containerID: containerID, userID: userID}}); }
        }
    }
    trigger_docker_event();
    res.send('<button class="btn" type="button" id="confirmed" hx-post="/update_permissions" hx-swap="outerHTML" hx-trigger="load delay:1s">Update ✔️</button>');
}