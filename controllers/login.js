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