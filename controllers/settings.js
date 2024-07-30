import { ServerSettings } from '../database/config.js';
import { Alert, getLanguage, Navbar } from '../utils/system.js';

export const Settings = async function(req,res){

    let container_links = await ServerSettings.findOne({ where: {key: 'container_links'}});
    let user_registration = await ServerSettings.findOne({ where: {key: 'user_registration'}});


    res.render("settings",{ 
        alert: '',
        username: req.session.username,
        role: req.session.role,
        user_registration: 'checked',
        registration_secret: 'some-long-secret',
        container_links: 'checked',
        link_url: 'mydomain.com',
        navbar: await Navbar(req),
    });
}



export const submitSettings = async function(req,res){

    console.log(req.body);

    let trigger_name = req.header('hx-trigger-name');
    let trigger_id = req.header('hx-trigger');

    console.log(`trigger_name: ${trigger_name} - trigger_id: ${trigger_id}`);


    // [HTMX Triggered] Changes the update button.
    if(trigger_id == 'settings'){
        res.send(`<button class="btn btn-success" hx-post="/settings" hx-trigger="load delay:2s" hx-swap="outerHTML" id="submit" hx-target="#submit">Updated</button>`);
        return;
    } else if (trigger_id == 'submit'){
        res.send(`<button class="btn btn-primary" id="submit" form="settings">Update</button>`);
        return;
    }

    res.render("settings",{
        alert: '',
        username: req.session.username,
        role: req.session.role,
        navbar: await Navbar(req),
    });

}