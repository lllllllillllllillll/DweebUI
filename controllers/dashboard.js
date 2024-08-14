import { currentLoad, mem, networkStats, fsSize } from 'systeminformation';
import { docker, getContainer, containerInspect, containerLogs } from '../utils/docker.js';
import { readFileSync } from 'fs';
import { User, Permission, ServerSettings } from '../database/config.js';
import { Alert, Navbar, Capitalize } from '../utils/system.js';
import { Op } from 'sequelize';

let [ hidden, alert, newCards, stats ] = [ '', '', '', {} ];
let container_link = '';

// Dashboard
export const Dashboard = async function (req, res) {

    let link_url = await ServerSettings.findOne({ where: {key: 'link_url'}});

    container_link = link_url.value;

    res.render("dashboard",{ 
        alert: '',
        username: req.session.username,
        role: req.session.role,
        navbar: await Navbar(req),
    }); 
}

// Dashboard search
export const submitDashboard = async function (req, res) {
    console.log(req.body);
    res.send('ok');
    return;
}


export const CardList = async function (req, res) {
    res.send(newCards);
    newCards = '';
    return;
}


async function containerInfo (containerID) {

    // get the container info
    let info = docker.getContainer(containerID);
    let container = await info.inspect();

    let container_name = container.Name.slice(1);
    let container_image = container.Config.Image;
    let container_service = container.Config.Labels['com.docker.compose.service'];

    let ports_list = [];
    let external = 0;
    let internal = 0;
    
    try {
        for (const [key, value] of Object.entries(container.HostConfig.PortBindings)) {
            let ports = {
                check: 'checked',
                external: value[0].HostPort,
                internal: key.split('/')[0],
                protocol: key.split('/')[1]
            }
            ports_list.push(ports);
        }
    } catch {}

    try { external = ports_list[0].external; internal = ports_list[0].internal; } catch { }

    let container_info = {
        containerName: container_name,
        containerID: containerID,
        containerImage: container_image,
        containerService: container_service,
        containerState: container.State.Status,
        external_port: external,
        internal_port: internal,
        ports: ports_list,
        volumes: container.Mounts,
        env: container.Config.Env,
        labels: container.Config.Labels,
        link: 'localhost',
    }

    return container_info;
}


async function userCards (session) {
    session.container_list = [];
    // check what containers the user wants hidden
    let hidden = await Permission.findAll({ where: {userID: session.userID, hide: true}}, { attributes: ['containerID'] });
    hidden = hidden.map((container) => container.containerID);
    // check what containers the user has permission to view
    let visable = await Permission.findAll({ where: { userID: session.userID, [Op.or]: [{ uninstall: true }, { edit: true }, { upgrade: true }, { start: true }, { stop: true }, { pause: true }, { restart: true }, { logs: true }, { view: true }] }, attributes: ['containerID'] });
    visable = visable.map((container) => container.containerID);
    // get all containers
    let containers = await docker.listContainers({ all: true });
    // loop through containers
    for (let i = 0; i < containers.length; i++) {
        let container_name = containers[i].Names[0].split('/').pop();
        // skip hidden containers
        if (hidden.includes(containers[i].Id)) { continue; }
        // admin can see all containers that they don't have hidden
        if (session.role == 'admin') { session.container_list.push({ containerName: container_name, containerID: containers[i].Id, containerState: containers[i].State }); }
        // user can see any containers that they have any permissions for
        else if (visable.includes(containers[i].Id)){ session.container_list.push({ containerName: container_name, containerID: containers[i].Id, containerState: containers[i].State }); }
    }
    // Create the lists if they don't exist
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
    container_list.forEach(container => {
        let { containerName, containerID, containerState } = container;
        let sent = sent_list.find(c => c.containerID === containerID);
        if (!sent) { session.new_cards.push(containerID);}
        else if (sent.containerState !== containerState) { session.update_list.push(containerID); }
    });
    // loop through the sent list to see if any containers have been removed
    sent_list.forEach(container => {
        let { containerName, containerID, containerState } = container;
        let exists = container_list.find(c => c.containerID === containerID);
        if (!exists) { session.update_list.push(containerID); }
    });
}


// Container actions (start, stop, pause, restart, hide)
export const ContainerAction = async (req, res) => {

    let container_name = req.header('hx-trigger-name');
    let containerID = req.params.containerid;
    let action = req.params.action;
    
    // Reset the view
    if (action == 'reset') { 
        console.log('Resetting view'); 
        await Permission.update({ hide: false }, { where: { userID: req.session.userID } });
        res.redirect('/dashboard');
        return;
    }

    if (action == 'update') {
        await userCards(req.session);
        if (!req.session.container_list.find(c => c.containerID === containerID)) {
            res.send('');
            return;
        } else {
            let details = await containerInfo(containerID);
            let card = await createCard(details);
            res.send(card);
            return;
        }
    }


    if (action == 'logs') {
        let logs = await containerLogs(containerID);
        let modal = `<div class="modal-content" id="modal_content">
						<div class="modal-header">
							<h5 class="modal-title">Logs</h5>
							<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
						</div>

                        <pre class="modal-body">${logs}</pre>

						<div class="modal-footer">
							<button type="button" class="btn me-auto" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal" name="refresh" id="submit" hx-post="/update_permissions" hx-trigger="click" hx-confirm="Are you sure you want to reset permissions for this container?">Reset</button>
						</div>
				  	</div>`;
        res.send(modal);
        return;
    }



    // Inspect the container
    let info = docker.getContainer(containerID);
    let container = await info.inspect();
    let containerState = container.State.Status;
    
    // Displays container state (starting, stopping, restarting, pausing)
    function status (state) {
        return(`<div class="text-yellow d-inline-flex align-items-center lh-1 ms-auto" id="AltIDState">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon-tabler icon-tabler-point-filled" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"> <path stroke="none" d="M0 0h24v24H0z" fill="none"></path> <path d="M12 7a5 5 0 1 1 -4.995 5.217l-.005 -.217l.005 -.217a5 5 0 0 1 4.995 -4.783z" stroke-width="0" fill="currentColor"></path></svg>
                <strong>${state}</strong>
                </div>`);
    }

    // Perform the action
    if ((action == 'start') && (containerState == 'exited')) {
        info.start();
        res.send(status('starting'));
    } else if ((action == 'start') && (containerState == 'paused')) {
        info.unpause();
        res.send(status('starting'));
    } else if ((action == 'stop') && (containerState != 'exited')) {
        info.stop();
        res.send(status('stopping'));
    } else if ((action == 'pause') && (containerState == 'paused')) {
        info.unpause();
        res.send(status('starting'));
    } else if ((action == 'pause') && (containerState == 'running')) {
        info.pause();
        res.send(status('pausing'));
    } else if (action == 'restart') {
        info.restart();
        res.send(status('restarting'));
    } else if (action == 'hide') {
        let exists = await Permission.findOne({ where: { containerID: containerID, userID: req.session.userID }});
        if (!exists) { const newPermission = await Permission.create({ containerName: container_name, containerID: containerID, username: req.session.username, userID: req.session.userID, hide: true }); }
        else { exists.update({ hide: true }); }
        res.send('ok'); 
    }
}


async function createCard (details) {

    // let trigger = 'data-hx-trigger="load, every 3s"';

    let containerName = details.containerName;
    if (containerName.length > 17) { containerName = containerName.substring(0, 17) + '...'; }
    let containerTitle = Capitalize(containerName);

    let containerID = details.containerID;
    let containerState = details.containerState;
    let containerService = details.containerService;
    let containerStateColor = '';

    if (containerState == 'running') { containerStateColor = 'green'; }
    else if (containerState == 'exited') { containerStateColor = 'red'; containerState = 'stopped'; }
    else if (containerState == 'paused') { containerStateColor = 'orange'; }
    else { containerStateColor = 'blue'; }

    let container_card = readFileSync('./views/partials/container_card.html', 'utf8');

    container_card = container_card.replace(/ContainerID/g, containerID);
    container_card = container_card.replace(/AltID/g, 'a' + containerID);
    container_card = container_card.replace(/AppName/g, containerName);
    container_card = container_card.replace(/AppTitle/g, containerTitle);
    container_card = container_card.replace(/AppService/g, containerService);
    container_card = container_card.replace(/AppState/g, containerState);
    container_card = container_card.replace(/StateColor/g, containerStateColor);

    if (details.external_port == 0 && details.internal_port == 0) {
        container_card = container_card.replace(/AppPorts/g, ``);
    } else {
        container_card = container_card.replace(/AppPorts/g, `<a href="${container_link}:${details.external_port}" target="_blank" style="color: inherit; text-decoration: none;"> ${details.external_port}:${details.internal_port}</a>`);
    }
    return container_card;
}


// Server metrics (CPU, RAM, TX, RX, DISK)
export const ServerMetrics = async (req, res) => {
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
                <div class="cpu-bar meter animate ${color}"><span style="width:${value}%"><span></span></span></div>`;
    res.send(info);
}

// HTMX - Server-side events
export const SSE = async (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });
    async function eventCheck () {
        await userCards(req.session);
        await updateDashboard(req.session);
        if (JSON.stringify(req.session.sent_list) === JSON.stringify(req.session.container_list)) { return; }
        for (let i = 0; i < req.session.new_cards.length; i++) {
            let details = await containerInfo(req.session.new_cards[i]);
            let card = await createCard(details);
            newCards += card;
        }
        for (let i = 0; i < req.session.update_list.length; i++) {
            res.write(`event: ${req.session.update_list[i]}\n`);
            res.write(`data: 'update cards'\n\n`);
        }
        res.write(`event: update\n`);
        res.write(`data: 'update cards'\n\n`);
        req.session.sent_list = req.session.container_list.slice();
    }
    await eventCheck();
    docker.getEvents({}, function (err, data) {
        data.on('data', async function () {
            await eventCheck();
        });
    });
    req.on('close', () => {
    });
}