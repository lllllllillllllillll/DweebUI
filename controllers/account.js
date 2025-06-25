import { User } from '../sys/db.js';
import { Alert, Navbar, Sidebar, Footer } from '../sys/utils.js';

export const Account = async function(req,res){

    let user = await User.findOne({ where: {userID: req.session.userID}});

    res.render("account",{ 
        alert: '',
        name: user.name,
        username: req.session.username,
        email: user.email,
        avatar: user.avatar,
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