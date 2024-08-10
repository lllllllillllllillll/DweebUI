import { Permission } from "../database/config.js";
import { readFileSync } from 'fs';

export const adminOnly = async (req, res, next) => {
    if (req.session.role == 'admin') { next(); }
    else { res.redirect('/0/dashboard'); }
}

export const sessionCheck = async (req, res, next) => {
    if (req.session.username) { next(); }
    else { res.redirect('/login'); }
}


export const permissionCheck = async (req, res, next) => {
    next();
}




export const permissionModal = async (req, res) => {

    // let title = name.charAt(0).toUpperCase() + name.slice(1);
    // let permissions_list = '';
    let permissions_modal = readFileSync('./views/partials/permissions.html', 'utf8');
    // permissions_modal = permissions_modal.replace(/PermissionsTitle/g, title);
    // permissions_modal = permissions_modal.replace(/PermissionsContainer/g, name);
    // let users = await User.findAll({ attributes: ['username', 'UUID']});
    // for (let i = 0; i < users.length; i++) {
    //     let user_permissions = readFileSync('./views/partials/user_permissions.html', 'utf8');
    //     let exists = await Permission.findOne({ where: {containerName: name, user: users[i].username}});
    //     if (!exists) { const newPermission = await Permission.create({ containerName: name, user: users[i].username, userID: users[i].UUID}); }
    //     let permissions = await Permission.findOne({ where: {containerName: name, user: users[i].username}});
    //     if (permissions.uninstall == true) { user_permissions = user_permissions.replace(/data-UninstallCheck/g, 'checked'); }
    //     if (permissions.edit == true) { user_permissions = user_permissions.replace(/data-EditCheck/g, 'checked'); }
    //     if (permissions.upgrade == true) { user_permissions = user_permissions.replace(/data-UpgradeCheck/g, 'checked'); }
    //     if (permissions.start == true) { user_permissions = user_permissions.replace(/data-StartCheck/g, 'checked'); }
    //     if (permissions.stop == true) { user_permissions = user_permissions.replace(/data-StopCheck/g, 'checked'); }
    //     if (permissions.pause == true) { user_permissions = user_permissions.replace(/data-PauseCheck/g, 'checked'); }
    //     if (permissions.restart == true) { user_permissions = user_permissions.replace(/data-RestartCheck/g, 'checked'); }
    //     if (permissions.logs == true) { user_permissions = user_permissions.replace(/data-LogsCheck/g, 'checked'); }
    //     if (permissions.view == true) { user_permissions = user_permissions.replace(/data-ViewCheck/g, 'checked'); }
    //     user_permissions = user_permissions.replace(/EntryNumber/g, i);
    //     user_permissions = user_permissions.replace(/EntryNumber/g, i);
    //     user_permissions = user_permissions.replace(/EntryNumber/g, i);
    //     user_permissions = user_permissions.replace(/PermissionsUsername/g, users[i].username);
    //     user_permissions = user_permissions.replace(/PermissionsUsername/g, users[i].username);
    //     user_permissions = user_permissions.replace(/PermissionsUsername/g, users[i].username);
    //     user_permissions = user_permissions.replace(/PermissionsContainer/g, name);
    //     user_permissions = user_permissions.replace(/PermissionsContainer/g, name);
    //     user_permissions = user_permissions.replace(/PermissionsContainer/g, name);
    //     permissions_list += user_permissions;
    // }
    // permissions_modal = permissions_modal.replace(/PermissionsList/g, permissions_list);
    res.send(permissions_modal);
}