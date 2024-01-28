import { User, Syslog } from '../database/models.js';
import bcrypt from 'bcrypt';

let SECRET = process.env.SECRET || "MrWiskers"

export const Register = function(req,res){
    if(req.session.user){
        res.redirect("/logout");
    } else {
        res.render("register",{
            "error":"",
        });
    }
}



export const submitRegister = async function(req,res){

    let { name, username, email, password, confirmPassword, avatar, warning, secret } = req.body;


    if (secret != SECRET) {
        const syslog = await Syslog.create({
            user: username,
            email: email,
            event: "Failed Registration",
            message: "Invalid secret",
            ip: req.socket.remoteAddress
        });
    }

    if((name && email && password && confirmPassword && username && warning) && (secret == SECRET) && (password == confirmPassword)){

        async function userRole () {
            let userCount = await User.count();
            if(userCount == 0){
                return "admin";
            }else{
                return "user";
            }
        }

        let existingUser = await User.findOne({ where: {email:email}});
        if(!existingUser){

            try {
                let currentDate = new Date();
                let newLogin = currentDate.toLocaleString();

                const user = await User.create({ 
                    name: name,
                    username: username,
                    email: email,
                    password: bcrypt.hashSync(password,10),
                    role: await userRole(),
                    group: 'all',
                    avatar: `<img src="/images/avatars/${avatar}">`,
                    lastLogin: newLogin,
                });

                // make sure the user was created and get the UUID.
                let newUser = await User.findOne({ where: {email:email}});
                let match = await bcrypt.compare(password,newUser.password);

                if(match){  
                    req.session.user = newUser.username;
                    req.session.UUID = newUser.UUID;
                    req.session.role = newUser.role;
                    req.session.avatar = newUser.avatar;

                    const syslog = await Syslog.create({
                        user: req.session.user,
                        email: email,
                        event: "Successful Registration",
                        message: "User registered successfully",
                        ip: req.socket.remoteAddress
                    });

                    res.redirect("/");
                }
            } catch(err) {
                res.render("register",{
                    "error":"Something went wrong when creating account.",
                });
            }

        } else {
                // return an error.
                res.render("register",{
                    "error":"User with that email already exists.",
                });
            }
    } else {
        // Redirect to the signup page.
        res.render("register",{
            "error":"Please fill in all the fields and acknowledge security warning.",
        });
    }
}