import { readFileSync, readdirSync, renameSync, mkdirSync, unlinkSync, existsSync } from 'fs';
import { Alert, getLanguage, Navbar } from '../utils/system.js';

export const Apps = async function(req,res){

    let { page, template } = req.params;

    let file = '';
    let templates = [];

    if (!page) { page = 1; }
    if (!template) { template = 'default'; }
    
    try {   // Try to read the template file
        file = readFileSync(`./appdata/templates/${template}.json`);
        templates = JSON.parse(file).templates;
            // Sort the templates by name
        templates = templates.sort((a, b) => { if (a.name < b.name) { return -1; } });
    } 
    catch {
        console.log(`Template ${template} not found`);
    }

    let apps_list = '';

    for (let i = 0; i < templates.length; i++) {
        let app_card = readFileSync('./views/partials/app_card.html', 'utf8');
        app_card = app_card.replace(/AppShortName/g, templates[i].name);
        app_card = app_card.replace(/AppIcon/g, templates[i].logo);
        apps_list += app_card;
    }

    let app_count = `1 - 28 of ${templates.length} Apps`;

    res.render("apps",{ 
        alert: '',
        username: req.session.username,
        role: req.session.role,
        app_count: app_count,
        remove_button: '',
        json_templates: '',
        apps_list: apps_list,
        prev: '',
        next: '',
        pages: '',
        navbar: await Navbar(req),
    });
}



export const submitApps = async function(req,res){

    // console.log(req.body);

    let trigger_name = req.header('hx-trigger-name');
    let trigger_id = req.header('hx-trigger');

    console.log(`trigger_name: ${trigger_name} - trigger_id: ${trigger_id}`);


    res.render("apps",{
        alert: '',
        username: req.session.username,
        role: req.session.role,
        navbar: await Navbar(req),
    });

}