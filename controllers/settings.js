import { readFileSync } from 'fs';  
import { ServerSettings } from '../database/models.js';


export const Settings = async (req, res) => {

    let settings = readFileSync('views/partials/settings.html', 'utf8');

    let links = await ServerSettings.findOne({ where: {key: 'links'}});
    try {
        if (links.value != 'localhost' && links.value != '') {
            settings = settings.replaceAll('data-LinkMode', 'checked');
            settings = settings.replaceAll('data-LinkValue', `value="${links.value}"`);
        }
    } catch {
        console.log(`Container Links: No Value Set`)
    }
        
    let registration = await ServerSettings.findOne({ where: {key: 'registration'}});
    try {
        if (registration.value != 'off' && registration.value != '') {
            settings = settings.replaceAll('data-UserReg', 'checked');
            settings = settings.replaceAll('data-Passphrase', `value="${registration.value}"`);
        }
    } catch {
        console.log(`User Registration: No Value Set`);
    }

    async function hostInfo(host) {
        let info = await ServerSettings.findOne({ where: {key: host}});
        try {
            if (info.value != 'off' && info.value != '') {
                let values = info.value.split(',');
                return { tag: values[0], ip: values[1], port: values[2] };
            }
        } catch {
            console.log(`${host}: No Value Set`);
        }
    }
    
    let host2 = await hostInfo('host2');
    if (host2) {
        settings = settings.replaceAll('data-Host2', 'checked');
        settings = settings.replaceAll('data-Tag2', `value="${host2.tag}"`);
        settings = settings.replaceAll('data-Ip2', `value="${host2.ip}"`);
        settings = settings.replaceAll('data-Port2', `value="${host2.port}"`);
    }
    
    let host3 = await hostInfo('host3');
    if (host3) {
        settings = settings.replaceAll('data-Host3', 'checked');
        settings = settings.replaceAll('data-Tag3', `value="${host3.tag}"`);
        settings = settings.replaceAll('data-Ip3', `value="${host3.ip}"`);
        settings = settings.replaceAll('data-Port3', `value="${host3.port}"`);
    }

    let host4 = await hostInfo('host4');
    if (host4) {
        settings = settings.replaceAll('data-Host4', 'checked');
        settings = settings.replaceAll('data-Tag4', `value="${host4.tag}"`);
        settings = settings.replaceAll('data-Ip4', `value="${host4.ip}"`);
        settings = settings.replaceAll('data-Port4', `value="${host4.port}"`);
    }


    res.render("settings", {
        username: req.session.username,
        role: req.session.role,
        avatar: req.session.username.charAt(0).toUpperCase(),
        alert: '',
        settings: settings,
        link1: '',
        link2: '',
        link3: '',
        link4: '',
        link5: '',
        link6: '',
        link7: '',
        link8: '',
        link9: '',
    });
}


export const updateSettings = async (req, res) => {

    let trigger = req.header('hx-trigger');
    if (trigger == 'updated') {
        let update = `<button class="btn btn-primary" id="submit" hx-trigger="click" hx-post="/settings" hx-swap="outerHTML" hx-target="#submit">
						Update
					</button>`
        res.send(update);
        return;
    }

    // Container links
    let { link_mode, link } = req.body;
    if (link_mode) {
        let exists = await ServerSettings.findOne({ where: {key: 'links'}});
        if (exists) {
            const setting = await ServerSettings.update({value: link}, {where: {key: 'links'}});
        } else {
            const newSetting = await ServerSettings.create({ key: 'links', value: link});
        }
        console.log('Custom links on');
    }   else if (!link_mode) {
        let exists = await ServerSettings.findOne({ where: {key: 'links'}});
        if (exists) {
            const setting = await ServerSettings.update({value: 'localhost'}, {where: {key: 'links'}});
        }
        console.log('Custom links off');
    }

    // User registration
    let { user_registration, passphrase} = req.body;
    if (user_registration) {
        let exists = await ServerSettings.findOne({ where: {key: 'registration'}});
        if (exists) {
            const setting = await ServerSettings.update({value: passphrase}, {where: {key: 'registration'}});
        } else {
            const newSetting = await ServerSettings.create({ key: 'registration', value: passphrase});
        }
        console.log('registration on');
    } else if (!user_registration) {
        let exists = await ServerSettings.findOne({ where: {key: 'registration'}});
        if (exists) {
            const setting = await ServerSettings.update({value: 'off'}, {where: {key: 'registration'}});
        }
        console.log('registration off');
    }

    // Host 2
    let { host2, tag2, ip2, port2 } = req.body;
    if (host2) {
        let exists = await ServerSettings.findOne({ where: {key: 'host2'}});
        if (exists) {
            const setting = await ServerSettings.update({value: `${tag2},${ip2},${port2}`}, {where: {key: 'host2'}});
        }   else {
            const newSetting = await ServerSettings.create({ key: 'host2', value: `${tag2},${ip2},${port2}`});
        }   
        console.log('host2 on');
    } else if (!host2) {
        let exists = await ServerSettings.findOne({ where: {key: 'host2'}});
        if (exists) {
            const setting = await ServerSettings.update({value: 'off'}, {where: {key: 'host2'}});
        }
        console.log('host2 off');
    }

    // Host 3
    let { host3, tag3, ip3, port3 } = req.body;
    if (host3) {
        let exists = await ServerSettings.findOne({ where: {key: 'host3'}});
        if (exists) {
            const setting = await ServerSettings.update({value: `${tag3},${ip3},${port3}`}, {where: {key: 'host3'}});
        }   else {
            const newSetting = await ServerSettings.create({ key: 'host3', value: `${tag3},${ip3},${port3}`});
        }   
        console.log('host3 on');
    } else if (!host3) {
        let exists = await ServerSettings.findOne({ where: {key: 'host3'}});
        if (exists) {
            const setting = await ServerSettings.update({value: 'off'}, {where: {key: 'host3'}});
        }
        console.log('host3 off');
    }

    // Host 4
    let { host4, tag4, ip4, port4 } = req.body;
    if (host4) {
        let exists = await ServerSettings.findOne({ where: {key: 'host4'}});
        if (exists) {
            const setting = await ServerSettings.update({value: `${tag4},${ip4},${port4}`}, {where: {key: 'host4'}});
        } else {
            const newSetting = await ServerSettings.create({ key: 'host4', value: `${tag4},${ip4},${port4}`});
        }
        console.log('host4 on');
    } else if (!host4) {
        let exists = await ServerSettings.findOne({ where: {key: 'host4'}});
        if (exists) {
            const setting = await ServerSettings.update({value: 'off'}, {where: {key: 'host4'}});
        }
        console.log('host4 off');
    }


    let success = `<button class="btn btn-success" id="updated" hx-trigger="load delay:2s" hx-post="/settings" hx-swap="outerHTML" hx-target="#updated">
					Update
					</button>`

    res.send(success);
}