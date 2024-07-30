import { User } from '../database/config.js';
import { readFileSync } from 'fs';


export async function Navbar (req) {

    let username = req.session.username;


    let language = await getLanguage(req);

    let user = await User.findOne({ where: { userID: req.session.userID }});
    let preferences = JSON.parse(user.preferences);
    if (preferences.hide_profile == true) {
        username = 'Anonymous';
    }

    let navbar = readFileSync('./views/partials/navbar.html', 'utf8');

    if (language == 'english') {
        navbar = navbar.replace(/Username/g, username);
        navbar = navbar.replace(/Userrole/g, req.session.role);
        return navbar;
    } else {
        let lang = readFileSync(`./languages/${language}.json`, 'utf8');
        lang = JSON.parse(lang);
        
        navbar = navbar.replace(/Dashboard/g, lang.Dashboard);
        navbar = navbar.replace(/Images/g, lang.Images);
        navbar = navbar.replace(/Volumes/g, lang.Volumes);
        navbar = navbar.replace(/Networks/g, lang.Networks);
        navbar = navbar.replace(/Apps/g, lang.Apps);
        navbar = navbar.replace(/Users/g, lang.Users);
        navbar = navbar.replace(/Syslogs/g, lang.Syslogs);

        navbar = navbar.replace(/Username/g, username);
        navbar = navbar.replace(/Userrole/g, req.session.role);
        return navbar;
    }
}


export function Alert (type, message) {
    return `
    <div class="alert alert-${type} alert-dismissible" role="alert" style="margin-bottom: 0;">
        <div class="d-flex">
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon alert-icon"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M5 12l5 5l10 -10"></path></svg>
            </div>
            <div>
                ${message}
            </div>
        </div>
        <a class="btn-close" data-bs-dismiss="alert" aria-label="close"></a>
    </div>`;
}

export async function getLanguage (req) {
    let user = await User.findOne({ where: { userID: req.session.userID }});
    let preferences = JSON.parse(user.preferences);
    return preferences.language;
}

export function Capitalize (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}