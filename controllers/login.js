import bcrypt from 'bcrypt';
import { User, Syslog, ServerSettings } from '../database/config.js';



// Login page
export const Login = async function(req,res){

    if (req.session.userID) { res.redirect("/dashboard"); return; }

    let authentication = await ServerSettings.findOne({ where: { key: 'authentication' }});
    if (!authentication) { await ServerSettings.create({ key: 'authentication', value: 'default' }); }
    authentication = await ServerSettings.findOne({ where: { key: 'authentication' }});

    if (authentication.value == 'localhost' && req.hostname == 'localhost') {
        req.session.username = 'Localhost';
        req.session.userID = '00000000-0000-0000-0000-000000000000';
        req.session.role = 'admin';
        res.redirect("/dashboard");
        return;
    } else if (authentication.value == 'no_auth') {
        req.session.username = 'No Auth';
        req.session.userID = '00000000-0000-0000-0000-000000000000';
        req.session.role = 'admin';
        res.redirect("/dashboard");
        return;
    }

    res.render("login",{ 
        "error":"", 
    });
}



// Submit login
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

// Logout
export const Logout = function(req,res){
    req.session.destroy(() => {
        res.redirect("/login");
    });
}