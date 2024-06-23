import { Readable } from 'stream';
import { Permission, User, ServerSettings } from '../database/models.js';
import { docker } from '../server.js';
import { readFileSync } from 'fs';
import { currentLoad, mem, networkStats, fsSize, dockerContainerStats } from 'systeminformation';
import { Op } from 'sequelize';

let hidden = '';
let alert = '';
let [ cardList, newCards, stats ] = [ '', '', {}];
let [ports_data, volumes_data, env_data, label_data] = [[], [], [], []];

// The page
export const Dashboard = (req, res) => {

    let name = req.session.user ;
    let role = req.session.role;
    alert = req.session.alert;
    
    res.render("dashboard", {
        name: name,
        avatar: name.charAt(0).toUpperCase(),
        role: role,
        alert: alert,
    });
}

// The page actions
export const DashboardAction = async (req, res) => {
    let name = req.header('hx-trigger-name');
    let value = req.header('hx-trigger');
    let action = req.params.action;
    let modal = '';
    let hostip = req.connection.remoteAddress;

    switch (action) {
        case 'permissions':
            let title = name.charAt(0).toUpperCase() + name.slice(1);
            let permissions_list = '';
            let permissions_modal = readFileSync('./views/modals/permissions.html', 'utf8');
            permissions_modal = permissions_modal.replace(/PermissionsTitle/g, title);
            permissions_modal = permissions_modal.replace(/PermissionsContainer/g, name);
            let users = await User.findAll({ attributes: ['username', 'UUID']});
            for (let i = 0; i < users.length; i++) {
                let user_permissions = readFileSync('./views/partials/user_permissions.html', 'utf8');
                let exists = await Permission.findOne({ where: {containerName: name, user: users[i].username}});
                if (!exists) { const newPermission = await Permission.create({ containerName: name, user: users[i].username, userID: users[i].UUID}); }
                let permissions = await Permission.findOne({ where: {containerName: name, user: users[i].username}});
                if (permissions.uninstall == true) { user_permissions = user_permissions.replace(/data-UninstallCheck/g, 'checked'); }
                if (permissions.edit == true) { user_permissions = user_permissions.replace(/data-EditCheck/g, 'checked'); }
                if (permissions.upgrade == true) { user_permissions = user_permissions.replace(/data-UpgradeCheck/g, 'checked'); }
                if (permissions.start == true) { user_permissions = user_permissions.replace(/data-StartCheck/g, 'checked'); }
                if (permissions.stop == true) { user_permissions = user_permissions.replace(/data-StopCheck/g, 'checked'); }
                if (permissions.pause == true) { user_permissions = user_permissions.replace(/data-PauseCheck/g, 'checked'); }
                if (permissions.restart == true) { user_permissions = user_permissions.replace(/data-RestartCheck/g, 'checked'); }
                if (permissions.logs == true) { user_permissions = user_permissions.replace(/data-LogsCheck/g, 'checked'); }
                if (permissions.view == true) { user_permissions = user_permissions.replace(/data-ViewCheck/g, 'checked'); }
                user_permissions = user_permissions.replace(/EntryNumber/g, i);
                user_permissions = user_permissions.replace(/EntryNumber/g, i);
                user_permissions = user_permissions.replace(/EntryNumber/g, i);
                user_permissions = user_permissions.replace(/PermissionsUsername/g, users[i].username);
                user_permissions = user_permissions.replace(/PermissionsUsername/g, users[i].username);
                user_permissions = user_permissions.replace(/PermissionsUsername/g, users[i].username);
                user_permissions = user_permissions.replace(/PermissionsContainer/g, name);
                user_permissions = user_permissions.replace(/PermissionsContainer/g, name);
                user_permissions = user_permissions.replace(/PermissionsContainer/g, name);
                permissions_list += user_permissions;
            }
            permissions_modal = permissions_modal.replace(/PermissionsList/g, permissions_list);
            res.send(permissions_modal);
            return;
        case 'uninstall':
            modal = readFileSync('./views/modals/uninstall.html', 'utf8');
            modal = modal.replace(/AppName/g, name);
            res.send(modal);
            return;
        case 'details':
            modal = readFileSync('./views/modals/details.html', 'utf8');
            let details = await containerInfo(name);

            modal = modal.replace(/AppName/g, details.name);
            modal = modal.replace(/AppImage/g, details.image);

            for (let i = 0; i <= 6; i++) {
                modal = modal.replaceAll(`Port${i}Check`, details.ports[i]?.check || '');
                modal = modal.replaceAll(`Port${i}External`, details.ports[i]?.external || '');
                modal = modal.replaceAll(`Port${i}Internal`, details.ports[i]?.internal || '');
                modal = modal.replaceAll(`Port${i}Protocol`, details.ports[i]?.protocol || '');
            }

            for (let i = 0; i <= 6; i++) {
                modal = modal.replaceAll(`Vol${i}Source`, details.volumes[i]?.Source || '');
                modal = modal.replaceAll(`Vol${i}Destination`, details.volumes[i]?.Destination || '');
                modal = modal.replaceAll(`Vol${i}RW`, details.volumes[i]?.RW || '');
            }


            for (let i = 0; i <= 19; i++) {
                modal = modal.replaceAll(`Label${i}Key`, Object.keys(details.labels)[i] || '');
                modal = modal.replaceAll(`Label${i}Value`, Object.values(details.labels)[i] || '');
            }

            // console.log(details.env);
            for (let i = 0; i <= 19; i++) {
                modal = modal.replaceAll(`Env${i}Key`, details.env[i]?.split('=')[0] || '');
                modal = modal.replaceAll(`Env${i}Value`, details.env[i]?.split('=')[1] || '');
            }

            res.send(modal);
            return;
        case 'updates':
            res.send(newCards);
            newCards = '';
            return;
        case 'card':
            await userCards(req.session);
            if (!req.session.container_list.find(c => c.container === name)) {
                res.send('');
                return;
            } else {
                let details = await containerInfo(name);
                let card = await createCard(details);
                res.send(card);
                return;
            }
        case 'logs':
            let logString = '';
            let options = { follow: true, stdout: true, stderr: false, timestamps: false };
            docker.getContainer(name).logs(options, function (err, stream) {
                if (err) { console.log(err); return; }
                const readableStream = Readable.from(stream);
                readableStream.on('data', function (chunk) {
                    logString += chunk.toString('utf8');
                });
                readableStream.on('end', function () {
                    res.send(`<pre>${logString}</pre>`);
                });
            });
            return;
        case 'hide':
            let user = req.session.user;
            let exists = await Permission.findOne({ where: {containerName: name, user: user}});
            if (!exists) { const newPermission = await Permission.create({ containerName: name, user: user, hide: true, userID: req.session.UUID}); }
            else { exists.update({ hide: true }); }
            hidden = await Permission.findAll({ where: {user: user, hide: true}}, { attributes: ['containerName'] });
            hidden = hidden.map((container) => container.containerName);
            res.send("ok");
            return;
        case 'reset':
            await Permission.update({ hide: false }, { where: { user: req.session.user } });
            res.send("ok");
            return;
        case 'alert':
            req.session.alert = '';
            res.send('');
            return;
    }

    function status (state) {
        return(`<span class="text-yellow align-items-center lh-1"><svg xmlns="http://www.w3.org/2000/svg" class="icon-tabler icon-tabler-point-filled" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"> <path stroke="none" d="M0 0h24v24H0z" fill="none"></path> <path d="M12 7a5 5 0 1 1 -4.995 5.217l-.005 -.217l.005 -.217a5 5 0 0 1 4.995 -4.783z" stroke-width="0" fill="currentColor"></path></svg>
                        ${state}
                </span>`);
    }

    // Container actions
    if ((action == 'start') && (value == 'stopped')) {
        docker.getContainer(name).start();
        res.send(status('starting'));
    } else if ((action == 'start') && (value == 'paused')) {
        docker.getContainer(name).unpause();
        res.send(status('starting'));
    } else if ((action == 'stop') && (value != 'stopped')) {
        docker.getContainer(name).stop();
        res.send(status('stopping'));
    } else if ((action == 'pause') && (value == 'paused')) {
        docker.getContainer(name).unpause();
        res.send(status('starting'));
    }   else if ((action == 'pause') && (value == 'running')) {
        docker.getContainer(name).pause();
        res.send(status('pausing'));
    } else if (action == 'restart') {
        docker.getContainer(name).restart();
        res.send(status('restarting'));
    } 
}

async function containerInfo (containerName) {
    // get the container info
    let container = docker.getContainer(containerName);
    let info = await container.inspect();
    let image = info.Config.Image;
    // grab the service name from the end of the image name
    let service = image.split('/').pop();
    // remove the tag from the service name if it exists
    try { service = service.split(':')[0]; } catch {}
    let ports_list = [];
    let external = 0;
    let internal = 0;
    
    try {
        for (const [key, value] of Object.entries(info.HostConfig.PortBindings)) {
            let ports = {
                check: 'checked',
                external: value[0].HostPort,
                internal: key.split('/')[0],
                protocol: key.split('/')[1]
            }
            ports_list.push(ports);
        }
    } catch {}
    try {
        external = ports_list[0].external;
        internal = ports_list[0].internal;
    } catch {}

    let details = {
        name: containerName,
        image: image,
        service: service,
        state: info.State.Status,
        external_port: external,
        internal_port: internal,
        ports: ports_list,
        volumes: info.Mounts,
        env: info.Config.Env,
        labels: info.Config.Labels,
        link: 'localhost',
    }
    return details;
}

async function createCard (details) {
    let shortname = details.name.slice(0, 10) + '...';
    let trigger = 'data-hx-trigger="load, every 3s"';
    let state = details.state;
    let card  = readFileSync('./views/partials/containerFull.html', 'utf8');

    let links = await ServerSettings.findOne({ where: {key: 'links'}});
    if (!links) { links = { value: 'localhost' }; }

    let state_color = '';
    switch (state) {
        case 'running':
            state_color = 'green';
            break;
        case 'exited':
            state = 'stopped';
            state_color = 'red';
            trigger = 'data-hx-trigger="load"';
            break;
        case 'paused':
            state_color = 'orange';
            trigger = 'data-hx-trigger="load"';
            break;
        case 'installing':
            state_color = 'blue';
            trigger = 'data-hx-trigger="load"';
            break;
    }
    // if (name.startsWith('dweebui')) { disable = 'disabled=""'; }

    card = card.replace(/AppName/g, details.name);
    card = card.replace(/AppShortName/g, shortname);
    card = card.replace(/AppIcon/g, details.service);
    card = card.replace(/AppState/g, state);
    card = card.replace(/StateColor/g, state_color);
    card = card.replace(/AppLink/g, links.value);
    card = card.replace(/ExternalPort/g, details.external_port);
    card = card.replace(/InternalPort/g, details.internal_port);
    card = card.replace(/ChartName/g, details.name.replace(/-/g, ''));
    card = card.replace(/AppNameState/g, `${details.name}State`);
    card = card.replace(/data-trigger=""/, trigger);
    return card;
}

async function userCards (session) {
    session.container_list = [];
    // check what containers the user wants hidden
    let hidden = await Permission.findAll({ where: {user: session.user, hide: true}}, { attributes: ['containerName'] });
    hidden = hidden.map((container) => container.containerName);
    // check what containers the user has permission to view
    let visable = await Permission.findAll({ where: { user: session.user, [Op.or]: [{ uninstall: true }, { edit: true }, { upgrade: true }, { start: true }, { stop: true }, { pause: true }, { restart: true }, { logs: true }, { view: true }] } });
    visable = visable.map((container) => container.containerName);
    // get all containers
    let containers = await docker.listContainers({ all: true });
    // loop through containers
    for (let i = 0; i < containers.length; i++) {
        let container_name = containers[i].Names[0].replace('/', '');
        // skip hidden containers
        if (hidden.includes(container_name)) { continue; }
        // admin can see all containers that they don't have hidden
        if (session.role == 'admin') { session.container_list.push({ container: container_name, state: containers[i].State }); }
        // user can see any containers that they have any permissions for
        else if (visable.includes(container_name)){ session.container_list.push({ container: container_name, state: containers[i].State }); }
    }
    // create a sent list if it doesn't exist
    if (!session.sent_list) { session.sent_list = []; }
    if (!session.update_list) { session.update_list = []; }
    if (!session.new_cards) { session.new_cards = []; }
}

async function updateDashboard (session) {
    let container_list = session.container_list;
    let sent_list = session.sent_list;
    session.new_cards = [];
    session.update_list = [];
    // loop through the containers list
    container_list.forEach(info => {
        let { container, state } = info;
        let sent = sent_list.find(c => c.container === container);
        if (!sent) { session.new_cards.push(container);}
        else if (sent.state !== state) { session.update_list.push(container); }
    });
    // loop through the sent list to see if any containers have been removed
    sent_list.forEach(info => {
        let { container } = info;
        let exists = container_list.find(c => c.container === container);
        if (!exists) { session.update_list.push(container); }
    });
}

// HTMX server-side events
export const SSE = async (req, res) => {
    // set the headers for server-sent events
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });
    // check for container changes every 500ms
    let eventCheck = setInterval(async () => {
        await userCards(req.session);
        // check if the cards displayed are the same as what's in the session
        if ((JSON.stringify(req.session.container_list) === JSON.stringify(req.session.sent_list))) { return; }
        await updateDashboard(req.session); 

        for (let i = 0; i < req.session.new_cards.length; i++) {
            let details = await containerInfo(req.session.new_cards[i]);
            let card = await createCard(details);
            newCards += card;
            req.session.alert = '';
        }
        for (let i = 0; i < req.session.update_list.length; i++) {
            res.write(`event: ${req.session.update_list[i]}\n`);
            res.write(`data: 'update cards'\n\n`);
        }
        res.write(`event: update\n`);
        res.write(`data: 'update cards'\n\n`);
        req.session.sent_list = req.session.container_list.slice();
    }, 500);
    req.on('close', () => {
        clearInterval(eventCheck);
    });
};

// Server metrics (CPU, RAM, TX, RX, DISK)
export const Stats = async (req, res) => {
    let name = req.header('hx-trigger-name');
    let color = req.header('hx-trigger');
    let value = 0;
    switch (name) {
        case 'CPU': 
            await currentLoad().then(data => { value = Math.round(data.currentLoad); });
            break;
        case 'RAM': 
            await mem().then(data => { value = Math.round((data.active / data.total) * 100); });
            break;
        case 'NET':
            let [down, up, percent] = [0, 0, 0];
            await networkStats().then(data => { down = Math.round(data[0].rx_bytes / (1024 * 1024)); up = Math.round(data[0].tx_bytes / (1024 * 1024)); percent = Math.round((down / 1000) * 100); });
            let net = `<div class="font-weight-medium"><label class="cpu-text mb-1">Down:${down}MB  Up:${up}MB</label></div>
                        <div class="cpu-bar meter animate ${color}"><span style="width:20%"><span></span></span></div>`;           
            res.send(net);
            return;
        case 'DISK':
            await fsSize().then(data => { value = data[0].use; });
            break;
    }
    let info = `<div class="font-weight-medium"> <label class="cpu-text mb-1">${name} ${value}%</label></div>
                <div class="cpu-bar meter animate ${color}"> <span style="width:${value}%"><span></span></span> </div>`;
    res.send(info);
}

// Imported by utils/install.js
export async function addAlert (session, type, message) {
    session.alert = `<div class="alert alert-${type} alert-dismissible py-2 mb-0" role="alert" id="alert">
                        <div class="d-flex">
                            <div class="spinner-border text-info nav-link">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                            <div>
                              ${message}
                            </div>
                        </div>
                        <button class="btn-close" data-hx-post="/dashboard/alert" data-hx-trigger="click" data-hx-target="#alert" data-hx-swap="outerHTML" style="padding-top: 0.5rem;" ></button>
                    </div>`;
}

export const UpdatePermissions = async (req, res) => {
    let { user, container, reset_permissions } = req.body;
    let id = req.header('hx-trigger');
    if (reset_permissions) {
        await Permission.update({ uninstall: false, edit: false, upgrade: false, start: false, stop: false, pause: false, restart: false, logs: false, view: false }, { where: { containerName: container} });
        return;
    }
    await Permission.update({ uninstall: false, edit: false, upgrade: false, start: false, stop: false, pause: false, restart: false, logs: false }, { where: { containerName: container, user: user } });
    Object.keys(req.body).forEach(async function(key) {
        if (key != 'user' && key != 'container') {
            let permissions = req.body[key];
            if (permissions.includes('uninstall')) { await Permission.update({ uninstall: true }, { where: {containerName: container, user: user}}); }  
            if (permissions.includes('edit')) { await Permission.update({ edit: true }, { where: {containerName: container, user: user}}); }   
            if (permissions.includes('upgrade')) { await Permission.update({ upgrade: true }, { where: {containerName: container, user: user}}); }   
            if (permissions.includes('start')) { await Permission.update({ start: true }, { where: {containerName: container, user: user}}); }   
            if (permissions.includes('stop')) { await Permission.update({ stop: true }, { where: {containerName: container, user: user}}); }   
            if (permissions.includes('pause')) { await Permission.update({ pause: true }, { where: {containerName: container, user: user}}); }   
            if (permissions.includes('restart')) { await Permission.update({ restart: true }, { where: {containerName: container, user: user}}); }   
            if (permissions.includes('logs')) { await Permission.update({ logs: true }, { where: {containerName: container, user: user}}); }
            if (permissions.includes('view')) { await Permission.update({ view: true }, { where: {containerName: container, user: user}}); }
        }  
    });
    if (id == 'submit') {
        res.send('<button class="btn" type="button" id="confirmed" hx-post="/updatePermissions" hx-swap="outerHTML" hx-trigger="load delay:2s">Update ✔️</button>');
        return;
    } else if (id == 'confirmed') {
        res.send('<button class="btn" type="button" id="submit" hx-post="/updatePermissions" hx-vals="#updatePermissions" hx-swap="outerHTML">Update  </button>');
        return;
    }
}

// Container charts
export const Chart = async (req, res) => {
    let name = req.header('hx-trigger-name');
    if (!stats[name]) { stats[name] = { cpuArray: Array(15).fill(0), ramArray: Array(15).fill(0) }; }
    const info = await dockerContainerStats(name);
    stats[name].cpuArray.push(Math.round(info[0].cpuPercent));
    stats[name].ramArray.push(Math.round(info[0].memPercent));
    stats[name].cpuArray = stats[name].cpuArray.slice(-15);
    stats[name].ramArray = stats[name].ramArray.slice(-15);
    let chart = `
        <script>
            ${name}chart.updateSeries([{
                data: [${stats[name].cpuArray}]
            }, {
                data: [${stats[name].ramArray}]
            }])
        </script>`
    res.send(chart);
}