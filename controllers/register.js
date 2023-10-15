const User = require('../database/UserModel');
const bcrypt = require('bcrypt');


exports.Register = function(req,res){
    // Check whether we have a session
    if(req.session.user){
        // Redirect to log out.
        res.redirect("/logout");
    } else {
        // Render the signup page.
        res.render("pages/register",{
            "error":"",
            isLoggedIn:false
        });
    }
}

exports.processRegister = async function(req,res){

    // Get the data.
    let { first_name, last_name, username, email, password, avatar, tos } = req.body;
    let role = "user";

    // Check the data.
    if(first_name && last_name && email && password && username && tos){

        // Check if there is an existing user with that username.
        let existingUser = await User.findOne({ where: {username:username}});

        let adminUser = await User.findOne({ where: {role:"admin"}});

        if(!existingUser){
            // hash the password.
            let hashedPassword = bcrypt.hashSync(password,10);

            if(!adminUser){
                console.log('Creating admin User');
                role = "admin";
            }

            try {
                const user = await User.create({ 
                    first_name: first_name,
                    last_name: last_name,
                    username: username,
                    email: email,
                    password: hashedPassword,
                    role: role,
                    group: 'all',
                    avatar: `<img src="./static/avatars/${avatar}">`
                 });

                console.log(`Created: ${user.first_name}`);

                // set the session.
                req.session.user = user.username;
                req.session.UUID = user.UUID;
                req.session.role = user.role;
                // Redirect to the home page.
                res.redirect("/");
            }
            catch (err) {
                // return an error.
                res.render("pages/register",{
                    "error":"Something went wrong when creating account.",
                    isLoggedIn:false
                });
            }

        }else{
            // return an error.
            res.render("pages/register",{
                "error":"User with that username already exists.",
                isLoggedIn:false
            });
        }
    }else{
        // Redirect to the signup page.
        res.render("pages/register",{
            "error":"Please fill in all the fields and accept TOS.",
            isLoggedIn:false
        });
    }
}