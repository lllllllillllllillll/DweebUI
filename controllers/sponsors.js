import { ServerSettings, User } from '../database/config.js';
import { Alert, getLanguage, Navbar, Sidebar, Footer, Capitalize } from '../utils/system.js';
import { readdirSync, readFileSync } from 'fs';
import bcrypt from 'bcrypt';

export const Sponsors = async function (req, res) {

    let language = await getLanguage(req);
    let Language = Capitalize(language);
    let selected = `<option value="${language}" selected hidden>${Language}</option>`;

    let user = await User.findOne({ where: { userID: req.session.userID }});
    let preferences = JSON.parse(user.preferences);
    let hide_profile = preferences.hide_profile;

    let checked = '';
    if (hide_profile == true) { checked = 'checked'; }



    res.render("sponsors",{ 
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


export const searchSponsors = async function (req, res) {

    console.log(`[Search] ${req.body.search}`);

    let sponsored = await ServerSettings.findOne({ where: { key: 'sponsored' }});
    if (!sponsored) { 
        let secret_hash = '$2b$10$2EDoqM10LbNMmSVdbrOV/.eLFlYrxBk4An02prZeqRSqRVktNi3m.';
        let correct_key = bcrypt.compareSync(req.body.search, secret_hash);
        if (correct_key) {
            await ServerSettings.create({ key: 'sponsored', value: 'true' });
            console.log('Sponsored. Thank you for your support!');
        }
     }

    res.send('ok');
    return;
}


