import bcrypt from 'bcrypt';
import { User, Syslog, Permission, ServerSettings } from '../database/models.js';


export const Register = async function (req,res) {

    // Redirect to dashboard if user is already logged in.
    if(req.session.user){ res.redirect("/dashboard"); return; } 

    // Continue to registration page if no users have been created.
    let users = await User.count();
    if (users == 0) {
        const disable_passphrase = await ServerSettings.create({ key: 'registration', value: ''});
        res.render("register",{
            "error": "Creating admin account. Leave passphrase blank.",
        });
    } else {
        // Check if registration is enabled.
        let registration = await ServerSettings.findOne({ where: {key: 'registration'}});
        if (registration.value == 'off') {
            res.render("login",{
                "error":"User registration is disabled.",
            });
        } else {
            res.render("register",{
                "error":"",
            });
        }
    }
}


export const submitRegister = async function (req,res) {

    // Grab values from the form.
    let { name, username, email, password1, password2, passphrase } = req.body;

    // Convert the email to lowercase.
    email = email.toLowerCase();

    // Get the registration passphrase.
    let registration_passphrase = await ServerSettings.findOne({ where: { key: 'registration' }});
    registration_passphrase = registration_passphrase.value;

    // Create a log entry if the form is submitted with an invalid passphrase.
    if (passphrase != registration_passphrase) {
        const syslog = await Syslog.create({
            user: username,
            email: email,
            event: "Failed Registration",
            message: "Invalid secret",
            ip: req.socket.remoteAddress
        });
        res.render("register",{
            "error":"Invalid passphrase",
        });
        return;
    }

    // Check that all fields are filled out correctly.
    if ((!name || !username || !email || !password1 || !password2) || (password1 != password2)) {
        res.render("register",{
            "error":"Missing field or password mismatch.",
        });
        return;
    }

    // Make sure the username and email are unique.
    let existing_username = await User.findOne({ where: {username:username}});
    let existing_email = await User.findOne({ where: {email:email}});
    if (existing_username || existing_email) {
        res.render("register",{
            "error":"Username or email already exists.",
        });
        return;
    }

    // Make the user an admin and disable registration if there are no other users.
    async function userRole () {
        let userCount = await User.count();
        if (userCount == 0) { 
            await ServerSettings.update({ value: 'off' }, { where: { key: 'registration' }}); 
            return "admin"; 
        } else { 
            return "user"; 
        }
    }

    // Create the user.
    const user = await User.create({ 
        name: name,
        username: username,
        email: email,
        password: bcrypt.hashSync(password1,10),
        role: await userRole(),
        group: 'all',
        lastLogin: new Date().toLocaleString(),
    });

    // make sure the user was created and get the UUID.
    let newUser = await User.findOne({ where: { email: email }});
    let match = await bcrypt.compare( password1, newUser.password);

    if (match) {  
        // Create the user session.
        req.session.username = newUser.username;
        req.session.userID = newUser.userID;
        req.session.role = newUser.role;

        // Create an entry in the permissions table.
        await Permission.create({ username: req.session.username, userID: req.session.userID });

        // Create a log entry.
        const syslog = await Syslog.create({
            user: req.session.username,
            email: email,
            event: "Successful Registration",
            message: "User registered successfully",
            ip: req.socket.remoteAddress
        });
        res.redirect("/dashboard");
    } else {
        // Create a log entry.
        const syslog = await Syslog.create({
            user: req.session.username,
            email: email,
            event: "Failed Registration",
            message: "User not created",
            ip: req.socket.remoteAddress
        });
        res.render("register",{
            "error":"User not created",
        });
    }
}