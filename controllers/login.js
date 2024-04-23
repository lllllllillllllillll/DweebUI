import { User, Syslog } from '../database/models.js';
import bcrypt from 'bcrypt';



export const Login = function(req,res){
    if(req.session.user){
        res.redirect("/logout");
    }else{
        res.render("login",{
            "error":"",
        });
    }
}

export const submitLogin = async function(req,res){

    let { email, password } = req.body;
    email = email.toLowerCase();

    if(email && password){

        let existingUser = await User.findOne({ where: {email:email}});
        if(existingUser){

            let match = await bcrypt.compare(password,existingUser.password);

            if(match){

                let currentDate = new Date();
                let newLogin = currentDate.toLocaleString();
                await User.update({lastLogin: newLogin}, {where: {UUID:existingUser.UUID}});

                req.session.user = existingUser.username;
                req.session.UUID = existingUser.UUID;
                req.session.role = existingUser.role;
                req.session.avatar = existingUser.avatar;

                const syslog = await Syslog.create({
                    user: req.session.user,
                    email: email,
                    event: "Successful Login",
                    message: "User logged in successfully",
                    ip: req.socket.remoteAddress
                });
                res.redirect("/dashboard");
            }else{

                const syslog = await Syslog.create({
                    user: null,
                    email: email,
                    event: "Bad Login",
                    message: "Invalid password",
                    ip: req.socket.remoteAddress
                });

                res.render("login",{
                    "error":"Invalid password",
                });
            }
        }else{
            res.render("login",{
                "error":"User with that email does not exist.",
            });
        }
    }else{
        res.status(400);
        res.render("login",{
            "error":"Please fill in all the fields.",
        });
    }
}


export const Logout = function(req,res){
    req.session.destroy(() => {
        res.redirect("/login");
    });
}