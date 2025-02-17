import { User, Permission, ContainerLists, Container, ServerSettings } from '../db/config.js';
import { Alert, Navbar, Footer } from '../utils/system.js';
import { trigger_docker_event } from '../utils/docker.js';
import { readFileSync } from 'fs';


export const Users = async function(req,res){
    
    let user_list = '';

    let allUsers = await User.findAll();
    allUsers.forEach((account) => {

        let lastLogin = new Date(account.lastLogin);
        let currentDate = new Date();
        let days = Math.floor((currentDate - lastLogin) / (1000 * 60 * 60 * 24));
        let avatar = account.username.charAt(0);

        let active = '<span class="badge badge-outline text-green" title="User has logged-in within the last 30 days.">Active</span>'

        if ((days > 30) && (account.status == 'active')) {
            active = '<span class="badge badge-outline text-grey" title="User has not logged-in within the last 30 days.">Inactive</span>';
        }
        else if (account.status == 'disabled') {
            active = '<span class="badge badge-outline text-grey" title="User is disabled.">Disabled</span>';
        }

        let info = `
        <tr>
            <td><input class="form-check-input" type="checkbox" name="select"></td>
            
            <td class="sort-id">${account.id}</td>
            <td class="sort-avatar p-1"><span class="avatar avatar-sm bg-green-lt">${avatar}</span></span>
            <td class="sort-name">${account.name}</td>
            <td class="sort-username">${account.username}</td>
            <td class="sort-email">${account.email}</td>
            <td class="sort-userid">${account.userID}</td>
            <td class="sort-role">${account.role}</td>
            <td class="sort-lastlogin">${account.lastLogin}</td>
            <td class="sort-active">${active}</td>
            <td class="sort-action"><button class="badge badge-outline text-grey" id="${account.username}" data-hx-get="/users/view/user/${account.userID}" hx-target="#modal_content"  hx-swap="innerHTML" data-bs-toggle="modal" data-bs-target="#scrolling_modal">View</button></td>
        </tr>`

        user_list += info;
    });

    res.render("users",{ 
        alert: req.session.alert,
        username: req.session.username,
        role: req.session.role,
        user_count: allUsers.length,
        user_list: user_list,
        navbar: await Navbar(req),
        footer: await Footer(req),
    });
}





export const searchUsers = async function (req, res) {
    console.log(`[Search] ${req.body.search}`);
    res.send('ok');
    return;
}



export const UsersView = async (req, res) => {

    let view = req.params.view;
    let userID = req.params.id;
    let username = req.header('hx-trigger');

    // console.log(`[view] ${view} - [userID] ${userID} - [username] ${username}`);

    if (view == 'user') {
        let user = await User.findOne({ where: { userID: userID } });

        let status = '';
        let status_toggle = '';

        if (user.status == 'active') {
            status = '<div class="me-auto badge badge-outline text-green">Active</div>';
            status_toggle = '<button type="submit" name="change" value="disable" class="btn btn-secondary w-100" hx-confirm="Are you sure you want to disable this account?">Disable</button>';
        } else {
            status = '<div class="me-auto badge badge-outline text-grey">Disabled</div>';
            status_toggle = '<button type="submit" name="change" value="enable" class="btn btn-success w-100" hx-confirm="Are you sure you want to enable this account?">Enable</button>';
        }

        
        
        let modal = readFileSync('./views/partials/user.html', 'utf8');
        modal = modal.replace(/Username/g, username);
        modal = modal.replace(/UserStatus/g, status);
        modal = modal.replace(/USERID/g, user.userID);
        modal = modal.replace(/FullName/g, user.name);
        modal = modal.replace(/EmailAddress/g, user.email);
        modal = modal.replace(/LastLogin/g, user.lastLogin);
        modal = modal.replace(/CreatedAt/g, user.createdAt);
        modal = modal.replace(/StatusToggle/g, status_toggle);
        res.send(modal);
        return;
    }

};


export const UsersAction = async (req, res) => {

    let action = req.params.action;
    let userID = req.params.id;
    let change = req.body.change;

    // console.log(`[action] ${action} [change] ${change} - [userID] ${userID}`);

    if (change == 'remove') {
        
        let container_lists = await ContainerLists.findAll({ where: { userID: userID } });
        container_lists.forEach(async (container_list) => {
            await container_list.destroy();
        });

        let permissions = await Permission.findAll({ where: { userID: userID } });
        permissions.forEach(async (permission) => {
            await permission.destroy();
        });

        let user = await User.findOne({ where: { userID: userID } });
        await user.destroy();
        req.session.alert = Alert('success', `User ${user.username} removed.`);
    } 
    else if (change == 'reset_permissions') {
        let user = await User.findOne({ where: { userID: userID } });
        let permissions = await Permission.findAll({ where: { userID: userID } });
        permissions.forEach(async (permission) => {
            await permission.destroy();
        });
        req.session.alert = Alert('success', `Permissions reset for ${user.username}.`);
        trigger_docker_event();
    }
    else if (change == 'disable') {
        let user = await User.findOne({ where: { userID: userID } });
        user.update({ status: 'disabled' });
        req.session.alert = Alert('success', `User ${user.username} disabled.`);
    }
    else if (change == 'enable') {
        let user = await User.findOne({ where: { userID: userID } });
        user.update({ status: 'active' });
        req.session.alert = Alert('success', `User ${user.username} enabled.`);
    }


    res.redirect('/users');

};