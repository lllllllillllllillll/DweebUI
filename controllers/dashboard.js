import { Readable } from 'stream';
import { Permission, Container, User } from '../database/models.js';
import { docker } from '../server.js';
import { dockerContainerStats } from 'systeminformation';
import { readFileSync } from 'fs';
import { currentLoad, mem, networkStats, fsSize } from 'systeminformation';

let hidden = '';

// The actual page
export const Dashboard = (req, res) => {
    
    let name = req.session.user;
    let role = req.session.role;
    let avatar = name.charAt(0).toUpperCase();

    res.render("dashboard", {
        name: name,
        avatar: avatar,
        role: role
    });
}

// Server metrics (CPU, RAM, TX, RX, DISK)
export const Stats = async (req, res) => {
    let name = req.header('hx-trigger-name');
    let color = req.header('hx-trigger');
    let value = 0;
    switch (name) {
        case 'CPU': 
            await currentLoad().then(data => { 
                value = Math.round(data.currentLoad); 
            });
            break;
        case 'RAM': 
            await mem().then(data => { 
                value = Math.round((data.active / data.total) * 100); 
            });
            break;
        case 'NET':
            let down = 0;
            let up = 0;
            let percent = 0;
            await networkStats().then(data => {
                down = Math.round(data[0].rx_bytes / (1024 * 1024));
                up = Math.round(data[0].tx_bytes / (1024 * 1024));
                // percent of download vs max download if max download was 1GB
                percent = Math.round((down / 1000) * 100);
            });
            let net = `<div class="font-weight-medium">
                        <label class="cpu-text mb-1">Down:${down}MB  Up:${up}MB</label>
                        </div>
                        <div class="cpu-bar meter animate ${color}">
                            <span style="width:20%"><span></span></span>
                        </div>`;           
            res.send(net);
            return;
        case 'DISK':
            await fsSize().then(data => { 
                value = data[0].use; 
            });
            break;
    }
    let info = `<div class="font-weight-medium">
                    <label class="cpu-text mb-1">${name} ${value}%</label>
                </div>
                <div class="cpu-bar meter animate ${color}">
                    <span style="width:${value}%"><span></span></span>
                </div>`;
    res.send(info);
}

async function containerInfo (containerName) {
    let container = docker.getContainer(containerName);
    let info = await container.inspect();
    let image = info.Config.Image.split('/');
    let ports_list = [];
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
    } catch {
        // no exposed ports
    }

    let external = 0;
    let internal = 0;
    try {
        external = ports_list[0].external;
        internal = ports_list[0].internal;
    }   catch {
        // no exposed ports
    }
    

    let details = {
        name: containerName,
        image: image,
        service: image[image.length - 1].split(':')[0],
        state: info.State.Status,
        external_port: external,
        internal_port: internal,
        ports: ports_list,
        link: 'localhost',
    }
    return details;
}

async function createCard (details) {
    if (hidden.includes(details.name)) { return;}
    let shortname = details.name.slice(0, 10) + '...';
    let trigger = 'data-hx-trigger="load, every 3s"';
    let state = details.state;
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
    let card  = readFileSync('./views/partials/containerCard.html', 'utf8');
    card = card.replace(/AppName/g, details.name);
    card = card.replace(/AppShortName/g, shortname);
    card = card.replace(/AppIcon/g, details.service);
    card = card.replace(/AppState/g, state);
    card = card.replace(/StateColor/g, state_color);
    card = card.replace(/ExternalPort/g, details.external_port);
    card = card.replace(/InternalPort/g, details.internal_port);
    card = card.replace(/ChartName/g, details.name.replace(/-/g, ''));
    card = card.replace(/AppNameState/g, `${details.name}State`);
    card = card.replace(/data-trigger=""/, trigger);
    return card;
}


let [ cardList, newCards, containersArray, sentArray, updatesArray ] = [ '', '', [], [], [] ];

export async function addCard (name, state) {
    console.log(`Adding card for ${name}: ${state}`);

    let details = {
        name: name,
        image: name,
        service: name,
        state: 'installing',
        external_port: 0,
        internal_port: 0,
        ports: [],
        link: 'localhost',
    
    }
    createCard(details).then(card => {
        cardList += card;
    });
}




// HTMX server-side events
export const SSE = (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });

    let eventCheck = setInterval(async () => {
        // builds array of containers and their states
        containersArray = [];
        await docker.listContainers({ all: true }).then(containers => {
            containers.forEach(container => {
                let name = container.Names[0].replace('/', '');
                if (!hidden.includes(name)) { // if not hidden
                    containersArray.push({ container: name, state: container.State });
                } 
            });
        });

        if ((JSON.stringify(containersArray) !== JSON.stringify(sentArray))) {
            cardList = '';
            newCards = '';
            containersArray.forEach(container => {
                const { container: containerName, state } = container;
                const existingContainer = sentArray.find(c => c.container === containerName);
                if (!existingContainer) {
                    containerInfo(containerName).then(details => {
                        createCard(details).then(card => {
                            newCards += card;
                        });
                    });
                    res.write(`event: update\n`);
                    res.write(`data: 'update cards'\n\n`);
                } else if (existingContainer.state !== state) {
                    updatesArray.push(containerName);
                }
                containerInfo(containerName).then(details => {
                    createCard(details).then(card => {
                        cardList += card;
                    });
                });
            });

            sentArray.forEach(container => {
                const { container: containerName } = container;
                const existingContainer = containersArray.find(c => c.container === containerName);
                if (!existingContainer) {
                    updatesArray.push(containerName);
                }
            });

            for (let i = 0; i < updatesArray.length; i++) {
                res.write(`event: ${updatesArray[i]}\n`);
                res.write(`data: 'update cards'\n\n`);
            }
            updatesArray = [];
            sentArray = containersArray.slice();
        }

    }, 500);


    req.on('close', () => {
        clearInterval(eventCheck);
    });
};

let stats = {};
// Container charts
export const Chart = async (req, res) => {
    let name = req.header('hx-trigger-name');
    if (!stats[name]) {
        stats[name] = { cpuArray: Array(15).fill(0), ramArray: Array(15).fill(0) };
    }
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

export const updateCards = async (req, res) => {
    console.log('updateCards called');
    res.send(newCards);
    newCards = '';
}


export const Containers = async (req, res) => {
    res.send(cardList);
}

export const Card = async (req, res) => {
    let name = req.header('hx-trigger-name');
    console.log(`${name} requesting updated card`);
    // return nothing if in hidden or not found in containersArray
    if (hidden.includes(name) || !containersArray.find(c => c.container === name)) {
        res.send('');
        return;
    } else {
        let details = await containerInfo(name);
        let card = await createCard(details);
        res.send(card);
    }
}




function status (state) {
    let status = `<span class="text-yellow align-items-center lh-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon-tabler icon-tabler-point-filled" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"> <path stroke="none" d="M0 0h24v24H0z" fill="none"></path> <path d="M12 7a5 5 0 1 1 -4.995 5.217l-.005 -.217l.005 -.217a5 5 0 0 1 4.995 -4.783z" stroke-width="0" fill="currentColor"></path></svg>
                    ${state}
                </span>`;
    return status;
}


export const Logs = (req, res) => {
    let name = req.header('hx-trigger-name');
    function containerLogs (data) {
        return new Promise((resolve, reject) => {
            let logString = '';
            var options = { follow: false, stdout: true, stderr: false, timestamps: false };
            var containerName = docker.getContainer(data);
            containerName.logs(options, function (err, stream) {
                if (err) { reject(err); return; }
                const readableStream = Readable.from(stream);
                readableStream.on('data', function (chunk) {
                    logString += chunk.toString('utf8');
                });
                readableStream.on('end', function () {
                    resolve(logString);
                });
            });
        });
    };
    containerLogs(name).then((data) => {
        res.send(`<pre>${data}</pre> `)
    });
}

export const Action = async (req, res) => {
    let name = req.header('hx-trigger-name');
    let state = req.header('hx-trigger');
    let action = req.params.action;
    // Start
    if ((action == 'start') && (state == 'stopped')) {
        var containerName = docker.getContainer(name);
        containerName.start();
        res.send(status('starting'));
    } else if ((action == 'start') && (state == 'paused')) {
        var containerName = docker.getContainer(name);
        containerName.unpause();
        res.send(status('starting'));
    // Stop
    } else if ((action == 'stop') && (state != 'stopped')) {
        var containerName = docker.getContainer(name);
        containerName.stop();
        res.send(status('stopping'));
    // Pause
    } else if ((action == 'pause') && (state == 'paused')) {
        var containerName = docker.getContainer(name);
        containerName.unpause();
        res.send(status('starting'));
    }   else if ((action == 'pause') && (state == 'running')) {
        var containerName = docker.getContainer(name);
        containerName.pause();
        res.send(status('pausing'));
    // Restart
    } else if (action == 'restart') {
        var containerName = docker.getContainer(name);
        containerName.restart();
        res.send(status('restarting'));
    // Hide
    } else if (action == 'hide') {
        let exists = await Container.findOne({ where: {name: name}});
        if (!exists) {
            const newContainer = await Container.create({ name: name, visibility: false, });
        } else {
            exists.update({ visibility: false });
        }
        hidden = await Container.findAll({ where: {visibility:false}});
        hidden = hidden.map((container) => container.name);
        res.send("ok");
    // Reset View
    } else if (action == 'reset') {
        await Container.update({ visibility: true }, { where: {} });
        hidden = await Container.findAll({ where: {visibility:false}});
        hidden = hidden.map((container) => container.name);
        res.send("ok");
    }   
}


export const Modals = async (req, res) => {
    let name = req.header('hx-trigger-name');
    let id = req.header('hx-trigger');
    let title = name.charAt(0).toUpperCase() + name.slice(1);

    if (id == 'permissions') {
        let permissions_list = '';
        let permissions_modal = readFileSync('./views/modals/permissions.html', 'utf8');
        permissions_modal = permissions_modal.replace(/PermissionsTitle/g, title);
        let users = await User.findAll({ attributes: ['username', 'UUID']});

        for (let i = 0; i < users.length; i++) {
            let user_permissions = readFileSync('./views/partials/user_permissions.html', 'utf8');
            let exists = await Permission.findOne({ where: {containerName: name, user: users[i].username}});
            if (!exists) {
                const newPermission = await Permission.create({ containerName: name, user: users[i].username, userID: users[i].UUID});
            }
            
            let permissions = await Permission.findOne({ where: {containerName: name, user: users[i].username}});
            if (permissions.uninstall == true) { user_permissions = user_permissions.replace(/data-UninstallCheck/g, 'checked'); }
            if (permissions.edit == true) { user_permissions = user_permissions.replace(/data-EditCheck/g, 'checked'); }
            if (permissions.upgrade == true) { user_permissions = user_permissions.replace(/data-UpgradeCheck/g, 'checked'); }
            if (permissions.start == true) { user_permissions = user_permissions.replace(/data-StartCheck/g, 'checked'); }
            if (permissions.stop == true) { user_permissions = user_permissions.replace(/data-StopCheck/g, 'checked'); }
            if (permissions.pause == true) { user_permissions = user_permissions.replace(/data-PauseCheck/g, 'checked'); }
            if (permissions.restart == true) { user_permissions = user_permissions.replace(/data-RestartCheck/g, 'checked'); }
            if (permissions.logs == true) { user_permissions = user_permissions.replace(/data-LogsCheck/g, 'checked'); }

            user_permissions = user_permissions.replace(/EntryNumber/g, i);
            user_permissions = user_permissions.replace(/PermissionsUsername/g, users[i].username);
            user_permissions = user_permissions.replace(/PermissionsContainer/g, name);

            permissions_list += user_permissions;
        }

        permissions_modal = permissions_modal.replace(/PermissionsList/g, permissions_list);
        res.send(permissions_modal);
        return;
    }



    if (id == 'uninstall') {
        let modal = readFileSync('./views/modals/uninstall.html', 'utf8');
        modal = modal.replace(/AppName/g, name);
        // let containerPermissions = await Permission.findAll({ where: {containerName: name}});
        res.send(modal);
        return;
    }

    let modal = readFileSync('./views/modals/details.html', 'utf8');
    let details = await containerInfo(name);

    modal = modal.replace(/AppName/g, details.name);
    modal = modal.replace(/AppImage/g, details.image);
    res.send(modal);
}


export const UpdatePermissions = async (req, res) => {

    let user = req.body.username;
    let container = req.body.container;
    let id = req.header('hx-trigger');
    
    console.log(`${req.session.user} is updating permissions for: ${user} on ${container}`);

    Object.keys(req.body).forEach(async function(key) {
        if (key != 'username' && key != 'container') {
            let permissions = req.body[key];

            if (permissions.includes('uninstall')){
                await Permission.update({ uninstall: true }, { where: {containerName: container, user: user}});
            }   
            else {
                await Permission.update({ uninstall: false }, { where: {containerName: container, user: user}});
            }

            if (permissions.includes('edit')){
                await Permission.update({ edit: true }, { where: {containerName: container, user: user}});
            }   
            else {
                await Permission.update({ edit: false }, { where: {containerName: container, user: user}});
            }

            if (permissions.includes('upgrade')){
                await Permission.update({ upgrade: true }, { where: {containerName: container, user: user}});
            }   
            else {
                await Permission.update({ upgrade: false }, { where: {containerName: container, user: user}});
            }
            
            if (permissions.includes('start')){
                await Permission.update({ start: true }, { where: {containerName: container, user: user}});
            }   else {
                await Permission.update({ start: false }, { where: {containerName: container, user: user}});
            }

            if (permissions.includes('stop')){
                await Permission.update({ stop: true }, { where: {containerName: container, user: user}});
            }   else {
                await Permission.update({ stop: false }, { where: {containerName: container, user: user}});
            }

            if (permissions.includes('pause')){
                await Permission.update({ pause: true }, { where: {containerName: container, user: user}});
            }   else {
                await Permission.update({ pause: false }, { where: {containerName: container, user: user}});
            }

            if (permissions.includes('restart')){
                await Permission.update({ restart: true }, { where: {containerName: container, user: user}});
            }   else {
                await Permission.update({ restart: false }, { where: {containerName: container, user: user}});
            }

            if (permissions.includes('logs')){
                await Permission.update({ logs: true }, { where: {containerName: container, user: user}});
            }
            else {
                await Permission.update({ logs: false }, { where: {containerName: container, user: user}});
            }
        }  
    });

    let submit = '';
    if (id == 'submit') {
        submit = `<button class="btn" type="button" id="confirmed" hx-post="/updatePermissions" hx-swap="outerHTML" hx-trigger="load delay:2s">Update ✔️</button>`;
        res.send(submit);
        return;
    } else if (id == 'confirmed') {
        submit = `<button class="btn" type="button" id="submit" hx-post="/updatePermissions" hx-vals="#updatePermissions" hx-swap="outerHTML">Update  </button>`;
        res.send(submit);
        return;
    }
}