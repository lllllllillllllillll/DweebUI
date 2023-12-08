const User = require('../database/UserModel');
const bcrypt = require('bcrypt');


exports.Login = function(req,res){

     // check whether we have a session
     if(req.session.user){
        // Redirect to log out.
        res.redirect("/logout");
    }else{
        // Render the login page.
        res.render("pages/login",{
            "error":"",
            "isLoggedIn": false
        });
    }
}

exports.processLogin = async function(req,res){
    // get the data.
    let email = req.body.email;
    let password = req.body.password;
    // check if we have data.
    if(email && password){
        // check if the user exists.
        let existingUser = await User.findOne({ where: {email:email}});
        if(existingUser){
            // compare the password.
            let match = await bcrypt.compare(password,existingUser.password);
            if(match){
                // set the session.
                req.session.user = existingUser.username;
                req.session.UUID = existingUser.UUID;
                req.session.role = existingUser.role;

                // Redirect to the home page.
                res.redirect("/");
            }else{
                // return an error.
                res.render("pages/login",{
                    "error":"Invalid password",
                    isLoggedIn: false
                });
            }
        }else{
            // return an error.
            res.render("pages/login",{
                "error":"User with that email does not exist.",
                isLoggedIn:false
            });
        }
    }else{
        res.status(400);
        res.render("pages/login",{
            "error":"Please fill in all the fields.",
            isLoggedIn:false
        });
    }
}


exports.Logout = function(req,res){
    // clear the session.
    req.session.destroy();
    // Redirect to the login page.
    res.redirect("/login");    
}



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