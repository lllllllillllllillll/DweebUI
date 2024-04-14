import { User } from '../database/models.js';

export const Users = async (req, res) => {
   
    let user_list = `
    <tr>
        <th><input class="form-check-input" type="checkbox"></th>
        <th>ID</th>
        <th>Avatar</th>
        <th>Name</th>
        <th>Username</th>
        <th>Email</th>
        <th>UUID</th>
        <th>Role</th>
        <th>Last Login</th>
        <th>Status</th>
        <th>Actions</th>
    </tr>`

    let allUsers = await User.findAll();
    allUsers.forEach((account) => {

        let active = '<span class="badge badge-outline text-green">Active</span>'
        let lastLogin = new Date(account.lastLogin);
        let currentDate = new Date();
        let days = Math.floor((currentDate - lastLogin) / (1000 * 60 * 60 * 24));
        let avatar = account.username.charAt(0);

        if (days > 30) {
            active = '<span class="badge badge-outline text-grey">Inactive</span>';
        }



        let info = `
        <tr>
            <td><input class="form-check-input" type="checkbox"></td>
            <td>${account.id}</td>
            <td><span class="avatar avatar-sm bg-green-lt">${avatar}</span></span>
            <td>${account.name}</td>
            <td>${account.username}</td>
            <td>${account.email}</td>
            <td>${account.UUID}</td>
            <td>${account.role}</td>
            <td>${account.lastLogin}</td>
            <td>${active}</td>
            <td><a href="#" class="btn">View</a></td>
        </tr>`

        user_list += info;
    });


    res.render("users", {
        name: req.session.user,
        role: req.session.role,
        avatar: req.session.avatar,
        user_list: user_list
    });

}