import { ServerSettings, User } from '../db/config.js';
import { Alert, getLanguage, Navbar, Sidebar, Footer, Capitalize } from '../utils/system.js';
import { readdirSync, readFileSync } from 'fs';

export const Credits = async function (req, res) {

    let language = await getLanguage(req.session.userID);
    let Language = Capitalize(language);
    let selected = `<option value="${language}" selected hidden>${Language}</option>`;

    let user = '';
    let preferences = '';
    let hide_profile = '';
    let checked = '';

    try {
        user = await User.findOne({ where: { userID: req.session.userID }});
        preferences = JSON.parse(user.preferences);
        hide_profile = preferences.hide_profile;
        checked = ''; if (hide_profile == true) { checked = 'checked'; }
    } catch (error) {
        console.log(`Error getting preferences: ${error}`);
    }

    res.render("credits",{ 
        alert: '',
        username: req.session.username,
        role: req.session.role,
        navbar: await Navbar(req),
        sidebar: await Sidebar(req),
        footer: await Footer(req),
        selected: selected,
        hide_profile: checked,

    });
}


export const searchCredits = async function (req, res) {
    console.log(`[Search] ${req.body.search}`);
    res.send('ok');
    return;
}