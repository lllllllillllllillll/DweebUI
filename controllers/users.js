import { ServerSettings, User } from '../database/config.js';
import { Alert, getLanguage, Navbar } from '../utils/system.js';

export const Users = async function(req,res){

    let user_list = `
    <tr>
        <th><input class="form-check-input" type="checkbox"></th>
        <th>ID</th>
        <th>Avatar</th>
        <th>Name</th>
        <th>Username</th>
        <th>Email</th>
        <th>UserID</th>
        <th>Role</th>
        <th>Last Login</th>
        <th>Status</th>
        <th>Actions</th>
    </tr>`

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
            <td><input class="form-check-input" type="checkbox"></td>
            <td>${account.id}</td>
            <td><span class="avatar avatar-sm bg-green-lt">${avatar}</span></span>
            <td>${account.name}</td>
            <td>${account.username}</td>
            <td>${account.email}</td>
            <td>${account.userID}</td>
            <td>${account.role}</td>
            <td>${account.lastLogin}</td>
            <td>${active}</td>
            <td><a href="#" class="btn">View</a></td>
        </tr>`

        user_list += info;
    });

    res.render("users",{ 
        alert: '',
        username: req.session.username,
        role: req.session.role,
        user_list: user_list,
        navbar: await Navbar(req),
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
    });

}