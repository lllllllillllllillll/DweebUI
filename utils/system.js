import { User, ServerSettings, Hosts } from '../db/config.js';
import { readFileSync } from 'fs';



// Navbar
export async function Navbar (req) {

    let userID = req.session.userID;
    let username = req.session.username;
    let role = req.session.role;
    let host = req.session.host || 1;
    let alert = req.session.alert || '';

    let language = await getLanguage(userID);

    // Check if the user wants to hide their profile name.
    if (userID != '00000000-0000-0000-0000-000000000000') { 
        let user = await User.findOne({ where: { userID: userID }});
        let preferences = JSON.parse(user.preferences);
        if (preferences.hide_profile == true) { username = 'Anon'; }
    }

    let sponsored = await ServerSettings.findOne({ where: { key: 'sponsored' }});
    if (sponsored) { username = `<label class="text-yellow">${username}</label>`; }

    // Get all hosts where state = 'enabled'
    let hosts = await Hosts.findAll({ where: { state: 'enabled' }});
    let host_buttons = '<form action="/dashboard/action/switch_host/hostid" method="post">';
    let nav_link = '';

    // Create a button for each host
    if (hosts.length > 1) {

        if (host == 0) { host_buttons += `<button type="submit" name="host" value="0" class="btn text-yellow mx-1" title="All">All</button>`; }
        else { host_buttons += `<button type="submit" name="host" value="0" class="btn mx-1" title="All">All</button>`; }
        

        for (let i = 0; i < hosts.length; i++) {
            let host_id = hosts[i].id;
            let host_tag = hosts[i].tag;
            let host_active = '';
            if (host == host_id) { host_active = 'text-yellow'; nav_link = `/${host_id}`; }
            host_buttons += `<button type="submit" name="host" value="${host_id}" class="btn mx-1 ${host_active}" title="${host_tag}">${host_tag}</button>`;
        }
        host_buttons += '</form>';
    } else { host_buttons = ''; }

    let navbar = readFileSync('./views/partials/navbar.html', 'utf8');

    if (language == 'English') {
        navbar = navbar.replace(/Username/g, username);
        navbar = navbar.replace(/Userrole/g, role);
        navbar = navbar.replace(/HostButtons/g, host_buttons);
        navbar = navbar.replace(/HOSTID/g, nav_link);
        navbar = navbar.replace(/NavAlert/g, alert);
        req.session.alert = '';
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
        navbar = navbar.replace(/HOSTID/g, nav_link);

        navbar = navbar.replace(/Search/g, lang.Search);
        navbar = navbar.replace(/Account/g, lang.Account);
        navbar = navbar.replace(/Notifications/g, lang.Notifications);
        navbar = navbar.replace(/Preferences/g, lang.Preferences);
        navbar = navbar.replace(/Settings/g, lang.Settings);
        navbar = navbar.replace(/Logout/g, lang.Logout);

        navbar = navbar.replace(/Username/g, username);
        navbar = navbar.replace(/Userrole/g, role);
        navbar = navbar.replace(/HostButtons/g, host_buttons);
        navbar = navbar.replace(/NavAlert/g, alert);
        req.session.alert = '';
        return navbar;
    }
}


// Sidebar
export async function Sidebar (req) {

    let language = await getLanguage(req.session.userID);

    let sidebar = readFileSync('./views/partials/sidebar.html', 'utf8');

    if (language == 'English') {
        return sidebar;
    } else {
        let lang = readFileSync(`./languages/${language}.json`, 'utf8');
        lang = JSON.parse(lang);
        
        sidebar = sidebar.replace(/Account/g, lang.Account);
        sidebar = sidebar.replace(/Notifications/g, lang.Notifications);
        sidebar = sidebar.replace(/Preferences/g, lang.Preferences);
        sidebar = sidebar.replace(/Settings/g, lang.Settings);
        sidebar = sidebar.replace(/Sponsors/g, lang.Sponsors);
        sidebar = sidebar.replace(/Credits/g, lang.Credits);

        return sidebar;
    }
}

// Footer
export async function Footer (req) {

    let language = await getLanguage(req.session.userID);

    let footer = readFileSync('./views/partials/footer.html', 'utf8');

    let package_info = readFileSync(`package.json`, 'utf8');
    package_info = JSON.parse(package_info);
    let version = package_info.version;
    let build = package_info.build;

    footer = footer.replace(/Version/g, version);
    footer = footer.replace(/Build/g, `Build ${build}`);

    if (language == 'English') { return footer;}
    else {
        let lang = readFileSync(`./languages/${language}.json`, 'utf8');
        lang = JSON.parse(lang);
        footer = footer.replace(/Documentation/g, lang.Documentation);
        footer = footer.replace(/License/g, lang.License);
        footer = footer.replace(/Source Code/g, lang.Source_Code);
        footer = footer.replace(/Sponsor/g, lang.Sponsor);
        return footer;
    }
}


// Header Alert
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


export async function getLanguage (userID) {

    // Use the admin's language if authentication is disabled.
    if (userID == '00000000-0000-0000-0000-000000000000') { 
        let user = await User.findOne({ where: { role: 'admin' }});
        return user.language;
    } else {
        let user = await User.findOne({ where: { userID: userID }});
        return user.language;
    }
}

export function Capitalize (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

