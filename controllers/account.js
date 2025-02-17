import { User, ServerSettings } from '../db/config.js';
import { Alert, getLanguage, Navbar, Sidebar, Footer } from '../utils/system.js';

export const Account = async function(req,res){

    let container_links = await ServerSettings.findOne({ where: {key: 'container_links'}});
    let user_registration = await ServerSettings.findOne({ where: {key: 'user_registration'}});

    let user = await User.findOne({ where: {userID: req.session.userID}});

    let name = '';
    let email = '';
    let avatar = '';

    try {
        name = user.name;
        email = user.email;
        avatar = user.avatar;
    } catch {}

    res.render("account",{ 
        alert: '',
        name: name,
        username: req.session.username,
        email: email,
        avatar: avatar,
        role: req.session.role,
        navbar: await Navbar(req),
        sidebar: await Sidebar(req),
        footer: await Footer(req),
    });
}


export const searchAccount = async function (req, res) {
    console.log(`[Search] ${req.body.search}`);
    res.send('ok');
    return;
}


export const submitAccount = async function(req,res){

    console.log(req.body);

    res.render("account",{
        alert: '',
        username: req.session.username,
        role: req.session.role,
        navbar: await Navbar(req),
        sidebar: await Sidebar(req),
        footer: await Footer(req),
    });

}