const User = require('../database/UserModel');

exports.Users = async function(req, res) {
    if (req.session.role == "admin") {

        // Get the user.
        let user = await User.findOne({ where: { UUID: req.session.UUID }});
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
            <th>Status</th>
            <th>Actions</th>
        </tr>`

        let users = await User.findAll();
        users.forEach((account) => {
            full_name = account.first_name + ' ' + account.last_name;
            user_info = `
            <tr>
                <td><input class="form-check-input" type="checkbox"></td>
                <td>${user.id}</td>
                <td><span class="avatar me-2">${account.avatar}</span></td>
                <td>${full_name}</td>
                <td>${account.username}</td>
                <td>${account.email}</td>
                <td>${account.UUID}</td>
                <td>${account.role}</td>
                <td><span class="badge badge-outline text-green">Active</span></td>
                <td><a href="#" class="btn">Edit</a></td>
            </tr>`

            user_list += user_info;
        });

        // Render the home page
        res.render("pages/users", {
            name: user.first_name + ' ' + user.last_name,
            role: user.role,
            avatar: user.avatar,
            isLoggedIn: true,
            user_list: user_list
        });
    } else {
        // Redirect to the login page
        res.redirect("/login");
    }
}