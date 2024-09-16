import { ServerSettings, User } from '../database/config.js';
import { Alert, getLanguage, Navbar, Sidebar, Footer, Capitalize } from '../utils/system.js';
import { readdirSync, readFileSync } from 'fs';

export const Credits = async function (req, res) {

    let language = await getLanguage(req);
    let Language = Capitalize(language);
    let selected = `<option value="${language}" selected hidden>${Language}</option>`;

    let user = await User.findOne({ where: { userID: req.session.userID }});
    let preferences = JSON.parse(user.preferences);
    let hide_profile = preferences.hide_profile;

    let checked = '';
    if (hide_profile == true) { checked = 'checked'; }



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