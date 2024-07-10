import bcrypt from 'bcrypt';
import { User, Syslog } from '../database/models.js';

// Environment variable to disable authentication.
const no_auth = process.env.NO_AUTH || false;


export const Login = function(req,res){
    if (req.session.username) { res.redirect("/dashboard"); }
    else { res.render("login",{ "error":"", }); }
}


export const Logout = function(req,res){
    req.session.destroy(() => {
        res.redirect("/login");
    });
}


export const submitLogin = async function(req,res){

    // Grab values from the form.
    let { email, password } = req.body;

    // Convert the email to lowercase.
    email = email.toLowerCase();

    // Create an admin session if NO_AUTH is enabled and the user is on localhost.
    if (no_auth && req.hostname == 'localhost') { 
        req.session.username = 'Localhost';
        req.session.userID = '';
        req.session.role = 'admin';
        res.redirect("/dashboard");
        return;
    }

    // Check that all fields are filled out.
    if (!email || !password) {
        res.render("login",{
            "error":"Please fill in all fields.",
        });
        return;
    }

    // Check that the user exists.
    let user = await User.findOne({ where: { email: email }});
    if (!user) {
        res.render("login",{
            "error":"Invalid credentials.",
        });
        return;
    }

    // Check that the password is correct.
    let password_check = await bcrypt.compare( password, user.password);

    // If the password is incorrect, log the failed login attempt.
    if (!password_check) {
        res.render("login",{
            "error":"Invalid credentials.",
        });
        const syslog = await Syslog.create({
            user: null,
            email: email,
            event: "Bad Login",
            message: "Invalid password",
            ip: req.socket.remoteAddress
        });
        return;
    }

    // Successful login. Create the user session.
    req.session.username = user.username;
    req.session.userID = user.userID;
    req.session.role = user.role;

    // Update the last login time.
    let date = new Date();
    let new_login = date.toLocaleString();
    await User.update({ lastLogin: new_login }, { where: { userID: user.userID}});

    // Create a login entry.
    const syslog = await Syslog.create({
        user: req.session.username,
        email: email,
        event: "Successful Login",
        message: "User logged in successfully",
        ip: req.socket.remoteAddress
    });
    
    // Redirect to the dashboard.
    res.redirect("/dashboard");
}


