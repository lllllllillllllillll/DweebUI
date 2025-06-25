import { Permission, User, Syslog, ServerSettings } from './db.js';


export const adminOnly = async (req, res, next) => {
    let path = req.path;
    // console.log(`\x1b[90m ${req.session.username} ${path} \x1b[0m`);
    if (req.session.role == 'admin') { next(); return; }
    // console.log(`User ${req.session.username} does not have permission to access ${path}`);
    res.redirect('/dashboard');
    return;
}


export const sessionCheck = async (req, res, next) => {


    let [authentication, created] = await ServerSettings.findOrCreate({ where: {key: 'authentication'}, defaults: { key: 'authentication', value: 'default' } });
    // if (created) { console.log(`\x1b[33mCreated key for authentication\x1b[0m`); }

    if (authentication.value == 'no_auth' || (authentication.value == 'localhost' && req.hostname == 'localhost')) { next(); return; }

    // Check if session exists first
    if (!req.session.userID) {
        // console.log(`\x1b[31mNo session found for user\x1b[0m`);
        res.redirect('/login');
        return;
    }

    // Then refresh session
    let user = await User.findOne({ where: { userID: req.session.userID } });
    if ((!user) || (user.status == 'disabled')) {
        console.log(`\x1b[31mDestroying session for user: \x1b[0m${req.session.username}`);
        req.session.destroy();
        req.session = null;
        res.redirect('/login');
        return;
    }

    next();
}


export const permissionCheck = async (req, res, next) => {
    
    // Skip permission check if user is admin
    if (req.session.role == 'admin') { next(); return; }
    
    // The route being requested
    let path = req.path;
    path = path.split('/').pop();

    let action = req.params.action || '';
    let view = req.params.view || '';
    let containerID = req.params.id || '';

    // Allowed paths, views, and actions required for the dashboard to function
    const allowedPaths = ['card_list', 'sse'];
    const allowedViews = ['card_list', 'update_card', 'chart'];
    const allowedActions = ['hide', 'reset'];
    if (allowedPaths.includes(path) || allowedViews.includes(view) || allowedActions.includes(action)) { next(); return; }

    // If the path, view, or action is not in the allowed list, check permissions
    let permission;
    if (action == 'start') { permission = await Permission.findOne({ where: { containerID: containerID, userID: req.session.userID }, attributes: ['start'] }); }
    if (action == 'stop') { permission = await Permission.findOne({ where: { containerID: containerID, userID: req.session.userID }, attributes: ['stop'] }); }
    if (action == 'pause') { permission = await Permission.findOne({ where: { containerID: containerID, userID: req.session.userID }, attributes: ['pause'] }); }
    if (action == 'restart') { permission = await Permission.findOne({ where: { containerID: containerID, userID: req.session.userID }, attributes: ['restart'] }); }
    if (action == 'edit') { permission = await Permission.findOne({ where: { containerID: containerID, userID: req.session.userID }, attributes: ['edit'] }); }

    if (view == 'logs') { permission = await Permission.findOne({ where: { containerID: containerID, userID: req.session.userID }, attributes: ['logs'] }); }
    if (view == 'details') { permission = await Permission.findOne({ where: { containerID: containerID, userID: req.session.userID }, attributes: ['details'] }); }

    if (permission) {

        if (permission[action] == true) {
            console.log(`\x1b[32mUser ${req.session.username} has permission for ${path}\x1b[0m`);
            await Syslog.create({ username: req.session.username, uniqueID: req.session.userID, event: "User Action", message: `User ${req.session.username} has permission to ${action} ${containerID}`, ip: req.socket.remoteAddress });
            next();
            return;
        } 
        else if (permission[view] == true) {
            console.log(`\x1b[32mUser ${req.session.username} has permission for ${path}\x1b[0m`);
            await Syslog.create({ username: req.session.username, uniqueID: req.session.userID, event: "User Action", message: `User ${req.session.username} has permission to view ${view} ${containerID}`, ip: req.socket.remoteAddress });
            next();
            return;
        }
        else {
            console.log(`\x1b[31mUser ${req.session.username} does NOT have permission for ${path}\x1b[0m`);
            await Syslog.create({ username: req.session.username, uniqueID: req.session.userID, event: "User Action", message: `User ${req.session.username} does not have permission to ${action} ${containerID}`, ip: req.socket.remoteAddress });
            let denied =`<div class="text-yellow d-inline-flex align-items-center lh-1 ms-auto" id="${'a' + containerID + 'State'}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="icon-tabler icon-tabler-point-filled" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"> <path stroke="none" d="M0 0h24v24H0z" fill="none"></path> <path d="M12 7a5 5 0 1 1 -4.995 5.217l-.005 -.217l.005 -.217a5 5 0 0 1 4.995 -4.783z" stroke-width="0" fill="currentColor"></path></svg>
                            <strong>Denied</strong>
                        </div>`;
            res.send(denied);
            return;
        }
    } else {
        console.log(`\x1b[31mUser ${req.session.username} does NOT have permission for ${path}\x1b[0m`);
    }



}