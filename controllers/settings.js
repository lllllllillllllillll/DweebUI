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
    let ip = req.body.ip;

    if ((action == 'links') && (req.body.links == 'on')) {
        let exists = await ServerSettings.findOne({ where: {key: 'links'}});
        if (exists) {
            const setting = await ServerSettings.update({value: ip}, {where: {key: 'links'}});
        } else {
            const newSetting = await ServerSettings.create({ key: 'links', value: ip});
        }
        console.log('Custom links on');
    }   else if ((action == 'links') && (!req.body.links)) {
        let exists = await ServerSettings.findOne({ where: {key: 'links'}});
        if (exists) {
            const setting = await ServerSettings.update({value: 'localhost'}, {where: {key: 'links'}});
        }
        console.log('Custom links off');
    }


    if ((action == 'registration') && (req.body.registration == 'on')) {
        let exists = await ServerSettings.findOne({ where: {key: 'registration'}});
        if (exists) {
            const setting = await ServerSettings.update({value: req.body.secret}, {where: {key: 'registration'}});
        } else {
            const newSetting = await ServerSettings.create({ key: 'registration', value: req.body.secret});
        }
        console.log('registration on');
        
    } else if ((action == 'registration') && (!req.body.registration)) {
        let exists = await ServerSettings.findOne({ where: {key: 'registration'}});
        if (exists) {
            const setting = await ServerSettings.update({value: 'off'}, {where: {key: 'registration'}});
        }
        console.log('registration off');
    }

    res.send('ok');
}