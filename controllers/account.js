import { User, ServerSettings } from '../database/config.js';
import { Alert, getLanguage, Navbar } from '../utils/system.js';

export const Account = async function(req,res){

    let container_links = await ServerSettings.findOne({ where: {key: 'container_links'}});
    let user_registration = await ServerSettings.findOne({ where: {key: 'user_registration'}});


    let user = await User.findOne({ where: {userID: req.session.userID}});

    res.render("account",{ 
        alert: '',
        name: user.name,
        username: req.session.username,
        email: user.email,
        avatar: user.avatar,
        role: req.session.role,
        navbar: await Navbar(req),
    });
}



export const submitAccount = async function(req,res){

    console.log(req.body);

    res.render("account",{
        alert: '',
        username: req.session.username,
        role: req.session.role,
        navbar: await Navbar(req),
    });

}