import { ServerSettings, User } from '../db/config.js';
import { Alert, getLanguage, Navbar, Sidebar, Footer, Capitalize } from '../utils/system.js';

export const Preferences = async function(req,res){

    let language = await getLanguage(req.session.userID);
    let Language = Capitalize(language);
    let selected = `<option value="${language}" selected hidden>${Language}</option>`;

    let user = await User.findOne({ where: { userID: req.session.userID }});
    let preferences = JSON.parse(user.preferences);
    let hide_profile = preferences.hide_profile;
    let checked = ''; if (hide_profile == true) { checked = 'checked'; }

    res.render("preferences",{ 
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



export const submitPreferences = async function(req,res){

    let { language_input, hidden_input, check_languages } = req.body;

    if (hidden_input == 'on') { hidden_input = true; } else { hidden_input = false; }

    let user_preferences = {
        hide_profile: hidden_input,
    };

    if (language_input != undefined && hidden_input != undefined) {
        await User.update({ preferences: JSON.stringify(user_preferences), language: language_input }, { where: { userID: req.session.userID }});
    }
    res.redirect('/preferences');
}



export const searchPreferences = async function (req, res) {
    console.log(`[Search] ${req.body.search}`);
    res.send('ok');
    return;
}