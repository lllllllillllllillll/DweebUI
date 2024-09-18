import { ServerSettings } from '../database/config.js';
import { Alert, getLanguage, Navbar, Sidebar, Footer } from '../utils/system.js';
import { read, readdirSync, readFileSync, writeFileSync } from 'fs';

export const Settings = async function(req,res){

    let user_registration = await ServerSettings.findOne({ where: {key: 'user_registration'}});
    let registration_secret = await ServerSettings.findOne({ where: {key: 'registration_secret'}});

    let authentication = await ServerSettings.findOne({ where: {key: 'authentication'}}) || { value: 'default' };

    let user_registration_enabled = '';
    try { if (user_registration.value == true) { user_registration_enabled = 'checked'; } } catch { }

    let registration_secret_value = '';
    try { registration_secret_value = registration_secret.value; } catch { }

    let custom_link = await ServerSettings.findOne({ where: {key: 'custom_link'}});
    let link_url = await ServerSettings.findOne({ where: {key: 'link_url'}});

    let custom_link_enabled = '';
    try { if (custom_link.value == true) { custom_link_enabled = 'checked'; } } catch { }

    let link_url_value = '';
    try { link_url_value = link_url.value; } catch { }


    let host2 = await ServerSettings.findOne({ where: {key: 'host2'}});
    let host3 = await ServerSettings.findOne({ where: {key: 'host3'}});
    let host4 = await ServerSettings.findOne({ where: {key: 'host4'}});

    let [host2_toggle, host2_tag, host2_ip, host2_port] = ['', '', '', ''];
    let [host3_toggle, host3_tag, host3_ip, host3_port] = ['', '', '', ''];
    let [host4_toggle, host4_tag, host4_ip, host4_port] = ['', '', '', ''];
    
    if (host2.value) { host2_toggle = 'checked'; [host2_tag, host2_ip, host2_port] = host2.value.split(','); }
    if (host3.value) { host3_toggle = 'checked'; [host3_tag, host3_ip, host3_port] = host3.value.split(','); }
    if (host4.value) { host4_toggle = 'checked'; [host4_tag, host4_ip, host4_port] = host4.value.split(','); }
    

    res.render("settings",{ 
        alert: '',
        username: req.session.username,
        role: req.session.role,
        user_registration: user_registration_enabled,
        registration_secret: registration_secret_value,
        custom_link: custom_link_enabled,
        link_url: link_url_value,
        authentication: authentication.value,
        host2_toggle: host2_toggle,
        host2_tag: host2_tag,
        host2_ip: host2_ip,
        host2_port: host2_port,
        host3_toggle: host3_toggle,
        host3_tag: host3_tag,
        host3_ip: host3_ip,
        host3_port: host3_port,
        host4_toggle: host4_toggle,
        host4_tag: host4_tag,
        host4_ip: host4_ip,
        host4_port: host4_port,
        selected: 'english',
        navbar: await Navbar(req),
        sidebar: await Sidebar(req),
        footer: await Footer(req),
    });
}



export const updateSettings = async function (req, res) {

    let { user_registration, registration_secret, custom_link, link_url, authentication } = req.body;
    let { host2, tag2, ip2, port2 } = req.body;
    let { host3, tag3, ip3, port3 } = req.body;
    let { host4, tag4, ip4, port4 } = req.body;

    if (tag2 == '') { tag2 = 'Host 2'; }
    if (tag3 == '') { tag3 = 'Host 3'; }
    if (tag4 == '') { tag4 = 'Host 4'; }

    let trigger_name = req.header('hx-trigger-name');
    let trigger_id = req.header('hx-trigger');

    // If the trigger is 'submit', return the button
    if (trigger_id == 'submit'){
        res.send(`<button class="btn btn-primary" id="submit" form="settings">Update</button>`);
        return;
    }

    // Continues on if the trigger is 'settings'

    // Custom link
    if (custom_link) {
        let exists = await ServerSettings.findOne({ where: {key: 'custom_link'}});
        if (exists) { await ServerSettings.update({value: true}, {where: {key: 'custom_link'}}); }
        else { await ServerSettings.create({ key: 'custom_link', value: true}); }

        let exists2 = await ServerSettings.findOne({ where: {key: 'link_url'}});
        if (exists2) { await ServerSettings.update({value: link_url}, {where: {key: 'link_url'}}); }
        else { await ServerSettings.create({ key: 'link_url', value: link_url}); }


    } else if (!custom_link) {
        let exists = await ServerSettings.findOne({ where: {key: 'custom_link'}});
        if (exists) { await ServerSettings.update({value: false}, {where: {key: 'custom_link'}}); }
        else { await ServerSettings.create({ key: 'custom_link', value: false}); }

        let exists2 = await ServerSettings.findOne({ where: {key: 'link_url'}});
        if (exists2) { await ServerSettings.update({value: 'http://localhost'}, {where: {key: 'link_url'}}); }
        else { await ServerSettings.create({ key: 'link_url', value: 'http://localhost'}); }
    }

    // User registration
    if (user_registration) {
        let exists = await ServerSettings.findOne({ where: {key: 'user_registration'}});
        if (exists) { const setting = await ServerSettings.update({value: true}, {where: {key: 'user_registration'}}); }
        else { const newSetting = await ServerSettings.create({ key: 'user_registration', value: true}); }

        let exists2 = await ServerSettings.findOne({ where: {key: 'registration_secret'}});
        if (exists2) { await ServerSettings.update({value: registration_secret}, {where: {key: 'registration_secret'}}); }
        else { await ServerSettings.create({ key: 'registration_secret', value: registration_secret}); }


    } else if (!user_registration) {
        let exists = await ServerSettings.findOne({ where: {key: 'user_registration'}});
        if (exists) { await ServerSettings.update({value: false}, {where: {key: 'user_registration'}}); }
        else { await ServerSettings.create({ key: 'user_registration', value: false}); }

        let exists2 = await ServerSettings.findOne({ where: {key: 'registration_secret'}});
        if (exists2) { await ServerSettings.update({value: ''}, {where: {key: 'registration_secret'}}); }
        else { await ServerSettings.create({ key: 'registration_secret', value: ''}); }
    }

    // Authentication
    if (authentication) {
        let exists = await ServerSettings.findOne({ where: {key: 'authentication'}});
        if (exists) { await ServerSettings.update({value: authentication}, {where: {key: 'authentication'}}); }
        else { await ServerSettings.create({ key: 'authentication', value: authentication}); }
    } else if (!authentication) {
        let exists = await ServerSettings.findOne({ where: {key: 'authentication'}});
        if (exists) { await ServerSettings.update({value: 'default'}, {where: {key: 'authentication'}}); }
        else { await ServerSettings.create({ key: 'authentication', value: 'off'}); }
    }



    // Host 2
    if (host2) {
        let exists = await ServerSettings.findOne({ where: {key: 'host2'}});
        if (exists) { await ServerSettings.update({value: `${tag2},${ip2},${port2}`}, {where: {key: 'host2'}}); }
        else { await ServerSettings.create({ key: 'host2', value: `${tag2},${ip2},${port2}`}); }   
    } else if (!host2) {
        let exists = await ServerSettings.findOne({ where: {key: 'host2'}});
        if (exists) { await ServerSettings.update({value: ''}, {where: {key: 'host2'}}); }
        else { await ServerSettings.create({ key: 'host2', value: ''}); }
    }

    // Host 3
    if (host3) {
        let exists = await ServerSettings.findOne({ where: {key: 'host3'}});
        if (exists) { await ServerSettings.update({value: `${tag3},${ip3},${port3}`}, {where: {key: 'host3'}}); }
        else { await ServerSettings.create({ key: 'host3', value: `${tag3},${ip3},${port3}`}); }
    } else if (!host3) {
        let exists = await ServerSettings.findOne({ where: {key: 'host3'}});
        if (exists) { await ServerSettings.update({value: ''}, {where: {key: 'host3'}}); }
        else { await ServerSettings.create({ key: 'host3', value: ''}); }
    }

    // Host 4
    if (host4) {
        let exists = await ServerSettings.findOne({ where: {key: 'host4'}});
        if (exists) { await ServerSettings.update({value: `${tag4},${ip4},${port4}`}, {where: {key: 'host4'}}); }
        else { await ServerSettings.create({ key: 'host4', value: `${tag4},${ip4},${port4}`}); }
    } else if (!host4) {
        let exists = await ServerSettings.findOne({ where: {key: 'host4'}});
        if (exists) { await ServerSettings.update({value: ''}, {where: {key: 'host4'}}); }
        else { await ServerSettings.create({ key: 'host4', value: ''}); }
    }


    console.log('Settings updated');
    res.send(`<button class="btn btn-success" hx-post="/settings" hx-trigger="load delay:2s" hx-swap="outerHTML" id="submit" hx-target="#submit">Updated</button>`);
}



let inProgress = false;
export const updateLanguages = async function(req,res){

    let trigger_id = req.header('hx-trigger');

    if (inProgress == true) {
        console.log('Language update still in progress');
        res.send('<button class="btn" aria-label="button" id="checking" hx-post="/update_languages" hx-swap="outerHTML" hx-target="#checking" hx-trigger="every 2s">Checking For Updates<div class="mx-2 spinner-border spinner-border-sm"></div></button>');
        return;
    }

    if (trigger_id == 'check_languages') {

        inProgress = true;
        res.send('<button class="btn" aria-label="button" id="checking" hx-post="/update_languages" hx-swap="outerHTML" hx-target="#checking" hx-trigger="every 2s">Checking For Updates<div class="mx-2 spinner-border spinner-border-sm"></div></button>');

        const resp = await fetch(`https://api.github.com/repos/lllllllillllllillll/DweebUI/contents/languages?ref=dev`);
        const data = await resp.json();
        let languages = [];
        data.forEach((lang) => {
            languages.push({ language: lang.name, download_url: lang.download_url });
        });
    
        for (let i = 0; i < languages.length; i++) {
            let language_dev = await fetch(languages[i].download_url);
            language_dev = await language_dev.text();
    
            let language_local = readFileSync(`./languages/${languages[i].language}`, 'utf8');
            
            if (language_dev != language_local) {
                console.log(`\x1b[31mLanguage: ${languages[i].language} is out of date.\x1b[0m`);
                console.log(`\x1b[31mUpdating ${languages[i].language}...\x1b[0m`);
                writeFileSync(`./languages/${languages[i].language}`, language_dev);
                console.log(`\x1b[32mLanguage: ${languages[i].language} has been updated.\x1b[0m`);
            } else {
                console.log(`\x1b[32mLanguage: ${languages[i].language} is up to date.\x1b[0m`);
            }
        }

        inProgress = false;
        console.log('Language update complete');

        return;
    } else {
        if ((trigger_id == "checking") && (inProgress == false)) {
            res.send('<button class="btn" aria-label="button" name="check_languages" id="check_languages" value="true" hx-post="/update_languages" hx-swap="outerHTML" hx-target="#check_languages">Update Language Files</button>');
            return;
        }
    }

}


export const searchSettings = async function (req, res) {
    console.log(`[Search] ${req.body.search}`);
    res.send('ok');
    return;
}