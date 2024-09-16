import bcrypt from 'bcrypt';
import { User, Syslog, ServerSettings } from '../database/config.js';


export const Login = async function (req, res) {

    if (req.session.userID) { res.redirect("/dashboard"); return; }

    // Check authentication settings
    let authentication = await ServerSettings.findOne({ where: { key: 'authentication' }});
    if (!authentication) { await ServerSettings.create({ key: 'authentication', value: 'default' }); }
    authentication = await ServerSettings.findOne({ where: { key: 'authentication' }});

    // Create an empty session and redirect if authentication is disabled
    if (authentication.value == 'localhost' && req.hostname == 'localhost') {
        req.session.username = 'Localhost';
        req.session.userID = '00000000-0000-0000-0000-000000000000';
        req.session.role = 'admin';
        await Syslog.create({ username: 'Localhost', uniqueID: 'localhost', event: "Login", message: "User logged in", ip: req.socket.remoteAddress });
        res.redirect("/dashboard");
        return;
    } else if (authentication.value == 'no_auth') {
        req.session.username = 'No Auth';
        req.session.userID = '00000000-0000-0000-0000-000000000000';
        req.session.role = 'admin';
        await Syslog.create({ username: 'No Auth', uniqueID: 'no_auth', event: "Login", message: "User logged in", ip: req.socket.remoteAddress });
        res.redirect("/dashboard");
        return;
    }
    res.render("login",{ 
        "error":"", 
    });
}


export const submitLogin = async function (req, res) {

    const { password } = req.body;
    let email = req.body.email.toLowerCase();

    // If one of the fields is empty.
    if (!email || !password) { res.render("login",{ "error": "Invalid credentials." }); return; }

    let user = await User.findOne({ where: { email: email }});

    // If there is no users with that email or the password is incorrect.
    if (!user || !await bcrypt.compare(password, user.password)) { 
        await Syslog.create({ username: '', uniqueID: email, event: "Login Attempt", message: "User login failed", ip: req.socket.remoteAddress });
        res.render("login",{ "error": "Invalid credentials." });
        return;
    }
    // Log the user in.
    else {
        req.session.username = user.username;
        req.session.userID = user.userID;
        req.session.role = user.role;
        let newLogin = new Date().toLocaleString();
        await User.update({ lastLogin: newLogin }, { where: { email: email } });

        console.log(`${req.session.username} logged in`);

        await Syslog.create({ username: user.username, uniqueID: email, event: "Login", message: "User logged in", ip: req.socket.remoteAddress });
        res.redirect("/dashboard");
        return;
    }
}


export const Logout = async function(req,res){
    console.log(`User ${req.session.username} logged out \n`);
    await Syslog.create({ username: req.session.username, uniqueID: req.session.userID, event: "Logout", message: "User logged out", ip: req.socket.remoteAddress });
    req.session.destroy(() => {
        res.redirect("/login");
    });
}