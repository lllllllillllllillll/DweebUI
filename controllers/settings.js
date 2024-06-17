import { ServerSettings } from '../database/models.js';

export const Settings = (req, res) => {

    res.render("settings", {
        name: req.session.user,
        role: req.session.role,
        avatar: req.session.user.charAt(0).toUpperCase(),
        alert: '',
    });
}


export const settingsAction = async (req, res) => {
    let action = req.params.action;
    let name = req.header('hx-trigger-name');
    let value = req.header('hx-trigger');

    console.log(`action: ${action}`);
    console.log(`name: ${name}`);
    console.log(`value: ${value}`);

    if ((action == 'links') && (req.body.links == 'on')) {
        let exists = await ServerSettings.findOne({ where: {key: 'links'}});
        if (!exists) { const newSetting = await ServerSettings.create({ key: 'links', value: 'on'}); }
        const setting = await ServerSettings.update({value: 'on'}, {where: {key: 'links'}});
    }   else if ((action == 'links') && (!req.body.links)) {
        let exists = await ServerSettings.findOne({ where: {key: 'links'}});
        if (!exists) { const newSetting = await ServerSettings.create({ key: 'links', value: 'off'}); }
        const setting = await ServerSettings.update({value: 'off'}, {where: {key: 'links'}});
    }


    if ((action == 'registration') && (req.body.registration == 'on')) {
        console.log(`registration on and secret: ${req.body.secret}`);
    } else if ((action == 'registration') && (!req.body.registration)) {
        console.log('registration off');
    }

    res.send('ok');
}