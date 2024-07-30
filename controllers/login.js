import bcrypt from 'bcrypt';
import { User, Syslog } from '../database/config.js';


export const Login = function(req,res){
    if (req.session.userID) { res.redirect("/dashboard"); }
    else { res.render("login",{ 
        "error":"", 
    }); }
}

export const submitLogin = async function(req,res){
    const { password } = req.body;
    let email = req.body.email.toLowerCase();

    let error = '';
    if (!email || !password) { error = "Invalid credentials."; }

    let user = await User.findOne({ where: { email: email }});

    if (!user || !await bcrypt.compare(password, user.password)) { error = "Invalid credentials."; }

    if (error) { res.render("login",{ "error":error }); return; }
    else {
        req.session.username = user.username;
        req.session.userID = user.userID;
        req.session.role = user.role;
        res.redirect("/dashboard");
    }
  
}

export const Logout = function(req,res){
    req.session.destroy(() => {
        res.redirect("/login");
    });
}