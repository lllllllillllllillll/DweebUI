import { ServerSettings, Hosts } from '../sys/db.js';
import { configureHost } from '../sys/docker.js';
import { Alert, Navbar, Sidebar, Footer, getLanguage } from '../sys/utils.js';
import { readFileSync, writeFileSync } from 'fs';
import multer from 'multer';

const upload = multer({storage: multer.diskStorage({
    destination: function (req, file, cb) { cb(null, 'data/tmp/') },
    filename: function (req, file, cb) { cb(null, file.originalname) },
})});

let hostcount = 0;

export const Settings = async function(req,res){

    let user_registration = await ServerSettings.findOne({ where: {key: 'user_registration'}});
    let registration_secret = await ServerSettings.findOne({ where: {key: 'registration_secret'}});

    let selected_auth = '';
    let authentication = await ServerSettings.findOne({ where: {key: 'authentication'}});
    if (authentication.value == 'default') { selected_auth = '<option value="default" hidden selected>Username and Password - Default</option>'; }
    else if (authentication.value == 'localhost') { selected_auth = '<option value="localhost" hidden selected>Localhost</option>'; }
    else if (authentication.value == 'no_auth') { selected_auth = '<option value="no_auth" hidden selected>Disabled - No Authentication</option>'; }
    
    let user_registration_enabled = '';
    try { if (user_registration.value == true) { user_registration_enabled = 'checked'; } } catch { }

    let registration_secret_value = '';
    try { registration_secret_value = registration_secret.value; } catch { }

    let port_toggle = '';
    let port_link = await ServerSettings.findOne({ where: {key: 'port_link'}});
    if (port_link.value != 'http://localhost') { port_toggle = 'checked'; }
    

    // Get hosts
    let hosts = await Hosts.findAll();

    // Update hostcount when you view the settings page
    hostcount = hosts.length;

    let host_list = '';

    for (let i = 0; i < hosts.length; i++) {
        
        let protocol = '';
        let enabled = '';

        if (hosts[i].state == 'enabled') { enabled = 'checked'; }

        if (hosts[i].protocol == 'https' || hosts[i].host == '/var/run/docker.sock') {
            protocol = `<button class="btn text-green" hx-swap="innerHTML" hx-get="/settings/view/https/${i+1}" hx-target="#modal_content" data-bs-toggle="modal" data-bs-target="#modal">
                            <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-lock"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z" /><path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" /><path d="M8 11v-4a4 4 0 1 1 8 0v4" /></svg>
                            HTTPS
                        </button>`;
        } else {
            
            // protocol = `<button class="btn text-red" hx-swap="innerHTML" hx-get="/settings/view/http/${i+1}" hx-target="#modal_content" data-bs-toggle="modal" data-bs-target="#modal">
            //                 <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-lock-open-2"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z" /><path d="M9 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" /><path d="M13 11v-4a4 4 0 1 1 8 0v4" /></svg>
            //                 HTTP  
            //             </button>`

            protocol = `<button class="btn text-red" type="button">
                            <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-lock-open-2"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z" /><path d="M9 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" /><path d="M13 11v-4a4 4 0 1 1 8 0v4" /></svg>
                            HTTP  
                        </button>`;
        }

        let entry = `
                    <div class="row align-items-center mb-2">
                      <div class="col-auto">
                        <label class="form-check form-switch form-switch-lg">
                          <input class="form-check-input" type="checkbox" name="toggled${i+1}" ${enabled}>
                          <span class="form-check-label form-check-label-on text-success">
                            Enabled 
                          </span>
                          <span class="form-check-label form-check-label-off text-danger">
                            Disabled
                          </span>
                        </label>
                      </div>
                      <div class="col-2">
                        <input type="text" class="form-control" name="tag${i+1}" value="${hosts[i].tag}">
                      </div>
                      <div class="col-3">
                        <input type="text" class="form-control" name="host${i+1}" value="${hosts[i].host}">
                      </div>
                      <div class="col-2">
                        <input type="text" class="form-control" name="port${i+1}" value="${hosts[i].port}">
                      </div>
                      <div class="col-auto">
                        ${protocol}
                      </div>
                      <div class="col-auto">
                        <button class="btn text-red" hx-swap="innerHTML" hx-get="/settings/view/confirm_remove/${i+1}" hx-target="#modal_content" data-bs-toggle="modal" data-bs-target="#modal">
                          <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-trash mx-2"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
                        </button>
                      </div>
                    </div>`

        host_list += entry;
    }


    res.render("settings",{ 
        username: req.session.username,
        role: req.session.role,
        user_registration: user_registration_enabled,
        registration_secret: registration_secret_value,
        selected_auth: selected_auth,
        port_link: port_toggle,
        port_url: port_link.value,
        host_list: host_list,
        selected: await getLanguage(req.session.userID),
        navbar: await Navbar(req),
        sidebar: await Sidebar(req),
        footer: await Footer(req),
    });
}



export const SettingsAction = async function (req, res) {

    let action = req.params.action;
    let id = req.params.id;
    let { user_registration, registration_secret, port_link, port_url, authentication } = req.body;

    if (action == 'remove_host') {
        await Hosts.destroy({ where: { id: id } });
        // If the host being removed is the current host, set the session host to 1 
        if (req.session.host == id) { req.session.host = 1; }   
        req.session.alert = Alert('success', `Host ${id} removed`);
        console.log(`Host ${id} removed`);

        // Reassign IDs to maintain ascending order
        const hosts = await Hosts.findAll({ order: [['id', 'ASC']] });
        for (let i = 0; i < hosts.length; i++) {
            await Hosts.update({ id: i + 1 }, { where: { id: hosts[i].id } });
        }

        res.redirect('/settings');
        return;
    }

    // User registration
    const [registration_enabled, created] = await ServerSettings.findOrCreate({ where: { key: 'user_registration' }, defaults: { value: user_registration }, });
    if (created) { console.log(`[SQLite] Created key 'user_registration' in ServerSettings`); }
    if (!user_registration) { await ServerSettings.update({value: false}, {where: {key: 'user_registration'}}); }
    else if (user_registration) { await ServerSettings.update({value: true}, {where: {key: 'user_registration'}}); }

    // Registration secret
    const [secret, created2] = await ServerSettings.findOrCreate({ where: { key: 'registration_secret' }, defaults: { value: registration_secret }, });
    if (created2) { console.log(`[SQLite] Created key 'registration_secret' in ServerSettings`); }
    await ServerSettings.update({value: registration_secret}, {where: {key: 'registration_secret'}});

    // Custom port link
    if (port_link) { await ServerSettings.update({value: port_url}, {where: {key: 'port_link'}}); }
    else if (!port_link) { await ServerSettings.update({value: 'http://localhost'}, {where: {key: 'port_link'}}); }

    // Hosts
    let form_fields = Object.keys(req.body).length;
    // Set all host entries to disabled before updating
    await Hosts.update({ state: 'disabled' }, { where: { state: 'enabled' } });
    // Loop through all the fields on the page to look for host entries.
    for (let i = 0; i < form_fields; i++) {
        let id = i + 1;
        if (req.body[`toggled${id}`]) {
            // Skip if 'host' or 'port' is not set. Default value of 'port' is 2375 from the form.
            if ((!req.body[`host${id}`] || !req.body[`port${id}`]) && req.body[`host${id}`] != '/var/run/docker.sock') { continue; }
            const [ entry, created] = await Hosts.findOrCreate({ where: { id: id }, defaults: { state: 'enabled', tag: req.body[`tag${id}`], host: req.body[`host${id}`], port: req.body[`port${id}`], protocol: 'http' } });
            if (!created) { await Hosts.update({ state: 'enabled', tag: req.body[`tag${id}`], host: req.body[`host${id}`], port: req.body[`port${id}`] }, { where: { id: id } }); }
            await configureHost(id, req.body[`host${id}`], req.body[`port${id}`], 'http', req.body[`tag${id}`]);
        }
    }


    // Authentication
    let auth_method = await ServerSettings.findOne({ where: {key: 'authentication'}});
    if (auth_method.value != authentication) {
        await ServerSettings.update({value: authentication },{where: {key: 'authentication'}});
        console.log(`Authentication method changed. Logging out...`);
        req.session.destroy();
        res.redirect('/login');
        return;
    }

    req.session.alert = Alert('success', 'Settings updated');
    res.redirect('/settings');
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

        const resp = await fetch(`https://api.github.com/repos/lllllllillllllillll/DweebUI/contents/sys/languages?ref=dev`);
        const data = await resp.json();
        let languages = [];
        data.forEach((lang) => {
            languages.push({ language: lang.name, download_url: lang.download_url });
        });
    
        for (let i = 0; i < languages.length; i++) {
            let language_dev = await fetch(languages[i].download_url);
            language_dev = await language_dev.text();
    
            let language_local = readFileSync(`./sys/languages/${languages[i].language}`, 'utf8');
            
            if (language_dev != language_local) {
                console.log(`\x1b[31mLanguage: ${languages[i].language} is out of date.\x1b[0m`);
                console.log(`\x1b[31mUpdating ${languages[i].language}...\x1b[0m`);
                writeFileSync(`./sys/languages/${languages[i].language}`, language_dev);
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


// VIEWS
export const SettingsView = async function (req, res) {
    
    let view = req.params.view;
    let id = req.params.id || hostcount + 1;

    // console.log(`SettingsView - View: ${view} ID: ${id}`);

    // HTTP modal
    if (view == 'http') {
        let modal = `
        <div class="modal-body">
            <div class="modal-title">Host ${id}</div>
            <img src = "/img/add to zip.jpg" alt = "Add to zip" class = "img-fluid" />
            <div class="mt-3">
                <form method="post" action="/settings/action/upload" enctype="multipart/form-data" id="upload">
                    <input class="form-control" type="file" name="files" multiple />
                </form>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-link link-secondary me-auto" data-bs-dismiss="modal">Cancel</button>
            <button type="submit" class="btn btn-primary" data-bs-dismiss="modal" form="upload">Upload</button>
        </div>`;
        res.send(modal);
        return;
    }

    // HTTPS modal
    if (view == 'https') {
        let modal = `
        <div class="modal-body">
            <div class="modal-title">HTTPS - Secure</div>
            <div class="text-muted mb-2"></div>
            <div class="text-muted mb-3"></div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-link link-secondary me-auto" data-bs-dismiss="modal">Cancel</button>
            <button type="submit" class="btn btn-primary" data-bs-dismiss="modal" form="upload">Ok</button>
        </div>`;
        res.send(modal);
        return;
    }

    // Remove host modal
    if (view == 'confirm_remove') {
        let host = await Hosts.findOne({ where: { id: id }});
        let modal = `
            <div class="modal-body">
                <div class="modal-title">Remove Host ${id}?</div>
                <div class="mb-2"><label class="text-muted">Tag: </label>${host.tag}</div>
                <div class="mb-2"><label class="text-muted">Host: </label>${host.host}</div>
                <div class=""><label class="text-muted">Port: </label>${host.port}</div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-link link-secondary me-auto" data-bs-dismiss="modal">Cancel</button>
                <form action="/settings/action/remove_host/${id}" method="post">
                    <button type="submit" class="btn btn-danger">Remove</button>
                </form>
            </div>`;
        res.send(modal);
        return;
    }

    // Form fields for adding a new host
    if (view == 'add_host') {
        let new_row = `
                    <div class="row align-items-center mb-2" id="">
                        <div class="col-auto">
                        <label class="form-check form-switch form-switch-lg">
                            <input class="form-check-input" type="checkbox" name="toggled${hostcount + 1}" checked>
                            <span class="form-check-label form-check-label-on text-success">
                            Enabled 
                            </span>
                            <span class="form-check-label form-check-label-off text-danger">
                            Disabled
                            </span>
                        </label>
                        </div>
                        <div class="col-2">
                        <input type="text" class="form-control" name="tag${hostcount + 1}" value="Host ${hostcount + 1}">
                        </div>
                        <div class="col-3">
                        <input type="text" class="form-control" name="host${hostcount + 1}">
                        </div>
                        <div class="col-2">
                        <input type="text" class="form-control" name="port${hostcount + 1}" value="2375">
                        </div>
                        <div class="col-auto">
                        <button class="btn text-red" hx-get="/something" hx-swap="none" hx-target="#import_modal" data-bs-toggle="modal" data-bs-target="#no_host" disabled title="Update host list">
                            <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-lock-open-2"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z" /><path d="M9 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" /><path d="M13 11v-4a4 4 0 1 1 8 0v4" /></svg>
                            HTTP  
                        </button>
                        </div>
                        <div class="col-auto">
                        <button class="btn text-red" hx-get="/something" hx-swap="none" hx-target="#import_modal" data-bs-toggle="modal" data-bs-target="#confirm" disabled>
                            <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-trash mx-2"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
                        </button>
                        </div>
                    </div>`
        hostcount++;
        res.send(new_row);
        return;
    }

}