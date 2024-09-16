import { ServerSettings, User } from '../database/config.js';
import { Alert, getLanguage, Navbar, Sidebar, Footer, Capitalize } from '../utils/system.js';
import { readdirSync, readFileSync } from 'fs';

export const Preferences = async function(req,res){

    let language = await getLanguage(req);
    let Language = Capitalize(language);
    let selected = `<option value="${language}" selected hidden>${Language}</option>`;

    let user = await User.findOne({ where: { userID: req.session.userID }});
    let preferences = JSON.parse(user.preferences);
    let hide_profile = preferences.hide_profile;

    let checked = '';
    if (hide_profile == true) { checked = 'checked'; }



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

    let trigger_name = req.header('hx-trigger-name');
    let trigger_id = req.header('hx-trigger');

    // console.log(`trigger_name: ${trigger_name} - trigger_id: ${trigger_id}`);
    // console.log(req.body);

    if (hidden_input == 'on') { hidden_input = true; } else { hidden_input = false; }

    let user_preferences = {
        language: language_input,
        hide_profile: hidden_input,
    };

    if (language_input != undefined && hidden_input != undefined) {
        await User.update({ preferences: JSON.stringify(user_preferences) }, { where: { userID: req.session.userID }});
    }

    // [HTMX Triggered] Changes the update button.
    if(trigger_id == 'preferences'){
        res.send(`<button class="btn btn-success" hx-post="/preferences" hx-trigger="load delay:2s" hx-swap="outerHTML" id="submit" hx-target="#submit">Updated</button>`);
        return;
    } else if (trigger_id == 'submit'){
        res.send(`<button class="btn btn-primary" id="submit" form="preferences">Update</button>`);
        return;
    }

    let language = await getLanguage(req);
    let Language = Capitalize(language);
    let selected = `<option value="${language}" selected hidden>${Language}</option>`;

    res.render("preferences",{
        alert: '',
        username: req.session.username,
        role: req.session.role,
        navbar: await Navbar(req),
        sidebar: await Sidebar(req),
        footer: await Footer(req),
        selected: selected,
    });

}



export const searchPreferences = async function (req, res) {
    console.log(`[Search] ${req.body.search}`);
    res.send('ok');
    return;
}