import { User } from '../sys/db.js';
import { getLanguage, Navbar, Sidebar, Footer } from '../sys/utils.js';

export const Preferences = async function(req,res){

    let language = await getLanguage(req.session.userID);
    let selected = `<option value="${language}" selected hidden>${language}</option>`;

    let user = '';
    let preferences = '';
    let hide_profile = '';
    let checked = '';

    try {
        user = await User.findOne({ where: { userID: req.session.userID }});
        preferences = JSON.parse(user.preferences);
        hide_profile = preferences.hide_profile;
        checked = ''; 
        if (hide_profile == true) { checked = 'checked'; }
    } catch {}

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