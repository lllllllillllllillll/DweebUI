import { User, Permission, ContainerLists, Container, ServerSettings } from '../db/config.js';
import { Alert, Navbar, Footer } from '../utils/system.js';
import { readFileSync } from 'fs';

export const Users = async function(req,res){

    req.session.host = `${req.params.host || 1}`;
    
    let user_list = '';

    let allUsers = await User.findAll();
    allUsers.forEach((account) => {

        let active = '<span class="badge badge-outline text-green" title="User has logged-in within the last 30 days.">Active</span>'
        let lastLogin = new Date(account.lastLogin);
        let currentDate = new Date();
        let days = Math.floor((currentDate - lastLogin) / (1000 * 60 * 60 * 24));
        let avatar = account.username.charAt(0);

        if (days > 30) {
            active = '<span class="badge badge-outline text-grey" title="User has not logged-in within the last 30 days.">Inactive</span>';
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
        alert: '',
        username: req.session.username,
        role: req.session.role,
        user_list: user_list,
        navbar: await Navbar(req),
        footer: await Footer(req),
    });
}



export const submitUsers = async function(req,res){

    // console.log(req.body);

    let trigger_name = req.header('hx-trigger-name');
    let trigger_id = req.header('hx-trigger');

    console.log(`trigger_name: ${trigger_name} - trigger_id: ${trigger_id}`);


    // [HTMX Triggered] Changes the update button.
    if(trigger_id == 'settings'){
        res.send(`<button class="btn btn-success" hx-post="/settings" hx-trigger="load delay:2s" hx-swap="outerHTML" id="submit" hx-target="#submit">Updated</button>`);
        return;
    } else if (trigger_id == 'submit'){
        res.send(`<button class="btn btn-primary" id="submit" form="settings">Update</button>`);
        return;
    }

    res.render("users",{
        alert: '',
        username: req.session.username,
        role: req.session.role,
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
        let modal = readFileSync('./views/partials/user.html', 'utf8');
        modal = modal.replace(/Username/g, username);
        modal = modal.replace(/USERID/g, user.userID);
        modal = modal.replace(/FullName/g, user.name);
        modal = modal.replace(/EmailAddress/g, user.email);
        modal = modal.replace(/LastLogin/g, user.lastLogin);
        modal = modal.replace(/CreatedAt/g, user.createdAt);
        res.send(modal);
        return;
    }

};


export const UsersAction = async (req, res) => {

    let action = req.params.action;
    let userID = req.params.id;
    let change = req.body.change;

    console.log(`[action] ${action} [change] ${change} - [userID] ${userID}`);

    if (change == 'remove') {
        
        let container_lists = await ContainerLists.findAll({ where: { userID: userID } });
        container_lists.destroy();

        let permissions = await Permission.findAll({ where: { userID: userID } });
        permissions.forEach(async (permission) => {
            await permission.destroy();
        });

        let user = await User.findOne({ where: { userID: userID } });
        await user.destroy();

        console.log(`User removed.`);
    }

    res.redirect('/users');

};