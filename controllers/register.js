import { User, Syslog, Permission, ServerSettings } from '../database/models.js';
import bcrypt from 'bcrypt';

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
    let { name, username, password, confirmPassword, passphrase } = req.body;
    let email = req.body.email.toLowerCase();

    // Get the passphrase from the database.
    let confirm_passphrase = await ServerSettings.findOne({ where: {key: 'registration'}});

    // Create a log entry if the form is submitted with an invalid passphrase.
    if (passphrase != confirm_passphrase.value) {
        const syslog = await Syslog.create({
            user: username,
            email: email,
            event: "Failed Registration",
            message: "Invalid secret",
            ip: req.socket.remoteAddress
        });
    }

    // Check that all fields are filled out and that the passphrase is correct.
    if ((name && email && password && confirmPassword && username) && (passphrase == confirm_passphrase.value) && (password == confirmPassword)) {

        async function userRole () {
            let userCount = await User.count();
            if (userCount == 0) { 
                // Disable registration.
                await ServerSettings.update({ value: 'off' }, { where: { key: 'registration' }}); 
                return "admin"; 
            } else { 
                return "user"; 
            }
        }

        // Check if the email address has already been used.
        let existingUser = await User.findOne({ where: {email:email}});
        if (!existingUser) {
            try {
                // Create the user.
                const user = await User.create({ 
                    name: name,
                    username: username,
                    email: email,
                    password: bcrypt.hashSync(password,10),
                    role: await userRole(),
                    group: 'all',
                    lastLogin: new Date().toLocaleString(),
                });

                // make sure the user was created and get the UUID.
                let newUser = await User.findOne({ where: {email:email}});
                let match = await bcrypt.compare(password,newUser.password);

                if (match) {  
                    // Create the user session.
                    req.session.user = newUser.username;
                    req.session.UUID = newUser.UUID;
                    req.session.role = newUser.role;

                    // Create an entry in the permissions table.
                    await Permission.create({ user: newUser.username, userID: newUser.UUID });

                    // Create a log entry.
                    const syslog = await Syslog.create({
                        user: req.session.user,
                        email: email,
                        event: "Successful Registration",
                        message: "User registered successfully",
                        ip: req.socket.remoteAddress
                    });
                    res.redirect("/dashboard");
                }

            } catch {
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
            "error":"Please fill in all the fields.",
        });
    }
}