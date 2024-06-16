import { ServerSettings } from '../database/models.js';

export const Settings = (req, res) => {

    res.render("settings", {
        name: req.session.user,
        role: req.session.role,
        avatar: req.session.user.charAt(0).toUpperCase(),
        alert: '',
    });
}


export const settingsAction = (req, res) => {
    let action = req.params.action;
    let name = req.header('hx-trigger-name');
    let value = req.header('hx-trigger');

    console.log(`action: ${action}`);
    console.log(`name: ${name}`);
    console.log(`value: ${value}`);

    if ((action == 'links') && (req.body.links == 'on')) {
        console.log('links on');
    }   else if ((action == 'links') && (!req.body.links)) {
        console.log('links off');
    }


    if ((action == 'registration') && (req.body.registration == 'on')) {
        console.log(`registration on and secret: ${req.body.secret}`);
    } else if ((action == 'registration') && (!req.body.registration)) {
        console.log('registration off');
    }

    res.send('ok');
}