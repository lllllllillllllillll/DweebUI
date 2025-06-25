import { ServerSettings, User } from '../sys/db.js';
import { Alert, getLanguage, Navbar, Sidebar, Footer, Capitalize } from '../sys/utils.js';
import bcrypt from 'bcrypt';

export const Sponsors = async function (req, res) {

    res.render("sponsors",{ 
        navbar: await Navbar(req),
        sidebar: await Sidebar(req),
        footer: await Footer(req)
    });
}


export const searchSponsors = async function (req, res) {

    console.log(`[Search] ${req.body.search}`);

    let sponsored = await ServerSettings.findOne({ where: { key: 'sponsored' }});
    if (!sponsored) { 
        let secret_hash = '$2b$10$2EDoqM10LbNMmSVdbrOV/.eLFlYrxBk4An02prZeqRSqRVktNi3m.';
        let correct_key = bcrypt.compareSync(req.body.search, secret_hash);
        if (correct_key) {
            await ServerSettings.create({ key: 'sponsored', value: 'true' });
            console.log('Sponsored. Thank you for your support!');
        }
     }

    res.send('ok');
    return;
}


export const SponsorsAction = async function (req, res) {

    let action = req.params.action;
    let id = req.params.id;

    // console.log(`[SponsorsAction] action: ${action} id: ${id}`);

    if (action == 'thank') {
        let [thanks, created] = await ServerSettings.findOrCreate({ where: { key: 'thanks' }, defaults: { value: 1 }});
        if (!created) { thanks.value++; await thanks.save(); }
        res.send(`${thanks.value}`);
        return;
    }
    res.send('ok');
}


export const SponsorsView = async function (req, res) {

    let view = req.params.view;
    let id = req.params.id;

    // console.log(`[SponsorsView] view: ${view} id: ${id}`);

    if (view == 'thanks') {
        let [thanks] = await ServerSettings.findOrCreate({ where: { key: 'thanks' }, defaults: { value: 1 }});
        res.send(`${thanks.value}`);
        return;
    }
    res.send('ok');
}