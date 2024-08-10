import { ServerSettings } from '../database/config.js';
import { Alert, getLanguage, Navbar } from '../utils/system.js';

export const Settings = async function(req,res){

    let custom_link = await ServerSettings.findOne({ where: {key: 'custom_link'}});
    let link_url = await ServerSettings.findOne({ where: {key: 'link_url'}});

    let user_registration = await ServerSettings.findOne({ where: {key: 'user_registration'}});
    let registration_secret = await ServerSettings.findOne({ where: {key: 'registration_secret'}});

    let authentication = await ServerSettings.findOne({ where: {key: 'authentication'}});
    
    let custom_link_enabled = '';
    try { if (custom_link.value == true) { custom_link_enabled = 'checked'; } } catch { console.log('Custom Link: No Value Set'); }

    let user_registration_enabled = '';
    try { if (user_registration.value == true) { user_registration_enabled = 'checked'; } } catch { console.log('User Registration: No Value Set'); }

    let link_url_value = '';
    try { link_url_value = link_url.value; } catch { console.log('Link URL: No Value Set'); }

    let registration_secret_value = '';
    try { registration_secret_value = registration_secret.value; } catch { console.log('Registration Secret: No Value Set'); }


    res.render("settings",{ 
        alert: '',
        username: req.session.username,
        role: req.session.role,
        user_registration: user_registration_enabled,
        registration_secret: registration_secret_value,
        custom_link: custom_link_enabled,
        link_url: link_url_value,
        authentication: authentication.value,
        navbar: await Navbar(req),
    });
}



export const updateSettings = async function (req, res) {

    let { user_registration, registration_secret, custom_link, link_url, authentication } = req.body;
    let { host2, tag2, ip2, port2 } = req.body;
    let { host3, tag3, ip3, port3 } = req.body;
    let { host4, tag4, ip4, port4 } = req.body;

    let trigger_name = req.header('hx-trigger-name');
    let trigger_id = req.header('hx-trigger');

    // If the trigger is 'submit', return the button
    if (trigger_id == 'submit'){
        res.send(`<button class="btn btn-primary" id="submit" form="settings">Update</button>`);
        return;
    }

    // Continues on if the trigger is 'settings

    // Custom link
    if (custom_link) {
        let exists = await ServerSettings.findOne({ where: {key: 'custom_link'}});
        if (exists) { await ServerSettings.update({value: true}, {where: {key: 'custom_link'}}); }
        else { await ServerSettings.create({ key: 'custom_link', value: true}); }

        let exists2 = await ServerSettings.findOne({ where: {key: 'link_url'}});
        if (exists2) { await ServerSettings.update({value: link_url}, {where: {key: 'link_url'}}); }
        else { await ServerSettings.create({ key: 'link_url', value: link_url}); }

        console.log('Custom link enabled');

    } else if (!custom_link) {
        let exists = await ServerSettings.findOne({ where: {key: 'custom_link'}});
        if (exists) { await ServerSettings.update({value: false}, {where: {key: 'custom_link'}}); }
        else { await ServerSettings.create({ key: 'custom_link', value: false}); }

        let exists2 = await ServerSettings.findOne({ where: {key: 'link_url'}});
        if (exists2) { await ServerSettings.update({value: ''}, {where: {key: 'link_url'}}); }
        else { await ServerSettings.create({ key: 'link_url', value: ''}); }

        console.log('Custom links off');
    }

    // User registration
    if (user_registration) {
        let exists = await ServerSettings.findOne({ where: {key: 'user_registration'}});
        if (exists) { const setting = await ServerSettings.update({value: true}, {where: {key: 'user_registration'}}); }
        else { const newSetting = await ServerSettings.create({ key: 'user_registration', value: true}); }

        let exists2 = await ServerSettings.findOne({ where: {key: 'registration_secret'}});
        if (exists2) { await ServerSettings.update({value: registration_secret}, {where: {key: 'registration_secret'}}); }
        else { await ServerSettings.create({ key: 'registration_secret', value: registration_secret}); }

        console.log('registration on');

    } else if (!user_registration) {
        let exists = await ServerSettings.findOne({ where: {key: 'user_registration'}});
        if (exists) { await ServerSettings.update({value: false}, {where: {key: 'user_registration'}}); }
        else { await ServerSettings.create({ key: 'user_registration', value: false}); }

        let exists2 = await ServerSettings.findOne({ where: {key: 'registration_secret'}});
        if (exists2) { await ServerSettings.update({value: ''}, {where: {key: 'registration_secret'}}); }
        else { await ServerSettings.create({ key: 'registration_secret', value: ''}); }
        
        console.log('registration off');
    }

    // Authentication
    if (authentication) {
        let exists = await ServerSettings.findOne({ where: {key: 'authentication'}});
        if (exists) { await ServerSettings.update({value: authentication}, {where: {key: 'authentication'}}); }
        else { await ServerSettings.create({ key: 'authentication', value: authentication}); }
        console.log('Authentication on');
    } else if (!authentication) {
        let exists = await ServerSettings.findOne({ where: {key: 'authentication'}});
        if (exists) { await ServerSettings.update({value: 'default'}, {where: {key: 'authentication'}}); }
        else { await ServerSettings.create({ key: 'authentication', value: 'off'}); }
        console.log('Authentication off');
    }



    // Host 2
    if (host2) {
        let exists = await ServerSettings.findOne({ where: {key: 'host2'}});
        if (exists) { const setting = await ServerSettings.update({value: `${tag2},${ip2},${port2}`}, {where: {key: 'host2'}}); }
        else { const newSetting = await ServerSettings.create({ key: 'host2', value: `${tag2},${ip2},${port2}`}); }   
        console.log('host2 on');
    } else if (!host2) {
        let exists = await ServerSettings.findOne({ where: {key: 'host2'}});
        if (exists) { const setting = await ServerSettings.update({value: ''}, {where: {key: 'host2'}}); }
        else { const newSetting = await ServerSettings.create({ key: 'host2', value: ''}); }
        console.log('host2 off');
    }

    // // Host 3
    if (host3) {
        let exists = await ServerSettings.findOne({ where: {key: 'host3'}});
        if (exists) { const setting = await ServerSettings.update({value: `${tag3},${ip3},${port3}`}, {where: {key: 'host3'}}); }
        else { const newSetting = await ServerSettings.create({ key: 'host3', value: `${tag3},${ip3},${port3}`}); }
        console.log('host3 on');
    } else if (!host3) {
        let exists = await ServerSettings.findOne({ where: {key: 'host3'}});
        if (exists) { const setting = await ServerSettings.update({value: ''}, {where: {key: 'host3'}}); }
        else { const newSetting = await ServerSettings.create({ key: 'host3', value: ''}); }
        console.log('host3 off');
    }

    // Host 4
    if (host4) {
        let exists = await ServerSettings.findOne({ where: {key: 'host4'}});
        if (exists) { const setting = await ServerSettings.update({value: `${tag4},${ip4},${port4}`}, {where: {key: 'host4'}}); }
        else { const newSetting = await ServerSettings.create({ key: 'host4', value: `${tag4},${ip4},${port4}`}); }
        console.log('host4 on');
    } else if (!host4) {
        let exists = await ServerSettings.findOne({ where: {key: 'host4'}});
        if (exists) { const setting = await ServerSettings.update({value: ''}, {where: {key: 'host4'}}); }
        else { const newSetting = await ServerSettings.create({ key: 'host4', value: ''}); }
        console.log('host4 off');
    }


    console.log('Settings updated');
    res.send(`<button class="btn btn-success" hx-post="/settings" hx-trigger="load delay:2s" hx-swap="outerHTML" id="submit" hx-target="#submit">Updated</button>`);
}