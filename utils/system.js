import { User, ServerSettings } from '../db/config.js';
import { readFileSync } from 'fs';



// Navbar
export async function Navbar (req) {

    let userID = req.session.userID;
    let username = req.session.username;
    let role = req.session.role;
    let host = req.session.host;

    let language = await getLanguage(userID);

    // Check if the user wants to hide their profile name.
    if (userID != '00000000-0000-0000-0000-000000000000') { 
        let user = await User.findOne({ where: { userID: userID }});
        let preferences = JSON.parse(user.preferences);
        if (preferences.hide_profile == true) { username = 'Anon'; }
    }

    let sponsored = await ServerSettings.findOne({ where: { key: 'sponsored' }});
    if (sponsored) { username = `<label class="text-yellow">${username}</label>`; }

    let [host0_active, host0_toggle, host0_tag, host0_ip, host0_port] = ['', '', '', '', ''];
    let [host1_active, host1_toggle, host1_tag, host1_ip, host1_port] = ['', '', '', '', ''];
    let [host2_active, host2_toggle, host2_tag, host2_ip, host2_port] = ['', '', '', '', ''];
    let [host3_active, host3_toggle, host3_tag, host3_ip, host3_port] = ['', '', '', '', ''];
    let [host4_active, host4_toggle, host4_tag, host4_ip, host4_port] = ['', '', '', '', ''];

    const [host2, created2] = await ServerSettings.findOrCreate({ where: { key: 'host2' }, defaults: { key: 'host2', value: '' }});
    const [host3, created3] = await ServerSettings.findOrCreate({ where: { key: 'host3' }, defaults: { key: 'host3', value: '' }});
    const [host4, created4] = await ServerSettings.findOrCreate({ where: { key: 'host4' }, defaults: { key: 'host4', value: '' }});

    if (host2.value) { host2_toggle = 'checked'; [host2_tag, host2_ip, host2_port] = host2.value.split(','); }
    if (host3.value) { host3_toggle = 'checked'; [host3_tag, host3_ip, host3_port] = host3.value.split(','); }
    if (host4.value) { host4_toggle = 'checked'; [host4_tag, host4_ip, host4_port] = host4.value.split(','); }
    
    let host_buttons = '<form action="/dashboard/action/switch_host/hostid" method="post">';
    let nav_link = '';

    if (host == '0') { host0_active = 'text-yellow'; nav_link = '/0'; }
    if (host == '1') { host1_active = 'text-yellow'; }
    if (host == '2') { host2_active = 'text-yellow'; nav_link = '/2'; }
    if (host == '3') { host3_active = 'text-yellow'; nav_link = '/3'; }
    if (host == '4') { host4_active = 'text-yellow'; nav_link = '/4'; }

    if (host2_toggle || host3_toggle || host4_toggle) { host_buttons += `<button type="submit" name="host" value="0" class="btn ${host0_active}" title="All">All</button>  <button type="submit" name="host" value="1" hx-swap="none" class="btn ${host1_active}" title="Host 1">Host 1</button>`; }
    if (host2_toggle) { host_buttons += `<button type="submit" name="host" value="2" class="btn ${host2_active}" title="${host2_tag}">${host2_tag}</button>`; }
    if (host3_toggle) { host_buttons += `<button type="submit" name="host" value="3" hx-swap="none" class="btn ${host3_active}" title="${host3_tag}">${host3_tag}</button>`; }
    if (host4_toggle) { host_buttons += `<button type="submit" name="host" value="4" hx-swap="none" class="btn ${host4_active}" title="${host4_tag}">${host4_tag}</button>`; }

    host_buttons += '</form>';

    let navbar = readFileSync('./views/partials/navbar.html', 'utf8');

    if (language == 'english') {
        navbar = navbar.replace(/Username/g, username);
        navbar = navbar.replace(/Userrole/g, role);
        navbar = navbar.replace(/HostButtons/g, host_buttons);
        navbar = navbar.replace(/HOSTID/g, nav_link);
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
        return navbar;
    }
}


// Sidebar
export async function Sidebar (req) {

    let language = await getLanguage(req.session.userID);

    let sidebar = readFileSync('./views/partials/sidebar.html', 'utf8');

    if (language == 'english') {
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
    let build_version = package_info.version.split('.').pop();

    footer = footer.replace(/BuildVersion/g, build_version);

    if (language == 'english') {
        return footer;
    } else {
        let lang = readFileSync(`./languages/${language}.json`, 'utf8');
        lang = JSON.parse(lang);
        
        footer = footer.replace(/Documentation/g, lang.Documentation);

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

