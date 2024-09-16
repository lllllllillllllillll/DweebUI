import bcrypt from "bcrypt";
import { Op } from "sequelize";
import { User, ServerSettings, Permission, Syslog } from "../database/config.js";


export const Register = async function(req,res){

    if (req.session.username) { res.redirect("/dashboard"); }

    let secret_input = '';
    let user_registration = await ServerSettings.findOne({ where: { key: 'user_registration' }});
    if (user_registration == null ) { user_registration = false; }
    else { user_registration = user_registration.value; }
    
    if (user_registration) {
        secret_input = `<div class="mb-3"><label class="form-label">Secret</label>
                                <div class="input-group input-group-flat">
                                    <input type="text" class="form-control" autocomplete="off" name="registration_secret">
                                </div>
                            </div>`}

    // If there are no users, or registration has been enabled, display the registration page.
    if ((await User.count() == 0) || (user_registration)) {
        res.render("register",{ 
            "error": "",
            "reg_secret": secret_input,
        }); 
    } else {
        res.render("login", { 
            "error": "User registration is disabled." 
        });
    }
}

export const submitRegister = async function(req,res){

    const { name, username, password, confirm, secret } = req.body;
    let email = req.body.email.toLowerCase();

    let registration_secret = await ServerSettings.findOne({ where: { key: 'registration_secret' }}).value;

    let error = '';
    if (!name || !username || !email || !password || !confirm) { error = "All fields are required"; } 
    else if (password !== confirm) { error = "Passwords do not match"; }

    else if (registration_secret && secret !== registration_secret) { 
        error = "Invalid secret";
        await Syslog.create({ username: user.username, uniqueID: email, event: "Failed Registration", message: "Invalid Secret", ip: req.socket.remoteAddress });
    }

    else if (await User.findOne({ where: { [Op.or]: [{ username: username }, { email: email }] }})) { 
        error = "Username or email already exists"; 
        await Syslog.create({ username: user.username, uniqueID: email, event: "Failed Registration", message: "Username or email already exists", ip: req.socket.remoteAddress });
    }

    if (error) { res.render("register", { "error": error }); return; }

    // Returns 'admin' if no users have been created.
    async function Role() {
        if (await User.count() == 0) { return "admin"; }
        else { return "user"; }
    }

    // Create the user.
    await User.create({
        name: name,
        username: username,
        email: email,
        password: bcrypt.hashSync(password, 10),
        role: await Role(),
        preferences: JSON.stringify({ language: "english", hidden_profile: false }),
        lastLogin: new Date().toLocaleString(),
    });

    // Make sure the user was created and get the UUID.
    let user = await User.findOne({ where: { email: email }});
    let match = await bcrypt.compare(password, user.password);
    if (match) {
        req.session.username = user.username;
        req.session.userID = user.userID;
        req.session.role = user.role;
        
        await Syslog.create({ username: user.username, uniqueID: user.email, event: "Registration", message: "User created", ip: req.socket.remoteAddress });

        console.log(`User ${username} created`);

        res.redirect("/dashboard");
    } else {
        await Syslog.create({ username: user.username, uniqueID: user.email, event: "Failed Registration", message: "Error. User not created", ip: req.socket.remoteAddress });
        res.render("register", { "error": "Error. User not created" });
    }
}

